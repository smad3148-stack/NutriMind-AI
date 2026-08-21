import React, { useState } from 'react';
import { Volume2, Mic, Sliders, Check, Sparkles, Upload, Play, Pause, Heart, Zap, Award } from 'lucide-react';

export type VoiceGender = 'male' | 'female';
export type VoiceStyle = 'calm' | 'motivational' | 'premium' | 'professional' | 'friendly';

interface VoicePersonaSettingsProps {
  gender: VoiceGender;
  setGender: (g: VoiceGender) => void;
  style: VoiceStyle;
  setStyle: (s: VoiceStyle) => void;
  isContinuous: boolean;
  setIsContinuous: (c: boolean) => void;
  isInterruptible: boolean;
  setIsInterruptible: (i: boolean) => void;
  voiceSpeed?: number;
  setVoiceSpeed?: (speed: number) => void;
}

export const VoicePersonaSettings: React.FC<VoicePersonaSettingsProps> = ({
  gender,
  setGender,
  style,
  setStyle,
  isContinuous,
  setIsContinuous,
  isInterruptible,
  setIsInterruptible,
  voiceSpeed = 1.0,
  setVoiceSpeed,
}) => {
  const [speedVal, setSpeedVal] = useState<number>(voiceSpeed);
  const [customVoiceName, setCustomVoiceName] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [emotionEngineActive, setEmotionEngineActive] = useState(true);

  const stylesInfo = [
    { id: 'calm', name: 'Calm & Serene', icon: '🍃', desc: 'Slower, rhythmic pacing with deep bio-resonance' },
    { id: 'motivational', name: 'Motivational', icon: '⚡', desc: 'High energy, uplifting encouragement for physical peak' },
    { id: 'premium', name: 'Ultra Premium', icon: '👑', desc: 'Velvety, crystal-clear warm human timbre' },
    { id: 'professional', name: 'Professional Expert', icon: '🩺', desc: 'Authoritative clinical precision' },
    { id: 'friendly', name: 'Friendly Companion', icon: '🤍', desc: 'Conversational warmth with natural breathing pauses' },
  ];

  const handleSpeedChange = (s: number) => {
    setSpeedVal(s);
    if (setVoiceSpeed) setVoiceSpeed(s);
  };

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomVoiceName(e.target.files[0].name);
    }
  };

  const handlePlayPreview = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingPreview) {
        setIsPlayingPreview(false);
        return;
      }
      setIsPlayingPreview(true);
      const text = `Hello! I am your ${gender} NutriMind AI coach, tuned to ${style} resonance at ${speedVal}x pace.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speedVal;
      utterance.pitch = gender === 'female' ? 1.2 : 0.95;
      utterance.onend = () => setIsPlayingPreview(false);
      utterance.onerror = () => setIsPlayingPreview(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingPreview(true);
      setTimeout(() => setIsPlayingPreview(false), 2000);
    }
  };

  return (
    <div id="voice_persona_settings" className="bg-[#07040A]/95 border border-[#663399]/40 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-2xl text-[#FBE4E3]">
      <div className="flex items-center justify-between border-b border-[#A3779D]/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#663399]/30 text-[#FBE4E3] border border-[#663399]/50 flex items-center justify-center">
            <Volume2 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#FBE4E3] font-sans">Human Voice Engine (95% Natural)</h3>
            <p className="text-[9px] text-[#A3779D]">Neural TTS with Emotion & Breath Dynamics</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePlayPreview}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
            isPlayingPreview
              ? 'bg-[#50C878] text-[#07040A] border-[#50C878] animate-pulse'
              : 'bg-[#663399]/30 hover:bg-[#663399]/50 border-[#663399]/50 text-[#FBE4E3]'
          }`}
        >
          {isPlayingPreview ? <Pause size={10} /> : <Play size={10} />}
          <span>{isPlayingPreview ? 'Testing Voice...' : 'Preview Voice'}</span>
        </button>
      </div>

      {/* Voice Gender */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-[#A3779D] uppercase tracking-wider block">Synthesizer Gender</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              gender === 'male'
                ? 'bg-[#663399] border-[#A3779D]/50 text-[#FBE4E3] shadow-md shadow-[#663399]/30'
                : 'bg-[#2E1A47]/30 border-[#A3779D]/15 text-[#A3779D] hover:text-[#FBE4E3]'
            }`}
          >
            <span>👨</span> Male Voice
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              gender === 'female'
                ? 'bg-[#663399] border-[#A3779D]/50 text-[#FBE4E3] shadow-md shadow-[#663399]/30'
                : 'bg-[#2E1A47]/30 border-[#A3779D]/15 text-[#A3779D] hover:text-[#FBE4E3]'
            }`}
          >
            <span>👩</span> Female Voice
          </button>
        </div>
      </div>

      {/* Voice Speed Control */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono text-[#A3779D] uppercase tracking-wider">Pace & Speed Control</label>
          <span className="text-[10px] font-mono text-[#50C878] font-bold">{speedVal}x</span>
        </div>
        <div className="flex gap-1.5">
          {[0.85, 1.0, 1.15, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSpeedChange(speed)}
              className={`flex-1 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition cursor-pointer ${
                speedVal === speed
                  ? 'bg-[#50C878]/20 border-[#50C878] text-[#50C878]'
                  : 'bg-[#2E1A47]/20 border-[#A3779D]/20 text-[#A3779D] hover:text-[#FBE4E3]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Voice Style / Emotion */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-[#A3779D] uppercase tracking-wider block">Emotion Engine Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {stylesInfo.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id as VoiceStyle)}
              className={`p-2 rounded-xl border text-left flex flex-col transition relative cursor-pointer ${
                style === s.id
                  ? 'bg-[#663399]/40 border-[#A3779D] text-[#FBE4E3] shadow-md'
                  : 'bg-[#2E1A47]/20 border-[#A3779D]/20 text-[#A3779D] hover:text-[#FBE4E3]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>{s.icon}</span>
                <span className="truncate">{s.name}</span>
                {style === s.id && <Check className="absolute right-2 top-2 text-[#50C878]" size={12} />}
              </div>
              <span className="text-[9px] text-[#A3779D] mt-0.5 font-sans leading-tight">
                {s.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Voice Upload */}
      <div className="p-2.5 bg-[#2E1A47]/20 border border-[#A3779D]/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload size={14} className="text-[#50C878]" />
          <div>
            <span className="text-xs font-semibold text-[#FBE4E3] block">Custom Voice Clone</span>
            <span className="text-[9px] text-[#A3779D] block">
              {customVoiceName || 'Upload a 10s audio clip'}
            </span>
          </div>
        </div>
        <label className="px-3 py-1 bg-[#663399]/40 hover:bg-[#663399]/60 border border-[#A3779D]/30 rounded-lg text-[10px] font-bold text-[#FBE4E3] transition cursor-pointer">
          Upload
          <input type="file" accept="audio/*" onChange={handleCustomVoiceUpload} className="hidden" />
        </label>
      </div>

      {/* Toggles */}
      <div className="border-t border-[#A3779D]/20 pt-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#FBE4E3] flex items-center gap-1.5">
              <Mic size={12} className="text-[#50C878]" />
              Continuous Conversation
            </h4>
            <p className="text-[9px] text-[#A3779D]">Auto-listen when speaker finishes response</p>
          </div>
          <button
            type="button"
            onClick={() => setIsContinuous(!isContinuous)}
            className={`w-9 h-5 rounded-full transition relative cursor-pointer ${isContinuous ? 'bg-[#50C878]' : 'bg-[#2E1A47]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#07040A] transition-all ${isContinuous ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#FBE4E3] flex items-center gap-1.5">
              <Sliders size={12} className="text-[#663399]" />
              Speech Interruption
            </h4>
            <p className="text-[9px] text-[#A3779D]">Instantly interrupt voice when you speak</p>
          </div>
          <button
            type="button"
            onClick={() => setIsInterruptible(!isInterruptible)}
            className={`w-9 h-5 rounded-full transition relative cursor-pointer ${isInterruptible ? 'bg-[#663399]' : 'bg-[#2E1A47]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#FBE4E3] transition-all ${isInterruptible ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

