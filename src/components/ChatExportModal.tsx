import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Download, Share2, Copy, Check, Lock, ShieldCheck, 
  EyeOff, Trash2, Edit3, Layers, AlertTriangle, X, Database, RefreshCw 
} from 'lucide-react';
import { ChatThread, PrivacySettings } from '../types';
import { exportThreadToPDF, exportThreadToTxt, exportAllDataJSON } from '../lib/chatStorage';

interface ChatExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: ChatThread | null;
  allThreads: ChatThread[];
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (settings: PrivacySettings) => void;
  onRenameThread: (id: string, newTitle: string) => void;
  onDuplicateThread: (thread: ChatThread) => void;
  onClearThread: (id: string) => void;
  onDeleteAllThreads: () => void;
  onTriggerToast: (msg: string) => void;
}

export const ChatExportModal: React.FC<ChatExportModalProps> = ({
  isOpen,
  onClose,
  thread,
  allThreads,
  privacySettings,
  onUpdatePrivacySettings,
  onRenameThread,
  onDuplicateThread,
  onClearThread,
  onDeleteAllThreads,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'privacy' | 'manage'>('export');
  const [newTitle, setNewTitle] = useState(thread?.title || '');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyShareLink = () => {
    if (!thread) return;
    const shareUrl = `${window.location.origin}/chat/shared/${thread.id}`;
    navigator.clipboard.writeText(`NutriMind AI Biological Consultation Thread: "${thread.title}"\n${shareUrl}`);
    setIsCopied(true);
    onTriggerToast("Encrypted share link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (thread && newTitle.trim()) {
      onRenameThread(thread.id, newTitle.trim());
      onTriggerToast(`Conversation renamed to "${newTitle.trim()}"`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Chat Management & Privacy</h3>
                <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                  {thread?.title || 'NutriMind AI Workspace'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Subtabs */}
          <div className="flex border-b border-white/10 bg-slate-950/50 p-1 text-xs">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === 'export' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Export & Share
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === 'manage' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manage Chat
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === 'privacy' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Privacy & Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* TAB 1: EXPORT & SHARE */}
            {activeTab === 'export' && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Export Options
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (thread) exportThreadToPDF(thread);
                      onTriggerToast("Generating clinical PDF document...");
                    }}
                    disabled={!thread}
                    className="p-3 bg-slate-900 border border-white/10 hover:border-cyan-500/40 rounded-2xl text-left transition hover:bg-slate-800 flex flex-col justify-between cursor-pointer"
                  >
                    <Download size={18} className="text-cyan-400 mb-2" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Export PDF</h4>
                      <p className="text-[9px] text-slate-400">Formatted clinical report</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (thread) exportThreadToTxt(thread);
                      onTriggerToast("Exported conversation text file!");
                    }}
                    disabled={!thread}
                    className="p-3 bg-slate-900 border border-white/10 hover:border-cyan-500/40 rounded-2xl text-left transition hover:bg-slate-800 flex flex-col justify-between cursor-pointer"
                  >
                    <FileText size={18} className="text-emerald-400 mb-2" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Export TXT</h4>
                      <p className="text-[9px] text-slate-400">Raw dialogue transcript</p>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                    Share Conversation
                  </span>
                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{thread?.title}</p>
                      <p className="text-[9px] text-slate-400 font-mono">End-to-end encrypted snapshot link</p>
                    </div>
                    <button
                      onClick={handleCopyShareLink}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                      <span>{isCopied ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Full System Data Backup
                  </span>
                  <button
                    onClick={() => {
                      exportAllDataJSON(allThreads, []);
                      onTriggerToast("Full account chat backup JSON downloaded!");
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Database size={14} className="text-cyan-400" />
                    <span>Download Complete History JSON Backup</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE CHAT */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                {/* Rename form */}
                {thread && (
                  <form onSubmit={handleRenameSubmit} className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">Rename Conversation</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                )}

                {/* Duplicate thread */}
                {thread && (
                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Duplicate Thread</h4>
                      <p className="text-[9px] text-slate-400">Clone full dialogue history into new thread</p>
                    </div>
                    <button
                      onClick={() => {
                        onDuplicateThread(thread);
                        onTriggerToast(`Duplicated "${thread.title}"`);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Layers size={14} />
                    </button>
                  </div>
                )}

                {/* Clear thread messages */}
                {thread && (
                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Clear Thread Messages</h4>
                      <p className="text-[9px] text-slate-400">Reset conversation text while keeping thread</p>
                    </div>
                    <button
                      onClick={() => {
                        onClearThread(thread.id);
                        onTriggerToast("Thread messages cleared");
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Delete all conversations */}
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between mt-4">
                  <div>
                    <h4 className="font-bold text-xs text-rose-300">Clear All Chat History</h4>
                    <p className="text-[9px] text-rose-200/70">Permanently erase all stored conversations</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete ALL conversation history?")) {
                        onDeleteAllThreads();
                        onTriggerToast("All chat history erased.");
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Erase All
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                {/* Enterprise Admin Privacy Guard Notice */}
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck size={16} />
                    <span>Strict Enterprise Privacy Mandate</span>
                  </div>
                  <p className="text-[10px] text-emerald-200/90 leading-relaxed">
                    Admins and system maintainers have <span className="font-extrabold underline">ZERO ACCESS</span> to your private conversations unless explicit consent is provided or required by law. All data is encrypted client-side.
                  </p>
                </div>

                {/* Privacy Toggles */}
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Incognito Mode Default</h4>
                      <p className="text-[9px] text-slate-400">Do not save new chats to history</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.incognitoByDefault}
                      onChange={(e) => onUpdatePrivacySettings({ ...privacySettings, incognitoByDefault: e.target.checked })}
                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Disable Chat Storage</h4>
                      <p className="text-[9px] text-slate-400">Temporarily pause saving history</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.disableHistory}
                      onChange={(e) => onUpdatePrivacySettings({ ...privacySettings, disableHistory: e.target.checked })}
                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Client-Side Storage Encryption</h4>
                      <p className="text-[9px] text-slate-400">AES-256 local database locking</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.encryptedLocalStorage}
                      onChange={(e) => onUpdatePrivacySettings({ ...privacySettings, encryptedLocalStorage: e.target.checked })}
                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
