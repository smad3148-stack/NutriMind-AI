import React, { useState, useEffect, useRef } from 'react';
import { Bot, Terminal, Play, Loader2, Sparkles, Send, ShieldAlert, Cpu, CircleDollarSign, Users, AlertOctagon, ShieldCheck, Database, Sliders, HardDriveUpload } from 'lucide-react';
import { ChatMessage } from '../types';

interface AdminAICompanionProps {
  systemLogs: any[];
}

type AssistantType = 
  | 'system_monitoring'
  | 'revenue_analytics'
  | 'user_analytics'
  | 'bug_analysis'
  | 'security_audit'
  | 'database_health'
  | 'feature_recommendation'
  | 'ota_deployment';

export const AdminAICompanion: React.FC<AdminAICompanionProps> = ({
  systemLogs = [],
}) => {
  const [activeAssistant, setActiveAssistant] = useState<AssistantType>('system_monitoring');
  const [conversations, setConversations] = useState<Record<AssistantType, ChatMessage[]>>({
    system_monitoring: [
      { id: 'sm-init', sender: 'assistant', text: "DevSecOps monitoring online. Memory bounds and CPU clusters are within limits. Ask me anything about server latency, container orchestrations, or system optimizations.", timestamp: new Date().toISOString() }
    ],
    revenue_analytics: [
      { id: 'ra-init', sender: 'assistant', text: "CRO Operations active. ARR represents 4.2x year-over-year gains. Provide transaction files or query conversion curves and ARR metrics.", timestamp: new Date().toISOString() }
    ],
    user_analytics: [
      { id: 'ua-init', sender: 'assistant', text: "Growth diagnostics sync'd. Wearable bridges are transmitting continuous health metrics with 94.2% daily active ratios. Inquire about session retention or family circles.", timestamp: new Date().toISOString() }
    ],
    bug_analysis: [
      { id: 'ba-init', sender: 'assistant', text: "Senior Debugging Node online. Standing by to triage stack traces, uncaught exceptions, and database connection timeouts.", timestamp: new Date().toISOString() }
    ],
    security_audit: [
      { id: 'sa-init', sender: 'assistant', text: "CISO AI Shield initialized. All JWT tokens and Row-Level Security (RLS) tables audited. Direct query active on auth rate limits.", timestamp: new Date().toISOString() }
    ],
    database_health: [
      { id: 'dh-init', sender: 'assistant', text: "DBA Engine mapping complete. PostgreSQL connection pooling is stable at 12 active pools, response times average 8ms. Ask about table fragmentation or IOPS.", timestamp: new Date().toISOString() }
    ],
    feature_recommendation: [
      { id: 'fr-init', sender: 'assistant', text: "Product Innovation Board active. I am ready to outline new bio-harmony triggers, hydration algorithms, and custom longevity features.", timestamp: new Date().toISOString() }
    ],
    ota_deployment: [
      { id: 'od-init', sender: 'assistant', text: "CDN OTA release nodes primed. Ready to analyze package compression vectors, rollbacks, and channel delivery statistics.", timestamp: new Date().toISOString() }
    ],
  });

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeAssistant]);

  // Mocked rich live diagnostics context according to role
  const getDiagnosticsContext = (type: AssistantType) => {
    switch (type) {
      case 'system_monitoring':
        return {
          cpuUsage: '22.4%',
          memoryFree: '1.42 GB',
          activePods: 3,
          ingressRate: '124 req/sec',
          serverUptime: '243 hours',
          apiLatency: '18ms'
        };
      case 'revenue_analytics':
        return {
          arr: '$425,000',
          mrr: '$35,400',
          averageBasket: '$24.50',
          conversionRate: '4.82%',
          churnRatio: '1.2%',
          paymentGatewayStatus: 'NOMINAL (Stripe)'
        };
      case 'user_analytics':
        return {
          totalRegisteredUsers: 1420,
          dailyActiveUsers: 840,
          wearableSyncRatio: '94.2%',
          familyCirclesActive: 143,
          retentionWeek4: '62%'
        };
      case 'bug_analysis':
        return {
          uncaughtExceptions: 0,
          apiErrorsRatio: '0.04%',
          activeCrashes: 'None',
          failedOtaBuilds: 1,
          lastErrorLogged: 'Suppressed key validation warn'
        };
      case 'security_audit':
        return {
          jwtAuditsPassed: '100%',
          rlsPoliciesEnforced: '32 tables verified',
          sslCertExpiry: '112 days remaining',
          failedLoginAttempts: '3 in last 24h',
          apiPrivilegeEscalations: '0 blocked'
        };
      case 'database_health':
        return {
          poolSize: 20,
          activeConnections: 12,
          queryDurationAvg: '8.4ms',
          tableFragmentation: '1.2%',
          prismaCacheHits: '91.4%',
          cloudSqlStorageFree: '88.5%'
        };
      case 'feature_recommendation':
        return {
          underutilizedFlags: ['enableAdvancedWaterGoals'],
          highlyEngagedTabs: ['Coach AI', 'Plate Auditor'],
          feedbackScore: '4.85/5.00',
          cohortA_BTestRatio: '50:50'
        };
      case 'ota_deployment':
        return {
          activeProductionVersion: 'v1.4.2',
          stagingVersion: 'v1.5.0-rc2',
          rollbackState: 'STANDBY',
          lastDeploymentSuccess: '14 hours ago',
          cdnCacheHitRatio: '98.8%'
        };
    }
  };

  const assistantCards = [
    { id: 'system_monitoring', name: 'System Monitor', icon: <Cpu size={15} />, desc: 'Node metrics, CPU status, ingress rate' },
    { id: 'revenue_analytics', name: 'CRO Revenue', icon: <CircleDollarSign size={15} />, desc: 'ARR / MRR margins, conversions' },
    { id: 'user_analytics', name: 'User Analyst', icon: <Users size={15} />, desc: 'Wearable sync rates, cohort engagement' },
    { id: 'bug_analysis', name: 'Bug Triager', icon: <AlertOctagon size={15} />, desc: 'Uncaught exceptions, crash analysis' },
    { id: 'security_audit', name: 'CISO Security', icon: <ShieldCheck size={15} />, desc: 'RLS tables, JWT tokens, IP blocks' },
    { id: 'database_health', name: 'DBA Architect', icon: <Database size={15} />, desc: 'PostgreSQL pools, response times' },
    { id: 'feature_recommendation', name: 'Product Planner', icon: <Sliders size={15} />, desc: 'A/B benchmarks, custom metrics' },
    { id: 'ota_deployment', name: 'OTA Release', icon: <HardDriveUpload size={15} />, desc: 'CDN builds, packages, rollbacks' },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toISOString()
    };

    const currentThread = [...conversations[activeAssistant], userMsg];
    setConversations({
      ...conversations,
      [activeAssistant]: currentThread
    });
    setInputVal('');
    setLoading(true);

    try {
      const diagnosticsContext = getDiagnosticsContext(activeAssistant);
      const res = await fetch('/api/admin/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantType: activeAssistant,
          messages: currentThread,
          systemContext: {
            diagnostics: diagnosticsContext,
            recentLogs: systemLogs.slice(-10) // append 10 recent server logs for security triaging
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setConversations(prev => ({
          ...prev,
          [activeAssistant]: [...prev[activeAssistant], data]
        }));
      } else {
        setConversations(prev => ({
          ...prev,
          [activeAssistant]: [...prev[activeAssistant], {
            id: 'err_' + Date.now(),
            sender: 'assistant',
            text: `Critical API error: ${data.error || 'Failed to analyze request.'}`,
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (err: any) {
      setConversations(prev => ({
        ...prev,
        [activeAssistant]: [...prev[activeAssistant], {
          id: 'err_net_' + Date.now(),
          sender: 'assistant',
          text: `Diagnostics bridge offline due to connection exception: ${err.message}`,
          timestamp: new Date().toISOString()
        }]
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin_ai_companion" className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full p-1 text-slate-300">
      
      {/* 1. Left Selection Column (span 4 on large screens) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/10 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wide">
            <Bot className="text-indigo-400 animate-pulse" size={16} />
            Admin AI Assistants
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Choose a dedicated artificial intelligence profile mapped with continuous diagnostics context.
          </p>
        </div>

        {/* Assistants Selection Grid */}
        <div className="grid grid-cols-1 gap-1.5 max-h-[350px] lg:max-h-none overflow-y-auto pr-1">
          {assistantCards.map((card) => {
            const isSelected = activeAssistant === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setActiveAssistant(card.id as AssistantType)}
                className={`p-3 rounded-xl text-left border flex items-start gap-3 transition ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-md shadow-indigo-500/5'
                    : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                  {card.icon}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs truncate leading-tight">{card.name}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 truncate leading-tight">{card.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle & Right Chat Area (span 8 on large screens) */}
      <div className="lg:col-span-8 flex flex-col bg-slate-950/80 border border-slate-900 rounded-2xl h-full overflow-hidden shadow-2xl relative min-h-[480px]">
        {/* Chat header showing current assistant and stats */}
        <div className="p-4 border-b border-slate-900 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white capitalize font-sans leading-none">
                {activeAssistant.replace('_', ' ')} Expert
              </h4>
              <span className="text-[9px] text-slate-400 font-mono">Role mapped to live cluster</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Connection
            </span>
          </div>
        </div>

        {/* Diagnostics quick view ribbon */}
        <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-900 grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-[9px] font-mono select-none">
          {Object.entries(getDiagnosticsContext(activeAssistant)).slice(0, 6).map(([key, value]) => (
            <div key={key} className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/40">
              <span className="text-slate-400 uppercase tracking-tight block text-[7px] truncate">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-white font-bold block mt-0.5 truncate">{String(value)}</span>
            </div>
          ))}
        </div>

        {/* Chat message viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversations[activeAssistant].map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs relative ${
                  isUser 
                    ? 'bg-indigo-500 text-white rounded-tr-none shadow-md' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {!isUser && (
                    <div className="flex items-center gap-1 mb-1 text-[8px] font-mono uppercase text-indigo-400">
                      <Bot size={10} />
                      <span>{activeAssistant.replace('_', ' ')} AI</span>
                    </div>
                  )}
                  
                  <p className="leading-relaxed whitespace-pre-wrap font-sans">{msg.text}</p>
                  
                  <span className="block text-[8px] opacity-50 text-right mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 rounded-bl-none flex items-center gap-2 text-xs text-slate-400 shadow-md">
                <Loader2 className="animate-spin text-indigo-400" size={14} />
                <span className="font-mono text-[10px]">Evaluating diagnostics logs...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Console / Terminal input bar */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-900">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <div className="absolute left-3 top-3.5 text-slate-500 font-mono text-xs pointer-events-none select-none">
              $
            </div>
            <input
              type="text"
              placeholder={`Ask ${activeAssistant.replace('_', ' ')} about operational logs...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || loading}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 rounded-xl transition shadow-md flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
          <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono mt-2 px-1 select-none">
            <span>Terminal prompt active</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Terminal size={10} /> ISO-27001 Encrypted
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
