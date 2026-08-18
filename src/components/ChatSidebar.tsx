import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Pin, Trash2, Download, Star, Sparkles, 
  Search, EyeOff, Archive, Brain, ShieldCheck, Laptop, Smartphone,
  MoreVertical, Check, RefreshCw
} from 'lucide-react';
import { ChatThread } from '../types';
import { groupThreadsByTimePeriod } from '../lib/chatStorage';

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  onNewThread: (incognito?: boolean) => void;
  onDeleteThread: (id: string) => void;
  onTogglePinThread: (id: string) => void;
  onToggleArchiveThread: (id: string) => void;
  onExportThread: (thread: ChatThread) => void;
  onOpenMemoryModal: () => void;
  onOpenManageModal: (thread: ChatThread | null) => void;
  onClearAllChats?: () => void;
  isOnline?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  threads,
  activeThreadId,
  setActiveThreadId,
  onNewThread,
  onDeleteThread,
  onTogglePinThread,
  onToggleArchiveThread,
  onExportThread,
  onOpenMemoryModal,
  onOpenManageModal,
  onClearAllChats,
  isOnline = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filter threads by search query
  const filteredThreads = threads.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = t.title.toLowerCase().includes(q);
    const matchesMsg = t.messages.some(m => m.text.toLowerCase().includes(q));
    return matchesTitle || matchesMsg;
  });

  const grouped = groupThreadsByTimePeriod(filteredThreads);

  const renderThreadItem = (thread: ChatThread) => {
    const isActive = activeThreadId === thread.id;
    const isIncognito = thread.incognito;

    return (
      <div
        key={thread.id}
        onClick={() => setActiveThreadId(thread.id)}
        className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition duration-200 cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/10'
            : 'bg-slate-950/50 border-slate-900 text-slate-400 hover:bg-slate-900/90 hover:text-slate-200 hover:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {isIncognito ? (
            <EyeOff size={14} className="text-amber-400 shrink-0" />
          ) : (
            <MessageSquare size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-xs truncate font-medium leading-tight text-slate-200 group-hover:text-white">
              {thread.title}
            </p>
            {thread.messages.length > 0 && (
              <span className="text-[9px] text-slate-500 truncate block font-sans">
                {thread.messages[thread.messages.length - 1].text}
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Bar */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150 shrink-0 ml-1 bg-slate-950/80 px-1 py-0.5 rounded-lg backdrop-blur-xs border border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinThread(thread.id);
            }}
            className="p-1 hover:text-cyan-400 text-slate-400 transition"
            title={thread.pinned ? "Unpin thread" : "Pin thread"}
          >
            <Pin size={11} className={thread.pinned ? "rotate-45 text-cyan-400" : ""} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenManageModal(thread);
            }}
            className="p-1 hover:text-emerald-400 text-slate-400 transition"
            title="Export & Manage"
          >
            <Download size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchiveThread(thread.id);
            }}
            className="p-1 hover:text-amber-400 text-slate-400 transition"
            title={thread.archived ? "Unarchive" : "Archive"}
          >
            <Archive size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteThread(thread.id);
            }}
            className="p-1 hover:text-rose-400 text-slate-400 transition"
            title="Delete thread"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="chat_history_sidebar" className="bg-slate-950 border border-slate-900 rounded-3xl h-full flex flex-col overflow-hidden shadow-2xl text-white">
      {/* 1. Header & New Chat Actions */}
      <div className="p-3.5 border-b border-slate-900 space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black rounded-xl text-xs">
              AI
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-wide uppercase font-display">
                NutriMind AI
              </h3>
              <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isOnline ? 'Cross-Platform Sync Active' : 'Offline Local Storage'}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons: New Standard Chat & Incognito Chat */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNewThread(false)}
            className="py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => onNewThread(true)}
            className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Private Incognito Mode (Unsaved)"
          >
            <EyeOff size={13} />
            <span>Incognito</span>
          </button>
        </div>

        {/* Search bar & Clear All */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          {onClearAllChats && threads.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all conversation history?')) {
                  onClearAllChats();
                }
              }}
              className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold transition flex items-center gap-1 shrink-0"
              title="Clear All Conversation History"
            >
              <Trash2 size={12} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Recents List grouped by time */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 font-sans">
        {/* Pinned Section */}
        {grouped.pinned.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Star size={10} className="fill-cyan-400 text-cyan-400" /> Pinned Chats ({grouped.pinned.length})
            </span>
            <div className="space-y-1">
              {grouped.pinned.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Today Section */}
        {grouped.today.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Today
            </span>
            <div className="space-y-1">
              {grouped.today.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Yesterday Section */}
        {grouped.yesterday.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Yesterday
            </span>
            <div className="space-y-1">
              {grouped.yesterday.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Last 7 Days Section */}
        {grouped.last7Days.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Previous 7 Days
            </span>
            <div className="space-y-1">
              {grouped.last7Days.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Last 30 Days Section */}
        {grouped.last30Days.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Previous 30 Days
            </span>
            <div className="space-y-1">
              {grouped.last30Days.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Older Section */}
        {grouped.older.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Older Conversations
            </span>
            <div className="space-y-1">
              {grouped.older.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Archived Section Toggle */}
        {grouped.archived.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-900">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-[9px] font-mono font-bold text-amber-400/80 hover:text-amber-300 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            >
              <Archive size={11} />
              <span>Archived ({grouped.archived.length}) {showArchived ? '▲' : '▼'}</span>
            </button>
            {showArchived && (
              <div className="space-y-1">
                {grouped.archived.map(renderThreadItem)}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {filteredThreads.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-500 space-y-2">
            <MessageSquare size={24} className="mx-auto text-slate-700" />
            <p>No conversations found.</p>
            <p className="text-[10px]">Click 'New Chat' to start a session.</p>
          </div>
        )}
      </div>

      {/* 3. Footer with Multi-Device Sync Indicator */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Smartphone size={12} className="text-cyan-400" />
          <Laptop size={12} className="text-cyan-400" />
          <span className="font-mono text-[9px]">Web • Android • iOS • Desktop</span>
        </div>

        <button
          onClick={() => onOpenManageModal(null)}
          className="p-1 hover:text-white transition cursor-pointer"
          title="Global Chat Settings & Privacy"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
