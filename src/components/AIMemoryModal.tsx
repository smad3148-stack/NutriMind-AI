import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Plus, Trash2, X, ShieldCheck, Check, Edit2, Lock, Tag } from 'lucide-react';
import { AIMemoryItem } from '../types';
import { getAiMemoryConsent, setAiMemoryConsent } from '../lib/chatStorage';

interface AIMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: AIMemoryItem[];
  onAddMemory: (memory: Omit<AIMemoryItem, 'id' | 'createdAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export const AIMemoryModal: React.FC<AIMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<AIMemoryItem['category']>('Preference');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // P0-07: explicit consent before memories (incl. Medical/Allergy) are
  // shared with the AI. Default OFF.
  const [memoryConsent, setMemoryConsent] = useState<boolean>(() => getAiMemoryConsent());

  if (!isOpen) return null;

  const filtered = memories.filter(m => 
    m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
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
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-white tracking-tight flex items-center gap-2">
                  NutriMind AI Memory Bank
                </h3>
                <p className="text-[10px] text-slate-400">
                  ChatGPT & Gemini level persistent biological context
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Context Notice */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                NutriMind AI automatically remembers key health details (goals, allergies, family context, biometrics) across all conversation threads to deliver continuous personalized coaching.
              </p>
            </div>

            {/* Actions Bar & Search */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search remembered context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Add Custom Memory</span>
              </button>
            </div>

            {/* Add Memory Form */}
            {isAdding && (
              <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">New Memory Profile Entry</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">KEY (E.G., ALLERGY, HABIT)</label>
                    <input
                      type="text"
                      placeholder="e.g. Peanut Allergy"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">CATEGORY</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="Goal">Goal</option>
                      <option value="Allergy">Allergy</option>
                      <option value="Preference">Preference</option>
                      <option value="Medical">Medical</option>
                      <option value="Workout">Workout</option>
                      <option value="Dietary">Dietary</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1">MEMORY CONTENT & CONTEXT</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Severe peanut allergy; trigger emergency response if detected in scan"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-xs hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-indigo-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-indigo-400"
                  >
                    Save Memory
                  </button>
                </div>
              </form>
            )}

            {/* Memory List */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No memories found. AI will automatically store context as you chat.
                </div>
              ) : (
                filtered.map(mem => (
                  <div
                    key={mem.id}
                    className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl flex items-start justify-between gap-3 group hover:border-indigo-500/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{mem.key}</span>
                        <span className="text-[8px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold uppercase">
                          {mem.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{mem.value}</p>
                      <span className="text-[8px] font-mono text-slate-500 block">
                        Saved: {new Date(mem.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                      title="Forget this memory"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* P0-07: explicit AI-sharing consent toggle */}
          <div className="px-4 py-3 border-t border-white/10 bg-slate-950 space-y-1.5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Share Memories with NutriChat AI
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-relaxed">
                  When enabled, your memories (including Medical / Allergy entries) are sent to the AI as context. This is off by default.
                </span>
              </div>
              <input
                type="checkbox"
                checked={memoryConsent}
                onChange={(e) => {
                  setMemoryConsent(e.target.checked);
                  setAiMemoryConsent(e.target.checked);
                }}
                className="w-4 h-4 rounded accent-cyan-400 cursor-pointer shrink-0"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>Stored locally in your browser (not encrypted)</span>
            </div>
            {memories.length > 0 && (
              <button
                onClick={onClearAllMemories}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-mono uppercase font-bold hover:underline cursor-pointer"
              >
                Clear All Memory
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
