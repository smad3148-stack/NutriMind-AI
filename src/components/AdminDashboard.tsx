/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent, 
  Sliders, 
  Cpu, 
  Terminal, 
  RefreshCw, 
  Play, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2,
  Download,
  Shield,
  Box,
  Plus,
  RotateCcw,
  Info,
  ExternalLink,
  Star,
  Award,
  Bot,
  Activity
} from 'lucide-react';
import { FeatureFlag, SystemPlugin, RevenueMetric, SystemLog, OtaUpdate, OtaDeployment } from '../types';
import { AdminAICompanion } from './AdminAICompanion';

type Tab = 'dashboard' | 'ota' | 'plugins' | 'logs' | 'admin_ai';

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState<RevenueMetric | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [plugins, setPlugins] = useState<SystemPlugin[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [otaUpdates, setOtaUpdates] = useState<OtaUpdate[]>([]);
  const [otaDeployments, setOtaDeployments] = useState<OtaDeployment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // OTA Deploy Form State
  const [otaVersion, setOtaVersion] = useState('');
  const [otaChannel, setOtaChannel] = useState<'development' | 'beta' | 'staging' | 'production'>('development');
  const [otaDescription, setOtaDescription] = useState('');
  const [otaBundleUrl, setOtaBundleUrl] = useState('');
  const [otaDeploying, setOtaDeploying] = useState(false);
  const [otaError, setOtaError] = useState<string | null>(null);
  const [otaSuccess, setOtaSuccess] = useState<string | null>(null);

  // Marketplace states
  const [pluginError, setPluginError] = useState<string | null>(null);
  const [pluginSuccess, setPluginSuccess] = useState<string | null>(null);
  const [pluginActionId, setPluginActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchOtaData();
    const interval = setInterval(fetchLogs, 5000); // Poll logs every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [revRes, flagsRes, pluginsRes, logsRes] = await Promise.all([
        fetch('/api/admin/revenue'),
        fetch('/api/admin/flags'),
        fetch('/api/admin/plugins'),
        fetch('/api/admin/logs')
      ]);

      const [revData, flagsData, pluginsData, logsData] = await Promise.all([
        revRes.json().catch(() => null),
        flagsRes.json().catch(() => []),
        pluginsRes.json().catch(() => []),
        logsRes.json().catch(() => [])
      ]);

      setRevenue(revData && typeof revData === 'object' && !revData.error ? revData : null);
      setFlags(Array.isArray(flagsData) ? flagsData : []);
      setPlugins(Array.isArray(pluginsData) ? pluginsData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error('Failed to load admin diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtaData = async () => {
    try {
      const res = await fetch('/api/admin/ota');
      if (res.ok) {
        const data = await res.json();
        setOtaUpdates(data.updates || []);
        setOtaDeployments(data.deployments || []);
      }
    } catch (err) {
      console.error('Failed to fetch OTA info:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  // Toggle Feature Flag
  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentVal })
      });

      if (res.ok) {
        const updated = await res.json();
        setFlags((Array.isArray(flags) ? flags : []).map(f => f.key === key ? updated : f));
        fetchLogs(); // Reload logs to capture update
      }
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  // Toggle Plugin Status (Mount/Unmount)
  const handleTogglePlugin = async (id: string) => {
    setPluginError(null);
    setPluginSuccess(null);
    setPluginActionId(id);
    try {
      const res = await fetch('/api/admin/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (!res.ok) {
        setPluginError(data.error || 'Failed to toggle plugin status.');
      } else {
        setPlugins((Array.isArray(plugins) ? plugins : []).map(p => p.id === id ? data : p));
        setPluginSuccess(`Modular microservice "${data.name}" altered successfully!`);
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to toggle plugin:', err);
      setPluginError('Failed to alter plugin status due to network exception.');
    } finally {
      setPluginActionId(null);
    }
  };

  // Install Marketplace Plugin
  const handleInstallPlugin = async (id: string) => {
    setPluginError(null);
    setPluginSuccess(null);
    setPluginActionId(id);
    try {
      const res = await fetch('/api/admin/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (!res.ok) {
        setPluginError(data.error || 'Installation failed.');
      } else {
        setPluginSuccess(`Marketplace plugin "${data.name}" has been installed. Mount the plugin to active.`);
        setPlugins(plugins.map(p => p.id === id ? data : p));
        fetchLogs();
      }
    } catch (err) {
      setPluginError('Failed to install marketplace plugin.');
    } finally {
      setPluginActionId(null);
    }
  };

  // Uninstall / Remove Plugin
  const handleRemovePlugin = async (id: string, name: string) => {
    setPluginError(null);
    setPluginSuccess(null);
    const confirmRemoval = window.confirm(`Uninstall Confirmation: Are you sure you want to completely remove "${name}"?`);
    if (!confirmRemoval) return;

    setPluginActionId(id);
    try {
      const res = await fetch('/api/admin/plugins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (!res.ok) {
        setPluginError(data.error || 'Plugin uninstallation failed.');
      } else {
        setPluginSuccess(`Plugin "${name}" uninstalled successfully.`);
        setPlugins(plugins.map(p => p.id === id ? data : p));
        fetchLogs();
      }
    } catch (err) {
      setPluginError('Failed to uninstall plugin.');
    } finally {
      setPluginActionId(null);
    }
  };

  // Update Plugin Version (Minor simulation)
  const handleUpdatePlugin = async (id: string, name: string, currentVersion: string) => {
    setPluginError(null);
    setPluginSuccess(null);
    setPluginActionId(id);

    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const nextVersion = `${major}.${minor + 1}.0`;

    try {
      const res = await fetch('/api/admin/plugins/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nextVersion })
      });

      const data = await res.json();
      if (!res.ok) {
        setPluginError(data.error || 'Failed to update plugin version.');
      } else {
        setPluginSuccess(`Plugin "${name}" updated successfully to v${nextVersion}!`);
        setPlugins(plugins.map(p => p.id === id ? data : p));
        fetchLogs();
      }
    } catch (err) {
      setPluginError('Failed to perform plugin upgrade.');
    } finally {
      setPluginActionId(null);
    }
  };

  // Publish / Deploy OTA Build
  const handleDeployOta = async (e: FormEvent) => {
    e.preventDefault();
    setOtaError(null);
    setOtaSuccess(null);

    if (!otaVersion || !otaBundleUrl) {
      setOtaError('Missing required fields: Application version and build package URL are required.');
      return;
    }

    setOtaDeploying(true);
    try {
      const res = await fetch('/api/admin/ota/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: otaVersion,
          channel: otaChannel,
          description: otaDescription,
          bundleUrl: otaBundleUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setOtaError(data.error || 'OTA build compilation / deployment failed.');
      } else {
        setOtaSuccess(`Build packet ${otaVersion} deployed successfully to ${otaChannel.toUpperCase()} channel!`);
        setOtaVersion('');
        setOtaBundleUrl('');
        setOtaDescription('');
        fetchOtaData();
        fetchLogs();
      }
    } catch (err) {
      setOtaError('Network failure deploying package to CDN.');
    } finally {
      setOtaDeploying(false);
    }
  };

  // Rollback OTA Environment
  const handleRollbackOta = async (otaUpdateId: string, version: string, channel: string) => {
    setOtaError(null);
    setOtaSuccess(null);

    const confirmRollback = window.confirm(
      `⚠️ EMERGENCY WARNING: Are you sure you want to rollback [${channel.toUpperCase()}] release channel to version ${version}? This action immediately affects live client connections.`
    );
    if (!confirmRollback) return;

    try {
      const res = await fetch('/api/admin/ota/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otaUpdateId,
          notes: `Rollback of ${channel.toUpperCase()} environment to build ${version}.`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setOtaError(data.error || 'Rollback execution aborted.');
      } else {
        setOtaSuccess(`Rollback executed successfully! [${channel.toUpperCase()}] restored to ${version}.`);
        fetchOtaData();
        fetchLogs();
      }
    } catch (err) {
      setOtaError('Failed to request rollback sequence.');
    }
  };

  // Clear server logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs/clear', { method: 'POST' });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 140;
  const chartWidth = 500;
  const padding = 25;

  const maxVal = revenue && Array.isArray(revenue.revenueByMonth) && revenue.revenueByMonth.length > 0
    ? Math.max(...revenue.revenueByMonth.map(m => Math.max(m.amount, m.target))) * 1.15 
    : 20000;
  const minVal = 0;

  const getX = (index: number, total: number) => {
    return padding + (index * (chartWidth - 2 * padding)) / (total - 1);
  };

  const getY = (val: number) => {
    return chartHeight - padding - ((val - minVal) * (chartHeight - 2 * padding)) / (maxVal - minVal);
  };

  // Helper to get active version for channels
  const getChannelVersion = (channelName: string) => {
    const sorted = [...otaUpdates]
      .filter(u => u.channel === channelName && u.status === 'published')
      .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
    return sorted[0]?.version || 'v2.3.0';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-slate-950/40 rounded-3xl border border-slate-900 shadow-xl">
      
      {/* Header and Sync */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            NutriMind Operations Console
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono uppercase font-bold">
              Enterprise
            </span>
          </h2>
          <p className="text-xs text-slate-400">OTA updates deployment dashboard, metabolic microservices marketplace, and diagnostics control boards.</p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button 
            onClick={async () => {
              await fetchDashboardData();
              await fetchOtaData();
            }}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-medium transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Live Logs</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-950 rounded-xl border border-slate-900 self-start">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg text-xs font-medium font-mono uppercase transition ${
            activeTab === 'dashboard' 
              ? 'bg-indigo-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Operations Center
        </button>
        <button
          onClick={() => setActiveTab('ota')}
          className={`px-4 py-2 rounded-lg text-xs font-medium font-mono uppercase transition flex items-center gap-1.5 ${
            activeTab === 'ota' 
              ? 'bg-teal-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box size={13} />
          OTA updates
        </button>
        <button
          onClick={() => setActiveTab('plugins')}
          className={`px-4 py-2 rounded-lg text-xs font-medium font-mono uppercase transition flex items-center gap-1.5 ${
            activeTab === 'plugins' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu size={13} />
          Plugins & Market
        </button>
        <button
          onClick={() => setActiveTab('admin_ai')}
          className={`px-4 py-2 rounded-lg text-xs font-medium font-mono uppercase transition flex items-center gap-1.5 ${
            activeTab === 'admin_ai' 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot size={13} className="text-purple-400" />
          AI Companion
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-medium font-mono uppercase transition flex items-center gap-1.5 ${
            activeTab === 'logs' 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal size={13} />
          Logs
        </button>
      </div>

      {/* CONDITIONAL RENDERING OF TABS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OPERATIONS / DIAGNOSTICS CENTER */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Board Grid - Exact 9 Admin Metrics & Export Report */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white font-display tracking-tight flex items-center gap-2">
                  <Shield size={18} className="text-cyan-400" /> EXECUTIVE REVENUE & USER METRICS
                </h3>
                <p className="text-xs text-slate-400">Live multi-currency transaction telemetry and user distribution logs.</p>
              </div>

              <button
                onClick={() => {
                  const dateStr = new Date().toISOString().split('T')[0];
                  const reportData = `==========================================================
                NUTRIMIND AI - SYSTEM REVENUE & USER REPORT
                          Generated: ${dateStr}
==========================================================

[USER METRICS]
Total Users: 24,850
Active Users: 18,920
Premium Users: 4,320
Lifetime Users: 980

[FINANCIAL METRICS]
Indian Earnings (INR): ₹4,580,000
International Earnings (USD): $184,500
Total Revenue (USD): $241,750
Monthly Revenue (MRR): $${revenue ? revenue.mrr.toLocaleString() : '14,850'}
Yearly Revenue (ARR): $${revenue ? revenue.arr.toLocaleString() : '178,200'}

==========================================================
                 END OF EXECUTIVE DIAGNOSTICS
==========================================================`;

                  const blob = new Blob([reportData], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NutriMind_Executive_Report_${dateStr}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer shrink-0 uppercase tracking-wider"
              >
                <Download size={14} />
                <span>EXPORT REPORT</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. TOTAL USERS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400">
                  <Users size={16} />
                  <span className="text-[9px] font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded text-cyan-400 font-bold">Total</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">24,850</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">TOTAL USERS</span>
                </div>
              </div>

              {/* 2. ACTIVE USERS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-400">
                  <Activity size={16} />
                  <span className="text-[9px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 font-bold">DAU/MAU</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">18,920</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">ACTIVE USERS</span>
                </div>
              </div>

              {/* 3. PREMIUM USERS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-indigo-400">
                  <Star size={16} />
                  <span className="text-[9px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-400 font-bold">Pro+</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">4,320</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">PREMIUM USERS</span>
                </div>
              </div>

              {/* 4. LIFETIME USERS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-400">
                  <Award size={16} />
                  <span className="text-[9px] font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400 font-bold">Lifetime</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">980</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">LIFETIME USERS</span>
                </div>
              </div>

              {/* 5. INDIAN EARNINGS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-teal-400">
                  <span className="font-bold font-mono text-sm">₹</span>
                  <span className="text-[9px] font-mono bg-teal-500/10 px-1.5 py-0.5 rounded text-teal-400 font-bold">India</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-teal-300">₹45,80,000</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">INDIAN EARNINGS</span>
                </div>
              </div>

              {/* 6. INTERNATIONAL EARNINGS */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-400">
                  <DollarSign size={16} />
                  <span className="text-[9px] font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 font-bold">Global</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-blue-300">$184,500</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">INTL EARNINGS</span>
                </div>
              </div>

              {/* 7. TOTAL REVENUE */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-400">
                  <TrendingUp size={16} />
                  <span className="text-[9px] font-mono bg-purple-500/10 px-1.5 py-0.5 rounded text-purple-400 font-bold">Gross</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">$241,750</span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">TOTAL REVENUE</span>
                </div>
              </div>

              {/* 8. MONTHLY REVENUE */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-400">
                  <DollarSign size={16} />
                  <span className="text-[9px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 font-bold">MRR</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">
                    {revenue ? `$${revenue.mrr.toLocaleString()}` : '$14,850'}
                  </span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">MONTHLY REVENUE</span>
                </div>
              </div>

              {/* 9. YEARLY REVENUE */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-cyan-400">
                  <TrendingUp size={16} />
                  <span className="text-[9px] font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded text-cyan-400 font-bold">ARR</span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold font-display text-white">
                    {revenue ? `$${revenue.arr.toLocaleString()}` : '$178,200'}
                  </span>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold tracking-wider mt-0.5">YEARLY REVENUE</span>
                </div>
              </div>
            </div>

            {/* Main Revenue Chart & Transactions Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Custom Revenue Growth Curve */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-white font-display">Revenue growth velocity</h3>
                    <p className="text-[10px] text-slate-400">Actual revenues vs target projection benchmarks.</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-teal-400 rounded-full inline-block"></span>
                      <span className="text-slate-300">Actual MRR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 border-t-2 border-dashed border-slate-500 inline-block"></span>
                      <span className="text-slate-400">Benchmark Target</span>
                    </div>
                  </div>
                </div>

                {/* SVG Canvas Renderer */}
                {revenue && (
                  <div className="relative">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                      {/* Horizontal grid lines */}
                      {[0, 0.5, 1].map((pRatio, i) => {
                        const yVal = padding + pRatio * (chartHeight - 2 * padding);
                        const approxVal = Math.round(maxVal - pRatio * maxVal);
                        return (
                          <g key={i}>
                            <line x1={padding} y1={yVal} x2={chartWidth - padding} y2={yVal} stroke="#1e293b" strokeDasharray="3 3" />
                            <text x={0} y={yVal + 3} fill="#64748b" className="text-[9px] font-mono">${approxVal.toLocaleString()}</text>
                          </g>
                        );
                      })}

                      {/* Target line (Dashed Slate) */}
                      <path
                        d={revenue.revenueByMonth.map((m, idx) => 
                          `${idx === 0 ? 'M' : 'L'} ${getX(idx, revenue.revenueByMonth.length)} ${getY(m.target)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />

                      {/* Actual line (Teal gradient curve) */}
                      <path
                        d={revenue.revenueByMonth.map((m, idx) => 
                          `${idx === 0 ? 'M' : 'L'} ${getX(idx, revenue.revenueByMonth.length)} ${getY(m.amount)}`
                        ).join(' ')}
                        fill="none"
                        stroke="url(#teal-grad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Hotspot circles for values */}
                      {revenue.revenueByMonth.map((m, idx) => {
                        const cx = getX(idx, revenue.revenueByMonth.length);
                        const cy = getY(m.amount);
                        return (
                          <g key={idx} onMouseEnter={() => setHoveredMonth(idx)} onMouseLeave={() => setHoveredMonth(null)}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={hoveredMonth === idx ? 6 : 4}
                              fill="#2dd4bf"
                              stroke="#0b0f19"
                              strokeWidth="2"
                              className="transition duration-150 cursor-pointer"
                            />
                            <text
                              x={cx}
                              y={chartHeight - 5}
                              fill="#94a3b8"
                              textAnchor="middle"
                              className="text-[9px] font-mono font-bold"
                            >
                              {m.month}
                            </text>
                          </g>
                        );
                      })}

                      {/* Definitions for gradient curves */}
                      <defs>
                        <linearGradient id="teal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Float tooltip popup */}
                    <AnimatePresence>
                      {hoveredMonth !== null && revenue && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1 right-1 bg-slate-950/90 border border-teal-500/30 p-2.5 rounded-xl shadow-xl text-left"
                        >
                          <span className="text-[9px] font-mono uppercase text-teal-400 block font-bold">
                            {revenue.revenueByMonth[hoveredMonth].month} Performance Log
                          </span>
                          <div className="flex gap-4 mt-1 font-mono text-xs">
                            <div>
                              <span className="text-slate-400 text-[9px] block">Actual</span>
                              <span className="text-white font-bold">${revenue.revenueByMonth[hoveredMonth].amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[9px] block">Benchmark</span>
                              <span className="text-slate-400 font-bold">${revenue.revenueByMonth[hoveredMonth].target.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Ledger Premium Transactions */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 lg:col-span-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white font-display">Recent premium sales</h3>
                  <p className="text-[10px] text-slate-400">Incoming subscription flows from stripe webhooks.</p>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {revenue && Array.isArray(revenue.recentTransactions) ? (
                    revenue.recentTransactions.map(tx => (
                      <div key={tx.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white truncate max-w-[120px]">{tx.userEmail}</span>
                            <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1 py-0.5 rounded border border-slate-800">
                              {tx.plan}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                            {tx.id.toUpperCase()} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-bold text-teal-400 font-mono block">${tx.amount}</span>
                          <span className={`text-[9px] font-semibold ${tx.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic text-center py-8">No recent transactions recorded.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Feature Flags Grid widget */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                    <Sliders size={16} className="text-indigo-400" />
                    Active Feature Flags
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">Toggle core customer-facing functionality dynamically across user scopes.</p>
                </div>
                <Lock size={14} className="text-slate-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {Array.isArray(flags) && flags.length > 0 ? (
                  flags.map(flag => (
                    <div key={flag.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white truncate">{flag.name}</h4>
                          <span className="text-[8px] font-mono bg-slate-900 text-slate-500 px-1 py-0.5 rounded font-bold border border-slate-800">
                            {flag.key}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{flag.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center ${
                          flag.enabled ? 'bg-teal-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-center py-6 col-span-2">No feature flags registered in diagnostics systems.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ENTERPRISE OTA MANAGER */}
        {activeTab === 'ota' && (
          <motion.div
            key="ota"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Environment Release Channel Statuses */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* DEVELOPMENT CARD */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Development</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {getChannelVersion('development')}
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-2">Targeted for developer build pushes and Sandbox systems.</span>
              </div>

              {/* BETA CARD */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">Beta</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {getChannelVersion('beta')}
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-2">Assigned to selected group of health testers & bio-feedback enthusiasts.</span>
              </div>

              {/* STAGING CARD */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">Staging</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {getChannelVersion('staging')}
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-2">Reflects full production data pipeline mirror before absolute client rollouts.</span>
              </div>

              {/* PRODUCTION CARD */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider block">Production</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {getChannelVersion('production')}
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-2">Active package server targeting standard mobile client web-frames.</span>
              </div>
            </div>

            {/* Layout: Deploy and History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Deploy New Release Packet */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 lg:col-span-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                    <Box size={16} className="text-teal-400" />
                    Compile & Publish Build
                  </h3>
                  <p className="text-[10px] text-slate-400">Push an Over-The-Air deployment bundle directly into active release channel server routers.</p>
                </div>

                {otaError && (
                  <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-start gap-2 text-xs text-rose-400">
                    <XCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{otaError}</span>
                  </div>
                )}

                {otaSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-xs text-emerald-400">
                    <CheckCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{otaSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleDeployOta} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Target Application Version</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., v2.5.0"
                      value={otaVersion}
                      onChange={(e) => setOtaVersion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Release Channel Routing</label>
                    <select
                      value={otaChannel}
                      onChange={(e) => setOtaChannel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
                    >
                      <option value="development">Development (Sandbox)</option>
                      <option value="beta">Beta (Selected Testers)</option>
                      <option value="staging">Staging (Metabolic Mirror)</option>
                      <option value="production">Production (Global Clients)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Build Package Bundle URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://cdn.nutrimind.ai/ota/v2.5.0.bin"
                      value={otaBundleUrl}
                      onChange={(e) => setOtaBundleUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Build Description / Changelog</label>
                    <textarea
                      placeholder="Core metabolic metrics upgrades, speech synthesis micro-buffer stabilizers..."
                      value={otaDescription}
                      onChange={(e) => setOtaDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-slate-700 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otaDeploying}
                    className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-bold font-mono text-xs uppercase py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    {otaDeploying ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Releasing Packet...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Deploy OTA update</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Deployment & Rollback history */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                    <RotateCcw size={16} className="text-teal-400" />
                    Deployment History & Rollback Logs
                  </h3>
                  <p className="text-[10px] text-slate-400">Enterprise audit logs of previous builds. Trigger instant client-routing rollbacks anytime.</p>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {Array.isArray(otaDeployments) && otaDeployments.length > 0 ? (
                    otaDeployments.map(dep => {
                      const isDeploy = dep.action === 'deploy';
                      const badgeBg = isDeploy ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 'bg-amber-950/40 text-amber-400 border-amber-500/20';
                      
                      return (
                        <div key={dep.id} className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs hover:border-slate-800 transition">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-bold font-mono text-white text-sm">{dep.version}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase tracking-wider border ${badgeBg}`}>
                                  {dep.action.toUpperCase()}
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-400 bg-slate-900 px-1 py-0.5 rounded uppercase border border-slate-800">
                                  {dep.channel}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[10.5px] mt-2 leading-relaxed">{dep.notes}</p>
                              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 mt-2">
                                <span>OPERATOR: {dep.deployedBy}</span>
                                <span>•</span>
                                <span>{new Date(dep.createdAt).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Rollback Trigger Button */}
                            {isDeploy && (
                              <button
                                onClick={() => handleRollbackOta(dep.otaUpdateId, dep.version, dep.channel)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-[9.5px] font-mono uppercase font-bold px-2 py-1.5 rounded-lg transition"
                                title="Restore this environment package to clients immediately"
                              >
                                Rollback here
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-500 italic text-center py-16">No previous system deployments recorded in audits.</div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: PLUGIN SYSTEM & MARKETPLACE */}
        {activeTab === 'plugins' && (
          <motion.div
            key="plugins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Status alerts */}
            {pluginError && (
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <h4 className="font-bold">Enterprise Safety Policy Conflict</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-rose-400">{pluginError}</p>
                </div>
              </div>
            )}

            {pluginSuccess && (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
                <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                <div>
                  <h4 className="font-bold">Execution Succeeded</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-300">{pluginSuccess}</p>
                </div>
              </div>
            )}

            {/* INSTALLED PLUGINS CONTAINER */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                  <Shield size={16} className="text-emerald-400" />
                  Mounted Microservices
                </h3>
                <p className="text-[10px] text-slate-400">Locally active metabolic adapters. Mounted components immediately hook into runtime AI request cycles.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plugins.filter(p => p.isInstalled).length === 0 ? (
                  <div className="col-span-2 text-slate-500 italic bg-slate-900/10 border border-slate-900 border-dashed p-10 rounded-2xl text-center text-xs">
                    No metabolic modules are currently installed. Browse the Marketplace below to inject capabilities.
                  </div>
                ) : (
                  plugins.filter(p => p.isInstalled).map(plugin => {
                    const isUpdating = pluginActionId === plugin.id;
                    return (
                      <div key={plugin.id} className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-3 hover:border-slate-800 transition relative">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-xs text-white">{plugin.name}</h4>
                              <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-950 px-1 py-0.5 rounded border border-slate-900">
                                v{plugin.version}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 mt-1 block">DEVELOPER: {plugin.author || 'Core'}</span>
                          </div>

                          {/* Toggle Active status */}
                          <button
                            onClick={() => handleTogglePlugin(plugin.id)}
                            className={`px-3 py-1 rounded-xl font-mono text-[9px] font-bold uppercase border tracking-wider transition ${
                              plugin.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400'
                            }`}
                          >
                            {plugin.status === 'active' ? 'Active' : 'Deactive'}
                          </button>
                        </div>

                        <p className="text-[10.5px] text-slate-400 leading-relaxed">{plugin.description}</p>

                        {/* Metadata blocks (Permissions / Dependencies) */}
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-1">
                          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-900">
                            <span className="text-slate-500 uppercase font-bold block mb-0.5">Permissions Required</span>
                            <span className="text-indigo-400 block truncate" title={plugin.permissions || 'None'}>
                              {plugin.permissions || 'None'}
                            </span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-900">
                            <span className="text-slate-500 uppercase font-bold block mb-0.5">Dependencies</span>
                            <span className="text-teal-400 block truncate" title={plugin.dependencies || 'None required'}>
                              {plugin.dependencies || 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Control actions bar */}
                        <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                          <button
                            onClick={() => handleRemovePlugin(plugin.id, plugin.name)}
                            className="text-slate-500 hover:text-rose-500 font-mono text-[10px] font-bold flex items-center gap-1"
                          >
                            <Trash2 size={11} />
                            <span>Remove</span>
                          </button>

                          <button
                            onClick={() => handleUpdatePlugin(plugin.id, plugin.name, plugin.version)}
                            disabled={isUpdating}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-800 transition"
                          >
                            {isUpdating ? 'Upgrading...' : 'Update Version'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* THIRD-PARTY MARKETPLACE DISCOVERY */}
            <div className="space-y-4 pt-4 border-t border-slate-900">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-display">
                  <Award size={16} className="text-teal-400" />
                  Metabolic Marketplace Directory
                </h3>
                <p className="text-[10px] text-slate-400">Unlock capabilities instantly. Explore trusted modules built to integrate with medical hardware and metabolic labs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plugins.filter(p => !p.isInstalled).length === 0 ? (
                  <div className="col-span-3 text-slate-500 italic bg-slate-900/10 border border-slate-900 border-dashed p-8 rounded-2xl text-center text-xs">
                    All marketplace metabolic modules are currently installed on this instance.
                  </div>
                ) : (
                  plugins.filter(p => !p.isInstalled).map(plugin => {
                    const isInstalling = pluginActionId === plugin.id;
                    return (
                      <div key={plugin.id} className="bg-slate-900/10 border border-slate-900/80 p-4 rounded-2xl space-y-3 hover:bg-slate-900/20 hover:border-slate-800 transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-white leading-tight">{plugin.name}</h4>
                              <span className="text-[9px] font-mono text-slate-500 block mt-1">v{plugin.version} • {plugin.author || 'Third Party'}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/20 px-1 rounded-md shrink-0">
                              ⭐ {plugin.rating ? Number(plugin.rating).toFixed(1) : '5.0'}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-3">
                            {plugin.description}
                          </p>

                          {/* Plugin diagnostics (installs / dependencies) */}
                          <div className="pt-3 space-y-1.5 text-[9px] font-mono">
                            <div className="flex justify-between text-slate-500">
                              <span>Installs</span>
                              <span className="text-slate-300 font-bold">{(plugin.installCount || 100).toLocaleString()}+</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Requires Dependencies</span>
                              <span className="text-teal-500 truncate font-bold max-w-[120px]" title={plugin.dependencies || 'None'}>
                                {plugin.dependencies || 'None'}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Permissions</span>
                              <span className="text-indigo-400 truncate font-bold max-w-[120px]" title={plugin.permissions || 'None'}>
                                {plugin.permissions || 'None'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-900/60 mt-3">
                          <button
                            onClick={() => handleInstallPlugin(plugin.id)}
                            disabled={isInstalling}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold font-mono text-[10px] uppercase py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            {isInstalling ? (
                              <>
                                <RefreshCw size={11} className="animate-spin" />
                                <span>Installing...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Install plugin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DIAGNOSTICS LOGS CONSOLE */}
        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Real-time Logs Console */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-rose-400" />
                  <h3 className="text-sm font-semibold text-white font-display">System Diagnostics Logs</h3>
                </div>
                <button 
                  onClick={handleClearLogs}
                  className="text-slate-500 hover:text-rose-500 text-[10px] flex items-center gap-1 font-semibold transition"
                >
                  <Trash2 size={12} />
                  <span>Flush logs</span>
                </button>
              </div>

              {/* Console Box */}
              <div className="bg-black/80 rounded-xl p-4 border border-slate-900 font-mono text-[11px] h-[360px] overflow-y-auto space-y-1.5 shadow-inner">
                {!Array.isArray(logs) || logs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-24">Diagnostics console empty. Standard heartbeat checks active.</div>
                ) : (
                  logs.map(log => {
                    const badgeColor = log && log.level === 'error' 
                      ? 'text-rose-400 bg-rose-950/20' 
                      : log && log.level === 'warn' 
                        ? 'text-amber-400 bg-amber-950/20' 
                        : 'text-teal-400 bg-teal-950/10';

                    if (!log) return null;

                    return (
                      <div key={log.id || Math.random().toString()} className="flex items-start gap-2.5 hover:bg-slate-950 p-1.5 rounded transition duration-150">
                        <span className="text-slate-500 shrink-0 select-none text-[9.5px]">
                          [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}]
                        </span>
                        
                        <span className={`px-1.5 py-0.5 rounded uppercase text-[8px] font-bold tracking-wider shrink-0 ${badgeColor}`}>
                          {log.level || 'info'}
                        </span>

                        <span className="text-indigo-400 shrink-0 select-none">
                          {log.service || 'SYSTEM'}:
                        </span>

                        <span className="text-slate-300 break-words flex-1 leading-relaxed">
                          {log.message || ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: ADMIN AI COMPANION */}
        {activeTab === 'admin_ai' && (
          <motion.div
            key="admin_ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminAICompanion systemLogs={logs} />
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
