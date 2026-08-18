import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, CheckCircle2, Bluetooth, Zap, Sparkles, Radio } from 'lucide-react';

export interface Brand3DConnectButtonProps {
  brandId: string;
  brandName: string;
  isConnected: boolean;
  isPairing: boolean;
  onConnect: () => void;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
}

interface BrandStyleConfig {
  bgGradient: string;
  textColor: string;
  borderStyle: string;
  glowShadow: string;
  glowHoverShadow: string;
  accentGlowColor: string;
  rippleColor: string;
  shineAnimation: string;
  badgeStyle?: string;
}

export const getBrand3DStyle = (brandId: string, brandName: string = ''): BrandStyleConfig => {
  const id = (brandId || '').toLowerCase();
  const name = (brandName || '').toLowerCase();

  // 1. Apple Health & Apple Watch -> Liquid Glass White + Pink Glow + Dynamic Shine
  if (id.includes('apple') || name.includes('apple') || id === 'apple_health' || id === 'apple_watch') {
    return {
      bgGradient: 'bg-gradient-to-r from-slate-100 via-white to-rose-100',
      textColor: 'text-slate-950',
      borderStyle: 'border-t-2 border-white border-x border-pink-200/60 border-b border-rose-300/40',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(244,63,94,0.4),0_0_15px_rgba(255,255,255,0.6)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(244,63,94,0.65),0_0_25px_rgba(255,255,255,0.9)]',
      accentGlowColor: '#f43f5e',
      rippleColor: 'rgba(244, 63, 94, 0.4)',
      shineAnimation: 'animate-pulse'
    };
  }

  // 2. Samsung Galaxy Watch -> Samsung One UI Blue + Cyan Neon Glow + Floating Effect
  if (id.includes('samsung') || name.includes('galaxy') || name.includes('samsung')) {
    return {
      bgGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500',
      textColor: 'text-white',
      borderStyle: 'border-t-2 border-cyan-200/80 border-x border-blue-400/50 border-b border-indigo-900',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(6,182,212,0.5),0_0_15px_rgba(37,99,235,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(6,182,212,0.8),0_0_25px_rgba(37,99,235,0.7)]',
      accentGlowColor: '#06b6d4',
      rippleColor: 'rgba(6, 182, 212, 0.5)',
      shineAnimation: ''
    };
  }

  // 3. Fitbit -> Google Blue Gradient + Soft Health Pulse
  if (id.includes('fitbit') || name.includes('fitbit')) {
    return {
      bgGradient: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-white/90 border-x border-teal-300/50 border-b border-blue-800',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(20,184,166,0.5),0_0_15px_rgba(6,182,212,0.35)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(20,184,166,0.8),0_0_25px_rgba(6,182,212,0.6)]',
      accentGlowColor: '#14b8a6',
      rippleColor: 'rgba(20, 184, 166, 0.5)',
      shineAnimation: ''
    };
  }

  // 4. WHOOP -> Matte Black + Emerald Green Glow
  if (id.includes('whoop') || name.includes('whoop')) {
    return {
      bgGradient: 'bg-gradient-to-r from-zinc-950 via-black to-zinc-900',
      textColor: 'text-emerald-400 font-bold',
      borderStyle: 'border-t-2 border-emerald-400/80 border-x border-emerald-500/30 border-b border-zinc-950',
      glowShadow: 'shadow-[0_8px_22px_-4px_rgba(16,185,129,0.55),0_0_18px_rgba(16,185,129,0.35)]',
      glowHoverShadow: 'hover:shadow-[0_14px_32px_-4px_rgba(16,185,129,0.85),0_0_28px_rgba(16,185,129,0.6)]',
      accentGlowColor: '#10b981',
      rippleColor: 'rgba(16, 185, 129, 0.5)',
      shineAnimation: ''
    };
  }

  // 5. Oura Ring -> Titanium Silver + Soft White Glow
  if (id.includes('oura') || name.includes('oura')) {
    return {
      bgGradient: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-white border-x border-slate-300 border-b border-slate-400',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(255,255,255,0.45),0_0_15px_rgba(203,213,225,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(255,255,255,0.8),0_0_25px_rgba(203,213,225,0.7)]',
      accentGlowColor: '#f8fafc',
      rippleColor: 'rgba(255, 255, 255, 0.5)',
      shineAnimation: ''
    };
  }

  // 6. Garmin -> Premium Dark Blue + Electric Blue Pulse
  if (id.includes('garmin') || name.includes('garmin')) {
    return {
      bgGradient: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-900',
      textColor: 'text-white font-bold',
      borderStyle: 'border-t-2 border-sky-300/90 border-x border-blue-400/40 border-b border-indigo-950',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(2,132,199,0.55),0_0_15px_rgba(59,130,246,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(2,132,199,0.85),0_0_25px_rgba(59,130,246,0.7)]',
      accentGlowColor: '#0284c7',
      rippleColor: 'rgba(2, 132, 199, 0.5)',
      shineAnimation: ''
    };
  }

  // 7. Xiaomi -> Orange Gradient + Glass Reflection
  if (id.includes('xiaomi') || name.includes('xiaomi') || id.includes('mi_band')) {
    return {
      bgGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-amber-200/90 border-x border-orange-300/50 border-b border-red-800',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(249,115,22,0.55),0_0_15px_rgba(245,158,11,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(249,115,22,0.85),0_0_25px_rgba(245,158,11,0.7)]',
      accentGlowColor: '#f97316',
      rippleColor: 'rgba(249, 115, 22, 0.5)',
      shineAnimation: ''
    };
  }

  // 8. Huawei -> Premium Gold + Soft White Lighting
  if (id.includes('huawei') || name.includes('huawei')) {
    return {
      bgGradient: 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-600',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-white border-x border-amber-200/60 border-b border-amber-700',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(245,158,11,0.55),0_0_18px_rgba(254,240,138,0.5)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(245,158,11,0.85),0_0_28px_rgba(254,240,138,0.8)]',
      accentGlowColor: '#f59e0b',
      rippleColor: 'rgba(245, 158, 11, 0.5)',
      shineAnimation: ''
    };
  }

  // 9. Health Connect -> Android Green + Dynamic Sync
  if (id.includes('health_connect') || name.includes('health connect')) {
    return {
      bgGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-emerald-200/90 border-x border-teal-300/50 border-b border-green-800',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(16,185,129,0.55),0_0_15px_rgba(20,184,166,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(16,185,129,0.85),0_0_25px_rgba(20,184,166,0.7)]',
      accentGlowColor: '#10b981',
      rippleColor: 'rgba(16, 185, 129, 0.5)',
      shineAnimation: ''
    };
  }

  // 10. Google Pixel Watch -> Material 3 Dynamic Gradient
  if (id.includes('pixel') || name.includes('pixel')) {
    return {
      bgGradient: 'bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-white/90 border-x border-rose-200/60 border-b border-emerald-700',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(251,113,133,0.5),0_0_15px_rgba(52,211,153,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(251,113,133,0.8),0_0_25px_rgba(52,211,153,0.7)]',
      accentGlowColor: '#fb7185',
      rippleColor: 'rgba(251, 113, 133, 0.5)',
      shineAnimation: ''
    };
  }

  // 11. Polar -> Red Metallic Glow
  if (id.includes('polar') || name.includes('polar')) {
    return {
      bgGradient: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-900',
      textColor: 'text-white font-bold',
      borderStyle: 'border-t-2 border-rose-300/90 border-x border-red-400/40 border-b border-rose-950',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(225,29,72,0.6),0_0_15px_rgba(244,63,94,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(225,29,72,0.85),0_0_25px_rgba(244,63,94,0.7)]',
      accentGlowColor: '#e11d48',
      rippleColor: 'rgba(225, 29, 72, 0.5)',
      shineAnimation: ''
    };
  }

  // 12. Amazfit -> Cyan Metallic Lighting
  if (id.includes('amazfit') || name.includes('amazfit')) {
    return {
      bgGradient: 'bg-gradient-to-r from-cyan-400 via-teal-600 to-blue-700',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-cyan-200/90 border-x border-teal-300/50 border-b border-blue-900',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(34,211,238,0.55),0_0_15px_rgba(6,182,212,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(34,211,238,0.85),0_0_25px_rgba(6,182,212,0.7)]',
      accentGlowColor: '#22d3ee',
      rippleColor: 'rgba(34, 211, 238, 0.5)',
      shineAnimation: ''
    };
  }

  // 13. OnePlus Watch -> Red Premium Gradient
  if (id.includes('oneplus') || name.includes('oneplus')) {
    return {
      bgGradient: 'bg-gradient-to-r from-red-600 via-red-700 to-rose-950',
      textColor: 'text-white font-bold',
      borderStyle: 'border-t-2 border-red-300/90 border-x border-red-500/40 border-b border-black',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(239,68,68,0.6),0_0_15px_rgba(185,28,28,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(239,68,68,0.85),0_0_25px_rgba(185,28,28,0.7)]',
      accentGlowColor: '#ef4444',
      rippleColor: 'rgba(239, 68, 68, 0.5)',
      shineAnimation: ''
    };
  }

  // 14. OPPO Watch -> Emerald Glass Glow
  if (id.includes('oppo') || name.includes('oppo')) {
    return {
      bgGradient: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-700',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-emerald-200/90 border-x border-teal-300/50 border-b border-emerald-900',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(52,211,153,0.55),0_0_15px_rgba(16,185,129,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(52,211,153,0.85),0_0_25px_rgba(16,185,129,0.7)]',
      accentGlowColor: '#34d399',
      rippleColor: 'rgba(52, 211, 153, 0.5)',
      shineAnimation: ''
    };
  }

  // 15. Nothing Health / CMF -> Dot Matrix Dark + Monochrome Glass Glow
  if (id.includes('nothing') || name.includes('nothing') || id.includes('cmf')) {
    return {
      bgGradient: 'bg-gradient-to-r from-zinc-900 via-stone-900 to-black',
      textColor: 'text-white font-mono font-bold',
      borderStyle: 'border-t-2 border-white/80 border-x border-white/30 border-b border-stone-950',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(255,255,255,0.35),0_0_15px_rgba(255,255,255,0.2)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(255,255,255,0.65),0_0_25px_rgba(255,255,255,0.4)]',
      accentGlowColor: '#ffffff',
      rippleColor: 'rgba(255, 255, 255, 0.4)',
      shineAnimation: ''
    };
  }

  // 16. Realme -> Gold Yellow Glow
  if (id.includes('realme') || name.includes('realme')) {
    return {
      bgGradient: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-yellow-100 border-x border-amber-200/50 border-b border-orange-800',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(234,179,8,0.55),0_0_15px_rgba(245,158,11,0.4)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(234,179,8,0.85),0_0_25px_rgba(245,158,11,0.7)]',
      accentGlowColor: '#eab308',
      rippleColor: 'rgba(234, 179, 8, 0.5)',
      shineAnimation: ''
    };
  }

  // 17. Suunto -> Outdoor Amber Metallic Glow
  if (id.includes('suunto') || name.includes('suunto')) {
    return {
      bgGradient: 'bg-gradient-to-r from-amber-600 via-yellow-700 to-stone-800',
      textColor: 'text-white font-bold',
      borderStyle: 'border-t-2 border-amber-300/80 border-x border-yellow-500/40 border-b border-stone-950',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(217,119,6,0.5),0_0_15px_rgba(245,158,11,0.35)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(217,119,6,0.8),0_0_25px_rgba(245,158,11,0.65)]',
      accentGlowColor: '#d97706',
      rippleColor: 'rgba(217, 119, 6, 0.5)',
      shineAnimation: ''
    };
  }

  // 18. Withings / Scales / BP / CGM -> Medical Titanium Glass Glow
  if (id.includes('withings') || id.includes('scale') || id.includes('cgm') || id.includes('bp')) {
    return {
      bgGradient: 'bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-100',
      textColor: 'text-slate-950 font-black',
      borderStyle: 'border-t-2 border-white border-x border-cyan-200/60 border-b border-slate-300',
      glowShadow: 'shadow-[0_8px_20px_-4px_rgba(6,182,212,0.45),0_0_15px_rgba(255,255,255,0.5)]',
      glowHoverShadow: 'hover:shadow-[0_14px_30px_-4px_rgba(6,182,212,0.75),0_0_25px_rgba(255,255,255,0.8)]',
      accentGlowColor: '#06b6d4',
      rippleColor: 'rgba(6, 182, 212, 0.4)',
      shineAnimation: ''
    };
  }

  // 19. Any Future Device -> Automatically Generate Brand-Specific 3D Theme
  let hash = 0;
  const str = (brandId + brandName).toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);

  return {
    bgGradient: `bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600`,
    textColor: 'text-white font-bold',
    borderStyle: 'border-t-2 border-white/80 border-x border-white/30 border-b border-black/40',
    glowShadow: `shadow-[0_8px_20px_-4px_rgba(6,182,212,0.5),0_0_15px_rgba(168,85,247,0.35)]`,
    glowHoverShadow: `hover:shadow-[0_14px_30px_-4px_rgba(6,182,212,0.8),0_0_25px_rgba(168,85,247,0.65)]`,
    accentGlowColor: `hsl(${hue}, 80%, 50%)`,
    rippleColor: `hsla(${hue}, 80%, 50%, 0.5)`,
    shineAnimation: ''
  };
};

