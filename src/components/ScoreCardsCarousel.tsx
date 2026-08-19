import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, RefreshCw, Flame, Droplets, Clock, Activity, 
  Heart, Smile, ChevronLeft, ChevronRight, UserCheck, Calendar, Sparkles, TrendingUp
} from 'lucide-react';
import { FoodItem, WearableMetrics } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';

interface ScoreCardsCarouselProps {
  userGoal: string;
  meals: FoodItem[];
  waterIntakeToday: number;
  sleepScore: number;
  sleepHistory: number[];
  sleepStart: string;
  sleepEnd: string;
  stressScore: number;
  stressHistory: number[];
  cardioScore: number;
  cardioHistory: number[];
  activityScore: number;
  activityHistory: number[];
  nutritionScore: number;
  nutritionHistory: number[];
  nutritionTab: 'PREV' | 'CURRENT' | 'NEXT';
  setNutritionTab: (t: 'PREV' | 'CURRENT' | 'NEXT') => void;
  hydrationTab: 'PREV' | 'CURRENT' | 'NEXT';
  setHydrationTab: (t: 'PREV' | 'CURRENT' | 'NEXT') => void;
  onTriggerHelp: (sectionKey: string) => void;
  onAddSleep: () => void;
  onAddWater: (amount: number) => void;
  onLogMood: () => void;
  onAddCardio: () => void;
  onAddActivity: () => void;
  onAddTweak: () => void;
  onViewReports: () => void;
  onConnectDevice: () => void;
  wearables?: WearableMetrics[];
}

