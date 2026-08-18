import React, { useState } from 'react';
import { 
  TrendingUp, Award, Clock, ArrowRight, HeartPulse, CheckCircle2, ChevronRight,
  TrendingDown, ShieldAlert, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

interface ReportsPanelProps {
  userGoal: string;
  totalCaloriesToday: number;
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ userGoal, totalCaloriesToday }) => {
  const [calorieView, setCalorieView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Static reports metrics
  const currentBMI = 21.5;
  const bmiStatus = 'Healthy Weight';
  const bmiRangeLabel = 'Healthy (18.5 - 24.9)';
  
  // Weights
  const currentWeight = 55;
  const goalWeight = 45;
  const weightHistory = [
    { date: '10 Jul', weight: 57.2 },
    { date: '12 Jul', weight: 56.5 },
    { date: '14 Jul', weight: 56.0 },
    { date: '16 Jul', weight: 55.8 },
    { date: '18 Jul', weight: 55.3 },
    { date: '20 Jul', weight: 55.0 }
  ];

  // Calories history
  const caloriesData = {
    daily: [
      { label: 'Breakfast', val: 420 },
      { label: 'Lunch', val: 780 },
      { label: 'Dinner', val: 490 },
      { label: 'Snacks', val: 119 }
    ],
    weekly: [
      { label: 'Mon', val: 1780 },
      { label: 'Tue', val: 1850 },
      { label: 'Wed', val: 1910 },
      { label: 'Thu', val: 1690 },
      { label: 'Fri', val: 1809 },
      { label: 'Sat', val: 1720 },
      { label: 'Sun', val: 1809 }
    ],
    monthly: [
      { label: 'Week 1', val: 12500 },
      { label: 'Week 2', val: 11800 },
      { label: 'Week 3', val: 12900 },
      { label: 'Week 4', val: 12660 }
    ]
  };

  // Previous Tweaks logs
  const previousTweaks = [
    {
      food: 'Cheese Sandwich',
      date: '19th July, 2026',
      improvement: 15,
      recommendation: 'Swapped processed cheddar for organic paneer; lowered sodium intake.'
    },
    {
      food: 'White Sauce Pasta',
      date: '18th July, 2026',
      improvement: 28,
      recommendation: 'Swapped refined wheat pasta for chickpea high-fiber fusilli & broccoli.'
    },
    {
      food: 'Pepperoni Pizza',
      date: '17th July, 2026',
      improvement: 20,
      recommendation: 'Replaced thin-crust base with sourdough, topped with arugula & chicken breast.'
    }
  ];

  // BMI Gauge Arc parameters
  const minBmi = 15;
  const maxBmi = 35;
  const bmiPct = Math.min(100, Math.max(0, ((currentBMI - minBmi) / (maxBmi - minBmi)) * 100));

  return (
    <div className="space-y-5 font-sans">
      
      {/* BMI Section */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Metabolic Body Mass Index (BMI)</span>
          <span className="text-[9px] text-slate-400">Updated: 20th July, 2026</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Gauge Visualization */}
          <div className="relative w-24 h-14 flex items-end justify-center overflow-hidden">
            {/* Background Arc */}
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
              {/* Healthy Range colored arc segment */}
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
              <span className="text-xl font-bold font-display text-white">{currentBMI}</span>
              <span className="text-[8px] text-slate-400 block font-mono">index</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="font-bold text-white text-xs">{bmiStatus}</h4>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Your BMI is within the optimal range. Keep maintaining your portion controls to preserve metabolic insulin efficiency.
            </p>
          </div>
        </div>

        {/* BMI ranges color bar */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex">
            <div className="h-full w-[17.5%] bg-blue-400/70" title="Underweight" />
            <div className="h-full w-[32.5%] bg-emerald-400" title="Healthy" />
            <div className="h-full w-[25%] bg-amber-400" title="Overweight" />
            <div className="h-full w-[25%] bg-rose-400" title="Obese" />
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-mono">
            <span>Under (&lt;18.5)</span>
            <span className="text-emerald-400 font-bold">Healthy (18.5-24.9)</span>
            <span>Over (25-29.9)</span>
            <span>Obese (&ge;30)</span>
          </div>
        </div>
      </div>

      {/* WEIGHT GRAPH */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Weight Management Tracker</span>
          <span className="text-[9px] text-slate-400">Goal vs Current</span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
          <div className="text-center border-r border-white/10">
            <span className="text-[9px] font-mono text-cyan-400 block">GOAL WEIGHT</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">{goalWeight} KG</span>
            <span className="text-[8px] text-slate-500 block">Target deficit</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono text-emerald-400 block">CURRENT WEIGHT</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">{currentWeight} KG</span>
            <span className="text-[8px] text-emerald-400/60 block">Logged today</span>
          </div>
        </div>

        {/* Weight Spark Chart */}
        <div className="space-y-1 pt-1">
          <span className="text-[9px] font-mono text-slate-500">Last 6 weight entries trend:</span>
          <div className="h-16 flex items-end justify-between gap-1.5 pt-3">
            {weightHistory.map((item, idx) => {
              const maxVal = 58;
              const minVal = 44;
              const hPct = ((item.weight - minVal) / (maxVal - minVal)) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[8px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition leading-none">
                    {item.weight}
                  </span>
                  <div className="w-full bg-cyan-500/20 border border-cyan-500/30 rounded-t-lg transition-all duration-300 hover:bg-cyan-500/40" style={{ height: `${hPct}%` }} />
                  <span className="text-[7px] text-slate-500 font-mono">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CALORIE GRAPH */}
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Macronutrient Intake Analysis</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/10">
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalorieView(view)}
                className={`px-2 py-0.5 text-[8px] font-mono rounded font-bold uppercase transition ${
                  calorieView === view ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic bar chart based on calorie view selection */}
        <div className="h-20 flex items-end justify-between gap-2.5 pt-2">
          {caloriesData[calorieView].map((item, idx) => {
            const vals = caloriesData[calorieView].map(d => d.val);
            const maxVal = Math.max(...vals, 2000);
            const hPct = (item.val / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[7px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition leading-none">
                  {item.val}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-slate-950 to-cyan-500/80 rounded-t-lg border-t border-r border-cyan-500/30 shadow-md transition-all duration-300 hover:scale-105" 
                  style={{ height: `${hPct}%` }} 
                />
                <span className="text-[8px] text-slate-400 font-mono truncate max-w-full text-center leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-slate-400 italic leading-snug">
          Your calorie profile adapts directly based on dynamic AI plate scanning and manual hydration inputs.
        </p>
      </div>

      {/* PREVIOUS TWEAKS LIST */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
          <Clock size={12} /> Previous Metabolic Tweaks
        </h3>

        <div className="space-y-2.5">
          {previousTweaks.map((tweak, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-2 relative shadow">
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                <TrendingUp size={10} /> +{tweak.improvement}% health
              </div>

              <div>
                <h4 className="font-bold text-white text-xs">{tweak.food}</h4>
                <p className="text-[8px] text-slate-500 mt-0.5">{tweak.date}</p>
              </div>

              <p className="text-[9px] text-slate-300 leading-relaxed italic bg-slate-950/60 p-2 rounded-xl border border-white/5">
                {tweak.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
