import React, { useState, useEffect, useRef } from 'react';
import { Tv, Play, Square, Wifi, Check, Sparkles, Smartphone, ShieldCheck, HeartPulse } from 'lucide-react';
import { ChatMessage } from '../types';

interface CastingSimulatorProps {
  activeThreadTitle: string;
  messages: ChatMessage[];
}

export const CastingSimulator: React.FC<CastingSimulatorProps> = ({
  activeThreadTitle,
  messages,
}) => {
  const [isCasting, setIsCasting] = useState(false);
  const [castDevice, setCastDevice] = useState<string>('Chromecast Living Room');
  const [connectionTime, setConnectionTime] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter messages to show the last 3 discussed points for clean TV readability
  const lastMessages = messages.slice(-3);

  // Time elapsed counter
  useEffect(() => {
    let timer: any;
    if (isCasting) {
      timer = setInterval(() => {
        setConnectionTime((t) => t + 1);
      }, 1000);
    } else {
      setConnectionTime(0);
    }
    return () => clearInterval(timer);
  }, [isCasting]);

  // High-Fidelity Audio Visualizer Animation Loop
  useEffect(() => {
    if (!isCasting || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#6366f1'; // Indigo-500
      ctx.lineWidth = 2.5;

      // Draw multi-layered sine wave to represent biometric diagnostics
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const opacity = 1 - layer * 0.3;
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.lineWidth = 3 - layer;

        for (let x = 0; x < canvas.width; x++) {
          const amplitude = 25 - layer * 5 + Math.sin(phase * 0.1) * 8;
          const frequency = 0.015 + layer * 0.005;
          const speed = phase * (0.05 + layer * 0.01);
          const y = canvas.height / 2 + Math.sin(x * frequency + speed) * amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw heart rate rhythm pulse
      ctx.beginPath();
      ctx.strokeStyle = '#ec4899'; // Rose-500
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        let pulseY = canvas.height / 2 + 35;
        // Periodic peak for heart rate
        const cycle = (x + phase * 2) % 150;
        if (cycle > 50 && cycle < 60) {
          pulseY -= Math.sin((cycle - 50) * Math.PI / 10) * 20;
        }
        if (x === 0) ctx.moveTo(x, pulseY);
        else ctx.lineTo(x, pulseY);
      }
      ctx.stroke();

      phase += 1;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isCasting]);

  const devices = [
    'Chromecast Living Room',
    'Samsung QLED 75" Smart TV',
    'Sony BRAVIA Master Room',
    'Apple TV 4K Dining'
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="casting_simulator" className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className={isCasting ? 'text-indigo-400 animate-pulse' : 'text-slate-400'} size={20} />
          <div>
            <h3 className="text-sm font-semibold text-white">Smart Casting Hub</h3>
            <p className="text-[10px] text-slate-400">Cast voice sessions & nutritional insights to TV</p>
          </div>
        </div>

        {isCasting ? (
          <span className="flex items-center gap-1 text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
            <Wifi className="animate-pulse" size={10} /> Active Cast ({formatDuration(connectionTime)})
          </span>
        ) : (
          <span className="text-[9px] bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
            Disconnected
          </span>
        )}
      </div>

      {!isCasting ? (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Select Display Device</label>
            <select
              value={castDevice}
              onChange={(e) => setCastDevice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {devices.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsCasting(true)}
            className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs tracking-wide shadow-lg flex items-center justify-center gap-1.5 transition"
          >
            <Play size={13} />
            <span>Cast Session to {castDevice.split(' ')[0]}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* CAST ACTIVE CONTROL PANEL */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
              <div>
                <span className="text-[10px] font-mono text-indigo-400 block">Streaming to:</span>
                <span className="text-xs font-bold text-white">{castDevice}</span>
              </div>
            </div>
            <button
              onClick={() => setIsCasting(false)}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-semibold text-xs flex items-center gap-1 transition"
            >
              <Square size={12} />
              <span>Stop Cast</span>
            </button>
          </div>

          {/* HIGH-FIDELITY LIVE TV DASHBOARD SIMULATOR SCREEN */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-inner flex flex-col relative aspect-video">
            {/* Glossy top overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

            {/* Simulated Smart TV Header */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center z-10">
              <div className="flex items-center gap-1.5">
                <HeartPulse className="text-rose-500" size={14} />
                <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest font-mono">NutriMind TV Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={11} /> Biometric Bridge Secured
                </span>
                <span className="text-[9px] font-mono text-slate-400">1080p Ultra-HD</span>
              </div>
            </div>

            {/* Smart TV Body Grid */}
            <div className="flex-1 grid grid-cols-3 p-4 gap-3 overflow-hidden z-10">
              {/* Left Column: Live Audio Frequency & Stream Stats */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">Focus Mode</span>
                  <h4 className="font-bold text-xs text-indigo-300 truncate">{activeThreadTitle || "General Coaching"}</h4>
                </div>

                {/* Pulsing Visualizer Canvas */}
                <div className="relative py-2 flex-1 flex flex-col justify-center">
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest text-center block mb-1">Live Audio Wave</span>
                  <canvas ref={canvasRef} className="w-full h-16 bg-slate-950/90 rounded-lg border border-slate-900" width={180} height={70} />
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono border-t border-slate-900 pt-1.5 mt-1">
                  <span className="text-slate-400">FPS: 60.00</span>
                  <span className="text-slate-400">Lat: 15ms</span>
                </div>
              </div>

              {/* Middle Column: Scrolling Transcripts / Captions */}
              <div className="col-span-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between overflow-hidden">
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mb-2 border-b border-slate-900 pb-1">Streaming Captions</span>
                <div className="flex-1 space-y-2 overflow-y-auto text-left pr-1">
                  {lastMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[9px] text-slate-500 italic">
                      Awaiting user dialogue vocalizations...
                    </div>
                  ) : (
                    lastMessages.map((msg, i) => (
                      <div key={msg.id || i} className="space-y-0.5">
                        <span className={`text-[7px] font-mono uppercase tracking-wider block ${msg.sender === 'user' ? 'text-teal-400' : 'text-indigo-400'}`}>
                          {msg.sender === 'user' ? '👤 User Voice Input' : '🩺 AI Health Coach'}
                        </span>
                        <p className="text-[10px] text-slate-200 leading-snug line-clamp-2 italic font-sans font-medium">
                          "{msg.text}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Smart TV Footer / Companion code */}
            <div className="bg-slate-950 p-2.5 border-t border-slate-800/60 flex items-center justify-between text-[8px] font-mono z-10">
              <div className="flex items-center gap-1 text-slate-400">
                <Smartphone size={10} />
                <span>Multi-Device Sync Code: <strong>NTR-782</strong></span>
              </div>
              <span className="text-slate-500">Press Stop Cast to control local audio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
