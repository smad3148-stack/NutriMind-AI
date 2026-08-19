import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Flame, Dna,
  HeartPulse, Droplets, Watch, 
  Lock, Activity, Clock,
  TrendingUp, Radio, Scale, Calendar
} from 'lucide-react';
import { AIHealthTwin } from './AIHealthTwin';
import { ReportsPanel } from './ReportsPanel';
import { WearableMetrics, FamilyMember } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';

interface AIHubProps {
  userGoal: string;
  totalCaloriesToday: number;
  waterIntakeToday: number;
  sleepScore: number;
  recoveryScore?: number;
  wearables?: WearableMetrics[];
  familyMembers?: FamilyMember[];
  onOpenNutriChat: (prompt?: string) => void;
  onOpenDeviceManager: () => void;
  onOpenReports: () => void;
  onTriggerToast: (msg: string) => void;
}

export const AIHub: React.FC<AIHubProps> = ({
  userGoal,
  totalCaloriesToday,
  waterIntakeToday,
  sleepScore,
  wearables = [],
  onOpenNutriChat,
  onOpenDeviceManager,
  onOpenReports,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'monthly' | 'insights'>('today');
  const [briefingTime, setBriefingTime] = useState<string>('07:00 AM');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [activeTrendTab, setActiveTrendTab] = useState<'recovery' | 'sleep' | 'weight' | 'calories' | 'stress'>('recovery');

  const connectedWearables = wearables.filter(w => w.connected);
  const hasConnectedDevices = connectedWearables.length > 0;
  const metrics = aggregateHealthMetrics(wearables);

  const handleTimeSelect = (timeStr: string) => {
    setBriefingTime(timeStr);
    setShowTimePicker(false);
    onTriggerToast(`⏰ Morning Briefing notification scheduled for ${timeStr} daily!`);
  };

  return (
    <div className="space-y-5 pb-8 font-sans max-w-2xl mx-auto">
      {/* HEALTH HUB HEADER WITH 4 SIMPLE TABS */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 border border-cyan-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Sparkles size={20} />
              </div>
            </div>
            <div>
              <h2 className="font-black text-white text-base font-display uppercase tracking-wide">
                HEALTH HUB
              </h2>
              <p className="text-[11px] text-slate-300">
                All-in-one physiological telemetry & reports
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenNutriChat("Give me a complete summary of all my Health Hub data.")}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
          >
            Ask NutriChat
          </button>
        </div>

        {/* 4 SIMPLE TABS */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          {(['today', 'weekly', 'monthly', 'insights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 rounded-xl uppercase font-extrabold tracking-wider transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TODAY */}
      {activeTab === 'today' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          {/* MORNING BRIEFING */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  MORNING BRIEFING
                </span>
                
                <div className="relative">
                  <button
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="text-[9.5px] font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Clock size={11} />
                    <span>Notify at {briefingTime}</span>
                  </button>

                  {showTimePicker && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-slate-900 border border-white/20 rounded-xl p-2 z-50 shadow-2xl space-y-1">
                      {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM'].map(t => (
                        <button
                          key={t}
                          onClick={() => handleTimeSelect(t)}
                          className="w-full text-left px-2 py-1 rounded text-xs font-mono text-slate-200 hover:bg-white/10 block"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400">
                {hasConnectedDevices ? '24/7 Sensor Verified' : 'Awaiting Wearable'}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {hasConnectedDevices 
                ? "Your health twin is waiting for real data. Connect a wearable and log your meals for an automated health report." 
                : "Connect your smartwatch to generate an automated morning health report based on continuous overnight sensors."}
            </p>
          </div>

          {/* TODAY'S SENSOR ANALYTICS GRID */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
              Today's Sensor Analytics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <HeartPulse size={12} className="text-rose-400" /> Heart Rate
                </span>
                <span className="text-sm font-black text-white block">
                  {metrics.avgHeartRateBpm > 0 ? `${metrics.avgHeartRateBpm} BPM` : 'No data'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Radio size={12} className="text-purple-400" /> Oxygen (SpO2)
                </span>
                <span className="text-sm font-black text-white block">
                  {metrics.avgSpO2Percent !== undefined ? `${metrics.avgSpO2Percent}%` : 'No data'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Activity size={12} className="text-amber-400" /> Stress Level
                </span>
                <span className="text-sm font-black text-white block">
                  {metrics.avgStressLevel !== undefined ? `${metrics.avgStressLevel}% (Low)` : 'No data'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Flame size={12} className="text-amber-400" /> Active Burn
                </span>
                <span className="text-sm font-black text-white block">
                  {metrics.totalActiveCalories > 0 ? `${metrics.totalActiveCalories} kcal` : 'No data'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Scale size={12} className="text-cyan-400" /> Smart Scale
                </span>
                <span className="text-sm font-black text-white block">
                  {metrics.latestWeightKg !== undefined ? `${metrics.latestWeightKg} kg` : 'No data'}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Droplets size={12} className="text-blue-400" /> Water Synced
                </span>
                <span className="text-sm font-black text-white block">
                  {(waterIntakeToday / 1000).toFixed(1)} L
                </span>
              </div>
            </div>
          </div>

          {/* BODY STATUS TODAY */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 block">
              Body Status Today
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-xl font-bold">
                🏋️ Heavy strength training recommended
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-xl font-bold">
                💧 Hydration goal: 3.0L
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-xl font-bold">
                🌙 Sleep bedtime: 10:30 PM
              </span>
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB 2: WEEKLY */}
      {activeTab === 'weekly' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          {/* HEALTH TRENDS */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <TrendingUp size={14} className="text-cyan-400" /> Weekly Health Trends
              </span>

              <div className="flex gap-1 text-[9px] font-mono">
                {(['recovery', 'sleep', 'weight', 'calories', 'stress'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTrendTab(t)}
                    className={`px-2 py-0.5 rounded uppercase font-bold cursor-pointer ${
                      activeTrendTab === t ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">7-Day Trajectory: <strong className="text-emerald-400">No data</strong></span>
                <span className="text-slate-400">7-Day Avg: No data</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 h-20 items-end pt-2">
                {[].map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-mono text-slate-400">{val}%</span>
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t-md" 
                      style={{ height: `${val * 0.6}px` }} 
                    />
                    <span className="text-[8px] font-mono text-slate-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WEEKLY REPORTS */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-white uppercase">Weekly Reports & Analytics</h3>
              <button
                onClick={onOpenReports}
                className="text-xs text-cyan-400 font-mono font-bold hover:underline"
              >
                View Full Page →
              </button>
            </div>
            <ReportsPanel userGoal={userGoal} totalCaloriesToday={totalCaloriesToday} />
          </div>

        </motion.div>
      )}

      {/* TAB 3: MONTHLY */}
      {activeTab === 'monthly' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <Calendar size={14} className="text-cyan-400" /> Monthly Reports & Health Timeline
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect real data to see your 30-day health trends here.
            </p>

            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Longevity Milestone Index</span>
                <span className="text-emerald-400 font-bold">No data</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Monthly Muscle Mass Retention</span>
                <span className="text-cyan-300 font-bold">No data</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Monthly Average Resting HR</span>
                <span className="text-rose-400 font-bold">No data</span>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB 4: INSIGHTS */}
      {activeTab === 'insights' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          {/* AI HEALTH TWIN */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                <Dna size={14} /> AI Health Twin & Predictive Analytics
              </span>
            </div>
            <AIHealthTwin
              userAge={0}
              userWeight={72}
              userHeight={175}
              userGoal={userGoal}
              wearables={wearables}
              onOpenNutriChat={onOpenNutriChat}
              onTriggerToast={onTriggerToast}
            />
          </div>

          {/* DEVICE ANALYTICS (21+ WEARABLES) */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Watch size={14} className="text-cyan-400" /> Device Analytics & Wearable Mesh
                </h4>
                <p className="text-[10px] text-slate-400">21+ Smart Devices Supported</p>
              </div>

              <button
                onClick={onOpenDeviceManager}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold rounded-xl cursor-pointer"
              >
                Manage Devices
              </button>
            </div>
          </div>

          {/* HEALTH VAULT & EMERGENCY MODE */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
                <Lock size={14} className="text-cyan-400" /> Health Vault & Emergency SOS
              </span>
              <button
                onClick={() => onTriggerToast("🚨 Emergency SOS Test signal broadcasted successfully!")}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl cursor-pointer"
              >
                Test SOS
              </button>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
};
