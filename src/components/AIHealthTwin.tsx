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

  // Proactive AI Companion Insights
  const proactiveInsights = [
    {
      id: 'p1',
      tag: 'Sleep & Recovery',
      role: 'Recovery Coach ⚡',
      hinglish: 'Kal tum sirf 5 ghante soye the. Aaj 20 min power nap aur deep sleep prioratize karo.',
      english: 'You only slept 5 hours last night. Prioritize a 20-min power nap today.',
      type: 'warning',
      actionPrompt: 'Mujhe meri poor sleep fixed karne ke liye routine suggest karo'
    },
    {
      id: 'p2',
      tag: 'Protein & Macro',
      role: 'Nutrition Coach 🥗',
      hinglish: 'Tum pichle 3 din se protein 25g kam consume kar rahe ho (Target 120g vs 95g achieved).',
      english: 'Your protein intake has been 25g below target for 3 consecutive days.',
      type: 'alert',
      actionPrompt: 'Mera daily protein intake complete karne ke liye quick high-protein snacks batao'
    },
    {
      id: 'p3',
      tag: 'Daily Workout',
      role: 'Personal Trainer 🏋️‍♂️',
      hinglish: 'Aaj tumhari recovery score 88% hai! Aaj heavy compound workout/lifting kar sakte ho.',
      english: 'Your recovery score is 88%! Perfect day for a heavy workout session.',
      type: 'success',
      actionPrompt: 'Aaj ke heavy workout ke liye optimal exercise routine suggest karo'
    },
    {
      id: 'p4',
      tag: 'Hydration Target',
      role: 'Personal Doctor 🩺',
      hinglish: 'Tumhari hydration pichle hafte se 35% kam ho gayi hai (Current: 1.8L vs Goal: 3.0L).',
      english: 'Your hydration dropped 35% compared to last week (1.8L vs 3.0L goal).',
      type: 'warning',
      actionPrompt: '3L water hydration maintain karne ki easy tips batao'
    },
    {
      id: 'p5',
      tag: 'Sleep Cumulative',
      role: 'AI Health Friend 🤖',
      hinglish: 'Tumhari sleep continuously 4 din se poor hai. Main tumhare stress levels monitor kar raha hu.',
      english: 'Your sleep quality has been low for 4 consecutive days.',
      type: 'alert',
      actionPrompt: 'Continuous poor sleep se recovery aur stress control kaise kare?'
    }
  ];

  const handleReSyncTwin = () => {
    setIsSyncing(true);
    if (onTriggerToast) onTriggerToast('🔄 Re-syncing AI Health Twin with 21 Wearables & Biometric Sensor Mesh...');
    setTimeout(() => {
      setIsSyncing(false);
      if (onTriggerToast) onTriggerToast('✨ Digital Health Twin updated with 100% Real-Time Accuracy!');
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
                  <Lock size={9} /> 256-Bit Encrypted
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-2 font-mono">
                <span>Real-Time Biometric Replication Active</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">21 Wearables Synced</span>
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
            <span className="text-base font-bold text-slate-200 mt-0.5 block">{userAge} Years</span>
          </div>

          <div className="bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 p-2.5 rounded-xl border border-emerald-500/40">
            <span className="text-[9px] text-emerald-400 uppercase font-bold block">Biological Age Score</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 mt-0.5 block flex items-center justify-center gap-1">
              {hasConnectedDevices ? (
                <>🧬 {(userAge - 3.8).toFixed(1)} <span className="text-[9px] text-emerald-400 font-bold">(-3.8 Yrs Younger)</span></>
              ) : (
                <span className="text-amber-400 text-xs">Device required</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Health Scores Grid (8 Key Scores) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider block flex items-center justify-between">
          <span>AI Health Twin Biometric Scores</span>
          <span className="text-slate-400 font-normal">{hasConnectedDevices ? 'Synced via Device Mesh' : 'Waiting for Device'}</span>
        </span>

        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          {/* Daily Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Daily Score</span>
            <span className="text-xs font-black text-cyan-300 block mt-0.5">
              {hasConnectedDevices ? `${Math.min(100, Math.round((metrics.avgRecoveryScore || 75) * 1.1))}/100` : 'Device required'}
            </span>
          </div>

          {/* Weekly Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Weekly Score</span>
            <span className="text-xs font-black text-blue-300 block mt-0.5">
              {hasConnectedDevices ? '88/100' : 'Device required'}
            </span>
          </div>

          {/* Monthly Health */}
          <div className="bg-slate-900/80 border border-white/10 p-2 rounded-xl">
            <span className="text-[8px] text-slate-400 uppercase block">Monthly Score</span>
            <span className="text-xs font-black text-indigo-300 block mt-0.5">
              {hasConnectedDevices ? '89/100' : 'Device required'}
            </span>
          </div>

          {/* Recovery Score */}
          <div className="bg-slate-900/80 border border-emerald-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-emerald-400 uppercase block font-bold">Recovery</span>
            <span className="text-xs font-black text-emerald-300 block mt-0.5">
              {metrics.avgRecoveryScore !== undefined ? `${metrics.avgRecoveryScore}%` : 'Waiting for sync'}
            </span>
          </div>

          {/* Fitness Score */}
          <div className="bg-slate-900/80 border border-amber-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-amber-400 uppercase block font-bold">Fitness</span>
            <span className="text-xs font-black text-amber-300 block mt-0.5">
              {metrics.totalWorkoutTimeMins !== undefined ? `${metrics.totalWorkoutTimeMins} min` : 'Device required'}
            </span>
          </div>

          {/* Stress Score */}
          <div className="bg-slate-900/80 border border-purple-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-purple-400 uppercase block font-bold">Stress Index</span>
            <span className="text-xs font-black text-purple-300 block mt-0.5">
              {metrics.avgStressLevel !== undefined ? `${metrics.avgStressLevel}%` : 'Device required'}
            </span>
          </div>

          {/* Longevity Score */}
          <div className="bg-slate-900/80 border border-yellow-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-yellow-400 uppercase block font-bold">Longevity</span>
            <span className="text-xs font-black text-yellow-300 block mt-0.5">
              {hasConnectedDevices ? '95/100' : 'Device required'}
            </span>
          </div>

          {/* Bio Age */}
          <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xl">
            <span className="text-[8px] text-cyan-400 uppercase block font-bold">Bio-Age</span>
            <span className="text-xs font-black text-cyan-300 block mt-0.5">
              {hasConnectedDevices ? `${(userAge - 3.8).toFixed(1)} Yrs` : 'Device required'}
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
                "Hello! I'm NutriChat AI, your personal health twin. I've verified your sleep, hydration, and workout patterns. Focus on proper recovery today and let me know how you're feeling!"
              </p>
            </div>
          )}

          {activePersona === 'doctor' && (
            <div>
              <h5 className="font-bold text-rose-300 flex items-center gap-1.5">
                <Stethoscope size={14} /> Personal Doctor Insights
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Blood pressure (118/76) and resting HR (62 bpm) are in optimal athletic range. Blood glucose levels are stable at 92 mg/dL. Allergies recorded: Peanut & Lactose. No critical cardiovascular anomalies detected."
              </p>
            </div>
          )}

          {activePersona === 'trainer' && (
            <div>
              <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                <Dumbbell size={14} /> Personal Fitness Trainer
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Recovery Score is 88%! Your HRV is high and central nervous system is primed. Today is ideal for a heavy compound strength workout (Deadlifts/Squats or Upper Body Hypertrophy)."
              </p>
            </div>
          )}

          {activePersona === 'nutrition' && (
            <div>
              <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Utensils size={14} /> Nutrition & Macro Coach
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Macronutrient Partitioning: Protein target is 120g/day. You consumed 95g yesterday (25g gap). Recommend 250g paneer, 3 boiled eggs, or a scoops of whey protein before bedtime."
              </p>
            </div>
          )}

          {activePersona === 'recovery' && (
            <div>
              <h5 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Zap size={14} /> Recovery & Sleep Specialist
              </h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                "Deep Sleep: 1h 45m (Good). REM Sleep: 1h 20m. Stress index is low at 22/100. Hydration needs attention (1.8L logged out of 3.0L goal)."
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
          {proactiveInsights.map((insight) => (
            <div 
              key={insight.id}
              onClick={() => handleSelectPrompt(insight.actionPrompt)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/40 p-3 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                  {insight.role}
                </span>
                <span className="text-[9px] text-cyan-400 font-bold group-hover:underline flex items-center gap-1 font-mono">
                  Ask NutriChat <ChevronRight size={11} />
                </span>
              </div>

              <p className="text-xs text-white font-medium mt-1.5 leading-snug">
                "{insight.hinglish}"
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 italic">
                {insight.english}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Global Bottom CTA to Chat with Health Twin */}
      <button
        onClick={() => handleSelectPrompt('Hey NutriChat, analyze my AI Health Twin data and give me my overall daily recommendations')}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <MessageCircle size={15} />
        <span>Chat with Your AI Health Twin</span>
      </button>
    </div>
  );
};