export const Brand3DConnectButton: React.FC<Brand3DConnectButtonProps> = ({
  brandId,
  brandName,
  isConnected,
  isPairing,
  onConnect,
  size = 'md',
  customLabel
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const style = getBrand3DStyle(brandId, brandName);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600);
    onConnect();
  };

  // Connected state has a pressable 3D Disconnect glass style
  if (isConnected) {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="relative overflow-hidden rounded-xl px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 border-t-rose-400/70 text-rose-300 font-mono text-[10px] uppercase font-bold tracking-wider shadow-[0_4px_12px_rgba(244,63,94,0.25)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)] transition cursor-pointer flex items-center gap-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        <span>Disconnect</span>
      </motion.button>
    );
  }

  const paddingClasses = size === 'sm' 
    ? 'px-3 py-1 text-[9px]' 
    : size === 'lg' 
      ? 'px-5 py-2.5 text-xs' 
      : 'px-3.5 py-1.5 text-[10px]';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.94, y: 0.5 }}
      onClick={handleClick}
      disabled={isPairing}
      className={`relative overflow-hidden rounded-2xl font-mono uppercase font-black tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md select-none ${paddingClasses} ${style.bgGradient} ${style.textColor} ${style.borderStyle} ${style.glowShadow} ${style.glowHoverShadow}`}
    >
      {/* Specular Liquid Glass Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-2xl" />

      {/* Dynamic Specular Sheen Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Ripple Wave Feedback */}
      {isRippling && (
        <motion.span
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute w-12 h-12 rounded-full pointer-events-none"
          style={{ backgroundColor: style.rippleColor }}
        />
      )}

      {/* Pairing / Connecting Spinner or Connect Label */}
      {isPairing ? (
        <span className="flex items-center gap-1.5">
          <RefreshCw size={12} className="animate-spin text-current" />
          <span>Syncing...</span>
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-1">
          <Zap size={11} className="fill-current opacity-90" />
          <span>{customLabel || 'CONNECT'}</span>
        </span>
      )}
    </motion.button>
  );
};
