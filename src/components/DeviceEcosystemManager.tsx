import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, RefreshCw, CheckCircle2, ShieldCheck, Bluetooth, 
  Smartphone, Plus, Sparkles, Activity, Heart, Flame, Zap, 
  Cpu, Lock, Sliders, ChevronRight, AlertCircle, Trash2, Globe, Radio, ArrowRight
} from 'lucide-react';
import { WearableMetrics, FamilyMember } from '../types';
import { 
  DEVICE_ECOSYSTEM_CATALOG, 
  DeviceBrandInfo, 
  getRegisteredCustomPlugins, 
  registerCustomDevicePlugin, 
  CustomDevicePlugin 
} from '../lib/wearableEcosystem';
import { Brand3DConnectButton } from './Brand3DConnectButton';

interface DeviceEcosystemManagerProps {
  isOpen: boolean;
  onClose: () => void;
  wearables: WearableMetrics[];
  onToggleDevice: (id: string, customDeviceName?: string) => Promise<void>;
  onTriggerToast: (msg: string) => void;
  familyMembers?: FamilyMember[];
}

export const DeviceEcosystemManager: React.FC<DeviceEcosystemManagerProps> = ({
  isOpen,
  onClose,
  wearables,
  onToggleDevice,
  onTriggerToast,
  familyMembers = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'scanner' | 'connected' | 'plugin'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceBrandInfo[]>([]);
  const [pairingDeviceId, setPairingDeviceId] = useState<string | null>(null);

  // Plugin Creator Form state
  const [pluginName, setPluginName] = useState('');
  const [pluginBrand, setPluginBrand] = useState('');
  const [pluginProtocol, setPluginProtocol] = useState<'REST_Webhook' | 'BLE_Direct' | 'PluginDriver'>('PluginDriver');
  const [pluginEndpoint, setPluginEndpoint] = useState('');
  const [customPlugins, setCustomPlugins] = useState<CustomDevicePlugin[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCustomPlugins(getRegisteredCustomPlugins());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    onTriggerToast('Scanning nearby Bluetooth LE & Local Health Bridges...');

    setTimeout(() => {
      const candidates = DEVICE_ECOSYSTEM_CATALOG.filter(d => 
        d.id === 'garmin' || d.id === 'oura_ring' || d.id === 'smart_scale' || d.id === 'glucose_cgm' || d.id === 'samsung_galaxy_watch'
      );
      setDiscoveredDevices(candidates);
      setIsScanning(false);
      onTriggerToast(`Discovered ${candidates.length} active health sensors nearby!`);
    }, 2800);
  };

  const handlePairDevice = async (catalogItem: DeviceBrandInfo) => {
    setPairingDeviceId(catalogItem.id);
    onTriggerToast(`Pairing with ${catalogItem.name}...`);

    const existing = wearables.find(w => w.device.toLowerCase().includes(catalogItem.name.toLowerCase()) || w.brand === catalogItem.brand);
    
    if (existing) {
      await onToggleDevice(existing.id);
    } else {
      await onToggleDevice(`new_${catalogItem.id}`, catalogItem.name);
    }
    setPairingDeviceId(null);
  };

  const handleRegisterPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pluginName.trim() || !pluginBrand.trim()) {
      onTriggerToast('Please enter plugin name and brand.');
      return;
    }

    const newPlugin = registerCustomDevicePlugin({
      id: `plugin_${Date.now()}`,
      name: pluginName.trim(),
      brand: pluginBrand.trim(),
      version: '1.0.0',
      protocol: pluginProtocol,
      endpointUrl: pluginEndpoint.trim() || 'https://api.health.local/telemetry',
      supportedMetrics: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'glucose', 'recovery']
    });

    setCustomPlugins(getRegisteredCustomPlugins());
    setPluginName('');
    setPluginBrand('');
    setPluginEndpoint('');
    onTriggerToast(`Registered plugin driver: ${newPlugin.name} v1.0.0!`);
    setActiveTab('catalog');
  };

  const filteredCatalog = DEVICE_ECOSYSTEM_CATALOG.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const connectedCount = wearables.filter(w => w.connected).length;

  // Find quick connector items for Screen 1
  const healthConnectItem = DEVICE_ECOSYSTEM_CATALOG.find(d => d.id === 'health_connect');
  const fitbitItem = DEVICE_ECOSYSTEM_CATALOG.find(d => d.id === 'fitbit');
  const appleHealthItem = DEVICE_ECOSYSTEM_CATALOG.find(d => d.id === 'apple_health');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="bg-slate-950/95 border border-cyan-500/25 rounded-[36px] w-full max-w-lg h-[700px] max-h-[92vh] text-slate-100 shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl shadow-inner">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm sm:text-base text-white tracking-wider uppercase flex items-center gap-2">
                  Universal Health Ecosystem
                  {connectedCount > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase font-bold">
                      {connectedCount} Connected
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Connect your Health Data • Continuous Bio-Sync
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white border border-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex border-b border-white/10 bg-slate-950/80 px-2 pt-2 text-[10px] font-mono font-bold shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                activeTab === 'catalog'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              See All Devices ({DEVICE_ECOSYSTEM_CATALOG.length})
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'scanner'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bluetooth size={11} /> Auto-Scan
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                activeTab === 'connected'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Fleet ({connectedCount})
            </button>
          </div>

          {/* Scrollable Main Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">

            {/* SCREEN 1 / TAB: OVERVIEW & SYNCHRONIZE SPECS */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Hero Box - 2027 Spatial Vision OS */}
                <div className="vision-card-3d p-4 sm:p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-500" />
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition duration-500" />

                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold block mb-1">
                    UNIVERSAL HEALTH ECOSYSTEM
                  </span>
                  <h4 className="font-display font-black text-lg text-white mb-2 tracking-tight">
                    Synchronize Biometric Data
                  </h4>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    Connect real-time biometric streams from WHOOP, Oura Ring, Apple Watch, Fitbit, Samsung Galaxy Watch, Continuous Glucose Monitors, and Android Health Connect.
                  </p>

                  <div className="bg-slate-950/80 border border-white/10 p-3 rounded-2xl space-y-2 backdrop-blur-md">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">
                      Biometric Data Pipelines:
                    </span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-mono text-slate-200">
                      {[
                        '• Sleep Staging',
                        '• HRV Index',
                        '• Heart Rate BPM',
                        '• Steps & Motion',
                        '• Calories Burned',
                        '• Body Weight',
                        '• Recovery Score',
                        '• Hydration Log',
                        '• Blood Pressure',
                        '• Exercise Data',
                        '• Stress Data',
                        '• Future Devices'
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900/90 px-2.5 py-1 rounded-xl border border-white/10 font-semibold text-slate-300 shadow-inner">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 my-2" />

                {/* Quick Connect Featured Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold">
                      Instant Health Connectors
                    </span>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="text-[10px] font-mono text-slate-300 hover:text-cyan-400 uppercase font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      See All Devices ({DEVICE_ECOSYSTEM_CATALOG.length}) <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Health Connect */}
                  {healthConnectItem && (
                    <div className="vision-card-emerald p-3 rounded-2xl flex items-center justify-between transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 icon-3d-box text-2xl">
                          {healthConnectItem.iconEmoji}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs">{healthConnectItem.name}</h5>
                          <p className="text-[9.5px] text-slate-300">Android System Health Repository</p>
                        </div>
                      </div>
                      <Brand3DConnectButton
                        brandId={healthConnectItem.id}
                        brandName={healthConnectItem.name}
                        isConnected={wearables.some(w => w.connected && w.device.toLowerCase().includes('health connect'))}
                        isPairing={pairingDeviceId === healthConnectItem.id}
                        onConnect={() => handlePairDevice(healthConnectItem)}
                      />
                    </div>
                  )}

                  {/* Fitbit */}
                  {fitbitItem && (
                    <div className="vision-card-3d p-3 rounded-2xl flex items-center justify-between transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 icon-3d-box text-2xl">
                          {fitbitItem.iconEmoji}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs">{fitbitItem.name}</h5>
                          <p className="text-[9.5px] text-slate-300">Sense 2, Charge 6 & Versa Biometrics</p>
                        </div>
                      </div>
                      <Brand3DConnectButton
                        brandId={fitbitItem.id}
                        brandName={fitbitItem.name}
                        isConnected={wearables.some(w => w.connected && w.device.toLowerCase().includes('fitbit'))}
                        isPairing={pairingDeviceId === fitbitItem.id}
                        onConnect={() => handlePairDevice(fitbitItem)}
                      />
                    </div>
                  )}

                  {/* Apple Health */}
                  {appleHealthItem && (
                    <div className="vision-card-silver p-3 rounded-2xl flex items-center justify-between transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 icon-3d-box text-2xl">
                          {appleHealthItem.iconEmoji}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs">{appleHealthItem.name}</h5>
                          <p className="text-[9.5px] text-slate-300">iOS HealthKit Encrypted Bridge</p>
                        </div>
                      </div>
                      <Brand3DConnectButton
                        brandId={appleHealthItem.id}
                        brandName={appleHealthItem.name}
                        isConnected={wearables.some(w => w.connected && (w.device.toLowerCase().includes('apple health') || w.device.toLowerCase().includes('apple watch')))}
                        isPairing={pairingDeviceId === appleHealthItem.id}
                        onConnect={() => handlePairDevice(appleHealthItem)}
                      />
                    </div>
                  )}
                </div>

                {/* Big SEE ALL DEVICES Button */}
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-98 flex items-center justify-center gap-2 mt-4"
                >
                  SEE ALL DEVICES ({DEVICE_ECOSYSTEM_CATALOG.length}+) <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* SCREEN 2 / TAB: ALL DEVICES CATALOG (21+ Brands) */}
            {activeTab === 'catalog' && (
              <div className="space-y-3.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Samsung, Pixel, Apple, Garmin, Oura, Whoop, Dexcom..."
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[9px] font-mono">
                  {['all', 'watch', 'band', 'ring', 'platform', 'scale', 'bp', 'cgm', 'plugin'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap uppercase tracking-wider font-bold transition border ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-white/10 hover:border-cyan-500/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredCatalog.map(item => {
                    const isConnected = wearables.some(w => w.connected && (w.device.toLowerCase().includes(item.name.toLowerCase()) || w.brand === item.brand));

                    return (
                      <div
                        key={item.id}
                        className={`bg-slate-900/80 border p-3 rounded-2xl flex flex-col justify-between transition hover:border-cyan-500/40 ${
                          isConnected ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{item.iconEmoji}</span>
                              <span className="font-bold text-white text-xs truncate">{item.name}</span>
                            </div>
                            {isConnected && (
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-300 leading-tight mb-2">{item.description}</p>
                          
                          {/* Metrics Badges */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.metricsSupported.map(m => (
                              <span key={m} className="bg-slate-950 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[8px] font-mono text-slate-400">
                            {item.defaultProtocol}
                          </span>
                          <Brand3DConnectButton
                            brandId={item.id}
                            brandName={item.name}
                            isConnected={isConnected}
                            isPairing={pairingDeviceId === item.id}
                            onConnect={() => handlePairDevice(item)}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: AUTO-SCAN (BLE / RADAR) */}
            {activeTab === 'scanner' && (
              <div className="space-y-4 text-center py-2">
                <div className="bg-slate-900/80 border border-cyan-500/20 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center">
                  
                  {/* Radar Wave Animation */}
                  <div className="relative w-32 h-32 flex items-center justify-center my-2">
                    {isScanning && (
                      <>
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping" />
                        <div className="absolute inset-2 bg-cyan-500/20 rounded-full animate-pulse" />
                      </>
                    )}
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10 text-slate-950">
                      <Radio size={32} className={isScanning ? 'animate-bounce' : ''} />
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">
                    {isScanning ? 'Scanning Wireless Spectrum...' : 'Automatic Health Sensor Scanner'}
                  </h4>
                  <p className="text-[10px] text-slate-300 max-w-xs mt-1">
                    Detects nearby Bluetooth LE watches, Oura Rings, Smart Scales, Blood Pressure cuffs, Dexcom CGMs, and Health Connect bridges.
                  </p>

                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="mt-4 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <Bluetooth size={14} />
                    {isScanning ? 'Scanning...' : 'Start Auto-Scan'}
                  </button>
                </div>

                {discoveredDevices.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                      Discovered Nearby Devices ({discoveredDevices.length})
                    </span>
                    <div className="space-y-2">
                      {discoveredDevices.map(device => (
                        <div key={device.id} className="bg-slate-900 border border-cyan-500/30 p-3 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{device.iconEmoji}</span>
                            <div>
                              <h5 className="font-bold text-white text-xs">{device.name}</h5>
                              <p className="text-[9px] text-slate-400 font-mono">Signal Strength: Strong (-58 dBm) • BLE</p>
                            </div>
                          </div>
                          <Brand3DConnectButton
                            brandId={device.id}
                            brandName={device.name}
                            isConnected={wearables.some(w => w.connected && (w.device.toLowerCase().includes(device.name.toLowerCase()) || w.brand === device.brand))}
                            isPairing={pairingDeviceId === device.id}
                            onConnect={() => handlePairDevice(device)}
                            customLabel="1-Click Pair"
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ACTIVE FLEET */}
            {activeTab === 'connected' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/40 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                      Multi-Device Telemetry Active
                    </span>
                    <h4 className="font-bold text-white text-xs mt-0.5">
                      {connectedCount > 0 ? `${connectedCount} Wearables Synced in Parallel` : 'No Active Devices Connected'}
                    </h4>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="space-y-2">
                  {wearables.map(w => (
                    <div key={w.id} className="bg-slate-900 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${w.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/40 text-slate-500'}`}>
                          <Activity size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs">{w.device}</h5>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {w.connected && (w.heartRateBpm > 0 || w.steps > 0 || w.sleepHours > 0)
                              ? `HR: ${w.heartRateBpm} BPM • Steps: ${w.steps.toLocaleString()} • Sleep: ${w.sleepHours}h`
                              : w.connected ? 'Connected — waiting for data' : 'Disconnected'}
                          </p>
                        </div>
                      </div>

                      <Brand3DConnectButton
                        brandId={w.brand || w.id}
                        brandName={w.device}
                        isConnected={w.connected}
                        isPairing={false}
                        onConnect={() => onToggleDevice(w.id)}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PLUGIN DRIVER CREATOR */}
            {activeTab === 'plugin' && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-cyan-500/20 p-4 rounded-3xl space-y-3">
                  <div>
                    <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                      Future Device Architecture
                    </span>
                    <h4 className="font-bold text-white text-xs mt-0.5">Register Custom Sensor / Wearable Driver</h4>
                    <p className="text-[9.5px] text-slate-300 mt-1">
                      Add future smartwatch brands, custom WebBluetooth sensors, or REST endpoint feeds without updating core code.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterPlugin} className="space-y-2.5">
                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block mb-1">Device Name / Model</label>
                      <input
                        type="text"
                        value={pluginName}
                        onChange={(e) => setPluginName(e.target.value)}
                        placeholder="e.g. Nothing Watch Pro 2, Cygnus Ring"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block mb-1">Brand Identifier</label>
                      <input
                        type="text"
                        value={pluginBrand}
                        onChange={(e) => setPluginBrand(e.target.value)}
                        placeholder="e.g. Nothing, Cygnus, OpenHealth"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block mb-1">Driver Protocol</label>
                      <select
                        value={pluginProtocol}
                        onChange={(e: any) => setPluginProtocol(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="PluginDriver">Plugin JS Driver (Universal)</option>
                        <option value="REST_Webhook">REST Webhook Endpoint</option>
                        <option value="BLE_Direct">WebBluetooth Direct GATT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block mb-1">Webhook / Telemetry URL (Optional)</label>
                      <input
                        type="text"
                        value={pluginEndpoint}
                        onChange={(e) => setPluginEndpoint(e.target.value)}
                        placeholder="https://api.device.com/v1/telemetry"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md mt-2"
                    >
                      + Load Plugin Driver
                    </button>
                  </form>
                </div>

                {customPlugins.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                      Loaded Driver Plugins ({customPlugins.length})
                    </span>
                    {customPlugins.map(p => (
                      <div key={p.id} className="bg-slate-900 border border-white/10 p-2.5 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <h5 className="font-bold text-white">{p.name} ({p.brand})</h5>
                          <p className="text-[8px] text-slate-400 font-mono">{p.protocol} • v{p.version}</p>
                        </div>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                          Active Driver
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
