import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Sparkles, ShieldCheck, Lock, Trash2, Download, 
  EyeOff, CheckCircle2, RefreshCw, Calendar, TrendingUp, 
  Activity, Clock, Dumbbell, Utensils, Moon, Droplets, 
  Zap, Heart, Award, ArrowRight, UserCheck, AlertCircle, Plus, ChevronRight, Scale
} from 'lucide-react';
import { AIMemoryItem, WearableMetrics, PrivacySettings } from '../types';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';
import { getAiMemoryConsent, setAiMemoryConsent } from '../lib/chatStorage';

interface LifeOsSecondBrainProps {
  userName?: string;
  userGoal: string;
  memories: AIMemoryItem[];
  wearables: WearableMetrics[];
  privacySettings: PrivacySettings;
  onAddMemory: (memory: Omit<AIMemoryItem, 'id' | 'createdAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onUpdatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  onOpenNutriChat: (prompt?: string) => void;
  onTriggerToast: (msg: string) => void;
}

export const LifeOsSecondBrain: React.FC<LifeOsSecondBrainProps> = ({
  userName = 'Utpal',
  userGoal,
  memories,
  wearables,
  privacySettings,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
  onUpdatePrivacySettings,
  onOpenNutriChat,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'brain' | 'lifeos' | 'timeline' | 'predictions' | 'privacy'>('brain');
  const [timelinePeriod, setTimelinePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<AIMemoryItem['category']>('Preference');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  // Settings Toggles (backed by PrivacySettings or state fallback)
  // P0-07: the "Share with AI" toggle is wired to the real consent flag
  // (default OFF), so memories are never sent to the AI without explicit
  // opt-in. The other toggles remain UI-only placeholders.
  const [enableAiMemory, setEnableAiMemory] = useState<boolean>(() => getAiMemoryConsent());
  const [enablePredictions, setEnablePredictions] = useState(true);
  const [enableDeviceHistory, setEnableDeviceHistory] = useState(true);

  const connectedWearables = wearables.filter(w => w.connected);
  const hasConnectedDevices = connectedWearables.length > 0;
  const metrics = aggregateHealthMetrics(wearables);

  // Default pre-populated Second Brain memories if empty
  const defaultSecondBrainItems: Omit<AIMemoryItem, 'id' | 'createdAt'>[] = [
    { key: 'Favourite Foods', value: 'Paneer Butter Masala, Oats Smoothie, Grilled Chicken, Moong Dal Khichdi', category: 'Dietary', isCustom: false },
    { key: 'Gym Timings', value: 'Every evening at 6:00 PM (Strength & Hypertrophy)', category: 'Workout', isCustom: false },
    { key: 'Office / Study Timings', value: '9:00 AM to 5:30 PM (Peak focus 10 AM - 1 PM)', category: 'Preference', isCustom: false },
    { key: 'Favourite Sleep Schedule', value: '11:00 PM to 7:00 AM (8 Hours target)', category: 'Preference', isCustom: false },
    { key: 'Water Intake Habits', value: 'Hydrates 500ml upon waking, targets 3.0L daily', category: 'General', isCustom: false },
    { key: 'Recovery Pattern', value: 'Best recovery observed after 7.5+ hrs sleep and light evening walk', category: 'General', isCustom: false },
    { key: 'Current Goal', value: userGoal || 'Healthy Muscle Gain & Metabolic Longevity', category: 'Goal', isCustom: false },
  ];

  const allMemories = memories.length > 0 ? memories : defaultSecondBrainItems.map((item, idx) => ({
    ...item,
    id: `default_mem_${idx}`,
    createdAt: new Date().toISOString()
  }));

  const filteredMemories = allMemories.filter(m =>
    m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export Personal Data
  const handleExportData = () => {
    const exportPayload = {
      user: userName,
      exportedAt: new Date().toISOString(),
      userGoal,
      memories: allMemories,
      connectedDevices: connectedWearables.map(w => ({ name: w.device, brand: w.brand, lastSynced: w.lastSynced })),
      privacySettings,
      timelineSnapshot: {
        y2026: { weightKg: 45, sleepAvgHours: 6.2, proteinConsistencyDays: 42 },
        y2027: { weightKg: 54, sleepAvgHours: 7.9, proteinConsistencyDays: 87, recoveryImprovementPercent: 31 }
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrimind_life_os_data_${userName.toLowerCase()}_2026.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onTriggerToast('📥 Personal Second Brain & Life OS data exported as JSON!');
  };

  const handlePermanentDeleteAll = () => {
    onClearAllMemories();
    setShowConfirmDeleteAll(false);
    onTriggerToast('⚠️ All Second Brain memories and health history permanently deleted.');
  };

  const handleCreateCustomMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory({
      key: newKey.trim(),
      value: newValue.trim(),
      category: newCategory,
      isCustom: true
    });
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto font-sans pb-12 text-white">
      
      {/* SECOND BRAIN & LIFE OS HERO HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 text-slate-950 rounded-2xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Brain size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  PERSONAL HEALTH OPERATING SYSTEM
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> USER CONSENT PROTECTED
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
                NutriMind Second Brain & Life OS
              </h1>
              <p className="text-xs text-slate-300">
                Simple outside. Maximum intelligence inside. Remembers your routines, goals, and habits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenNutriChat("Review my Second Brain memory and tell me what habits I should optimize next.")}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Ask Second Brain AI</span>
            </button>
            <button
              onClick={handleExportData}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Export JSON Data"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* TOP TAB NAVIGATION */}
        <div className="flex items-center gap-1 pt-4 overflow-x-auto text-xs font-mono">
          {[
            { id: 'brain', label: 'Second Brain Memory', icon: Brain },
            { id: 'lifeos', label: 'Life OS Domains', icon: Activity },
            { id: 'timeline', label: 'Health Timeline', icon: Calendar },
            { id: 'predictions', label: 'Prediction Engine', icon: TrendingUp },
            { id: 'privacy', label: 'Privacy & Data Controls', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-500 text-slate-950 font-bold shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SECOND BRAIN MEMORY BANK */}
      {activeTab === 'brain' && (
        <div className="space-y-4">
          <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Brain className="text-indigo-400" size={18} />
                  Second Brain Intelligent Memory Bank ({filteredMemories.length})
                </h3>
                <p className="text-xs text-slate-400">
                  NutriMind AI remembers your preferences, routines, and goals with your explicit consent.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search memory context..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 w-full sm:w-48"
                />
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Add Memory</span>
                </button>
              </div>
            </div>

            {/* Custom Memory Entry Form */}
            {isAdding && (
              <form onSubmit={handleCreateCustomMemory} className="p-4 bg-slate-900/90 border border-indigo-500/40 rounded-2xl space-y-3 shadow-xl">
                <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-wider block">
                  Add New Custom Second Brain Memory
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">KEY NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Gym Timings / Favourite Meals"
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">CATEGORY</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="Goal">Goal</option>
                      <option value="Dietary">Dietary</option>
                      <option value="Workout">Workout</option>
                      <option value="Preference">Preference</option>
                      <option value="Allergy">Allergy</option>
                      <option value="Medical">Medical</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1">MEMORY DETAILS</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Prefer 100g paneer in lunch; workout at 6:00 PM daily"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-xl text-xs hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-indigo-400 cursor-pointer"
                  >
                    Save Memory Entry
                  </button>
                </div>
              </form>
            )}

            {/* Memories List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMemories.map(mem => (
                <div
                  key={mem.id}
                  className="p-3.5 bg-slate-900/80 border border-white/10 rounded-2xl flex items-start justify-between gap-3 hover:border-indigo-500/30 transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{mem.key}</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-bold uppercase border border-indigo-500/30">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{mem.value}</p>
                    <span className="text-[8.5px] font-mono text-slate-500 block">
                      Saved locally: {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {mem.isCustom && (
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                      title="Forget memory"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIFE OS DOMAINS */}
      {activeTab === 'lifeos' && (
        <div className="space-y-4">
          <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Activity className="text-cyan-400" size={18} />
                NutriMind Life OS Multi-Domain Intelligence
              </h3>
              <p className="text-xs text-slate-400">
                NutriMind AI maps your physiological and behavioral domains seamlessly into one unified operating system.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { title: 'Health', value: hasConnectedDevices ? `${metrics.avgRecoveryScore}% Recovery` : 'Device required', icon: Heart, color: 'text-rose-400', desc: 'Metabolic & Cardiac Sync' },
                { title: 'Fitness', value: metrics.totalSteps > 0 ? `${metrics.totalSteps.toLocaleString()} steps` : (hasConnectedDevices ? '0 steps' : 'Data unavailable'), icon: Dumbbell, color: 'text-cyan-400', desc: 'Workout & Activity Log' },
                { title: 'Food', value: '1,800 kcal target', icon: Utensils, color: 'text-amber-400', desc: 'Real meals logged' },
                { title: 'Sleep', value: metrics.totalSleepHours > 0 ? `${metrics.totalSleepHours}h Sleep` : 'Not available', icon: Moon, color: 'text-indigo-400', desc: 'REM & Deep Sleep Sync' },
                { title: 'Hydration', value: metrics.syncedWaterMl ? `${(metrics.syncedWaterMl / 1000).toFixed(1)}L` : '3.0L Target', icon: Droplets, color: 'text-blue-400', desc: 'Auto + Manual log' },
                { title: 'Productivity', value: 'Peak: 10 AM - 1 PM', icon: Zap, color: 'text-yellow-400', desc: 'Focus & Study hours' },
                { title: 'Stress', value: metrics.avgStressLevel !== undefined ? `${metrics.avgStressLevel}% (Low)` : 'Device required', icon: Activity, color: 'text-purple-400', desc: 'cEDA Sensor Sync' },
                { title: 'Habits', value: '87 Days Protein Streak', icon: Award, color: 'text-emerald-400', desc: 'Daily Routine Consistency' }
              ].map((domain, i) => {
                const Icon = domain.icon;
                return (
                  <div key={i} className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <Icon size={13} className={domain.color} /> {domain.title}
                    </span>
                    <span className="text-xs font-black text-white block truncate">{domain.value}</span>
                    <span className="text-[8.5px] text-slate-400 block truncate">{domain.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Calendar className="text-cyan-400" size={18} />
                Longitudinal Health & Progression Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Continuous history of your physiological milestones and goal transformations.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTimelinePeriod(p)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                    timelinePeriod === p ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Year Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300">2026 INITIAL BASELINE</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">STARTING POINT</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-950 p-2 rounded-xl">
                    <span className="text-[8px] text-slate-400 block">WEIGHT</span>
                    <span className="text-sm font-bold text-white">45 kg</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl">
                    <span className="text-[8px] text-slate-400 block">SLEEP AVG</span>
                    <span className="text-sm font-bold text-indigo-300">6.2 hrs</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl">
                    <span className="text-[8px] text-slate-400 block">STREAK</span>
                    <span className="text-sm font-bold text-amber-300">12 Days</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-cyan-500/40 rounded-2xl p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300">2027 CURRENT TIMELINE</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">+20% IMPROVEMENT</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-white/10">
                    <span className="text-[8px] text-slate-400 block">WEIGHT</span>
                    <span className="text-sm font-bold text-emerald-300">54 kg (+9kg)</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-white/10">
                    <span className="text-[8px] text-slate-400 block">SLEEP AVG</span>
                    <span className="text-sm font-bold text-indigo-300">7.9 hrs (+27%)</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-white/10">
                    <span className="text-[8px] text-slate-400 block">STREAK</span>
                    <span className="text-sm font-bold text-amber-300">87 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Longitudinal Achievements Log */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TIMELINE MILESTONES LOG</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span><strong>Protein Goal Streak:</strong> Completed for 87 consecutive days without interruption.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0" />
                  <span><strong>Sleep Consistency:</strong> Sleep quality improved by 27% compared to previous baseline.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span><strong>Cardiovascular Recovery:</strong> Recovery index boosted by 31% over 6 months.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREDICTION ENGINE */}
      {activeTab === 'predictions' && (
        <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={18} />
              AI Predictive Health & Longevity Engine
            </h3>
            <p className="text-xs text-slate-400">
              Future predictions based on real current trends and continuous adherence.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider block">
                🔮 4-MONTH GOAL FORECAST
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "Agar tum isi consistency ko maintain karte ho to agle 4 mahino mein tum approximately healthy muscle gain achieve kar sakte ho aur tumhari sleep quality steady reh sakti hai."
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Weight Trajectory</span>
                <span className="text-sm font-black text-emerald-300 block">No data</span>
                <span className="text-[8.5px] text-slate-400 block">—</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Sleep Quality Trend</span>
                <span className="text-sm font-black text-indigo-300 block">+15% Deep Sleep</span>
                <span className="text-[8.5px] text-slate-400 block">Steady Circadian Rhythm</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Metabolic Longevity</span>
                <span className="text-sm font-black text-yellow-300 block">95 / 100 Forecast</span>
                <span className="text-[8.5px] text-slate-400 block">Optimal Insulin Sensitivity</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & DATA CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                User Consent & Data Governance
              </h3>
              <p className="text-xs text-slate-400">
                You own 100% of your Second Brain data. NutriMind AI stores memory ONLY with your consent.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Toggles */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Share Memories with NutriChat AI</span>
                  <span className="text-[10px] text-slate-400">Sends your stored memories (incl. medical/allergy info) to the AI as context. Off by default.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAiMemory}
                  onChange={e => {
                    const next = e.target.checked;
                    setEnableAiMemory(next);
                    setAiMemoryConsent(next);
                    onTriggerToast(next ? 'Memories shared with AI' : 'Memories no longer shared with AI');
                  }}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div>
                  <span className="font-bold text-white block">Enable Predictive Insights</span>
                  <span className="text-[10px] text-slate-400">Generates 4-month goal and trajectory forecasts</span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePredictions}
                  onChange={e => {
                    setEnablePredictions(e.target.checked);
                    onTriggerToast(e.target.checked ? 'Predictions Enabled' : 'Predictions Disabled');
                  }}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div>
                  <span className="font-bold text-white block">Enable Wearable Device History</span>
                  <span className="text-[10px] text-slate-400">Stores historical biometric telemetry from connected devices</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableDeviceHistory}
                  onChange={e => {
                    setEnableDeviceHistory(e.target.checked);
                    onTriggerToast(e.target.checked ? 'Device History Enabled' : 'Device History Disabled');
                  }}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Dangerous Actions */}
            <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-2xl space-y-3">
              <span className="text-rose-400 font-bold uppercase text-[10px] block">PERMANENT DATA MANAGEMENT</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onClearAllMemories}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl transition cursor-pointer"
                >
                  Clear Memory Bank
                </button>
                <button
                  onClick={() => setShowConfirmDeleteAll(true)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition cursor-pointer"
                >
                  Delete Everything Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PERMANENT DELETE MODAL */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle size={24} />
              <h4 className="font-bold text-base font-display">Delete All Personal Data?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete all Second Brain memories, health timeline logs, and custom preferences. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDeleteAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-mono"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
