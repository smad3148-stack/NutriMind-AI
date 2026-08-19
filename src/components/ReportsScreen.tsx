import React, { useState } from 'react';
import { 
  ArrowLeft, Activity, TrendingUp, Clock, HeartPulse, Award, 
  Smile, Calendar, Flame, CheckSquare, Square, Layers, BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsScreenProps {
  userGoal: string;
  totalCaloriesToday: number;
  onBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ 
  userGoal, 
  totalCaloriesToday, 
  onBack 
}) => {
  const [calorieView, setCalorieView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // 1. BMI (Body Mass Index) — P0-05: honest empty state until real data.
  const currentBMI = null as number | null;
  const bmiStatus = 'No data yet — log your weight to calculate BMI.';
  const minBmi = 15;
  const maxBmi = 35;
  const bmiPct = currentBMI ? Math.min(100, Math.max(0, ((currentBMI - minBmi) / (maxBmi - minBmi)) * 100)) : 0;

  // 2. Weight Readings
  const currentWeight = null as number | null;
  const goalWeight = null as number | null;
  const weightHistory: { date: string; weight: number }[] = [];

  // 3. Calorie Intake Graph
  const caloriesData: Record<'daily' | 'weekly' | 'monthly', { label: string; val: number }[]> = {
    daily: [],
    weekly: [],
    monthly: []
  };

  // 4. Average Macros — targets are goals (kept); current starts at 0.
  const averageMacros = {
    protein: { current: 0, target: 110, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    carbs: { current: 0, target: 350, color: 'bg-amber-400', textColor: 'text-amber-400' },
    fat: { current: 0, target: 95, color: 'bg-rose-400', textColor: 'text-rose-400' },
    fiber: { current: 0, target: 35, color: 'bg-sky-400', textColor: 'text-sky-400' }
  };

  // 5. Meditation
  const meditationHistory: { date: string; mins: number }[] = [];
  const meditationStreak = 0;
  const averageMeditationMins = 0;

  // 6. Supplement Window (user-maintained checklist — not telemetry; kept)
  const [supplements, setSupplements] = useState([
    { id: 1, name: 'CoQ10 (Mitochondrial Energy)', dosage: '100mg', time: 'With Breakfast', checked: true },
    { id: 2, name: 'Omega-3 Fish Oil (Anti-inflammatory)', dosage: '1000mg', time: 'With Lunch', checked: true },
    { id: 3, name: 'Magnesium L-Threonate (Neuro recovery)', dosage: '150mg', time: '30 mins before Bed', checked: false },
    { id: 4, name: 'Vitamin D3 + K2 (Bone & Immune health)', dosage: '5000 IU', time: 'With Breakfast', checked: true }
  ]);

  const toggleSupplement = (id: number) => {
    setSupplements(supplements.map(sup => sup.id === id ? { ...sup, checked: !sup.checked } : sup));
  };

  // 7. Tweak Frequency
  const tweakComplianceScore = 0;
  const tweaksThisWeek = 0;
  const averageTweakDelta = 'No data';
  const tweakHistory: { label: string; count: number }[] = [];

  return (
    <div className="space-y-5 font-sans animate-fadeIn">
      
      {/* Header with back button */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-cyan-500/20 px-4 py-3 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 hover:bg-white/10 rounded-xl border border-white/10 text-cyan-400 transition active:scale-95 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Comprehensive Analysis</span>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Metabolic Longevity Reports</h2>
        </div>
      </div>

      {/* 1. BMI SECTION */}
      <div className="vision-card-3d p-4 space-y-3.5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="flex justify-between items-center border-b border-white/10 pb-2 relative z-10">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <Layers size={11} /> Body Mass Index (BMI)
          </span>
          <span className="text-[8px] text-slate-400 font-mono">Updated: Never</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-24 h-14 flex items-end justify-center overflow-hidden">
            <svg className="absolute top-0 w-24 h-24 transform -rotate-180" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                strokeDasharray="125 250"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="10"
                strokeDasharray={`${bmiPct} 250`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-lg font-black font-mono text-white">{currentBMI ?? 'No data'}</span>
              <span className="text-[8px] text-slate-400 block font-mono">Index</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="font-bold text-white text-xs">{bmiStatus}</h4>
            </div>
            <p className="text-[9.5px] text-slate-300 leading-relaxed">
              Log your weight readings to calculate and track your BMI here.
            </p>
          </div>
        </div>

        {/* BMI ranges color bar */}
        <div className="space-y-1">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex">
            <div className="h-full w-[17.5%] bg-blue-400/70" />
            <div className="h-full w-[32.5%] bg-emerald-400" />
            <div className="h-full w-[25%] bg-amber-400" />
            <div className="h-full w-[25%] bg-rose-400" />
          </div>
          <div className="flex justify-between text-[7.5px] text-slate-400 font-mono">
            <span>Under (&lt;18.5)</span>
            <span className="text-emerald-400 font-bold">Healthy (18.5-24.9)</span>
            <span>Over (25-29.9)</span>
            <span>Obese (&ge;30)</span>
          </div>
        </div>
      </div>

      {/* 2. CALORIE INTAKE GRAPH */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <Flame size={12} /> Calorie Intake Graph
          </span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/10">
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalorieView(view)}
                className={`px-2 py-0.5 text-[7.5px] font-mono rounded font-bold uppercase transition ${
                  calorieView === view ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="h-24 flex items-end justify-between gap-3 pt-2">
          {caloriesData[calorieView].map((item, idx) => {
            const vals = caloriesData[calorieView].map(d => d.val);
            const maxVal = Math.max(...vals, 2500);
            const hPct = (item.val / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[7px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition leading-none">
                  {item.val}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-slate-900 to-cyan-400 rounded-t-lg border-t border-r border-cyan-500/30 shadow-md transition-all duration-300 hover:scale-105" 
                  style={{ height: `${hPct}%` }} 
                />
                <span className="text-[7.5px] text-slate-400 font-mono truncate max-w-full text-center leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AVERAGE MACROS */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <Activity size={11} /> Average Macronutrient Targets
          </span>
          <span className="text-[8px] text-slate-400 font-mono">Hypertrophy Active</span>
        </div>

        <div className="space-y-3">
          {Object.entries(averageMacros).map(([key, item]) => {
            const pct = Math.min(100, Math.round((item.current / item.target) * 100));
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="capitalize text-slate-200 font-bold">{key} Intake</span>
                  <span className="text-white">
                    <span className={item.textColor}>{item.current > 0 ? `${item.current}g` : 'No data'}</span> / {item.target}g <span className="text-slate-500">{item.current > 0 ? `(${pct}%)` : '(no data)'}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WEIGHT READINGS */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <TrendingUp size={11} /> Weight Readings Trend
          </span>
          <span className="text-[8px] text-emerald-400 font-mono font-bold">Active Weight Gain</span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
          <div className="text-center border-r border-white/10">
            <span className="text-[8.5px] font-mono text-cyan-400 block font-bold">TARGET WEIGHT</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">{goalWeight !== null ? `${goalWeight} KG` : 'No data'}</span>
            <span className="text-[7.5px] text-slate-500 block">—</span>
          </div>
          <div className="text-center">
            <span className="text-[8.5px] font-mono text-emerald-400 block font-bold">CURRENT WEIGHT</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">{currentWeight !== null ? `${currentWeight} KG` : 'No data'}</span>
            <span className="text-[7.5px] text-emerald-400/60 block">—</span>
          </div>
        </div>

        {/* weight Spark Chart */}
        <div className="space-y-1 pt-1">
          <span className="text-[8.5px] font-mono text-slate-500 block">Weekly physical scale logs:</span>
          <div className="h-16 flex items-end justify-between gap-2 pt-3">
            {weightHistory.map((item, idx) => {
              const maxVal = 66;
              const minVal = 50;
              const hPct = ((item.weight - minVal) / (maxVal - minVal)) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[7.5px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition leading-none">
                    {item.weight}
                  </span>
                  <div className="w-full bg-cyan-500/20 border border-cyan-500/30 rounded-t-lg transition-all duration-300 hover:bg-cyan-500/40" style={{ height: `${hPct}%` }} />
                  <span className="text-[7px] text-slate-400 font-mono">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. MEDITATION (Mindfulness Longevity Tracking) */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <Smile size={12} className="text-cyan-400" /> Meditation & HRV Recovery
          </span>
          <span className="text-[8px] text-emerald-400 font-mono font-bold">{meditationStreak > 0 ? `${meditationStreak} Day Streak 🔥` : 'No streak yet'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
          <div className="text-center border-r border-white/10">
            <span className="text-[8.5px] font-mono text-cyan-400 block font-bold">DAILY AVERAGE</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">{averageMeditationMins > 0 ? `${averageMeditationMins} MINS` : 'No data'}</span>
            <span className="text-[7.5px] text-slate-500 block">—</span>
          </div>
          <div className="text-center">
            <span className="text-[8.5px] font-mono text-indigo-400 block font-bold">VAGUS NERVE STABILIZATION</span>
            <span className="text-base font-black text-indigo-300 font-mono mt-0.5 block">No data</span>
            <span className="text-[7.5px] text-slate-500 block">—</span>
          </div>
        </div>

        {/* Meditation Spark Chart */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-mono text-slate-500 block">Daily focus & box-breathing minutes:</span>
          <div className="h-12 flex items-end justify-between gap-2.5 pt-2">
            {meditationHistory.map((item, idx) => {
              const maxVal = 25;
              const hPct = (item.mins / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div 
                    className={`w-full rounded-t ${item.mins > 0 ? 'bg-gradient-to-t from-slate-900 to-indigo-400' : 'bg-white/5'}`} 
                    style={{ height: `${Math.max(10, hPct)}%` }} 
                    title={`${item.mins} mins logged`}
                  />
                  <span className="text-[7px] text-slate-400 font-mono">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. SUPPLEMENT WINDOW */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <BookOpen size={11} /> Supplement Window
          </span>
          <span className="text-[8px] text-cyan-400 font-mono font-bold">Optimal Delivery Time</span>
        </div>

        <div className="space-y-2">
          {supplements.map((sup) => (
            <div 
              key={sup.id} 
              onClick={() => toggleSupplement(sup.id)}
              className="bg-slate-950/80 hover:bg-slate-950 border border-white/10 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  className="text-cyan-400 focus:outline-none flex-shrink-0"
                >
                  {sup.checked ? (
                    <CheckSquare size={16} className="fill-cyan-500/20" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
                <div className="min-w-0">
                  <h5 className="font-bold text-white text-[10.5px] truncate">{sup.name}</h5>
                  <p className="text-[8.5px] text-slate-400 mt-0.5">{sup.dosage} • {sup.time}</p>
                </div>
              </div>
              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                sup.checked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-500'
              }`}>
                {sup.checked ? 'Taken' : 'Due'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. TWEAK FREQUENCY */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <Calendar size={11} /> Tweak Scan Frequency
          </span>
          <span className="text-[8px] text-emerald-400 font-mono font-bold">{tweakComplianceScore > 0 ? `${tweakComplianceScore}% Compliance` : 'No data'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
            <span className="text-[8px] font-mono text-slate-500 block uppercase">TOTAL SCANS</span>
            <span className="text-sm font-black text-white font-mono mt-1 block">{tweaksThisWeek > 0 ? tweaksThisWeek : 'No data'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
            <span className="text-[8px] font-mono text-slate-500 block uppercase">DAILY AVERAGE</span>
            <span className="text-sm font-black text-white font-mono mt-1 block">No data</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
            <span className="text-[8px] font-mono text-slate-500 block uppercase">METRIC DELTA</span>
            <span className="text-sm font-black text-emerald-400 font-mono mt-1 block">{averageTweakDelta}</span>
          </div>
        </div>

        {/* Tweak Frequency sparkline histogram */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-mono text-slate-500 block">Weekly food-plate audit frequency:</span>
          <div className="h-10 flex items-end justify-between gap-3 pt-2">
            {tweakHistory.map((item, idx) => {
              const hPct = (item.count / 4) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 rounded-t-sm transition-colors" style={{ height: `${Math.max(15, hPct)}%` }} title={`${item.count} scans`} />
                  <span className="text-[7.5px] text-slate-400 font-mono">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition duration-150 active:scale-98 text-center shadow-lg shadow-cyan-500/20"
      >
        Back to Dashboard
      </button>

    </div>
  );
};