export const ScoreCardsCarousel: React.FC<ScoreCardsCarouselProps> = ({
  userGoal,
  meals,
  waterIntakeToday,
  sleepScore,
  sleepHistory,
  sleepStart,
  sleepEnd,
  stressScore,
  stressHistory,
  cardioScore,
  cardioHistory,
  activityScore,
  activityHistory,
  nutritionScore,
  nutritionHistory,
  nutritionTab,
  setNutritionTab,
  hydrationTab,
  setHydrationTab,
  onTriggerHelp,
  onAddSleep,
  onAddWater,
  onLogMood,
  onAddCardio,
  onAddActivity,
  onAddTweak,
  onViewReports,
  onConnectDevice,
  wearables = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const connectedWearables = wearables.filter(w => w.connected);
  const metrics = aggregateHealthMetrics(wearables);

  // Today's stats calculated
  const totalCaloriesToday = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinToday = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbsToday = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFatToday = meals.reduce((acc, m) => acc + m.fat, 0);

  // Dynamic values
  const currentHydrationScore = Math.min(100, Math.round((waterIntakeToday / 2500) * 100));

  // Metabolic health score is average of all scores
  const calculatedMetabolicScore = Math.round(
    (nutritionScore + activityScore + sleepScore + currentHydrationScore + cardioScore + stressScore) / 6
  );

  const getMetabolicStatus = (score: number) => {
    if (score >= 80) return { label: 'Good / Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 50) return { label: 'Average / Weak', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Poor / Critical', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const metabolicStatus = getMetabolicStatus(calculatedMetabolicScore);

  const scoreCards = [
    // 1. Metabolic Health Score Card
    {
      title: 'Metabolic Health Score',
      key: 'metabolic',
      content: (
        <div className="space-y-3.5">
          {/* Gauge display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Metabolic Status:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metabolicStatus.bg} ${metabolicStatus.color}`}>
                {metabolicStatus.label}
              </span>
            </div>
            <button 
              onClick={onConnectDevice}
              className="p-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded text-cyan-400 transition"
              title="Refresh Device Sync"
            >
              <RefreshCw size={11} className="animate-pulse" />
            </button>
          </div>

          <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-slate-500">AGGREGATE BIO-SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-white leading-none">
                  {calculatedMetabolicScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[9px] text-[#e8dfcb]/80 leading-tight">
                Cellular engine stability index.
              </p>
            </div>

            {/* Custom Meter graphics */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" fill="none" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  stroke={calculatedMetabolicScore >= 80 ? '#10b981' : calculatedMetabolicScore >= 50 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="4.5" 
                  fill="none" 
                  strokeDasharray={`${calculatedMetabolicScore * 1.63} 163`}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white font-mono">{calculatedMetabolicScore > 0 ? `${calculatedMetabolicScore}%` : 'No data'}</span>
            </div>
          </div>

          {/* Sub-scores lists */}
          <div className="grid grid-cols-3 gap-1.5 text-[8px] font-mono">
            {[
              { label: 'Nutrition', score: nutritionScore, status: 'Excellent' },
              { label: 'Activity', score: activityScore, status: 'Average' },
              { label: 'Sleep', score: sleepScore, status: 'Good' },
              { label: 'Hydration', score: currentHydrationScore, status: currentHydrationScore >= 80 ? 'Excellent' : 'Weak' },
              { label: 'Cardio', score: cardioScore, status: 'Good' },
              { label: 'Stress', score: stressScore, status: 'Average' }
            ].map((sub, idx) => (
              <div key={idx} className="bg-black/15 p-1.5 rounded-xl border border-white/5 text-center">
                <span className="text-slate-400 block truncate">{sub.label}</span>
                <span className="text-white font-bold block mt-0.5">{sub.score > 0 ? sub.score : 'No data'}</span>
              </div>
            ))}
          </div>

          {connectedWearables.length > 0 ? (
            <div 
              onClick={onConnectDevice}
              className="w-full bg-gradient-to-r from-emerald-950/60 to-teal-950/50 border border-emerald-500/40 p-3 rounded-2xl cursor-pointer hover:border-emerald-400/80 transition shadow-lg group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  DEVICE CONNECTED
                </span>
                <span className="text-[8px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                  CONNECTED SUCCESSFULLY
                </span>
              </div>

              <div className="text-xs font-bold text-white font-sans mb-1.5 flex items-center justify-between">
                <span>{connectedWearables.map(w => w.device).join(' + ') || 'No device'}</span>
                <span className="text-[9px] text-cyan-400 group-hover:underline font-mono">Manage Fleet →</span>
              </div>
              
              <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-slate-200 text-center">
                <span className="bg-black/30 py-1 rounded border border-white/5">Sleep: {metrics.totalSleepHours > 0 ? `${metrics.totalSleepHours}h` : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">HRV: {metrics.avgHrvMs !== undefined ? `${metrics.avgHrvMs}ms` : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">HR: {metrics.avgHeartRateBpm > 0 ? metrics.avgHeartRateBpm : 'No data'} BPM</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">Weight: {metrics.latestWeightKg !== undefined ? `${metrics.latestWeightKg}kg` : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">Steps: {metrics.totalSteps > 0 ? metrics.totalSteps.toLocaleString() : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">Calories: {metrics.totalActiveCalories > 0 ? metrics.totalActiveCalories : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">Recovery: {metrics.avgRecoveryScore !== undefined ? `${metrics.avgRecoveryScore}%` : 'No data'}</span>
                <span className="bg-black/30 py-1 rounded border border-white/5">Hydration: {currentHydrationScore > 0 ? `${currentHydrationScore}%` : 'No data'}</span>
              </div>

              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-emerald-500/20">
                <span>Last Synced: Never</span>
                <span className="text-emerald-400 font-bold uppercase">Waiting for data sync</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectDevice}
              className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition active:scale-98 shadow-md"
            >
              Click to Connect Device
            </button>
          )}
        </div>
      )
    },

    // 2. Nutrition Score Card
    {
      title: 'Nutrition Score',
      key: 'nutrition',
      content: (
        <div className="space-y-3">
          {/* Pre / Current / Next Session Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl">
            {(['PREV', 'CURRENT', 'NEXT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNutritionTab(t)}
                className={`py-1 text-[8px] font-mono font-bold rounded transition ${
                  nutritionTab === t ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {nutritionTab === 'CURRENT' ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[8px] font-mono text-slate-500">CONSUMED TODAY</span>
                  <div className="text-xl font-black font-mono text-white mt-0.5">
                    {totalCaloriesToday} <span className="text-[9px] text-slate-500 font-normal">/ 1809 kcal</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-slate-500">MACRO SCORE</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{nutritionScore > 0 ? `${nutritionScore}%` : 'No data'}</div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-1.5 text-[9px]">
                {/* Protein */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Protein</span>
                    <span className="text-white font-mono font-bold">{totalProteinToday}g / 130g</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (totalProteinToday / 130) * 100)}%` }} />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Carbs</span>
                    <span className="text-white font-mono font-bold">{totalCarbsToday}g / 220g</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, (totalCarbsToday / 220) * 100)}%` }} />
                  </div>
                </div>

                {/* Fat */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Fat</span>
                    <span className="text-white font-mono font-bold">{totalFatToday}g / 65g</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, (totalFatToday / 65) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center bg-slate-950/40 border border-dashed border-white/5 rounded-xl text-center">
              <span className="text-slate-500 text-[10px]">No historical logs synced for {nutritionTab}.</span>
              <p className="text-[8px] text-slate-400 max-w-[180px] mt-1">Previous meal iterations are locked under PRO+ sandbox.</p>
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              onClick={onAddTweak}
              className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-[9px] uppercase tracking-wider transition shadow-sm"
            >
              Add Tweak
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("Opening Reports...");
                onViewReports();
              }}
              className="py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-bold rounded-xl text-[9px] uppercase tracking-wider transition relative z-10"
            >
              Your Reports
            </button>
          </div>
        </div>
      )
    },

    // 3. Activity Score Card
    {
      title: 'Activity Score',
      key: 'activity',
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[8px] font-mono text-slate-500">ENERGY OUTPUT</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{activityScore > 0 ? `${activityScore} pts` : 'No data'}</div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono text-slate-500">vs TDEE TARGET</span>
              <div className="text-xs text-slate-400 font-mono mt-0.5">No data</div>
            </div>
          </div>

          {/* Trend graph simulation */}
          <div className="h-10 flex items-end justify-between gap-1.5">
            {activityHistory.map((val, idx) => (
              <div key={idx} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400/40 border-r border-cyan-500/10 rounded-t" style={{ height: `${val}%` }} title={`Active Day ${idx}`} />
            ))}
          </div>

          <button
            onClick={onAddActivity}
            className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-98"
          >
            Add Calories
          </button>
        </div>
      )
    },

    // 4. Sleep Score Card
    {
      title: 'Sleep Score',
      key: 'sleep',
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[8px] font-mono text-slate-500">DURATION SUMMARY</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{sleepScore > 0 ? `${sleepScore}/100` : 'No data'}</div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono text-slate-500">SLEEP RECOVERY</span>
              <div className="text-xs text-emerald-400 font-mono mt-0.5 font-bold">{sleepScore > 0 ? `${sleepScore}%` : 'No data'}</div>
            </div>
          </div>

          {/* Trend graph */}
          <div className="h-10 flex items-end justify-between gap-1.5">
            {sleepHistory.map((val, idx) => (
              <div key={idx} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400/40 border-r border-cyan-500/10 rounded-t" style={{ height: `${val}%` }} title={`Sleep Quality ${val}%`} />
            ))}
          </div>

          <button
            onClick={onAddSleep}
            className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-98"
          >
            Add Sleep Data
          </button>
        </div>
      )
    },

    // 5. Hydration Score Card
    {
      title: 'Hydration Score',
      key: 'hydration',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl">
            {(['PREV', 'CURRENT', 'NEXT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setHydrationTab(t)}
                className={`py-1 text-[8px] font-mono font-bold rounded transition ${
                  hydrationTab === t ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {hydrationTab === 'CURRENT' ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[8px] font-mono text-slate-500">WATER INTAKE</span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {waterIntakeToday} ml <span className="text-[9px] text-slate-500 font-normal">/ 2500 ml</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-slate-500">TARGET ACHIEVED</span>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5 font-bold">{currentHydrationScore}%</div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${currentHydrationScore}%` }} />
              </div>
            </div>
          ) : (
            <div className="h-10 flex items-center justify-center text-slate-500 text-[10px]">
              No water intake logs tracked for {hydrationTab}.
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              onClick={() => onAddWater(250)}
              className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-bold rounded-xl text-[9px] uppercase tracking-wider transition"
            >
              +250ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-bold rounded-xl text-[9px] uppercase tracking-wider transition"
            >
              +500ml
            </button>
          </div>
        </div>
      )
    },

    // 6. Cardio-Metabolic Score Card
    {
      title: 'Cardio-Metabolic Score',
      key: 'cardio',
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[8px] font-mono text-slate-500">RESTING HEART RATE</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{cardioScore > 0 ? `${cardioScore}/100` : 'No data'}</div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono text-slate-500">CARDIO RESILIENCE</span>
              <div className="text-xs text-emerald-400 font-mono mt-0.5 font-bold">{cardioScore > 0 ? `${cardioScore}%` : 'No data'}</div>
            </div>
          </div>

          <div className="h-10 flex items-end justify-between gap-1.5">
            {cardioHistory.map((val, idx) => (
              <div key={idx} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400/40 border-r border-cyan-500/10 rounded-t" style={{ height: `${val}%` }} title={`Pulse rate index`} />
            ))}
          </div>

          <button
            onClick={onAddCardio}
            className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-98"
          >
            Add Cardio Data
          </button>
        </div>
      )
    },

    // 7. Stress Score Card
    {
      title: 'Stress Score',
      key: 'stress',
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[8px] font-mono text-slate-500">CORTISOL STABILITY</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{stressScore > 0 ? `${stressScore} / 100` : 'No data'}</div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono text-slate-500">HRV (rMSSD)</span>
              <div className="text-xs text-amber-400 font-mono mt-0.5 font-bold">No data</div>
            </div>
          </div>

          <div className="h-10 flex items-end justify-between gap-1.5">
            {stressHistory.map((val, idx) => (
              <div key={idx} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400/40 border-r border-cyan-500/10 rounded-t" style={{ height: `${val}%` }} title={`Stress index trend`} />
            ))}
          </div>

          <button
            onClick={onLogMood}
            className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-98"
          >
            Log My Mood
          </button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (activeIndex < scoreCards.length - 1) {
      setActiveIndex(activeIndex + 1);
      containerRef.current?.scrollTo({
        left: (activeIndex + 1) * 280,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      containerRef.current?.scrollTo({
        left: (activeIndex - 1) * 280,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-3 relative">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          Swipeable Health Indicators
        </h4>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={activeIndex === 0} 
            onClick={handlePrev} 
            className="p-1 rounded bg-slate-900 border border-white/10 hover:bg-cyan-500/10 text-slate-400 hover:text-white transition disabled:opacity-25"
          >
            <ChevronLeft size={13} />
          </button>
          <button 
            disabled={activeIndex === scoreCards.length - 1} 
            onClick={handleNext} 
            className="p-1 rounded bg-slate-900 border border-white/10 hover:bg-cyan-500/10 text-slate-400 hover:text-white transition disabled:opacity-25"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* horizontal scroll flex */}
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 scrollbar-none no-scrollbar pr-5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const index = Math.round(scrollLeft / 280);
          if (index !== activeIndex && index >= 0 && index < scoreCards.length) {
            setActiveIndex(index);
          }
        }}
      >
        {scoreCards.map((card, idx) => (
          <div 
            key={idx}
            className="w-[285px] shrink-0 snap-center vision-card-3d p-4 space-y-3.5 relative overflow-hidden group"
          >
            {/* Top Glossy Light Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition duration-500" />

            {/* Header info */}
            <div className="flex justify-between items-center border-b border-white/10 pb-2 relative z-10">
              <span className="font-display font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
                <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  {card.title === 'Metabolic Health Score' && <Heart size={12} />}
                  {card.title === 'Nutrition Score' && <Flame size={12} />}
                  {card.title === 'Activity Score' && <Activity size={12} />}
                  {card.title === 'Sleep Score' && <Clock size={12} />}
                  {card.title === 'Hydration Score' && <Droplets size={12} />}
                  {card.title === 'Cardio-Metabolic Score' && <Heart size={12} />}
                  {card.title === 'Stress Score' && <Smile size={12} />}
                </div>
                {card.title}
              </span>
              <button 
                onClick={() => onTriggerHelp(card.key)}
                className="text-slate-400 hover:text-cyan-400 transition p-1 hover:bg-white/5 rounded-lg"
              >
                <HelpCircle size={14} />
              </button>
            </div>

            {/* Inner dynamic widgets */}
            <div className="relative z-10">{card.content}</div>
          </div>
        ))}
      </div>

      {/* Dots indicators */}
      <div className="flex justify-center gap-1 mt-1">
        {scoreCards.map((_, idx) => (
          <span 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-cyan-400 w-3.5' : 'bg-white/10'}`} 
          />
        ))}
      </div>

    </div>
  );
};
