import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Radio, Heart, Flame, Clock, Zap, Smartphone, ChevronRight, 
  RefreshCw, Plus, CheckCircle2, ShieldCheck, Bluetooth, Droplets 
} from 'lucide-react';
import { WearableMetrics } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';
import { Brand3DConnectButton } from './Brand3DConnectButton';

interface WearableHealthBannerProps {
  wearables: WearableMetrics[];
  onOpenDeviceManager: () => void;
  onQuickToggle: (deviceId: string) => void;
  onSyncAll: () => void;
}

export const WearableHealthBanner: React.FC<WearableHealthBannerProps> = ({
  wearables,
  onOpenDeviceManager,
  onQuickToggle,
  onSyncAll
}) => {
  const connectedWearables = wearables.filter(w => w.connected);
  const isAnyConnected = connectedWearables.length > 0;
  const metrics = aggregateHealthMetrics(wearables);

  // Helper find specific wearable IDs for quick toggle
  const healthConnectDevice = wearables.find(w => w.device.toLowerCase().includes('health connect') || w.device.toLowerCase().includes('google health'));
  const fitbitDevice = wearables.find(w => w.device.toLowerCase().includes('fitbit'));
  const appleHealthDevice = wearables.find(w => w.device.toLowerCase().includes('apple health') || w.device.toLowerCase().includes('apple watch'));

  if (!isAnyConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="vision-card-3d p-4 space-y-3 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition duration-500" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 icon-3d-box text-cyan-400">
              <Radio size={16} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-400 font-extrabold block">
                UNIVERSAL HEALTH ECOSYSTEM
              </span>
              <h3 className="font-display font-black text-sm text-white leading-tight">
                Connect your Health Data
              </h3>
            </div>
          </div>

          <button
            onClick={onOpenDeviceManager}
            className="px-3.5 py-1.5 vision-button-3d text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1"
          >
            See All Devices <ChevronRight size={12} />
          </button>
        </div>

        <p className="text-[10.5px] text-slate-300 leading-relaxed mb-3 font-sans">
          Synchronize Sleep, HRV, Heart Rate, Steps, Calories Burned, Weight, and Recovery automatically across present & future wearable brands.
        </p>

        {/* Featured Quick Connectors */}
        <div className="grid grid-cols-3 gap-2 text-[9.5px] font-mono font-bold">
          <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl flex flex-col items-center justify-between gap-2 text-slate-200 transition shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💚</span>
              <span className="truncate text-[10px] font-bold">Health Connect</span>
            </div>
            <Brand3DConnectButton
              brandId="health_connect"
              brandName="Health Connect"
              isConnected={!!healthConnectDevice?.connected}
              isPairing={false}
              onConnect={() => healthConnectDevice ? onQuickToggle(healthConnectDevice.id) : onOpenDeviceManager()}
              size="sm"
            />
          </div>

          <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl flex flex-col items-center justify-between gap-2 text-slate-200 transition shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⌚</span>
              <span className="truncate text-[10px] font-bold">Fitbit</span>
            </div>
            <Brand3DConnectButton
              brandId="fitbit"
              brandName="Fitbit"
              isConnected={!!fitbitDevice?.connected}
              isPairing={false}
              onConnect={() => fitbitDevice ? onQuickToggle(fitbitDevice.id) : onOpenDeviceManager()}
              size="sm"
            />
          </div>

          <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl flex flex-col items-center justify-between gap-2 text-slate-200 transition shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🍎</span>
              <span className="truncate text-[10px] font-bold">Apple Health</span>
            </div>
            <Brand3DConnectButton
              brandId="apple_health"
              brandName="Apple Health"
              isConnected={!!appleHealthDevice?.connected}
              isPairing={false}
              onConnect={() => appleHealthDevice ? onQuickToggle(appleHealthDevice.id) : onOpenDeviceManager()}
              size="sm"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Connected state: Live Telemetry Banner
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-slate-950/90 border border-emerald-500/40 p-4 rounded-[28px] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold block">
              LIVE HEALTH TELEMETRY SYNC
            </span>
            <h4 className="font-bold text-white text-xs truncate max-w-[210px]">
              {metrics.primarySource}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSyncAll}
            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition"
            title="Force Realtime Data Sync"
          >
            <RefreshCw size={12} className="animate-spin" />
          </button>
          <button
            onClick={onOpenDeviceManager}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[8.5px] font-black uppercase tracking-wider rounded-xl transition shadow-md"
          >
            Fleet ({metrics.activeDeviceCount})
          </button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="bg-slate-950/80 border border-emerald-500/20 p-2 rounded-2xl shadow-inner">
          <span className="text-[8px] text-slate-400 uppercase block font-semibold">Heart Rate</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
            <Heart size={10} className="fill-rose-500 text-rose-500 animate-pulse" />
            {metrics.avgHeartRateBpm > 0 ? `${metrics.avgHeartRateBpm} BPM` : 'Unavailable'}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/20 p-2 rounded-2xl shadow-inner">
          <span className="text-[8px] text-slate-400 uppercase block font-semibold">Steps Today</span>
          <span className="text-xs font-bold text-white mt-0.5 block truncate">
            {metrics.totalSteps > 0 ? metrics.totalSteps.toLocaleString() : '0 steps'}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/20 p-2 rounded-2xl shadow-inner">
          <span className="text-[8px] text-slate-400 uppercase block font-semibold">Sleep</span>
          <span className="text-xs font-bold text-sky-300 mt-0.5 block truncate">
            {metrics.totalSleepHours > 0 ? `${metrics.totalSleepHours}h` : 'Unavailable'}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/20 p-2 rounded-2xl shadow-inner">
          <span className="text-[8px] text-slate-400 uppercase block font-semibold">HRV</span>
          <span className="text-xs font-bold text-cyan-400 mt-0.5 block truncate">
            {metrics.avgHrvMs !== undefined ? `${metrics.avgHrvMs} ms` : 'Sync required'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
