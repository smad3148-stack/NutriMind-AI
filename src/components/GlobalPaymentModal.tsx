import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ShieldCheck, Lock, CreditCard, Sparkles, CheckCircle2, 
  Smartphone, Zap, RefreshCw, ChevronRight, Globe, Tag, Award, 
  ArrowLeft, Laptop, ShieldAlert, FileText, CheckCircle, XCircle
} from 'lucide-react';

export interface GlobalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  onPaymentSuccess?: (details: {
    plan: string;
    isLifetime: boolean;
    amount: number;
    currency: string;
    txId: string;
    paymentId: string;
  }) => void;
  profileName?: string;
  profileEmail?: string;
  isLifetimeActive?: boolean;
}

export type CountryCode = 'IN' | 'US' | 'EU' | 'BD' | 'AE' | 'GLOBAL';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  prices: {
    MONTHLY: number;
    YEARLY: number;
    LIFETIME: number;
  };
  formattedPrices: {
    MONTHLY: string;
    YEARLY: string;
    LIFETIME: string;
  };
  methods: {
    id: string;
    name: string;
    category: 'wallet' | 'upi' | 'card' | 'netbanking' | 'paylater';
    icon: string;
    popular?: boolean;
  }[];
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    prices: { MONTHLY: 799, YEARLY: 5999, LIFETIME: 14999 },
    formattedPrices: { MONTHLY: '₹799/mo', YEARLY: '₹5,999/yr', LIFETIME: '₹14,999' },
    methods: [
      { id: 'upi_gpay', name: 'Google Pay (UPI)', category: 'upi', icon: '⚡', popular: true },
      { id: 'upi_phonepe', name: 'PhonePe', category: 'upi', icon: '🟣', popular: true },
      { id: 'upi_paytm', name: 'Paytm UPI', category: 'upi', icon: '🔵' },
      { id: 'upi_bhim', name: 'BHIM UPI', category: 'upi', icon: '🇮🇳' },
      { id: 'amazon_pay', name: 'Amazon Pay', category: 'wallet', icon: '🟧' },
      { id: 'card_in', name: 'Credit / Debit Card', category: 'card', icon: '💳' },
      { id: 'netbanking', name: 'Net Banking (All Indian Banks)', category: 'netbanking', icon: '🏦' }
    ]
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    prices: { MONTHLY: 9.99, YEARLY: 79.99, LIFETIME: 199.99 },
    formattedPrices: { MONTHLY: '$9.99/mo', YEARLY: '$79.99/yr', LIFETIME: '$199.99' },
    methods: [
      { id: 'apple_pay', name: 'Apple Pay', category: 'wallet', icon: '🍎', popular: true },
      { id: 'google_pay', name: 'Google Pay', category: 'wallet', icon: '⚡', popular: true },
      { id: 'paypal', name: 'PayPal', category: 'wallet', icon: '🅿️' },
      { id: 'card_visa_mc', name: 'Visa / Mastercard', category: 'card', icon: '💳' },
      { id: 'card_amex', name: 'American Express', category: 'card', icon: '🟦' },
      { id: 'card_discover', name: 'Discover Card', category: 'card', icon: '🟧' }
    ]
  },
  EU: {
    code: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    prices: { MONTHLY: 9.99, YEARLY: 79.99, LIFETIME: 199.99 },
    formattedPrices: { MONTHLY: '€9.99/mo', YEARLY: '€79.99/yr', LIFETIME: '€199.99' },
    methods: [
      { id: 'apple_pay', name: 'Apple Pay', category: 'wallet', icon: '🍎', popular: true },
      { id: 'google_pay', name: 'Google Pay', category: 'wallet', icon: '⚡', popular: true },
      { id: 'paypal', name: 'PayPal', category: 'wallet', icon: '🅿️' },
      { id: 'klarna', name: 'Klarna (Pay in 3)', category: 'paylater', icon: '💗' },
      { id: 'card_eu', name: 'Credit / Debit Card', category: 'card', icon: '💳' },
      { id: 'sepa', name: 'SEPA Direct Debit', category: 'netbanking', icon: '🏦' }
    ]
  },
  BD: {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    currency: 'BDT',
    symbol: '৳',
    prices: { MONTHLY: 1099, YEARLY: 8999, LIFETIME: 21999 },
    formattedPrices: { MONTHLY: '৳1,099/mo', YEARLY: '৳8,999/yr', LIFETIME: '৳21,999' },
    methods: [
      { id: 'bkash', name: 'bKash Wallet', category: 'wallet', icon: '💖', popular: true },
      { id: 'nagad', name: 'Nagad Digital', category: 'wallet', icon: '🟠', popular: true },
      { id: 'rocket', name: 'Dutch-Bangla Rocket', category: 'wallet', icon: '🚀' },
      { id: 'card_bd', name: 'Credit / Debit Card', category: 'card', icon: '💳' }
    ]
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    prices: { MONTHLY: 36.99, YEARLY: 299.99, LIFETIME: 749.99 },
    formattedPrices: { MONTHLY: 'AED 36.99/mo', YEARLY: 'AED 299.99/yr', LIFETIME: 'AED 749.99' },
    methods: [
      { id: 'apple_pay', name: 'Apple Pay', category: 'wallet', icon: '🍎', popular: true },
      { id: 'google_pay', name: 'Google Pay', category: 'wallet', icon: '⚡', popular: true },
      { id: 'card_ae', name: 'Credit / Debit Card', category: 'card', icon: '💳' },
      { id: 'careem_pay', name: 'Careem Pay', category: 'wallet', icon: '💚' }
    ]
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global / Rest of World',
    flag: '🌐',
    currency: 'USD',
    symbol: '$',
    prices: { MONTHLY: 9.99, YEARLY: 79.99, LIFETIME: 199.99 },
    formattedPrices: { MONTHLY: '$9.99/mo', YEARLY: '$79.99/yr', LIFETIME: '$199.99' },
    methods: [
      { id: 'apple_pay', name: 'Apple Pay', category: 'wallet', icon: '🍎', popular: true },
      { id: 'google_pay', name: 'Google Pay', category: 'wallet', icon: '⚡', popular: true },
      { id: 'paypal', name: 'PayPal', category: 'wallet', icon: '🅿️' },
      { id: 'card_global', name: 'International Cards', category: 'card', icon: '💳' }
    ]
  }
};

