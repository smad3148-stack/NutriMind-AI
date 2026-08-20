import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, HeartPulse, Activity, Brain, ShieldAlert, Sparkles, 
  Stethoscope, Dumbbell, Utensils, Zap, MessageCircle, RefreshCw, 
  ChevronRight, Lock, CheckCircle, TrendingUp, AlertTriangle, Moon, Droplets
} from 'lucide-react';
import { WearableMetrics } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';

interface AIHealthTwinProps {
  userAge?: number;
  userWeight?: number;
  userHeight?: number;
  userGoal?: string;
  wearables?: WearableMetrics[];
  onOpenNutriChat?: (prompt?: string) => void;
  onTriggerToast?: (msg: string) => void;
}

export const AIHealthTwin: React.FC<AIHealthTwinProps> = ({
  userAge = 28,
  userWeight = 72,
  userHeight = 175,
  userGoal = 'Muscle Building & Longevity',
  wearables = [],
  onOpenNutriChat,
  onTriggerToast
}) => {
  const [activePersona, setActivePersona] = useState<'doctor' | 'trainer' | 'nutrition' | 'recovery' | 'friend'>('friend');
  const [isSyncing, setIsSyncing] = useState(false);

  const connectedWearables = wearables.filter(w => w.connected);
  const hasConnectedDevices = connectedWearables.length > 0;
  const metrics = aggregateHealthMetrics(wearables);

  // P0-05: only devices carrying real telemetry count as synced. Bio-age,
  // "21 wearables", BP/glucose claims and hardcoded scores were fabricated
  // and have been removed.
  const hasRealData =
    metrics.totalSteps > 0 ||
    metrics.avgHeartRateBpm > 0 ||
    metrics.totalSleepHours > 0 ||
    metrics.totalActiveCalories > 0 ||
    (metrics.avgHrvMs ?? 0) > 0 ||
    (metrics.latestWeightKg ?? 0) > 0 ||
    (metrics.latestGlucoseMgDl ?? 0) > 0;
  const dataDeviceCount = hasRealData ? connectedWearables.length : 0;

  const handleReSyncTwin = () => {
    setIsSyncing(true);
    if (onTriggerToast) onTriggerToast(hasRealData ? '🔄 Re-syncing AI Health Twin…' : 'No wearable data to sync yet. Connect a device first.');
    setTimeout(() => {
      setIsSyncing(false);
      if (onTriggerToast) onTriggerToast(hasRealData ? '✨ Digital Health Twin updated.' : 'Still waiting for real wearable data.');
    }, 1200);
  };

  const handleSelectPrompt = (promptText: string) => {
    if (onOpenNutriChat) {
      onOpenNutriChat(promptText);
    } else if (onTriggerToast) {
      onTriggerToast(`Asking NutriChat: "${promptText}"`);
    }
  };

  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-4 text-white space-y-4 shadow-2xl relative overflow-hidden">
      {/* Subtle Background Mesh glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Digital Twin Header Card */}
      <div className="bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-400/40 p-4 rounded-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 relative overflow-hidden">
                  <Dna size={28} className="animate-pulse" />
                  <span className="absolute bottom-1 text-[7px] font-mono font-bold text-cyan-300">TWIN v10</span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-950">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm font-display tracking-wide">
                  YOUR AI DIGITAL HEALTH TWIN
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-mono font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                  <Lock size={9} /> Local Data
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-2 font-mono">
                <span>{hasRealData ? 'Real-Time Biometric Replication Active' : 'Waiting for real device data'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{hasRealData ? `${dataDeviceCount} Wearable${dataDeviceCount === 1 ? '' : 's'} Synced` : 'No Wearables Synced'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleReSyncTwin}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono font-bold text-[10px] rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin text-cyan-400" : ""} />
            {isSyncing ? 'Syncing...' : 'Re-sync Twin'}
          </button>
        </div>

        {/* Biological Age vs Chronological Age Highlight */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center font-mono">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase block">Chronological Age</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">{userAge > 0 ? `${userAge} Years` : 'No data'}</span>
          </div>

          <div className="bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 p-2.5 rounded-xl border border-emerald-500/40">
            <span className="text-[9px] text-emerald-400 uppercase font-bold block">Biological Age Score</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 mt-0.5 block">
              {hasRealData ? 'Calculating…' : 'No data — requires real biometrics'}
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Health Scores Grid (8 Key Scores) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider block flex items-center justify-between">
          <span>AI Health Twin Biometric Scores</span>
          <span className="text-slate-400 font-normal">{hasRealData ? 'Synced via Device Mesh' : 'No data synced'}</span>
        </span>

        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          {/* Daily Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Daily Score</span>
            <span className="text-xs font-black text-cyan-300 block mt-0.5">
              {metrics.avgRecoveryScore ? `${Math.min(100, metrics.avgRecoveryScore)}/100` : 'No data'}
            </span>
          </div>

          {/* Weekly Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Weekly Score</span>
            <span className="text-xs font-black text-blue-300 block mt-0.5">
              No data
            </span>
          </div>

          {/* Monthly Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Monthly Score</span>
            <span className="text-xs font-black text-indigo-300 block mt-0.5">
              No data
            </span>
          </div>

          {/* Recovery Score */}
          <div className="bg-slate-900/80 border border-emerald-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-emerald-400 uppercase block font-bold">Recovery</span>
            <span className="text-xs font-black text-emerald-300 block mt-0.5">
              {metrics.avgRecoveryScore !== undefined ? `${metrics.avgRecoveryScore}%` : 'No data'}
            </span>
          </div>

          {/* Fitness Score */}
          <div className="bg-slate-900/80 border border-amber-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-amber-400 uppercase block font-bold">Fitness</span>
            <span className="text-xs font-black text-amber-300 block mt-0.5">
              {metrics.totalWorkoutTimeMins !== undefined ? `${metrics.totalWorkoutTimeMins} min` : 'No data'}
            </span>
          </div>

          {/* Stress Score */}
          <div className="bg-slate-900/80 border border-purple-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-purple-400 uppercase block font-bold">Stress Index</span>
            <span className="text-xs font-black text-purple-300 block mt-0.5">
              {metrics.avgStressLevel !== undefined ? `${metrics.avgStressLevel}%` : 'No data'}
            </span>
          </div>

          {/* Longevity Score */}
          <div className="bg-slate-900/80 border border-yellow-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-yellow-400 uppercase block font-bold">Longevity</span>
            <span className="text-xs font-black text-yellow-300 block mt-0.5">
              No data
            </span>
          </div>

          {/* Bio Age */}
          <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-cyan-400 uppercase block font-bold">Bio-Age</span>
            <span className="text-xs font-black text-cyan-300 block mt-0.5">
              No data
            </span>
          </div>
        </div>
      </div>

      {/* 5 AI Roles Matrix Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
          AI Twin Roles & Persona Insights
        </span>

        <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-2xl border border-white/10 text-[9px] font-bold">
          <button
            onClick={() => setActivePersona('friend')}
            className={`py-1.5 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
              activePersona === 'friend' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖 AI Friend</span>
          </button>

          <button
            onClick={() => setActivePersona('doctor')}
            className={`py-1.5 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
              activePersona === 'doctor' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🩺 Doctor</span>
          </button>

          <button
            onClick={() => setActivePersona('trainer')}
            className={`py-1.5 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
              activePersona === 'trainer' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏋️ Trainer</span>
          </button>

          <button
            onClick={() => setActivePersona('nutrition')}
            className={`py-1.5 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
              activePersona === 'nutrition' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🥗 Nutrition</span>
          </button>

          <button
            onClick={() => setActivePersona('recovery')}
            className={`py-1.5 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
              activePersona === 'recovery' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ Recovery</span>
          </button>
        </div>

        {/* Dynamic Persona Advice Box */}
        <div className="bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl space-y-2 text-xs">
          {activePersona === 'friend' && (
            <div>
              <h5 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} /> AI Personal Health Companion
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Hi! I'm NutriChat AI, your health companion. Once you connect a wearable and log your meals, I can personalise everything for you. For now, ask me any nutrition, fitness or wellness question!"
              </p>
            </div>
          )}

          {activePersona === 'doctor' && (
            <div>
              <h5 className="font-bold text-rose-300 flex items-center gap-1.5">
                <Stethoscope size={14} /> Personal Doctor Insights
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "No biometric readings are connected yet. Connect a wearable (Apple Health, Health Connect, Fitbit…) or log your vitals for personalised insights — and always consult a qualified doctor for medical advice."
              </p>
            </div>
          )}

          {activePersona === 'trainer' && (
            <div>
              <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                <Dumbbell size={14} /> Personal Fitness Trainer
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Once activity data is synced, I can tailor workout intensity to your recovery. Until then: consistency, progressive overload and proper form build the foundation."
              </p>
            </div>
          )}

          {activePersona === 'nutrition' && (
            <div>
              <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Utensils size={14} /> Nutrition & Macro Coach
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Share what you ate today and I'll help you hit your macro targets. Use the meal scanner for instant calorie and protein estimates."
              </p>
            </div>
          )}

          {activePersona === 'recovery' && (
            <div>
              <h5 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Zap size={14} /> Recovery & Sleep Specialist
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Sleep and recovery tracking need connected data. Use the manual sleep log to start building your recovery picture."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Proactive Nudges & Insights Feed */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider block flex items-center justify-between">
          <span>Proactive AI Twin Health Alerts</span>
          <span className="text-slate-400 font-normal">Tap to ask NutriChat</span>
        </span>

        <div className="space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed p-3 bg-slate-900/60 border border-white/10 rounded-2xl">
            {hasRealData
              ? 'Insights will appear here as more data streams in.'
              : 'No health insights yet — connect a wearable or log your meals for personalised alerts.'}
          </p>
        </div>
      </div>

      {/* Global Bottom CTA to Chat with Health Twin */}
      <button
        onClick={() => handleSelectPrompt('Hey NutriChat, help me understand my current health and nutrition goals')}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <MessageCircle size={15} />
        <span>Chat with Your AI Health Twin</span>
      </button>
    </div>
  );
};
