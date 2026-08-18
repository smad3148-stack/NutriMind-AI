import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, Sparkles, Check, Download, Star, Loader2, HeartPulse, 
  Award, Shield, Flame, Zap, Trophy, CheckCircle, Gift, Users, 
  Watch, Target, ArrowRight, Lock, ChevronRight, ChevronLeft, Activity, CreditCard,
  Clock, TrendingUp, Cpu, BatteryCharging, Flame as FlameIcon, CheckSquare,
  Smartphone, Wallet, QrCode, ArrowLeft, CheckCircle2, User, Mail, Phone
} from 'lucide-react';
import { GlobalPaymentModal } from './GlobalPaymentModal';

interface PremiumPanelProps {
  isPremium: boolean;
  setIsPremium: (p: boolean) => void;
  wearablesCount: number;
  familyCount: number;
  selectedTier: 'FREE' | 'PRO' | 'ELITE';
  setSelectedTier: (t: 'FREE' | 'PRO' | 'ELITE') => void;
  onTriggerToast?: (msg: string) => void;
}

export const PremiumPanel: React.FC<PremiumPanelProps> = ({
  isPremium,
  setIsPremium,
  wearablesCount,
  familyCount,
  selectedTier,
  setSelectedTier,
  onTriggerToast
}) => {
  // Current active slide (1 to 15)
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Form details for Slide 13
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678'
  });

  // Selected Billing Plan for Slide 12/13/14
  const [selectedPlanType, setSelectedPlanType] = useState<'MONTHLY' | 'YEARLY' | 'LIFETIME'>('YEARLY');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('UPI');

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLifetimeActive, setIsLifetimeActive] = useState<boolean>(() => {
    return localStorage.getItem('nutrimind_is_lifetime') === 'true';
  });

  // Mission completion local states
  const [completedMissions, setCompletedMissions] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('nutrimind_completed_missions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      day1: false,
      day2: false,
      day3: false,
      day7: false
    };
  });

  // Persistent Production-Level Elite Timer State
  const [eliteStartTime] = useState<number>(() => {
    const saved = localStorage.getItem('nutrimind_elite_start_time');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const now = Date.now();
    localStorage.setItem('nutrimind_elite_start_time', now.toString());
    return now;
  });

  const [earnedEliteDays, setEarnedEliteDays] = useState<number>(() => {
    const saved = localStorage.getItem('nutrimind_earned_elite_days');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    localStorage.setItem('nutrimind_earned_elite_days', '14');
    return 14;
  });

  const [userId] = useState<string>(() => {
    let saved = localStorage.getItem('nutrimind_user_id');
    if (!saved) {
      saved = 'ELITE-USR-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('nutrimind_user_id', saved);
    }
    return saved;
  });

  // Calculate dynamic countdown metrics from absolute timestamps
  const calculateRealtimeCountdown = (startTime: number, days: number) => {
    const totalDurationMs = days * 24 * 60 * 60 * 1000;
    const expiryTimestamp = startTime + totalDurationMs;
    const now = Date.now();
    const remainingMs = Math.max(0, expiryTimestamp - now);

    const startDateObj = new Date(startTime);
    const expiryDateObj = new Date(expiryTimestamp);

    const formatDateStr = (d: Date) => {
      return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };

    if (remainingMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
        startDateFormatted: formatDateStr(startDateObj),
        expiryDateFormatted: formatDateStr(expiryDateObj),
        percentCompleted: 100,
        daysCompleted: days,
        expiryTimestamp,
        startTime
      };
    }

    const dLeft = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hLeft = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const sLeft = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const elapsedMs = Math.max(0, now - startTime);
    const percentCompleted = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
    const daysCompleted = Math.min(days, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));

    return {
      days: dLeft,
      hours: hLeft,
      minutes: mLeft,
      seconds: sLeft,
      totalSeconds: Math.floor(remainingMs / 1000),
      isExpired: false,
      startDateFormatted: formatDateStr(startDateObj),
      expiryDateFormatted: formatDateStr(expiryDateObj),
      percentCompleted,
      daysCompleted,
      expiryTimestamp,
      startTime
    };
  };

  // Real-time dynamic timer state updated every second
  const [timeLeft, setTimeLeft] = useState(() => calculateRealtimeCountdown(eliteStartTime, earnedEliteDays));

  useEffect(() => {
    const updateLoop = () => {
      const updated = calculateRealtimeCountdown(eliteStartTime, earnedEliteDays);
      setTimeLeft(updated);
      if (updated.isExpired) {
        localStorage.setItem('nutrimind_elite_expired', 'true');
        setIsPremium(false);
        setSelectedTier('FREE');
      } else {
        localStorage.setItem('nutrimind_elite_expired', 'false');
      }
    };

    updateLoop();
    const timer = setInterval(updateLoop, 1000);
    return () => clearInterval(timer);
  }, [eliteStartTime, earnedEliteDays, setIsPremium, setSelectedTier]);

  const handleResetFreeAccess = () => {
    const now = Date.now();
    localStorage.setItem('nutrimind_elite_start_time', now.toString());
    localStorage.setItem('nutrimind_earned_elite_days', '14');
    localStorage.setItem('nutrimind_elite_expired', 'false');
    setEarnedEliteDays(14);
    setIsPremium(true);
    setSelectedTier('ELITE');
    notify('🔄 Elite Free Access Timer Reset! 14 Days Reactivated.');
  };

  useEffect(() => {
    localStorage.setItem('nutrimind_completed_missions', JSON.stringify(completedMissions));
    localStorage.setItem('nutrimind_earned_elite_days', earnedEliteDays.toString());
  }, [completedMissions, earnedEliteDays]);

  const notify = (msg: string) => {
    if (onTriggerToast) onTriggerToast(msg);
  };

  const handleClaimMission = (missionId: string, addedDays: number, rewardText: string) => {
    if (completedMissions[missionId]) {
      notify('Reward already claimed for this mission!');
      return;
    }
    setCompletedMissions(prev => ({ ...prev, [missionId]: true }));
    setEarnedEliteDays(prev => prev + addedDays);
    setIsPremium(true);
    setSelectedTier('ELITE');
    notify(`🎉 Mission Completed! Earned +${addedDays} Days Free Elite Access (${rewardText})!`);
  };

  const slides = [
    { id: 1, title: 'ELITE ACCESS' },
    { id: 2, title: 'YOUR ELITE JOURNEY' },
    { id: 3, title: 'HEALTH MISSIONS' },
    { id: 4, title: 'UNLOCKED FEATURES' },
    { id: 5, title: 'HEALTH IMPROVEMENTS' },
    { id: 6, title: 'UPCOMING REWARDS' },
    { id: 7, title: '14 DAYS COMPLETED' },
    { id: 8, title: 'CONGRATULATIONS' },
    { id: 9, title: 'YOUR RESULTS' },
    { id: 10, title: 'CONTINUE YOUR JOURNEY' },
    { id: 11, title: 'PREMIUM PLANS' },
    { id: 12, title: 'CHOOSE YOUR PLAN' },
    { id: 13, title: 'CONFIRM DETAILS' },
    { id: 14, title: 'PAYMENT METHODS' },
    { id: 15, title: 'PAYMENT SUCCESS' },
  ];

  const planPrices = {
    MONTHLY: { label: 'Monthly Premium', price: '$9.99', sub: '/month', id: 'MONTHLY' },
    YEARLY: { label: 'Yearly Premium+ (Best Value)', price: '$79.99', sub: '/year', id: 'YEARLY' },
    LIFETIME: { label: 'Lifetime VIP Pass', price: '$199.99', sub: 'one-time', id: 'LIFETIME' },
  };

  const paymentMethodsList = [
    { id: 'UPI', name: 'UPI / VPA', icon: QrCode, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'GPAY', name: 'Google Pay', icon: Smartphone, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'PHONEPE', name: 'PhonePe', icon: Wallet, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'PAYTM', name: 'Paytm Wallet', icon: Wallet, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'PAYPAL', name: 'PayPal', icon: CreditCard, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'APPLE_PAY', name: 'Apple Pay', icon: Smartphone, color: 'text-slate-100 bg-slate-800 border-white/20' },
    { id: 'GOOGLE_PAY', name: 'GPay Express', icon: Smartphone, color: 'text-blue-300 bg-blue-500/20 border-blue-400/30' },
    { id: 'VISA', name: 'Visa Credit/Debit', icon: CreditCard, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'MASTERCARD', name: 'Mastercard', icon: CreditCard, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'NET_BANKING', name: 'Net Banking', icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    { id: 'STRIPE', name: 'Stripe Secure', icon: Lock, color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/30' },
    { id: 'PAY_LATER', name: 'Pay Later / BNPL', icon: Clock, color: 'text-amber-300 bg-amber-500/20 border-amber-400/30' },
  ];

  const unlockedFeaturesList = [
    { title: 'Unlimited Food Auditor', desc: 'Instant AI macro & micro nutrient breakdown', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { title: 'AI Health Twin', desc: 'Real-time metabolic prediction engine', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { title: 'NutriChat Pro', desc: 'Unlimited 24/7 medical-grade AI companion', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { title: 'Weekly Reports', desc: 'Deep longevity & metabolic trends analysis', icon: Trophy, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { title: 'AI Meal Planner', desc: 'Custom tailored chef & clinical diet plans', icon: Target, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { title: 'Device Sync', desc: 'Seamless Apple Health, Oura & Whoop bridge', icon: Watch, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { title: 'Recovery Tracking', desc: 'Autonomous sleep & strain optimization', icon: HeartPulse, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { title: 'Family Mode', desc: 'Track up to 5 family health circles', icon: Users, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    { title: 'Medical Reports', desc: 'Downloadable clinical metabolic PDF export', icon: Shield, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Premium Challenges', desc: 'Exclusive bio-reset & longevity streaks', icon: Award, color: 'text-amber-300 bg-amber-400/10 border-amber-400/30' },
    { title: 'Health Exports', desc: 'Raw telemetry & biometric CSV export', icon: Download, color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30' },
  ];

  const healthImprovements = [
    { label: 'RECOVERY SCORE', val: '+18%', percent: 98, icon: BatteryCharging, color: 'from-emerald-400 to-teal-500', textCol: 'text-emerald-400' },
    { label: 'PROTEIN GOAL', val: '96%', percent: 96, icon: Target, color: 'from-cyan-400 to-blue-500', textCol: 'text-cyan-400' },
    { label: 'SLEEP QUALITY', val: '+20%', percent: 95, icon: Clock, color: 'from-indigo-400 to-purple-500', textCol: 'text-indigo-400' },
    { label: 'HYDRATION', val: '+19%', percent: 94, icon: Zap, color: 'from-blue-400 to-cyan-400', textCol: 'text-blue-400' },
    { label: 'WORKOUT GOAL', val: '93%', percent: 93, icon: FlameIcon, color: 'from-amber-400 to-rose-500', textCol: 'text-amber-400' },
    { label: 'BODY RECOVERY', val: '+15%', percent: 88, icon: Cpu, color: 'from-teal-400 to-emerald-400', textCol: 'text-teal-400' },
    { label: 'HEART HEALTH', val: '98%', percent: 98, icon: HeartPulse, color: 'from-rose-500 to-red-600', textCol: 'text-rose-400' },
    { label: 'CALORIE TARGET', val: '92%', percent: 92, icon: TrendingUp, color: 'from-purple-400 to-indigo-500', textCol: 'text-purple-400' },
  ];

  const handleFinishPayment = () => {
    setIsPremium(true);
    setSelectedTier('ELITE');
    localStorage.setItem('nutrimind_is_lifetime', selectedPlanType === 'LIFETIME' ? 'true' : 'false');
    notify(`🎉 Payment Successful! Welcome to NutriMind Elite (${planPrices[selectedPlanType].label})!`);
  };

  return (
    <div id="premium_billing_panel" className="relative space-y-6 font-sans pb-16 max-w-3xl mx-auto text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Dynamic Ambient Glow & Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-amber-500/10 rounded-full blur-[140px] opacity-75 animate-pulse" />
        <div className="absolute top-1/3 right-5 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-5 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 space-y-6">

        {/* ========================================================= */}
        {/* SLIDE NAVIGATION BAR (SLIDE 01 - SLIDE 15 NAVIGATOR)       */}
        {/* ========================================================= */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 shadow-xl backdrop-blur-2xl space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
              disabled={currentSlide === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <ChevronLeft size={14} /> PREV
            </button>

            <div className="text-center font-mono">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                SLIDE {String(currentSlide).padStart(2, '0')} OF 15
              </span>
              <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                {slides[currentSlide - 1].title}
              </span>
            </div>

            <button
              onClick={() => setCurrentSlide(prev => Math.min(15, prev + 1))}
              disabled={currentSlide === 15}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 rounded-xl text-xs font-mono font-black flex items-center gap-1 cursor-pointer transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              NEXT <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Slide Dots / Pills Carousel */}
          <div className="flex items-center justify-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {slides.map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(s.id)}
                title={`Slide ${s.id}: ${s.title}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === s.id
                    ? 'w-6 bg-gradient-to-r from-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SLIDE CONTENT DISPLAY AREA                                */}
        {/* ========================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >

            {/* SLIDE 01: ELITE ACCESS */}
            {currentSlide === 1 && (
              <div className="relative rounded-[32px] p-8 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950 border border-cyan-400/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] backdrop-blur-3xl space-y-8 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-black rounded-full uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '5s' }} /> NUTRIMIND PRO + REWARDS
                  </span>
                </div>

                {/* Floating Animated Crown Header */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_40px_rgba(251,191,36,0.6)] relative z-10"
                >
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
                    <Crown size={48} className="drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" fill="currentColor" />
                  </div>
                </motion.div>

                <div className="space-y-3 relative z-10">
                  <h1 className="text-3xl md:text-4xl font-black text-white font-mono uppercase tracking-tight">
                    NUTRIMIND ELITE
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-extrabold rounded-full">
                    <CheckCircle size={14} /> FREE ELITE ACCESS ACTIVE
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto font-medium leading-relaxed pt-2">
                    YOUR AI HEALTH JOURNEY HAS STARTED • ALL ELITE FEATURES ARE ACTIVE • 14 DAYS OF PREMIUM ACCESS REMAINING
                  </p>
                </div>

                <div className="pt-4 relative z-10">
                  <button
                    onClick={() => setCurrentSlide(2)}
                    className="w-full py-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_35px_rgba(6,182,212,0.4)]"
                  >
                    <span>EXPLORE YOUR ELITE JOURNEY</span> <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 02: YOUR ELITE JOURNEY */}
            {currentSlide === 2 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
                
                {/* Header status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-extrabold rounded-lg uppercase tracking-widest">
                        DAY {String(timeLeft.daysCompleted).padStart(2, '0')} OF {earnedEliteDays} DAYS
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[11px] rounded-md border border-slate-700">
                        USER ID: {userId}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight mt-2 flex items-center gap-2">
                      {timeLeft.isExpired ? (
                        <span className="text-rose-400">ELITE ACCESS EXPIRED</span>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                          ELITE ACCESS ACTIVE
                        </>
                      )}
                    </h2>
                  </div>

                  <div className="px-4 py-2 bg-slate-900/90 border border-emerald-400/30 rounded-2xl text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">STATUS & TIER</span>
                    <span className={`text-xs font-mono font-black ${timeLeft.isExpired ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {timeLeft.isExpired ? 'COMPLETED (UPGRADE TO CONTINUE)' : '100% FREE ELITE ACCESS ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* IF EXPIRED: AUTO SHOW CONGRATULATIONS & RESULTS */}
                {timeLeft.isExpired ? (
                  <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)]">
                      <Trophy size={42} />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-amber-300 font-mono uppercase tracking-tight">
                        CONGRATULATIONS!!
                      </h3>
                      <p className="text-sm font-bold text-white font-mono">
                        You successfully completed your FREE ELITE ACCESS.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-left max-w-lg mx-auto pt-2">
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">TOTAL HEALTH SCORE</div>
                        <div className="text-xl font-black text-cyan-400">94 / 100</div>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">RECOVERY SCORE</div>
                        <div className="text-xl font-black text-emerald-400">98%</div>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">PROTEIN COMPLETION</div>
                        <div className="text-xl font-black text-amber-400">96%</div>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">WATER GOAL</div>
                        <div className="text-xl font-black text-blue-400">92%</div>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">WORKOUT COMPLETION</div>
                        <div className="text-xl font-black text-purple-400">93%</div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-slate-300 font-mono">
                        Continue your health journey with Premium.
                      </p>
                      <button
                        onClick={() => setCurrentSlide(11)}
                        className="w-full py-4 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_35px_rgba(251,191,36,0.4)]"
                      >
                        <span>VIEW PREMIUM PLANS & CONTINUE</span> <ChevronRight size={18} />
                      </button>

                      <button
                        onClick={handleResetFreeAccess}
                        className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono underline cursor-pointer pt-2"
                      >
                        Reset 14-Day Free Access (Developer Demo)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LIVE REAL-TIME COUNTDOWN TIMER (APPLE FITNESS / WHOOP / OURA STYLE) */
                  <div className="bg-slate-950/90 border border-cyan-500/40 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden shadow-2xl">
                    
                    {/* Live Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-cyan-400 animate-pulse" />
                        <span>LIVE ELITE COUNTDOWN</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        EXACT REAL-TIME SYSTEM
                      </span>
                    </div>

                    {/* Apple / Oura Digital Glowing Grid */}
                    <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto font-mono">
                      
                      {/* DAYS */}
                      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
                        <motion.div 
                          key={timeLeft.days}
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl sm:text-4xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                        >
                          {String(timeLeft.days).padStart(2, '0')}
                        </motion.div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                          DAYS
                        </div>
                      </div>

                      {/* HOURS */}
                      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
                        <motion.div 
                          key={timeLeft.hours}
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl sm:text-4xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                        >
                          {String(timeLeft.hours).padStart(2, '0')}
                        </motion.div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                          HOURS
                        </div>
                      </div>

                      {/* MINUTES */}
                      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
                        <motion.div 
                          key={timeLeft.minutes}
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl sm:text-4xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                        >
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </motion.div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                          MINS
                        </div>
                      </div>

                      {/* SECONDS */}
                      <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 shadow-[0_0_20px_rgba(251,191,36,0.2)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 animate-pulse" />
                        <motion.div 
                          key={timeLeft.seconds}
                          initial={{ scale: 0.85, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="text-2xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                        >
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </motion.div>
                        <div className="text-[9px] sm:text-[10px] text-amber-400/90 font-bold uppercase mt-1 tracking-wider">
                          SECS
                        </div>
                      </div>

                    </div>

                    {/* Exact Start & Expiry Date Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-2 border-t border-white/5">
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">ELITE JOINED:</span>
                        <span className="text-cyan-300 font-bold">{timeLeft.startDateFormatted}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">ELITE EXPIRY:</span>
                        <span className="text-amber-300 font-bold">{timeLeft.expiryDateFormatted}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-emerald-400 font-bold pt-1">
                      ✓ {timeLeft.days} DAYS {timeLeft.hours}H {timeLeft.minutes}M REMAINING • 100% PREMIUM ACTIVE
                    </div>
                  </div>
                )}

                {/* Apple Fitness Ring & Whoop Recovery Progress Bar */}
                <div className="space-y-3 bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-300 font-bold">
                      {timeLeft.daysCompleted} / {earnedEliteDays} DAYS COMPLETED
                    </span>
                    <span className="text-cyan-400 font-black">
                      {Math.round(timeLeft.percentCompleted)}% HEALTH JOURNEY COMPLETED
                    </span>
                  </div>

                  <div className="relative w-full h-4 bg-slate-900 border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div 
                      animate={{ width: `${Math.min(100, Math.max(5, timeLeft.percentCompleted))}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>START: DAY 01</span>
                    <span className="text-amber-400 font-bold">MISSIONS ACTIVE</span>
                    <span>GOAL: DAY {earnedEliteDays}</span>
                  </div>
                </div>

              </div>
            )}

            {/* SLIDE 03: HEALTH MISSIONS */}
            {currentSlide === 3 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <Trophy className="text-amber-400" size={22} /> TODAY'S HEALTH MISSIONS
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Apple Fitness Style Clinical Goal Verification</p>
                  </div>
                  <span className="text-xs text-amber-300 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    REWARDS ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">PROFILE SETUP</div>
                        <div className="text-[11px] text-slate-400">NutriMind Clinical Bio-Profile Initialized</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-extrabold rounded-lg border border-emerald-500/30">
                      COMPLETED
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">SCAN FIRST MEAL</div>
                        <div className="text-[11px] text-slate-400">AI Food Auditor & Macro Partition Scan</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-extrabold rounded-lg border border-emerald-500/30">
                      COMPLETED
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                        <Zap size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">DRINK WATER GOAL</div>
                        <div className="text-[11px] text-slate-400">Hydration Telemetry Tracking</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-extrabold rounded-lg border border-cyan-500/30">
                      6 / 8 GLASSES
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">ASK NUTRICHAT</div>
                        <div className="text-[11px] text-slate-400">Consult AI Bio-Twin Companion</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-extrabold rounded-lg border border-emerald-500/30">
                      1 / 1 COMPLETED
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Watch size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">CONNECT SMART DEVICE</div>
                        <div className="text-[11px] text-slate-400">Sync Wearable (Oura / Apple Watch / Whoop)</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-mono font-extrabold rounded-lg border border-amber-500/30">
                      PENDING
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-purple-500/15 border border-amber-400/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <span className="text-slate-200 font-bold">TOTAL REWARD:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-black">+2 ELITE DAYS</span>
                      <span className="text-cyan-400 font-black">+200 XP</span>
                      <span className="text-emerald-400 font-black">+50 NUTRICOINS</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimMission('day1', 2, '+2 Elite Days')}
                    disabled={completedMissions.day1}
                    className={`w-full py-3.5 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider ${
                      completedMissions.day1
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    <Trophy size={16} />
                    <span>{completedMissions.day1 ? 'DAY 1 REWARD CLAIMED (+2 DAYS ACTIVE)' : 'CLAIM REWARD (+2 ELITE DAYS)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 04: UNLOCKED FEATURES */}
            {currentSlide === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 p-5 rounded-3xl">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <Crown className="text-amber-400" size={22} /> UNLOCKED ELITE SUITE
                    </h2>
                    <p className="text-xs text-slate-400">11 Medical-Grade Features Active</p>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                    100% UNLOCKED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {unlockedFeaturesList.map((feat, idx) => {
                    const IconComp = feat.icon;
                    return (
                      <motion.div 
                        key={feat.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className="bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 rounded-2xl p-4 flex items-start gap-3.5 transition group hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-xl"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${feat.color} shadow-md group-hover:scale-110 transition-transform`}>
                          <IconComp size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-tight truncate">
                              {feat.title}
                            </h3>
                            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {feat.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLIDE 05: HEALTH IMPROVEMENTS */}
            {currentSlide === 5 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp className="text-emerald-400" size={22} /> YOUR HEALTH IMPROVEMENTS
                    </h2>
                    <p className="text-xs text-slate-400">Clinical Bio-Telemetry Analytics & Cellular Optimization</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    OPTIMIZED
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  {healthImprovements.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div key={item.label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-cyan-400/30 transition">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                          <IconComp size={15} className={item.textCol} />
                        </div>

                        <div className={`text-2xl font-black font-mono ${item.textCol}`}>
                          {item.val}
                        </div>

                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`} 
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLIDE 06: UPCOMING REWARDS */}
            {currentSlide === 6 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <Gift className="text-cyan-400" size={22} /> UPCOMING REWARDS TIMELINE
                    </h2>
                    <p className="text-xs text-slate-400">Unlock Up to 14 Total Days of Free Elite Access</p>
                  </div>
                  <span className="text-xs text-emerald-300 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    TOTAL: 14 DAYS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                        DAY 02
                      </span>
                      <span className="text-sm font-black text-amber-400">+3 DAYS</span>
                    </div>
                    <h3 className="text-xs font-bold text-white font-mono">DAILY HABIT BUILDERS</h3>
                    <p className="text-[11px] text-slate-400">Log 3 Meals • Hit Daily Water Goal • Sleep Goal</p>
                    <button
                      onClick={() => handleClaimMission('day2', 3, '+3 Elite Days')}
                      disabled={completedMissions.day2}
                      className={`w-full mt-2 py-2.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                        completedMissions.day2
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {completedMissions.day2 ? 'CLAIMED (+3 DAYS)' : 'CLAIM (+3 DAYS)'}
                    </button>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/30">
                        DAY 03
                      </span>
                      <span className="text-sm font-black text-amber-400">+7 DAYS</span>
                    </div>
                    <h3 className="text-xs font-bold text-white font-mono">WEEKLY CONSISTENCY</h3>
                    <p className="text-[11px] text-slate-400">Complete Weekly Goal & High Recovery Score</p>
                    <button
                      onClick={() => handleClaimMission('day3', 7, '+7 Elite Days')}
                      disabled={completedMissions.day3}
                      className={`w-full mt-2 py-2.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                        completedMissions.day3
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {completedMissions.day3 ? 'CLAIMED (+7 DAYS)' : 'CLAIM (+7 DAYS)'}
                    </button>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                        DAY 07
                      </span>
                      <span className="text-sm font-black text-amber-400">+2 DAYS</span>
                    </div>
                    <h3 className="text-xs font-bold text-white font-mono">7-DAY MASTER STREAK</h3>
                    <p className="text-[11px] text-slate-400">7 Consecutive Days of AI Twin Sync</p>
                    <button
                      onClick={() => handleClaimMission('day7', 2, '+2 Elite Days')}
                      disabled={completedMissions.day7}
                      className={`w-full mt-2 py-2.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                        completedMissions.day7
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {completedMissions.day7 ? 'CLAIMED (+2 DAYS)' : 'CLAIM (+2 DAYS)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 07: 14 DAYS COMPLETED */}
            {currentSlide === 7 && (
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-[32px] p-8 shadow-2xl text-center space-y-6 backdrop-blur-2xl">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                  <Award size={40} />
                </div>
                <div className="space-y-2">
                  <span className="px-3.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold rounded-full uppercase">
                    14 DAYS FREE ACCESS UNLOCKED
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white font-mono uppercase">
                    14 DAYS COMPLETED
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    You have unlocked the full 14-day clinical longevity protocol. All medical reports, AI twin telemetry, and device sync are fully verified.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setCurrentSlide(8)}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>VIEW CONGRATULATIONS SCREEN</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 08: CONGRATULATIONS SCREEN */}
            {currentSlide === 8 && (
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-400/50 rounded-[32px] p-8 shadow-2xl text-center space-y-6 backdrop-blur-2xl relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
                />

                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)]">
                  <Trophy size={42} />
                </div>

                <div className="space-y-2 relative z-10">
                  <h2 className="text-3xl font-black text-amber-300 font-mono uppercase tracking-tight">
                    CONGRATULATIONS!
                  </h2>
                  <p className="text-sm font-bold text-white font-mono">
                    YOUR METABOLIC RESET IS 100% COMPLETE
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    You've achieved optimal cellular performance across sleep, strain, HRV, and protein partitioning over the last 14 days.
                  </p>
                </div>

                <div className="pt-2 relative z-10">
                  <button
                    onClick={() => setCurrentSlide(9)}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>SEE YOUR RESULTS</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 09: YOUR RESULTS */}
            {currentSlide === 9 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <Activity className="text-cyan-400" size={22} /> YOUR CLINICAL RESULTS
                    </h2>
                    <p className="text-xs text-slate-400">Comprehensive 14-Day Bio-Transformation Summary</p>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                    SCORED 98/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">HRV & RECOVERY</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">72 ms <span className="text-xs text-slate-400 font-normal">(+18%)</span></div>
                    <p className="text-[11px] text-slate-300">Parasympathetic nervous system recovery achieved peak athletic state.</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">PROTEIN PARTITIONING</span>
                    <div className="text-xl font-black text-cyan-400 font-mono">96% Accuracy</div>
                    <p className="text-[11px] text-slate-300 font-medium">Lean muscle mass preservation optimized through AI Food Auditor scans.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setCurrentSlide(10)}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-amber-400 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>CONTINUE YOUR JOURNEY</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 10: CONTINUE YOUR JOURNEY */}
            {currentSlide === 10 && (
              <div className="bg-gradient-to-br from-indigo-950/80 via-slate-950 to-slate-950 border border-indigo-400/40 rounded-[32px] p-8 shadow-2xl text-center space-y-6 backdrop-blur-2xl">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <Sparkles size={40} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black text-white font-mono uppercase tracking-tight">
                    CONTINUE YOUR JOURNEY
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Keep your AI Health Twin, Medical Reports, and Unlimited Food Auditor running 24/7 without interruption.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setCurrentSlide(11)}
                    className="w-full py-4 bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 hover:opacity-90 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_35px_rgba(6,182,212,0.4)]"
                  >
                    <span>CLICK HERE TO CHOOSE PLAN</span> <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 11: PREMIUM PLANS */}
            {currentSlide === 11 && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-white/10 p-6 rounded-[32px] text-center space-y-2">
                  <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                    NUTRIMIND PREMIUM PLANS
                  </h2>
                  <p className="text-xs text-slate-300">Choose the best bio-intelligence plan for your health goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* BASIC */}
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">BASIC</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">$9.99/mo</span>
                    </div>
                    <p className="text-xs text-slate-300">Standard AI Food Auditor & basic tracking.</p>
                    <button
                      onClick={() => { setSelectedPlanType('MONTHLY'); setCurrentSlide(12); }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    >
                      SELECT BASIC
                    </button>
                  </div>

                  {/* PREMIUM+ */}
                  <div className="bg-slate-900 border border-cyan-400 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-500/20 relative">
                    <span className="absolute -top-3 right-4 bg-cyan-400 text-slate-950 text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                      RECOMMENDED
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">PREMIUM+</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">$79.99/yr</span>
                    </div>
                    <p className="text-xs text-slate-300">All 11 Elite features, AI Health Twin, Medical Reports & Device Sync.</p>
                    <button
                      onClick={() => { setSelectedPlanType('YEARLY'); setCurrentSlide(12); }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl text-xs font-mono font-black transition cursor-pointer shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Zap size={14} fill="currentColor" />
                      <span>CLICK PREMIUM+</span>
                    </button>
                  </div>

                  {/* LIFETIME */}
                  <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border border-amber-400/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">LIFETIME PASS</span>
                      <span className="text-xs font-mono font-bold text-amber-300">$199.99</span>
                    </div>
                    <p className="text-xs text-slate-300">Pay once, enjoy lifetime uninterrupted NutriMind Elite.</p>
                    <button
                      onClick={() => { setSelectedPlanType('LIFETIME'); setCurrentSlide(12); }}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-mono font-black transition cursor-pointer"
                    >
                      SELECT LIFETIME
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 12: CHOOSE YOUR PLAN */}
            {currentSlide === 12 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <CheckCircle className="text-cyan-400" size={22} /> CHOOSE YOUR PLAN
                    </h2>
                    <p className="text-xs text-slate-400">Select Billing Cycle for NutriMind Elite</p>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                    STEP 1 OF 3
                  </span>
                </div>

                <div className="space-y-3">
                  {/* MONTHLY */}
                  <div 
                    onClick={() => setSelectedPlanType('MONTHLY')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedPlanType === 'MONTHLY'
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlanType === 'MONTHLY' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'}`}>
                        {selectedPlanType === 'MONTHLY' && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono uppercase">MONTHLY PLAN</div>
                        <div className="text-[11px] text-slate-400">Billed monthly • Cancel anytime</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-cyan-300">$9.99</div>
                      <div className="text-[10px] text-slate-400">/month</div>
                    </div>
                  </div>

                  {/* YEARLY */}
                  <div 
                    onClick={() => setSelectedPlanType('YEARLY')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between relative ${
                      selectedPlanType === 'YEARLY'
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-4 bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono">
                      RECOMMENDED (SAVE 40%)
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlanType === 'YEARLY' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'}`}>
                        {selectedPlanType === 'YEARLY' && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono uppercase">YEARLY PREMIUM+</div>
                        <div className="text-[11px] text-slate-400">Full Elite Suite • Best Value</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-cyan-300">$79.99</div>
                      <div className="text-[10px] text-slate-400">/year</div>
                    </div>
                  </div>

                  {/* LIFETIME */}
                  <div 
                    onClick={() => setSelectedPlanType('LIFETIME')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedPlanType === 'LIFETIME'
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlanType === 'LIFETIME' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'}`}>
                        {selectedPlanType === 'LIFETIME' && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300 font-mono uppercase">LIFETIME PASS</div>
                        <div className="text-[11px] text-slate-400">Pay once • Use forever</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-amber-300">$199.99</div>
                      <div className="text-[10px] text-slate-400">one-time</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentSlide(13)}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <span>CONTINUE TO CONFIRM DETAILS</span> <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* SLIDE 13: CONFIRM DETAILS */}
            {currentSlide === 13 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <User className="text-cyan-400" size={22} /> CONFIRM DETAILS
                    </h2>
                    <p className="text-xs text-slate-400">Step 2 of 3: Enter Your Subscriber Information</p>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                    STEP 2 OF 3
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">FULL NAME</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={userInfo.name}
                        onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white outline-none transition"
                        placeholder="Your Full Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        value={userInfo.email}
                        onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white outline-none transition"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">PHONE NUMBER</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="tel" 
                        value={userInfo.phone}
                        onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white outline-none transition"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>SELECTED PLAN:</span>
                      <span className="font-bold text-cyan-300">{planPrices[selectedPlanType].label}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white font-bold border-t border-white/10 pt-2">
                      <span>TOTAL PRICE:</span>
                      <span className="text-cyan-400">{planPrices[selectedPlanType].price}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentSlide(14)}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                >
                  <CreditCard size={16} />
                  <span>PAY NOW ({planPrices[selectedPlanType].price})</span>
                </button>
              </div>
            )}

            {/* SLIDE 14: PAYMENT METHODS */}
            {currentSlide === 14 && (
              <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                      <CreditCard className="text-cyan-400" size={22} /> SELECT PAYMENT METHOD
                    </h2>
                    <p className="text-xs text-slate-400">Step 3 of 3: Secure 256-Bit SSL Encrypted Gateway</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    SSL SECURED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethodsList.map(method => {
                    const IconComp = method.icon;
                    const isSelected = selectedPaymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${method.color} shrink-0`}>
                          <IconComp size={16} />
                        </div>
                        <span className="text-xs font-mono font-bold text-white truncate">{method.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleFinishPayment();
                      setCurrentSlide(15);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_35px_rgba(52,211,153,0.5)]"
                  >
                    <Lock size={16} />
                    <span>CONFIRM PAYMENT VIA {selectedPaymentMethod} ({planPrices[selectedPlanType].price})</span>
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 15: PAYMENT SUCCESS */}
            {currentSlide === 15 && (
              <div className="bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border border-emerald-400/50 rounded-[32px] p-8 shadow-2xl text-center space-y-6 backdrop-blur-2xl relative overflow-hidden">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_50px_rgba(52,211,153,0.6)]">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={54} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold rounded-full uppercase">
                    TRANSACTION VERIFIED
                  </span>
                  <h2 className="text-3xl font-black text-white font-mono uppercase tracking-tight">
                    WELCOME TO NUTRIMIND ELITE
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your profile has been upgraded to NutriMind Elite. Enjoy lifetime access to AI health intelligence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left font-mono">
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                    <Check size={14} className="text-emerald-400" /> AI HEALTH TWIN ACTIVATED
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                    <Check size={14} className="text-emerald-400" /> UNLIMITED FOOD AUDITOR ACTIVATED
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                    <Check size={14} className="text-emerald-400" /> MEDICAL REPORTS ACTIVATED
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                    <Check size={14} className="text-emerald-400" /> FAMILY MODE ACTIVATED
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300 sm:col-span-2">
                    <Check size={14} className="text-emerald-400" /> DEVICE SYNC ACTIVATED
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setCurrentSlide(1)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 rounded-2xl text-xs font-mono font-black transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_35px_rgba(52,211,153,0.5)]"
                  >
                    <span>GO TO DASHBOARD</span> <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Payment Modal */}
      <GlobalPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        initialPlan={selectedPlanType}
        profileName={userInfo.name}
        profileEmail={userInfo.email}
        isLifetimeActive={isLifetimeActive}
        onPaymentSuccess={({ plan, isLifetime }) => {
          setIsPremium(true);
          setSelectedTier('ELITE');
          if (isLifetime) {
            setIsLifetimeActive(true);
            localStorage.setItem('nutrimind_is_lifetime', 'true');
          }
          notify(`🎉 Payment Successful! Welcome to NutriMind ${plan}!`);
        }}
      />
    </div>
  );
};