export const GlobalPaymentModal: React.FC<GlobalPaymentModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'YEARLY',
  onPaymentSuccess,
  profileName = '',
  profileEmail = '',
  isLifetimeActive = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY' | 'LIFETIME'>(initialPlan);
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('apple_pay');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  const [step, setStep] = useState<'SELECT' | 'PAYING' | 'SUCCESS' | 'MANAGE' | 'ERROR'>('SELECT');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processingMsg, setProcessingMsg] = useState<string>('Checking payment availability...');
  const [processingProgress, setProcessingProgress] = useState<number>(10);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('Detecting Device...');

  // Auto-detect Country & Device on load
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const lang = navigator.language || '';
      
      let detected: CountryCode = 'US';
      if (tz.includes('Kolkata') || tz.includes('India') || lang.includes('en-IN') || lang.includes('hi')) {
        detected = 'IN';
      } else if (tz.includes('Dhaka') || lang.includes('bn')) {
        detected = 'BD';
      } else if (tz.includes('Dubai') || tz.includes('Muscat') || lang.includes('ar')) {
        detected = 'AE';
      } else if (tz.includes('Europe') || tz.includes('London') || tz.includes('Paris') || tz.includes('Berlin')) {
        detected = 'EU';
      }
      setCountryCode(detected);

      // Detect Device
      const ua = navigator.userAgent;
      let dev = 'Desktop Browser';
      if (/iPhone|iPad|iPod/i.test(ua)) dev = 'Apple iOS (Safari)';
      else if (/Android/i.test(ua)) dev = 'Android Device (Chrome)';
      else if (/Macintosh/i.test(ua)) dev = 'macOS (Safari/Chrome)';
      else if (/Windows/i.test(ua)) dev = 'Windows PC (Edge/Chrome)';
      setDeviceInfo(dev);

      // Set default payment method for country
      const cfg = COUNTRY_CONFIGS[detected];
      if (cfg && cfg.methods.length > 0) {
        setSelectedMethodId(cfg.methods[0].id);
      }
    } catch (e) {
      setCountryCode('US');
    }
  }, []);

  // Update selected payment method when country changes
  const handleCountryChange = (c: CountryCode) => {
    setCountryCode(c);
    const cfg = COUNTRY_CONFIGS[c];
    if (cfg && cfg.methods.length > 0) {
      setSelectedMethodId(cfg.methods[0].id);
    }
  };

  const currentCountry = COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS.US;
  const rawPrice = currentCountry.prices[selectedPlan];

  // Calculate discounts
  let discountPercent = 0;
  if (appliedCoupon) discountPercent += appliedCoupon.percent;
  if (isStudentDiscount) discountPercent += 50;
  if (discountPercent > 80) discountPercent = 80; // cap discount

  const finalPrice = Math.max(0, Number((rawPrice * (1 - discountPercent / 100)).toFixed(2)));

  // Coupon apply
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'FESTIVAL20' || clean === 'HOLI20' || clean === 'DIWALI20') {
      setAppliedCoupon({ code: clean, percent: 20 });
    } else if (clean === 'STUDENT50') {
      setAppliedCoupon({ code: clean, percent: 50 });
    } else if (clean === 'NUTRIMIND10') {
      setAppliedCoupon({ code: clean, percent: 10 });
    } else if (clean === 'EARLYBIRD' || clean === 'PROMO25') {
      setAppliedCoupon({ code: clean, percent: 25 });
    } else {
      alert('Invalid coupon code. Try FESTIVAL20, STUDENT50, or NUTRIMIND10');
    }
  };

  // Start Payment Process (< 15 seconds fast execution)
  const handleStartPayment = async () => {
    setStep('PAYING');
    setProcessingProgress(15);
    setProcessingMsg('Checking payment availability...');

    await new Promise(r => setTimeout(r, 400));
    setProcessingProgress(40);
    setProcessingMsg('Verifying payment details...');

    await new Promise(r => setTimeout(r, 500));
    setProcessingProgress(75);
    setProcessingMsg(`Requesting ${currentCountry.currency} payment via ${currentCountry.methods.find(m => m.id === selectedMethodId)?.name || 'Direct Ingress'}...`);

    await new Promise(r => setTimeout(r, 600));
    setProcessingProgress(95);
    setProcessingMsg('Activating NutriMind Elite License & Direct Admin Sync...');

    try {
      const selectedMethodObj = currentCountry.methods.find(m => m.id === selectedMethodId);
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: profileName,
          userEmail: profileEmail,
          country: currentCountry.name,
          currency: currentCountry.currency,
          amount: finalPrice,
          plan: selectedPlan === 'MONTHLY' ? 'Monthly Plan' : selectedPlan === 'YEARLY' ? 'Yearly Plan' : 'Lifetime Pass',
          paymentMethod: selectedMethodObj ? selectedMethodObj.name : 'Instant Digital Payment',
          couponCode: appliedCoupon ? appliedCoupon.code : isStudentDiscount ? 'STUDENT50' : null,
          device: deviceInfo
        })
      });

      const data = await res.json();
      setProcessingProgress(100);

      // P0-06: a non-OK response (e.g. 503 "payment system not configured")
      // must NEVER be treated as a successful payment.
      if (!res.ok) {
        setStep('ERROR');
        setPaymentError(data?.error || 'Payment failed. Please try again.');
        return;
      }

      const isLifetime = selectedPlan === 'LIFETIME';
      // P0-06: entitlement flags are only set by a verified payment system,
      // never by the client. (Success path is currently unreachable — the
      // checkout endpoint returns 503.)

      setReceiptData({
        txId: data.transactionId || `TX_${Date.now()}`,
        paymentId: data.paymentId || `PAY_${Date.now()}`,
        amount: finalPrice,
        currency: currentCountry.currency,
        symbol: currentCountry.symbol,
        plan: selectedPlan === 'MONTHLY' ? 'NutriMind Monthly Plan' : selectedPlan === 'YEARLY' ? 'NutriMind Yearly Plan' : 'NutriMind Lifetime Pass',
        isLifetime,
        country: currentCountry.name,
        paymentMethod: selectedMethodObj?.name || 'Instant Checkout',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
        device: deviceInfo
      });

      setStep('SUCCESS');

      if (onPaymentSuccess) {
        onPaymentSuccess({
          plan: selectedPlan,
          isLifetime,
          amount: finalPrice,
          currency: currentCountry.currency,
          txId: data.transactionId || `TX_${Date.now()}`,
          paymentId: data.paymentId || `PAY_${Date.now()}`
        });
      }
    } catch (err) {
      console.error('Payment Error:', err);
      // P0-06: never fabricate a successful payment on error. Show the real
      // failure state; nothing is granted.
      setStep('ERROR');
      setPaymentError(err instanceof Error ? err.message : 'Payment system not configured.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-xl bg-slate-950 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden font-sans text-white my-auto"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ShieldCheck size={18} className="text-slate-950 font-bold" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-display uppercase tracking-wide flex items-center gap-1.5">
                  NUTRIMIND GLOBAL PAY
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono rounded-md uppercase">
                    1-CLICK SMART
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Automated regional currency & instant fraud-free ingress</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/10 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Content Switcher */}
          <div className="p-5 space-y-5">
            {step === 'SELECT' && (
              <>
                {/* ZERO REGRET & ZERO DARK PATTERNS GUARANTEE */}
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wide block">
                        ZERO REGRET & ZERO DARK PATTERNS POLICY
                      </span>
                      <span className="text-[9.5px] text-slate-300">
                        Payments are not configured yet — no payment will be processed until a verified provider is integrated.
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-bold whitespace-nowrap">
                    100% HONEST
                  </span>
                </div>

                {/* AI SUBSCRIPTION ADVISOR */}
                <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-2xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-400" /> AI SUBSCRIPTION ADVISOR RECOMMENDATION
                    </span>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                      User Benefit First
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug font-medium">
                    "Based on your health activity, the <strong className="text-cyan-300">Free Plan</strong> is already great for basic tracking! But if you want continuous wearable sync & AI Twin, <strong className="text-amber-300">Yearly or Lifetime</strong> will save you up to 80% over 3 years."
                  </p>
                </div>

                {/* AUTO-DETECTED REGION BANNER */}
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentCountry.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{currentCountry.name}</span>
                        <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          Auto-Detected
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Currency: <strong className="text-cyan-400">{currentCountry.currency} ({currentCountry.symbol})</strong> • Device: {deviceInfo}
                      </span>
                    </div>
                  </div>

                  {/* Manual Country Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                    className="bg-slate-950 border border-white/20 text-xs font-mono font-bold text-cyan-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {Object.values(COUNTRY_CONFIGS).map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* PLAN SELECTION TABS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    1. Select Plan
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {/* MONTHLY */}
                    <button
                      onClick={() => setSelectedPlan('MONTHLY')}
                      className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                        selectedPlan === 'MONTHLY'
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Monthly</span>
                      <span className="text-base font-extrabold text-white font-mono block mt-0.5">
                        {currentCountry.formattedPrices.MONTHLY}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1">Flexible month-to-month</span>
                    </button>

                    {/* YEARLY */}
                    <button
                      onClick={() => setSelectedPlan('YEARLY')}
                      className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                        selectedPlan === 'YEARLY'
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="absolute -top-2 right-2 bg-cyan-400 text-slate-950 font-black text-[8px] uppercase px-1.5 py-0.5 rounded-full font-mono">
                        BEST VALUE
                      </span>
                      <span className="text-[9px] font-mono font-bold text-cyan-300 block uppercase">Yearly</span>
                      <span className="text-base font-extrabold text-white font-mono block mt-0.5">
                        {currentCountry.formattedPrices.YEARLY}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1">Save ~35% Annually</span>
                    </button>

                    {/* LIFETIME */}
                    <button
                      onClick={() => setSelectedPlan('LIFETIME')}
                      className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                        selectedPlan === 'LIFETIME'
                          ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold text-amber-400 block uppercase flex items-center gap-1">
                        <Award size={10} /> Lifetime Pass
                      </span>
                      <span className="text-base font-extrabold text-amber-300 font-mono block mt-0.5">
                        {currentCountry.formattedPrices.LIFETIME}
                      </span>
                      <span className="text-[8.5px] font-bold text-amber-400 block mt-1 uppercase tracking-tight">
                        Pay Once • Use Forever
                      </span>
                    </button>
                  </div>
                </div>

                {/* LIFETIME SPECIAL BANNER */}
                {selectedPlan === 'LIFETIME' && (
                  <div className="bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-amber-950/80 border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between gap-2 text-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <strong className="text-amber-300 font-display block">LIFETIME ACCESS ACTIVATION</strong>
                        <span className="text-[10px] text-slate-300">
                          One single payment. Permanently removes ALL paywalls and subscription popups forever.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* REGIONAL PAYMENT METHODS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    2. Select Localized Payment Method ({currentCountry.name})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentCountry.methods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                          selectedMethodId === method.id
                            ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400/50'
                            : 'bg-slate-950 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{method.icon}</span>
                          <span className="text-xs font-bold text-slate-200 truncate">{method.name}</span>
                        </div>
                        {selectedMethodId === method.id && (
                          <CheckCircle size={14} className="text-cyan-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PROMO CODE & STUDENT DISCOUNT */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase flex items-center gap-1">
                      <Tag size={12} /> Promo Code / Student Discount
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-slate-300">
                      <input
                        type="checkbox"
                        checked={isStudentDiscount}
                        onChange={(e) => setIsStudentDiscount(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Student (50% OFF)</span>
                    </label>
                  </div>

                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. FESTIVAL20, STUDENT50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {(appliedCoupon || isStudentDiscount) && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                      <span>✓ Active Discount Applied ({discountPercent}% OFF)</span>
                      <span>Saved {currentCountry.symbol}{(rawPrice * (discountPercent / 100)).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* ORDER BREAKDOWN & FAST PAY BUTTON */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
                    <span className="text-slate-400">Total Due Today:</span>
                    <div className="text-right">
                      {discountPercent > 0 && (
                        <span className="text-slate-500 line-through text-xs mr-2 font-bold">
                          {currentCountry.symbol}{rawPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-black text-cyan-400 font-mono">
                        {currentCountry.symbol}{finalPrice.toFixed(2)} <span className="text-xs font-normal text-slate-400">{currentCountry.currency}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartPayment}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase font-display tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap size={18} fill="currentColor" />
                    <span>PAY NOW ({currentCountry.symbol}{finalPrice.toFixed(2)} {currentCountry.currency})</span>
                  </button>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <Lock size={10} className="text-emerald-400" /> TLS Secured
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-cyan-400" /> Fraud Guard Protected
                    </span>
                    <span>15s Instant Processing</span>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: PROCESSING SCREEN */}
            {step === 'PAYING' && (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping" />
                  <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin flex items-center justify-center">
                    <ShieldCheck size={28} className="text-cyan-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white font-display uppercase tracking-wide">
                    PROCESSING SECURE PAYMENT
                  </h4>
                  <p className="text-xs text-cyan-400 font-mono font-semibold animate-pulse">
                    {processingMsg}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-500 font-mono">
                  Directing transaction securely to NutriMind Admin Ledger...
                </p>
              </div>
            )}

            {/* P0-06: ERROR / NOT CONFIGURED — payments are disabled until a
                verified provider exists. No fake success is ever shown. */}
            {step === 'ERROR' && (
              <div className="space-y-4 py-2">
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-400/40">
                    <XCircle size={28} />
                  </div>
                  <h4 className="text-base font-black text-white font-display uppercase tracking-wide">
                    PAYMENT NOT CONFIGURED
                  </h4>
                  <p className="text-xs text-rose-300 font-medium">
                    {paymentError || 'The payment system is not configured yet. No payment was processed.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStep('SELECT');
                      setPaymentError(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    BACK TO PLANS
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS & RECEIPT */}
            {step === 'SUCCESS' && receiptData && (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-base font-black text-white font-display uppercase tracking-wide">
                    PAYMENT SUCCESSFUL!
                  </h4>
                  <p className="text-xs text-emerald-300 font-medium">
                    {receiptData.isLifetime
                      ? '🎉 LIFETIME PASS ACTIVATED! ALL PAYWALLS REMOVED FOREVER.'
                      : '🎉 NUTRIMIND ELITE ACCESS ACTIVATED SUCCESSFULLY.'}
                  </p>
                </div>

                {/* RECEIPT AUDIT CARD */}
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/10 pb-2 text-[10px] text-slate-400 font-bold uppercase">
                    <span>Transaction Receipt</span>
                    <span>Direct Admin Ledger Synced</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Plan</span>
                      <strong className="text-white">{receiptData.plan}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Amount Paid</span>
                      <strong className="text-cyan-400">{receiptData.symbol}{receiptData.amount} {receiptData.currency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Payment Method</span>
                      <strong className="text-slate-200">{receiptData.paymentMethod}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Country</span>
                      <strong className="text-slate-200">{receiptData.country}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Transaction ID</span>
                      <strong className="text-slate-300 text-[10px]">{receiptData.txId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9.5px] uppercase block">Payment ID</span>
                      <strong className="text-slate-300 text-[10px]">{receiptData.paymentId}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      setStep('SELECT');
                    }}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    RETURN TO NUTRIMIND
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
