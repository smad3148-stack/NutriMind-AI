import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Edit2, ShieldCheck, Heart, Award, Copy, Check, Bell, 
  Settings, CheckSquare, Sparkles, Smartphone, ChevronRight, CheckCircle2,
  Watch, Pill, Gift, Tag, Globe, Moon, Lock, Users, Crown, CreditCard,
  FileText, HelpCircle, MessageCircle, Bug, Info, LogOut, Shield, Zap, RefreshCw, Brain
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  setProfileName: (n: string) => void;
  profilePhone: string;
  setProfilePhone: (p: string) => void;
  profileAvatar: string;
  setProfileAvatar: (a: string) => void;
  userGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain';
  setUserGoal: (g: 'Weight Loss' | 'Weight Gain' | 'Maintain') => void;
  onSelectTab: (tab: any) => void;
  isPremium: boolean;
  onTriggerToast: (msg: string) => void;
  onOpenDeviceManager?: () => void;
  onOpenGamification?: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  profileName,
  setProfileName,
  profilePhone,
  setProfilePhone,
  profileAvatar,
  setProfileAvatar,
  userGoal,
  setUserGoal,
  onSelectTab,
  isPremium,
  onTriggerToast,
  onOpenDeviceManager,
  onOpenGamification
}) => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [familyModeActive, setFamilyModeActive] = useState(true);

  // Accessibility, Low Internet & Global Compliance States
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrimind_accessibility_mode') === 'true';
  });
  const [lowInternetMode, setLowInternetMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrimind_low_internet_mode') === 'true';
  });
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportTab, setSupportTab] = useState<'faq' | 'bug' | 'contact' | 'feedback'>('faq');
  const [bugMessage, setBugMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const toggleAccessibility = () => {
    const val = !accessibilityMode;
    setAccessibilityMode(val);
    localStorage.setItem('nutrimind_accessibility_mode', String(val));
    onTriggerToast(val ? 'Accessibility Mode Enabled (Large Text + Simple UI)' : 'Standard UI Mode Restored');
  };

  const toggleLowInternet = () => {
    const val = !lowInternetMode;
    setLowInternetMode(val);
    localStorage.setItem('nutrimind_low_internet_mode', String(val));
    onTriggerToast(val ? 'Low Internet Mode Active (Background Queueing Enabled)' : 'High Speed Mode Active');
  };
  const [smartWatchStatus, setSmartWatchStatus] = useState('Connected (Galaxy Watch 6)');

  // Reminders simulated connections
  const [reminders, setReminders] = useState({
    medicine: true,
    meal: true,
    water: true,
    sleep: true
  });

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('NUTRIMIND-GOLD-777');
    onTriggerToast('Referral code NUTRIMIND-GOLD-777 copied to clipboard!');
  };

  const handleLogout = () => {
    onTriggerToast('Logged out successfully. Reloading workspace...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md">
          {/* Backdrop Close Click */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-[340px] h-full bg-slate-950 border-l border-white/10 text-slate-100 shadow-2xl flex flex-col justify-between backdrop-blur-xl z-10"
          >
            {/* Header area */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
              <span className="font-display font-black text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Crown size={14} /> Account & App Settings
              </span>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable list content with staggered motion items */}
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs font-sans"
            >
              
              {/* 1. User Profile Card */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/90 border border-[#D1F2EB]/15 p-4 rounded-3xl space-y-3 shadow-xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={profileAvatar}
                    alt="avatar"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#50C878] shadow-md shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#D1F2EB] text-sm truncate">{profileName || 'NutriMind User'}</h4>
                    <p className="text-[10px] text-[#D1F2EB]/60 font-mono mt-0.5">{profilePhone || 'No phone on file'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="bg-[#50C878]/15 border border-[#50C878]/30 text-[#50C878] text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {isPremium ? 'PRO+ Member' : 'Free Client'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="w-full py-2 bg-gradient-to-r from-[#D1F2EB] to-[#50C878] hover:opacity-90 text-[#050505] font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-[#50C878]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              </motion.div>

              {/* 2. My Plan & Subscription Details */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Crown size={12} className="text-[#663399]" /> My Plan & Subscription
                </span>
                <div className="flex items-center justify-between bg-[#050505] p-2.5 rounded-xl border border-[#D1F2EB]/10">
                  <div>
                    <h6 className="font-bold text-[#D1F2EB]">NutriMind PRO+ Tier</h6>
                    <p className="text-[9px] text-[#D1F2EB]/50">Renews on August 24, 2026</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onSelectTab('premium'); }}
                    className="px-2.5 py-1 bg-[#663399]/30 text-[#D1F2EB] border border-[#663399]/50 text-[9px] font-mono font-bold rounded-lg hover:bg-[#663399]/50 transition cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </motion.div>

              {/* 3. Connected Devices & Smart Watch Status */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                    <Watch size={12} className="text-[#50C878]" /> Smart Watch & Ecosystem
                  </span>
                  {onOpenDeviceManager && (
                    <button
                      onClick={() => { onClose(); onOpenDeviceManager(); }}
                      className="text-[9px] text-[#50C878] hover:underline font-mono uppercase font-bold cursor-pointer"
                    >
                      Manage (21+)
                    </button>
                  )}
                </div>
                <div className="bg-[#050505] p-2.5 rounded-xl border border-[#D1F2EB]/10 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-bold text-[#D1F2EB] block">Smart Watch Status</span>
                    <span className="text-[9px] text-[#50C878] font-mono">{smartWatchStatus}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#50C878] animate-pulse" />
                </div>
              </motion.div>

              {/* 4. Medicine & Health Reminders */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2.5 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Pill size={12} className="text-[#663399]" /> Medicine & Daily Reminders
                </span>
                <div className="space-y-2 bg-[#050505] p-2.5 rounded-xl border border-[#D1F2EB]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-[#D1F2EB] text-[11px]">Medicine & Supplement Alert</h6>
                      <p className="text-[8px] text-[#D1F2EB]/50">Pill reminder at 8:00 AM & 9:00 PM</p>
                    </div>
                    <button
                      onClick={() => setReminders({ ...reminders, medicine: !reminders.medicine })}
                      className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${reminders.medicine ? 'bg-[#50C878]' : 'bg-[#1a1a24]'}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-[#050505] rounded-full transition-all ${reminders.medicine ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#D1F2EB]/10 pt-2">
                    <div>
                      <h6 className="font-bold text-[#D1F2EB] text-[11px]">Water Hydration Reminder</h6>
                      <p className="text-[8px] text-[#D1F2EB]/50">Hourly alerts to maintain 3L target</p>
                    </div>
                    <button
                      onClick={() => setReminders({ ...reminders, water: !reminders.water })}
                      className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${reminders.water ? 'bg-[#50C878]' : 'bg-[#1a1a24]'}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-[#050505] rounded-full transition-all ${reminders.water ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 5. Rewards, Referral Code & Offers */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2.5 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Gift size={12} className="text-[#50C878]" /> Rewards & Referral Code
                </span>

                <div className="flex items-center justify-between bg-[#050505] p-2.5 rounded-xl border border-[#D1F2EB]/10">
                  <span className="font-mono font-bold text-[#D1F2EB] text-[11px]">NUTRIMIND-GOLD-777</span>
                  <button onClick={handleCopyReferral} className="p-1 text-[#50C878] hover:bg-white/5 rounded cursor-pointer">
                    <Copy size={13} />
                  </button>
                </div>

                {onOpenGamification && (
                  <button
                    onClick={() => { onClose(); onOpenGamification(); }}
                    className="w-full py-2 bg-[#663399]/20 hover:bg-[#663399]/30 border border-[#663399]/40 text-[#D1F2EB] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award size={13} className="text-[#50C878]" /> View Rewards & Gamification Hub
                  </button>
                )}
              </motion.div>

              {/* 6. Language & App Customization */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2.5 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Globe size={12} className="text-[#663399]" /> Language & Preferences
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#D1F2EB]/80 text-xs">App Language</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        onTriggerToast(`Language updated to ${e.target.value}`);
                      }}
                      className="bg-[#050505] border border-[#D1F2EB]/15 rounded-lg px-2 py-1 text-[#D1F2EB] text-[10px]"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="French">French (Français)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#D1F2EB]/10 pt-2">
                    <span className="text-[#D1F2EB]/80 text-xs">Matte Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${darkMode ? 'bg-[#50C878]' : 'bg-[#1a1a24]'}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-[#050505] rounded-full transition-all ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 7. Accessibility, Low-Internet & Global Compliance */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2.5 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Zap size={12} className="text-[#50C878]" /> Accessibility, Network & Compliance
                </span>

                <div className="space-y-2 bg-[#050505] p-2.5 rounded-xl border border-[#D1F2EB]/10 text-[10px]">
                  {/* Accessibility Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#D1F2EB] font-bold block">Accessibility Mode</span>
                      <span className="text-[8px] text-[#D1F2EB]/50">Large text & simple UI for kids/elderly</span>
                    </div>
                    <button
                      onClick={toggleAccessibility}
                      className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${accessibilityMode ? 'bg-[#50C878]' : 'bg-[#1a1a24]'}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-[#050505] rounded-full transition-all ${accessibilityMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Low Internet Mode */}
                  <div className="flex items-center justify-between border-t border-[#D1F2EB]/10 pt-2">
                    <div>
                      <span className="text-[#D1F2EB] font-bold block">Low Internet Mode</span>
                      <span className="text-[8px] text-[#D1F2EB]/50">Background queueing on 2G/3G connections</span>
                    </div>
                    <button
                      onClick={toggleLowInternet}
                      className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${lowInternetMode ? 'bg-[#663399]' : 'bg-[#1a1a24]'}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-[#D1F2EB] rounded-full transition-all ${lowInternetMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Global Compliance Button */}
                  <div className="border-t border-[#D1F2EB]/10 pt-2">
                    <button
                      onClick={() => setShowComplianceModal(true)}
                      className="w-full py-1.5 bg-[#0f1118] hover:bg-[#1a1a24] text-[#D1F2EB] font-mono font-bold text-[9px] rounded-lg border border-[#D1F2EB]/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck size={12} className="text-[#50C878]" />
                      <span>Global Compliance (GDPR, DPDP & HealthKit)</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 8. Help Center & Support */}
              <motion.div 
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                className="bg-[#0f1118]/80 border border-[#D1F2EB]/10 p-3.5 rounded-2xl space-y-2 backdrop-blur-xl"
              >
                <span className="text-[9px] font-mono text-[#D1F2EB] uppercase tracking-wider font-bold block flex items-center gap-1">
                  <HelpCircle size={12} className="text-[#663399]" /> Support & Information
                </span>

                <div className="space-y-1">
                  <button 
                    onClick={() => { setSupportTab('faq'); setShowSupportModal(true); }}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-[#D1F2EB]/80 hover:text-[#D1F2EB] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><HelpCircle size={13} className="text-[#A3779D]" /> Help Center & FAQs</span>
                    <ChevronRight size={12} className="text-[#D1F2EB]/40" />
                  </button>

                  <button 
                    onClick={() => { setSupportTab('contact'); setShowSupportModal(true); }}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-[#D1F2EB]/80 hover:text-[#D1F2EB] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><MessageCircle size={13} className="text-[#50C878]" /> Contact Support</span>
                    <ChevronRight size={12} className="text-[#D1F2EB]/40" />
                  </button>

                  <button 
                    onClick={() => { setSupportTab('bug'); setShowSupportModal(true); }}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-[#D1F2EB]/80 hover:text-[#D1F2EB] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><Bug size={13} className="text-[#663399]" /> Report a Bug</span>
                    <ChevronRight size={12} className="text-[#D1F2EB]/40" />
                  </button>

                  <button 
                    onClick={() => { setSupportTab('feedback'); setShowSupportModal(true); }}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-[#D1F2EB]/80 hover:text-[#D1F2EB] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><Sparkles size={13} className="text-[#FBE4E3]" /> Submit Feedback</span>
                    <ChevronRight size={12} className="text-[#D1F2EB]/40" />
                  </button>

                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-xl text-[#D1F2EB]/80 hover:text-[#D1F2EB] flex items-center justify-between cursor-pointer border-t border-[#D1F2EB]/10 pt-2.5 mt-1"
                  >
                    <span className="flex items-center gap-2"><Info size={13} className="text-[#663399]" /> About NutriMind AI</span>
                    <ChevronRight size={12} className="text-[#D1F2EB]/40" />
                  </button>
                </div>
              </motion.div>

              {/* 9. Logout */}
              <motion.button
                variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout Session</span>
              </motion.button>

            </motion.div>

            {/* Footer of drawer */}
            <div className="p-3 border-t border-white/10 bg-[#07040A] text-center text-[10px] text-[#A3779D] font-mono space-y-0.5">
              <span className="block font-bold text-[#FBE4E3]">NutriMind AI v3.0 • Designed & Developed in India</span>
              <span className="block text-[9px] text-[#A3779D]/70">© 2026 NutriMind AI. All Rights Reserved.</span>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Edit Profile Modal Component */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        profileName={profileName}
        setProfileName={setProfileName}
        profilePhone={profilePhone}
        setProfilePhone={setProfilePhone}
        profileAvatar={profileAvatar}
        setProfileAvatar={setProfileAvatar}
        userGoal={userGoal}
        setUserGoal={setUserGoal}
        onTriggerToast={onTriggerToast}
      />

      {/* Global Compliance & Data Privacy Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-slate-950 border border-cyan-500/30 rounded-3xl p-5 text-white space-y-4 shadow-2xl relative font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide font-display text-white">
                    GLOBAL COMPLIANCE & PRIVACY SHIELD
                  </h4>
                  <p className="text-[10px] text-slate-400">Automated regional privacy enforcement & consent control</p>
                </div>
              </div>
              <button
                onClick={() => setShowComplianceModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* EU GDPR */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Globe size={13} /> European Union (GDPR Compliant)
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Full right to data erasure, data portability (JSON/CSV export), and transparent explicit consent logs.
                </p>
              </div>

              {/* India DPDP Act 2023 */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 flex items-center gap-1.5">
                    <Shield size={13} /> India Digital Personal Data Protection (DPDP) Act
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Data minimization, localized storage options, and zero unauthorized third-party data monetization.
                </p>
              </div>

              {/* Apple HealthKit & Google Health Connect */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Watch size={13} /> Apple HealthKit & Google Health Connect
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    ENCRYPTED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Read/write biometric permissions strictly guarded by local device secure enclave & OAuth token encryption.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onTriggerToast('Health record dataset exported to JSON!');
                  }}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/10 rounded-xl text-[10px] font-bold transition"
                >
                  Export Health Record
                </button>
                <button
                  onClick={() => {
                    onTriggerToast('Zero-Telemetry Mode Active. Non-essential tracking disabled.');
                  }}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-white/10 rounded-xl text-[10px] font-bold transition"
                >
                  Enable Zero-Telemetry
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowComplianceModal(false)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              CLOSE PRIVACY SHIELD
            </button>
          </motion.div>
        </div>
      )}

      {/* Interactive Support & Help Center Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-[#07040A] border border-[#663399]/40 rounded-3xl p-5 text-[#FBE4E3] space-y-4 shadow-2xl relative font-sans max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#A3779D]/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#663399]/30 text-[#FBE4E3] border border-[#663399]/50 flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide font-display text-[#FBE4E3]">
                    NutriMind Support Hub
                  </h4>
                  <p className="text-[10px] text-[#A3779D]">Direct Help, FAQ, Bug Reporting & Feedback</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-[#A3779D] hover:text-[#FBE4E3] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 p-1 bg-[#2E1A47]/40 rounded-2xl border border-[#A3779D]/15 text-xs font-semibold">
              <button
                onClick={() => setSupportTab('faq')}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                  supportTab === 'faq' ? 'bg-[#663399] text-[#FBE4E3] shadow-md' : 'text-[#A3779D] hover:text-[#FBE4E3]'
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setSupportTab('contact')}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                  supportTab === 'contact' ? 'bg-[#663399] text-[#FBE4E3] shadow-md' : 'text-[#A3779D] hover:text-[#FBE4E3]'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setSupportTab('bug')}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                  supportTab === 'bug' ? 'bg-[#663399] text-[#FBE4E3] shadow-md' : 'text-[#A3779D] hover:text-[#FBE4E3]'
                }`}
              >
                Report Bug
              </button>
              <button
                onClick={() => setSupportTab('feedback')}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                  supportTab === 'feedback' ? 'bg-[#663399] text-[#FBE4E3] shadow-md' : 'text-[#A3779D] hover:text-[#FBE4E3]'
                }`}
              >
                Feedback
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {supportTab === 'faq' && (
                <div className="space-y-2.5">
                  <div className="bg-[#2E1A47]/30 border border-[#A3779D]/20 p-3 rounded-2xl space-y-1">
                    <h5 className="font-bold text-[#FBE4E3]">How does NutriChat AI analyze my meal photos?</h5>
                    <p className="text-[11px] text-[#A3779D] leading-relaxed">
                      NutriMind AI uses multi-modal Gemini Vision models to inspect protein, carbs, lipids, and micronutrients directly from visual camera captures in milliseconds.
                    </p>
                  </div>
                  <div className="bg-[#2E1A47]/30 border border-[#A3779D]/20 p-3 rounded-2xl space-y-1">
                    <h5 className="font-bold text-[#FBE4E3]">How do I pair my smart watch or wearable ring?</h5>
                    <p className="text-[11px] text-[#A3779D] leading-relaxed">
                      Navigate to Hamburger Menu &gt; Smart Watch &amp; Ecosystem or the Health Hub tab. Click "Pair New Device" to auto-sync Apple HealthKit, Google Health Connect, Whoop, or Oura Ring.
                    </p>
                  </div>
                  <div className="bg-[#2E1A47]/30 border border-[#A3779D]/20 p-3 rounded-2xl space-y-1">
                    <h5 className="font-bold text-[#FBE4E3]">Is my biometric data stored securely?</h5>
                    <p className="text-[11px] text-[#A3779D] leading-relaxed">
                      Yes. All health data is encrypted at rest and in transit adhering to GDPR, DPDP Act 2023, and HIPAA client standards with zero third-party telemetry sharing.
                    </p>
                  </div>
                </div>
              )}

              {supportTab === 'contact' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#A3779D]">
                    Our clinical AI engineering team responds within 1 hour. Leave your inquiry below:
                  </p>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your health question or support request..."
                    className="w-full bg-[#2E1A47]/20 border border-[#A3779D]/30 rounded-2xl p-3 text-xs text-[#FBE4E3] focus:outline-none focus:border-[#663399]"
                  />
                  <button
                    onClick={() => {
                      if (!contactMessage.trim()) return;
                      onTriggerToast('Support message dispatched! Ticket #NM-' + Math.floor(100000 + Math.random() * 900000));
                      setContactMessage('');
                      setShowSupportModal(false);
                    }}
                    className="w-full py-2.5 bg-[#663399] hover:bg-[#663399]/80 text-[#FBE4E3] font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Send Support Message
                  </button>
                </div>
              )}

              {supportTab === 'bug' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#A3779D]">
                    Found an issue? Report it to NutriMind's core engineering engine for instant resolution:
                  </p>
                  <textarea
                    rows={4}
                    value={bugMessage}
                    onChange={(e) => setBugMessage(e.target.value)}
                    placeholder="Describe what happened or steps to reproduce..."
                    className="w-full bg-[#2E1A47]/20 border border-[#A3779D]/30 rounded-2xl p-3 text-xs text-[#FBE4E3] focus:outline-none focus:border-[#663399]"
                  />
                  <button
                    onClick={() => {
                      if (!bugMessage.trim()) return;
                      onTriggerToast('Bug report logged! Diagnostic packet ID: ERR-' + Math.floor(1000 + Math.random() * 9000));
                      setBugMessage('');
                      setShowSupportModal(false);
                    }}
                    className="w-full py-2.5 bg-[#663399] hover:bg-[#663399]/80 text-[#FBE4E3] font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Submit Bug Diagnostics
                  </button>
                </div>
              )}

              {supportTab === 'feedback' && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-[#A3779D]">Rate your NutriMind AI Operating System experience:</p>
                  <div className="flex justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`text-xl transition cursor-pointer ${star <= feedbackRating ? 'scale-125 text-[#50C878]' : 'opacity-30'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share how we can make NutriMind AI even more transformative..."
                    className="w-full bg-[#2E1A47]/20 border border-[#A3779D]/30 rounded-2xl p-3 text-xs text-[#FBE4E3] focus:outline-none focus:border-[#663399]"
                  />
                  <button
                    onClick={() => {
                      onTriggerToast('Thank you! Your feedback helps shape NutriMind AI.');
                      setFeedbackText('');
                      setShowSupportModal(false);
                    }}
                    className="w-full py-2.5 bg-[#663399] hover:bg-[#663399]/80 text-[#FBE4E3] font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Official About & Founder Credits Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-[#07040A] border border-[#663399]/50 rounded-3xl p-6 text-[#FBE4E3] space-y-5 shadow-2xl relative font-sans text-center"
          >
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl text-[#A3779D] hover:text-[#FBE4E3] transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2E1A47] via-[#663399] to-[#A3779D] p-[2px] mx-auto shadow-[0_0_30px_rgba(102,51,153,0.6)]">
              <div className="w-full h-full bg-[#07040A] rounded-[14px] flex items-center justify-center font-display font-black text-[#FBE4E3] text-2xl tracking-tighter border border-[#A3779D]/30">
                NΩ
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-display text-[#FBE4E3] tracking-tight">
                NutriMind AI
              </h3>
              <p className="text-xs font-mono font-bold text-[#50C878] uppercase tracking-widest">
                Version 3.0
              </p>
            </div>

            <p className="text-xs text-[#A3779D] italic font-medium max-w-xs mx-auto leading-relaxed">
              "Simple Outside. Infinite Intelligence Inside."
            </p>

            <div className="bg-[#2E1A47]/40 border border-[#663399]/40 p-4 rounded-2xl space-y-1 shadow-inner">
              <span className="text-[10px] font-mono text-[#A3779D] uppercase tracking-wider block">
                Founder & Creator
              </span>
              <h4 className="text-lg font-extrabold text-[#FBE4E3]">
                Mitrabha Deb
              </h4>
              <p className="text-[11px] text-[#A3779D] font-mono pt-1">
                Designed & Developed in India.
              </p>
            </div>

            <div className="p-3 bg-[#07040A] border border-[#A3779D]/20 rounded-2xl text-[11px] font-mono text-[#A3779D] space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-[#FBE4E3] font-bold block">Built With:</span>
              <p className="text-[#FBE4E3] font-semibold">Human Health • Longevity • Artificial Intelligence</p>
            </div>

            <div className="text-[10px] text-[#A3779D]/60 font-mono">
              © 2026 NutriMind AI. All Rights Reserved.
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-[#663399] to-[#2E1A47] hover:opacity-90 text-[#FBE4E3] font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-[#663399]/30 border border-[#A3779D]/30"
            >
              CLOSE CREDITS
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
