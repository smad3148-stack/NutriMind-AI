import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ShieldCheck, Award, Heart, HelpCircle } from 'lucide-react';

interface ScoreHelpModalProps {
  section: {
    title: string;
    what: string;
    why: string;
    improve: string;
    source: string;
    example: string;
  } | null;
  onClose: () => void;
}

export const ScoreHelpModal: React.FC<ScoreHelpModalProps> = ({ section, onClose }) => {
  if (!section) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
        {/* Backdrop Tap Close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-slate-950 border-t border-white/10 rounded-t-[32px] p-6 text-slate-100 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]"
        >
          {/* Decorative Drag Handle bar */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

          {/* Title Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <HelpCircle size={18} />
              </div>
              <h3 className="font-display font-bold text-base text-white tracking-tight">
                {section.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition border border-white/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content Body */}
          <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1 no-scrollbar font-sans text-xs leading-relaxed">
            
            {/* What is this? */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">What is this?</span>
              <p className="text-slate-300">{section.what}</p>
            </div>

            {/* Why it matters */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Why it matters</span>
              <p className="text-slate-300">{section.why}</p>
            </div>

            {/* How to improve */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">How to improve</span>
              <p className="text-slate-300">{section.improve}</p>
            </div>

            {/* Data sources */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Data sources</span>
              <p className="text-slate-300">{section.source}</p>
            </div>

            {/* Example */}
            <div className="bg-slate-900 border border-cyan-500/20 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">Metabolic Example</span>
              <p className="text-white italic">"{section.example}"</p>
            </div>
          </div>

          {/* Bottom Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-2xl font-bold transition duration-200 shadow-lg font-sans text-xs uppercase tracking-wider"
          >
            Acknowledge & Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
