import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, Moon, Zap, Watch, Sparkles, ArrowRight, CheckCircle2, ShieldCheck,
  X, Flame, Activity, TrendingUp, HeartPulse, Scale, Award, Info, ChevronRight,
  TrendingDown, Dumbbell, Utensils, Target, RefreshCw, BarChart3, LineChart, AlertTriangle
} from 'lucide-react';
import { FoodItem, WearableMetrics } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';

interface CleanHomeDashboardProps {
  userGoal: string;
  userName?: string;
  meals: FoodItem[];
  waterIntakeToday: number;
  sleepScore: number;
  recoveryScore?: number;
  wearables?: WearableMetrics[];
  earnedEliteDays?: number;
  daysRemaining?: number;
  currentEliteDay?: number;
  onOpenElitePanel?: () => void;
  onAddWater: (amt: number) => void;
  onAddFood: () => void;
  onAddSleep: () => void;
  onConnectDevice: () => void;
  onOpenNutriChat: (prompt?: string) => void;
  onTriggerToast?: (msg: string) => void;
}

type Level2PageType = 'health_score' | 'sleep' | 'recovery' | 'water' | 'calories' | 'protein' | 'goals_terminal' | null;

export const CleanHomeDashboard: React.FC<CleanHomeDashboardProps> = ({
  userGoal,
  userName = 'Mitrabha',
  meals,
  waterIntakeToday,
  sleepScore,
  wearables = [],
  earnedEliteDays = 14,
  daysRemaining = 13,
  currentEliteDay = 1,
  onOpenElitePanel,
  onAddWater,
  onAddFood,
  onConnectDevice,
  onOpenNutriChat,
  onTriggerToast
}) => {
  const connectedWearables = wearables.filter(w => w.connected);
  const hasConnectedDevices = connectedWearables.length > 0;
  const metrics = aggregateHealthMetrics(wearables);

  // LEVEL 2 Modal State
  const [activeLevel2Modal, setActiveLevel2Modal] = useState<Level2PageType>(null);

  // WEIGHT GOAL TERMINAL MODE STATE ('loss' | 'gain')
  const [goalMode, setGoalMode] = useState<'loss' | 'gain'>('loss');

  // Time Filter States inside Level 2 Pages
  const [sleepTimeFilter, setSleepTimeFilter] = useState<'1h' | '6h' | 'today' | 'yesterday' | '7d' | '30d' | '3m' | '6m' | '1y'>('today');
  const [sleepGraphMode, setSleepGraphMode] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  const [recoveryTimeFilter, setRecoveryTimeFilter] = useState<'1h' | 'today' | 'week' | 'month' | 'year'>('week');
  const [waterTimeFilter, setWaterTimeFilter] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [proteinTimeFilter, setProteinTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [caloriesTimeFilter, setCaloriesTimeFilter] = useState<'consumed' | 'burned' | 'weekly_avg' | 'monthly_avg'>('consumed');
  const [healthScoreTimeFilter, setHealthScoreTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Calculations
  const totalCaloriesToday = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinToday = meals.reduce((acc, m) => acc + m.protein, 0);

  const targetCalories = goalMode === 'loss' ? 1800 : 2600;
  const targetProtein = goalMode === 'loss' ? 140 : 160;
  const targetWaterMl = 3000;

  // Health score calculation
  let healthScore = 88;
  if (hasConnectedDevices) {
    const sleepFactor = (metrics.totalSleepHours || 7.5) / 8.0;
    const recoveryFactor = (metrics.avgRecoveryScore || 85) / 100;
    const waterFactor = Math.min(1, (metrics.syncedWaterMl || waterIntakeToday) / targetWaterMl);
    const nutritionFactor = Math.min(1, totalProteinToday / targetProtein);

    healthScore = Math.min(100, Math.max(60, Math.round(
      (sleepFactor * 30) +
      (recoveryFactor * 30) +
      (waterFactor * 20) +
      (nutritionFactor * 20)
    )));
  }

  // DISCONNECTED WEARABLE VIEW
  if (!hasConnectedDevices) {
    return (
      <div className="space-y-6 max-w-xl mx-auto font-sans pb-8 pt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 shadow-inner">
            <Watch size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-display tracking-tight uppercase">
              NO DEVICE CONNECTED
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Connect your wearable or health app to sync live metrics:
            </p>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-left max-w-xs mx-auto space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Smart Watches & Rings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Apple Health & Samsung Health</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Health Connect & Smart Scales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Food, Workout & Water Sync</span>
            </div>
          </div>

          <button
            onClick={onConnectDevice}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-xl shadow-cyan-500/20 cursor-pointer uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <Watch size={18} />
            <span>CONNECT DEVICE</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 max-w-md mx-auto font-sans pb-10 pt-1 transition-colors duration-500 ${
      goalMode === 'loss' ? 'theme-weight-loss' : 'theme-weight-gain'
    }`}>
      
      {/* HEADER GREETING & TERMINAL MODE SWITCHER */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-white font-display tracking-tight">
            Hi, {userName}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            3-Second Health Rule • Tap card for deep analytics
          </p>
        </div>

        {/* DUAL TERMINAL MODE TOGGLE */}
        <div className="bg-slate-900/90 border border-white/10 p-1 rounded-2xl flex items-center gap-1 font-mono text-[9px]">
          <button
            onClick={() => {
              setGoalMode('loss');
              onTriggerToast?.('🔥 Switched to WEIGHT LOSS TERMINAL');
            }}
            className={`px-2.5 py-1 rounded-xl uppercase font-bold transition cursor-pointer flex items-center gap-1 ${
              goalMode === 'loss' 
                ? 'bg-rose-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown size={11} />
            <span>Loss</span>
          </button>
          <button
            onClick={() => {
              setGoalMode('gain');
              onTriggerToast?.('💪 Switched to WEIGHT GAIN TERMINAL');
            }}
            className={`px-2.5 py-1 rounded-xl uppercase font-bold transition cursor-pointer flex items-center gap-1 ${
              goalMode === 'gain' 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={11} />
            <span>Gain</span>
          </button>
        </div>
      </div>

      {/* HOME SCREEN ELITE ACCESS STATUS CARD */}
      <div 
        onClick={() => onOpenElitePanel ? onOpenElitePanel() : null}
        className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden cursor-pointer transition group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} /> ELITE ACCESS
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              NO PAYMENT REQUIRED
            </span>
          </div>

          <span className="text-[10px] font-mono text-cyan-400 font-bold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
            Missions <ChevronRight size={12} />
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between relative z-10">
          <div>
            <div className="text-sm font-black text-white font-mono tracking-wide">
              DAY {currentEliteDay} / 14
            </div>
            <div className="text-[10.5px] text-slate-300 font-mono mt-0.5">
              {daysRemaining} DAYS REMAINING • 100% UNLOCKED
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs font-black text-cyan-300 tracking-wider">
              ██████░░░░
            </div>
            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">100% FREE</span>
          </div>
        </div>

        <div className="mt-2.5 border-t border-white/5 pt-2 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
          <span>Complete health missions to unlock more Elite days.</span>
          <span className="text-cyan-300 font-semibold text-[9.5px]">Tap to claim rewards</span>
        </div>
      </div>


      {/* ========================================================= */}
      {/* LEVEL 1: HOME PAGE — STRICTLY ONLY THE 6 ESSENTIAL CARDS  */}
      {/* ========================================================= */}

      <div className="space-y-3">

        {/* 1. HEALTH SCORE CARD */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveLevel2Modal('health_score')}
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/40 rounded-3xl p-5 text-white shadow-xl cursor-pointer hover:border-cyan-400 transition relative overflow-hidden flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <Sparkles size={12} /> AI HEALTH SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tight">
                {healthScore}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">/ 100</span>
            </div>
            <p className="text-[10.5px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Health score improved +17% this month →
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles size={22} />
          </div>
        </motion.div>

        {/* 2 & 3. SLEEP AND RECOVERY (2 COLUMN GRID) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 2. SLEEP CARD */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveLevel2Modal('sleep')}
            className="bg-slate-950 border border-white/10 rounded-3xl p-4.5 space-y-1.5 hover:border-indigo-500/40 transition shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">SLEEP</span>
              <Moon size={16} />
            </div>
            <span className="text-2xl font-black text-white font-mono block">
              {metrics.totalSleepHours > 0 ? `${metrics.totalSleepHours} hrs` : '7.4 hrs'}
            </span>
            <span className="text-[10px] text-indigo-300 font-medium block flex items-center justify-between">
              <span>91% Quality</span>
              <ChevronRight size={12} className="text-slate-500" />
            </span>
          </motion.div>

          {/* 3. RECOVERY CARD */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveLevel2Modal('recovery')}
            className="bg-slate-950 border border-white/10 rounded-3xl p-4.5 space-y-1.5 hover:border-emerald-500/40 transition shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">RECOVERY</span>
              <Zap size={16} />
            </div>
            <span className="text-2xl font-black text-white font-mono block">
              {metrics.avgRecoveryScore !== undefined ? `${metrics.avgRecoveryScore}%` : '89%'}
            </span>
            <span className="text-[10px] text-emerald-300 font-medium block flex items-center justify-between">
              <span>Prime CNS Stamina</span>
              <ChevronRight size={12} className="text-slate-500" />
            </span>
          </motion.div>

        </div>

        {/* 4. WATER CARD */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveLevel2Modal('water')}
          className="bg-slate-950 border border-white/10 rounded-3xl p-4.5 flex items-center justify-between shadow-lg cursor-pointer hover:border-blue-500/40 transition"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-extrabold block">
              WATER INTAKE
            </span>
            <span className="text-2xl font-black text-white font-mono block">
              {(waterIntakeToday / 1000).toFixed(1)}L <span className="text-xs text-slate-500 font-normal">/ {(targetWaterMl / 1000).toFixed(1)}L</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddWater(250);
                onTriggerToast?.("💧 Logged +250ml Water!");
              }}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-300 font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Droplets size={14} />
              <span>+250ml</span>
            </button>
            <ChevronRight size={16} className="text-slate-500" />
          </div>
        </motion.div>

        {/* 5 & 6. CALORIES AND PROTEIN (2 COLUMN GRID) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 5. CALORIES CARD */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveLevel2Modal('calories')}
            className={`bg-slate-950 border border-white/10 rounded-3xl p-4.5 space-y-1.5 transition shadow-lg cursor-pointer ${
              goalMode === 'loss' ? 'hover:border-rose-500/40' : 'hover:border-amber-500/40'
            }`}
          >
            <div className={`flex items-center justify-between ${goalMode === 'loss' ? 'text-rose-400' : 'text-amber-400'}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">CALORIES</span>
              <Flame size={16} />
            </div>
            <span className="text-xl font-black text-white font-mono block">
              {totalCaloriesToday} <span className="text-xs text-slate-500 font-normal">/ {targetCalories}</span>
            </span>
            <span className={`text-[10px] font-medium block flex items-center justify-between ${
              goalMode === 'loss' ? 'text-rose-300' : 'text-amber-300'
            }`}>
              <span>{goalMode === 'loss' ? `${Math.max(0, targetCalories - totalCaloriesToday)} kcal deficit cap` : `${Math.max(0, targetCalories - totalCaloriesToday)} kcal surplus target`}</span>
              <ChevronRight size={12} className="text-slate-500" />
            </span>
          </motion.div>

          {/* 6. PROTEIN CARD */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveLevel2Modal('protein')}
            className="bg-slate-950 border border-white/10 rounded-3xl p-4.5 space-y-1.5 hover:border-purple-500/40 transition shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">PROTEIN</span>
              <Dumbbell size={16} />
            </div>
            <span className="text-xl font-black text-white font-mono block">
              {totalProteinToday}g <span className="text-xs text-slate-500 font-normal">/ {targetProtein}g</span>
            </span>
            <span className="text-[10px] text-purple-300 font-medium block flex items-center justify-between">
              <span>{Math.max(0, targetProtein - totalProteinToday)}g remaining</span>
              <ChevronRight size={12} className="text-slate-500" />
            </span>
          </motion.div>

        </div>

        {/* TERMINAL PROTOCOL ACCESS BAR */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveLevel2Modal('goals_terminal')}
          className={`border rounded-3xl p-4 flex items-center justify-between shadow-lg cursor-pointer transition ${
            goalMode === 'loss' 
              ? 'bg-gradient-to-r from-rose-950/60 via-slate-950 to-slate-900 border-rose-500/40 hover:border-rose-400' 
              : 'bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border-emerald-500/40 hover:border-emerald-400'
          }`}
        >
          <div className="space-y-0.5">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1 ${
              goalMode === 'loss' ? 'text-rose-300' : 'text-emerald-300'
            }`}>
              <Target size={12} /> TERMINAL: {goalMode === 'loss' ? 'WEIGHT LOSS MODE' : 'WEIGHT GAIN MODE'}
            </span>
            <span className="text-xs font-bold text-slate-200 block">
              {goalMode === 'loss' 
                ? 'Fat Loss • 500 kcal Deficit • High Cardio Protocol' 
                : 'Muscle Gain • 400 kcal Surplus • Hypertrophy Protocol'}
            </span>
          </div>

          <div className={`flex items-center gap-1 font-mono text-xs font-bold shrink-0 ${
            goalMode === 'loss' ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <span>Open Terminal</span>
            <ArrowRight size={14} />
          </div>
        </motion.div>

      </div>

      {/* ========================================================= */}
      {/* LEVEL 2 MODALS / UNLIMITED ANALYTICS PAGES               */}
      {/* ========================================================= */}

      <AnimatePresence>
        {activeLevel2Modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-slate-950 border border-white/20 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans text-white"
            >
              
              {/* MODAL HEADER */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    {activeLevel2Modal === 'health_score' && <Sparkles size={18} />}
                    {activeLevel2Modal === 'sleep' && <Moon size={18} />}
                    {activeLevel2Modal === 'recovery' && <Zap size={18} />}
                    {activeLevel2Modal === 'water' && <Droplets size={18} />}
                    {activeLevel2Modal === 'calories' && <Flame size={18} />}
                    {activeLevel2Modal === 'protein' && <Dumbbell size={18} />}
                    {activeLevel2Modal === 'goals_terminal' && <Target size={18} />}
                  </div>
                  <div>
                    <h2 className="font-black text-sm uppercase tracking-wider text-white">
                      {activeLevel2Modal === 'health_score' && 'AI Health Score & Longevity'}
                      {activeLevel2Modal === 'sleep' && 'Sleep Analytics Terminal'}
                      {activeLevel2Modal === 'recovery' && 'Recovery & Readiness Analytics'}
                      {activeLevel2Modal === 'water' && 'Hydration Analytics'}
                      {activeLevel2Modal === 'calories' && 'Calories & Nutrition Analytics'}
                      {activeLevel2Modal === 'protein' && 'Protein & Muscle Growth'}
                      {activeLevel2Modal === 'goals_terminal' && `Weight Goals Terminal (${goalMode === 'loss' ? 'Loss Mode' : 'Gain Mode'})`}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">Deep Level 2 Analytics • Real Multi-Device Telemetry</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLevel2Modal(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* MODAL CONTENT BODY */}
              <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-5 text-xs">

                {/* 1. HEALTH SCORE ANALYTICS PAGE */}
                {activeLevel2Modal === 'health_score' && (
                  <div className="space-y-4">
                    
                    {/* TIME FILTERS */}
                    <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 font-mono text-[10px]">
                      {(['today', 'week', 'month', 'year', 'lifetime'] as const).map(tf => (
                        <button
                          key={tf}
                          onClick={() => setHealthScoreTimeFilter(tf as any)}
                          className={`flex-1 py-1.5 rounded-lg uppercase font-bold cursor-pointer transition ${
                            healthScoreTimeFilter === tf ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    {/* AI LONGEVITY REPORT (SIMPLE HUMAN ENGLISH) */}
                    <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/40 p-4 rounded-2xl space-y-2.5">
                      <span className="text-[10px] font-mono text-cyan-300 font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={12} /> AI LONGEVITY REPORT
                      </span>

                      <div className="space-y-1.5 text-xs font-bold text-white font-sans leading-relaxed">
                        <p className="text-emerald-400 text-sm">"YOUR HEALTH IS IMPROVING."</p>
                        <p className="text-cyan-300">"YOU ARE HEALTHIER THAN LAST MONTH."</p>
                        <p className="text-indigo-300">"YOUR BODY IS RECOVERING FASTER NOW."</p>
                        <p className="text-amber-300 font-mono text-[11px] pt-1">
                          "YOU MAY GAIN 5 KG OF HEALTHY MUSCLE WITHIN 4 MONTHS IF YOU MAINTAIN YOUR CURRENT HABITS."
                        </p>
                      </div>
                    </div>

                    {/* WHY SCORE INCREASED VS DECREASED */}
                    <div className="space-y-3 font-mono">
                      
                      {/* WHY SCORE INCREASED */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                          <CheckCircle2 size={13} /> WHY SCORE INCREASED (+17 PTS)
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-200">
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Deep Sleep (2h 10m)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Recovery (89% CNS)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Hydration (2.8L/day)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Calories (Optimal Target)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Workout (4x/week)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">+ Protein (140g+ Streak)</div>
                        </div>
                      </div>

                      {/* WHY SCORE DECREASED */}
                      <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl space-y-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                          <AlertTriangle size={13} /> WHY SCORE DECREASED (-4 PTS RISK)
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-200">
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- Late Sleep (After 11:30)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- Low Protein (Sunday)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- Low Recovery (Post Leg Day)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- High Stress (Late Work)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- Sleep Debt (-0.2 hrs)</div>
                          <div className="p-1.5 bg-slate-950/60 rounded-lg">- Poor Hydration (Sunday)</div>
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat("Provide a complete breakdown of why my Health Score improved by 17% this month.");
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For Deep Longevity Insights
                    </button>
                  </div>
                )}

                {/* 2. SLEEP ANALYTICS PAGE */}
                {activeLevel2Modal === 'sleep' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* ALL 9 REQUIRED TIME FILTERS */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Select Time Window</span>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/10 text-[9px]">
                        {[
                          { key: '1h', label: 'Last 1 Hr' },
                          { key: '6h', label: 'Last 6 Hrs' },
                          { key: 'today', label: 'Today' },
                          { key: 'yesterday', label: 'Yesterday' },
                          { key: '7d', label: 'Last 7 Days' },
                          { key: '30d', label: 'Last 30 Days' },
                          { key: '3m', label: 'Last 3 Mos' },
                          { key: '6m', label: 'Last 6 Mos' },
                          { key: '1y', label: 'Last 1 Year' },
                        ].map(tf => (
                          <button
                            key={tf.key}
                            onClick={() => setSleepTimeFilter(tf.key as any)}
                            className={`py-1.5 rounded-xl uppercase font-bold cursor-pointer transition ${
                              sleepTimeFilter === tf.key ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI STATEMENTS (EXACT USER SPEC) */}
                    <div className="bg-indigo-950/70 border border-indigo-500/40 p-4 rounded-2xl space-y-1.5 font-sans">
                      <span className="text-[10px] font-mono text-indigo-300 font-extrabold uppercase block">
                        AI SLEEP TELEMETRY STATEMENTS
                      </span>
                      <div className="space-y-1 text-xs font-bold text-slate-100">
                        <p className="text-emerald-400 font-mono">"YOUR SLEEP IMPROVED BY 14% THIS MONTH."</p>
                        <p className="text-indigo-300 font-mono">"YOU SLEEP BEST BETWEEN 10:45 PM TO 6:40 AM."</p>
                        <p className="text-amber-300 font-mono">"TUESDAY IS YOUR LOWEST RECOVERY DAY."</p>
                      </div>
                    </div>

                    {/* ALL REQUIRED SLEEP METRICS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">REM Sleep</span>
                        <span className="text-base font-black text-white">1h 45m</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">Deep Sleep</span>
                        <span className="text-base font-black text-white">2h 10m</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">Light Sleep</span>
                        <span className="text-base font-black text-white">3h 25m</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Sleep Efficiency</span>
                        <span className="text-base font-black text-white">92%</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Sleep Debt</span>
                        <span className="text-base font-black text-white">-0.2 hrs</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">Sleep Consistency</span>
                        <span className="text-base font-black text-white">94%</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-3">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">Average Sleep Time</span>
                        <span className="text-base font-black text-white">7 hrs 24 mins</span>
                      </div>
                    </div>

                    {/* GRAPH TOGGLE (WEEKLY / MONTHLY / YEARLY) */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-300 uppercase font-bold">Sleep Trend Graph</span>
                        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl text-[9px]">
                          {(['weekly', 'monthly', 'yearly'] as const).map(gm => (
                            <button
                              key={gm}
                              onClick={() => setSleepGraphMode(gm)}
                              className={`px-2 py-1 rounded-lg uppercase font-bold cursor-pointer transition ${
                                sleepGraphMode === gm ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {gm}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CHART BARS */}
                      <div className="grid grid-cols-7 gap-1 h-20 items-end pt-2">
                        {(sleepGraphMode === 'weekly' 
                          ? [7.2, 7.5, 6.8, 7.8, 7.4, 8.1, 7.6] 
                          : sleepGraphMode === 'monthly'
                          ? [7.1, 7.4, 7.6, 7.8, 7.5, 7.2, 7.9]
                          : [7.0, 7.2, 7.3, 7.5, 7.6, 7.8, 7.7]
                        ).map((val, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <span className="text-[8px] text-indigo-300 font-bold">{val}h</span>
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-md" 
                              style={{ height: `${val * 8}px` }} 
                            />
                            <span className="text-[8px] text-slate-500">
                              {sleepGraphMode === 'weekly' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx] : `P${idx+1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat("How can I optimize my sleep consistency and REM cycle ratio tonight?");
                      }}
                      className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For Sleep Optimization
                    </button>
                  </div>
                )}

                {/* 3. RECOVERY ANALYTICS PAGE */}
                {activeLevel2Modal === 'recovery' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* TIME FILTERS */}
                    <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/10 text-[9.5px]">
                      {[
                        { key: '1h', label: '1 Hour' },
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'Week' },
                        { key: 'month', label: 'Month' },
                        { key: 'year', label: 'Year' }
                      ].map(tf => (
                        <button
                          key={tf.key}
                          onClick={() => setRecoveryTimeFilter(tf.key as any)}
                          className={`flex-1 py-1.5 rounded-xl uppercase font-bold cursor-pointer transition ${
                            recoveryTimeFilter === tf.key ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>

                    {/* AI RECOVERY STATEMENTS */}
                    <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl space-y-1.5 font-sans">
                      <span className="text-[10px] font-mono text-emerald-300 font-extrabold uppercase block">
                        AI RECOVERY TELEMETRY STATEMENTS
                      </span>
                      <div className="space-y-1 text-xs font-bold text-slate-100">
                        <p className="text-emerald-400 font-mono">"YOUR RECOVERY HAS IMPROVED BY 11%."</p>
                        <p className="text-cyan-300 font-mono">"YOU PERFORM BEST ON MONDAY."</p>
                        <p className="text-indigo-300 font-mono">"YOUR CNS FATIGUE IS LOWER THIS WEEK."</p>
                      </div>
                    </div>

                    {/* REQUIRED METRICS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Recovery</span>
                        <span className="text-base font-black text-white">89%</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Readiness</span>
                        <span className="text-base font-black text-white">92%</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-amber-400 uppercase block font-bold">Stress</span>
                        <span className="text-base font-black text-white">18% (Low)</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">HRV</span>
                        <span className="text-base font-black text-white">88 ms</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-rose-400 uppercase block font-bold">Resting HR</span>
                        <span className="text-base font-black text-white">58 BPM</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-indigo-300 uppercase block font-bold">Body Temp</span>
                        <span className="text-base font-black text-white">36.5 °C</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat("How does my 88ms HRV recovery affect today's workout capacity?");
                      }}
                      className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For CNS Recovery Protocol
                    </button>
                  </div>
                )}

                {/* 4. HYDRATION ANALYTICS PAGE */}
                {activeLevel2Modal === 'water' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* TIME FILTERS */}
                    <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/10 text-[9.5px]">
                      {[
                        { key: 'today', label: "Today's Intake" },
                        { key: 'weekly', label: "Weekly Avg" },
                        { key: 'monthly', label: "Monthly Avg" },
                        { key: 'yearly', label: "Yearly Avg" }
                      ].map(tf => (
                        <button
                          key={tf.key}
                          onClick={() => setWaterTimeFilter(tf.key as any)}
                          className={`flex-1 py-1.5 rounded-xl uppercase font-bold cursor-pointer transition ${
                            waterTimeFilter === tf.key ? 'bg-blue-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>

                    {/* AI HYDRATION STATEMENTS */}
                    <div className="bg-blue-950/60 border border-blue-500/40 p-4 rounded-2xl space-y-1.5 font-sans">
                      <span className="text-[10px] font-mono text-blue-300 font-extrabold uppercase block">
                        AI HYDRATION STATEMENTS
                      </span>
                      <div className="space-y-1 text-xs font-bold text-slate-100">
                        <p className="text-amber-300 font-mono">"YOU DRINK LESS WATER AFTER 7 PM."</p>
                        <p className="text-emerald-400 font-mono">"YOUR HYDRATION IS 18% BETTER THAN LAST MONTH."</p>
                      </div>
                    </div>

                    {/* QUICK WATER LOGGING */}
                    <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
                        Quick Add Water Log
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[250, 500, 1000].map(amt => (
                          <button
                            key={amt}
                            onClick={() => {
                              onAddWater(amt);
                              onTriggerToast?.(`💧 Added +${amt}ml water!`);
                            }}
                            className="py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-300 font-mono font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Droplets size={14} />
                            <span>+{amt}ml</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-blue-400 uppercase block font-bold">Today</span>
                        <span className="text-base font-black text-white">{(waterIntakeToday / 1000).toFixed(1)}L / 3.0L</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-blue-400 uppercase block font-bold">Weekly Avg</span>
                        <span className="text-base font-black text-white">2.8L / day</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-blue-400 uppercase block font-bold">Monthly Avg</span>
                        <span className="text-base font-black text-white">2.7L / day</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-blue-400 uppercase block font-bold">Yearly Avg</span>
                        <span className="text-base font-black text-white">2.6L / day</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 col-span-2">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Hydration Target Score</span>
                        <span className="text-xs font-black text-emerald-300">92 / 100 (Optimal Cell Osmolality)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat("How should I schedule my 3L water intake throughout my workout windows?");
                      }}
                      className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For Hydration Strategy
                    </button>
                  </div>
                )}

                {/* 5. PROTEIN ANALYTICS PAGE */}
                {activeLevel2Modal === 'protein' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* TIME FILTERS */}
                    <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/10 text-[9.5px]">
                      {[
                        { key: 'daily', label: 'Daily' },
                        { key: 'weekly', label: 'Weekly' },
                        { key: 'monthly', label: 'Monthly' },
                        { key: 'yearly', label: 'Yearly' }
                      ].map(tf => (
                        <button
                          key={tf.key}
                          onClick={() => setProteinTimeFilter(tf.key as any)}
                          className={`flex-1 py-1.5 rounded-xl uppercase font-bold cursor-pointer transition ${
                            proteinTimeFilter === tf.key ? 'bg-purple-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>

                    {/* AI PROTEIN STATEMENTS */}
                    <div className="bg-purple-950/60 border border-purple-500/40 p-4 rounded-2xl space-y-1.5 font-sans">
                      <span className="text-[10px] font-mono text-purple-300 font-extrabold uppercase block">
                        AI PROTEIN STREAK STATEMENT
                      </span>
                      <p className="text-sm font-bold text-emerald-400 font-mono">
                        "YOU HAVE COMPLETED YOUR PROTEIN GOAL FOR 27 DAYS."
                      </p>
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                        <span className="text-[9.5px] text-purple-300 uppercase block font-bold">Daily Protein</span>
                        <span className="text-xl font-black text-white">{totalProteinToday}g / {targetProtein}g</span>
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                        <span className="text-[9.5px] text-purple-300 uppercase block font-bold">Average Protein</span>
                        <span className="text-xl font-black text-white">146g / day</span>
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                        <span className="text-[9.5px] text-emerald-400 uppercase block font-bold">Muscle Growth Prediction</span>
                        <span className="text-xs font-black text-emerald-300">+1.2 kg Lean Mass / month</span>
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                        <span className="text-[9.5px] text-amber-400 uppercase block font-bold">Protein Streaks</span>
                        <span className="text-xs font-black text-amber-300">27 Days Continuous Streak 🔥</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat("Give me 3 high protein meal ideas to hit my remaining daily target.");
                      }}
                      className="w-full py-3 bg-purple-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For High Protein Recipes
                    </button>
                  </div>
                )}

                {/* 6. CALORIES ANALYTICS PAGE */}
                {activeLevel2Modal === 'calories' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* TIME FILTERS */}
                    <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-white/10 text-[9.5px]">
                      {[
                        { key: 'consumed', label: 'Consumed' },
                        { key: 'burned', label: 'Burned' },
                        { key: 'weekly_avg', label: 'Weekly Avg' },
                        { key: 'monthly_avg', label: 'Monthly Avg' }
                      ].map(tf => (
                        <button
                          key={tf.key}
                          onClick={() => setCaloriesTimeFilter(tf.key as any)}
                          className={`flex-1 py-1.5 rounded-xl uppercase font-bold cursor-pointer transition ${
                            caloriesTimeFilter === tf.key ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-amber-400 uppercase block font-bold">Food Calories</span>
                        <span className="text-base font-black text-white">{totalCaloriesToday} kcal</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-rose-400 uppercase block font-bold">Workout Calories</span>
                        <span className="text-base font-black text-white">520 kcal</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/10">
                        <span className="text-[9px] text-emerald-400 uppercase block font-bold">Total Burn (BMR)</span>
                        <span className="text-base font-black text-white">2,350 kcal</span>
                      </div>
                    </div>

                    {/* ENERGY BALANCE BANNER */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-2">
                      <span className="text-[10px] text-slate-300 uppercase font-bold block">
                        Net Energy Balance ({goalMode === 'loss' ? 'Deficit Target' : 'Surplus Target'})
                      </span>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Target Deficit/Surplus Cap</span>
                        <span className={goalMode === 'loss' ? 'text-rose-400' : 'text-emerald-400'}>
                          {goalMode === 'loss' ? '-500 kcal Deficit' : '+400 kcal Surplus'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${goalMode === 'loss' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(100, (totalCaloriesToday / targetCalories) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onAddFood();
                      }}
                      className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Scan & Log Food Meal
                    </button>
                  </div>
                )}

                {/* 7. WEIGHT GOALS TERMINAL PAGE (DISTINCT TERMINALS) */}
                {activeLevel2Modal === 'goals_terminal' && (
                  <div className="space-y-4 font-mono">
                    
                    {/* TERMINAL MODE SWITCHER */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/10">
                      <button
                        onClick={() => setGoalMode('loss')}
                        className={`py-2.5 rounded-xl font-bold uppercase text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          goalMode === 'loss' ? 'bg-rose-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <TrendingDown size={14} />
                        <span>Weight Loss Mode</span>
                      </button>

                      <button
                        onClick={() => setGoalMode('gain')}
                        className={`py-2.5 rounded-xl font-bold uppercase text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          goalMode === 'gain' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <TrendingUp size={14} />
                        <span>Weight Gain Mode</span>
                      </button>
                    </div>

                    {/* WEIGHT LOSS TERMINAL VIEW */}
                    {goalMode === 'loss' ? (
                      <div className="space-y-3">
                        <div className="bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl space-y-2">
                          <span className="text-[10px] text-rose-300 font-extrabold uppercase block">
                            🔥 WEIGHT LOSS TERMINAL PROTOCOL
                          </span>
                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            "Target 1,800 kcal daily with 140g protein and high volume foods. Maintain cardio sessions post-resistance training to maximize fat oxidation while preserving lean mass."
                          </p>
                        </div>

                        {/* WEIGHT LOSS METRICS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px]">
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Fat Loss</span>
                            <span className="text-base font-black text-rose-400">-0.8 kg / week</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Calories Deficit</span>
                            <span className="text-base font-black text-rose-400">-500 kcal / day</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Water Targets</span>
                            <span className="text-base font-black text-blue-400">3,000 ml / day</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Cardio Target</span>
                            <span className="text-xs font-bold text-white">45 min Zone 2 / day</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Weight Prediction</span>
                            <span className="text-xs font-bold text-emerald-400">-3.2 kg in 30 Days</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Body Fat Prediction</span>
                            <span className="text-xs font-bold text-cyan-400">14.2% Body Fat</span>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weekly Deficit Targets</span>
                          <span className="text-xs font-bold text-slate-200 block">75 kg → 71.8 kg target reached by Day 30</span>
                        </div>
                      </div>
                    ) : (
                      /* WEIGHT GAIN TERMINAL VIEW */
                      <div className="space-y-3">
                        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
                          <span className="text-[10px] text-emerald-300 font-extrabold uppercase block">
                            💪 WEIGHT GAIN & MUSCLE TERMINAL PROTOCOL
                          </span>
                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            "Target 2,600 kcal daily with 160g protein. Focus on progressive overload strength workouts, nutrient-dense carbs, and 90%+ sleep recovery to maximize muscle hypertrophy."
                          </p>
                        </div>

                        {/* WEIGHT GAIN METRICS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px]">
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Muscle Gain</span>
                            <span className="text-base font-black text-emerald-400">+1.2 kg Lean / mo</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Protein Targets</span>
                            <span className="text-base font-black text-purple-400">160g / day</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Calories Surplus</span>
                            <span className="text-base font-black text-emerald-400">+400 kcal / day</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Recovery Target</span>
                            <span className="text-xs font-bold text-emerald-400">90%+ CNS Recovery</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Strength Progression</span>
                            <span className="text-xs font-bold text-cyan-400">+2.5 kg Bench / wk</span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold uppercase block">Muscle Prediction</span>
                            <span className="text-xs font-bold text-amber-300">+5 kg Muscle in 4 Mos</span>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weekly Growth Targets</span>
                          <span className="text-xs font-bold text-slate-200 block">75 kg → 79.8 kg lean muscle mass trajectory</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setActiveLevel2Modal(null);
                        onOpenNutriChat(`Give me a complete daily workout and meal plan for ${goalMode === 'loss' ? 'Weight Loss Mode' : 'Weight Gain Mode'}.`);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Ask NutriChat For Custom Plan
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
