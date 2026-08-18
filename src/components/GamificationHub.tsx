import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Award, Zap, Shield, Trophy, Star, CheckCircle, Lock, 
  Sparkles, RefreshCw, Snowflake, Heart, Droplets, Moon, Footprints, 
  Crown, Gift, Users, Globe, ArrowUp, ChevronRight, X, Play, Target
} from 'lucide-react';

export interface GamificationState {
  streakDays: number;
  lifetimeStreak: number;
  streakFrozen: boolean;
  freezesRemaining: number;
  totalXP: number;
  coins: number;
  completedChallenges: string[];
  unlockedAchievements: string[];
  activeWeeklyChallenge: string | null;
}

const HEALTH_LEVELS = [
  { name: 'Beginner', minXP: 0, maxXP: 499, color: 'text-slate-300', bg: 'bg-slate-500/20 border-slate-500/30' },
  { name: 'Bronze', minXP: 500, maxXP: 1499, color: 'text-amber-500', bg: 'bg-amber-500/20 border-amber-500/30' },
  { name: 'Silver', minXP: 1500, maxXP: 3499, color: 'text-slate-200', bg: 'bg-slate-300/20 border-slate-300/30' },
  { name: 'Gold', minXP: 3500, maxXP: 6999, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  { name: 'Platinum', minXP: 7000, maxXP: 11999, color: 'text-cyan-300', bg: 'bg-cyan-500/20 border-cyan-500/30' },
  { name: 'Diamond', minXP: 12000, maxXP: 19999, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  { name: 'Master', minXP: 20000, maxXP: 34999, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
  { name: 'Legend', minXP: 35000, maxXP: 59999, color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' },
  { name: 'Immortal', minXP: 60000, maxXP: 99999, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  { name: 'NutriMind Champion', minXP: 100000, maxXP: 999999, color: 'text-amber-300 font-extrabold', bg: 'bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30 border-amber-400/50' },
];

export const ACHIEVEMENTS_LIST = [
  { id: 'first_workout', title: 'First Workout', desc: 'Completed your 1st fitness session', xp: 100, icon: '🏋️‍♂️' },
  { id: 'steps_10k', title: '10,000 Steps', desc: 'Hit 10,000 steps in a single day', xp: 150, icon: '🏃‍♂️' },
  { id: 'muscle_goals', title: 'Muscle Gain Goals', desc: 'Reached daily protein target 5 days in a row', xp: 200, icon: '💪' },
  { id: 'weight_loss', title: 'Weight Loss Goals', desc: 'Maintained calorie deficit for 7 days', xp: 250, icon: '🔥' },
  { id: 'hydration_master', title: 'Proper Hydration', desc: 'Logged 3L water for 5 consecutive days', xp: 120, icon: '💧' },
  { id: 'perfect_sleep', title: 'Perfect Sleep', desc: 'Logged 8+ hours of deep sleep', xp: 100, icon: '🌙' },
  { id: 'weekly_report', title: 'Perfect Weekly Report', desc: 'Achieved >85% overall weekly health score', xp: 300, icon: '📊' },
  { id: 'healthy_eating', title: 'Healthy Eating', desc: 'Logged 10 nutrient-rich meals with high scores', xp: 180, icon: '🥗' },
  { id: 'streak_30', title: '30-Day Streak', desc: 'Maintained a 30 day daily logging streak', xp: 500, icon: '⚡' },
  { id: 'premium_challenger', title: 'Premium Challenges', desc: 'Completed a PRO+ metabolic challenge', xp: 400, icon: '👑' },
  { id: 'device_milestone', title: 'Connected Device Milestones', desc: 'Synchronized 2+ wearable health devices', xp: 250, icon: '⌚' },
  { id: 'ai_health_hero', title: 'AI Health Champion', desc: 'Used NutriChat coach 20 times for diet advice', xp: 220, icon: '🤖' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'water_3l', name: 'Drink 3L Water Daily', desc: 'Maintain 3,000 ml water intake every day this week', rewardXP: 350, category: 'Hydration' },
  { id: 'sleep_8h', name: 'Sleep 8 Hours Daily', desc: 'Get at least 8 hours of restful sleep for 5 days', rewardXP: 300, category: 'Recovery' },
  { id: 'steps_15k', name: 'Complete 15,000 Steps', desc: 'Reach 15k steps in a single active session', rewardXP: 400, category: 'Fitness' },
  { id: 'burn_500cal', name: 'Burn 500 Active Calories', desc: 'Burn 500 kcal through workouts or walking', rewardXP: 350, category: 'Burn' },
  { id: 'protein_challenge', name: 'Protein Master Challenge', desc: 'Hit 120g+ protein target for 4 days', rewardXP: 450, category: 'Nutrition' },
  { id: 'recovery_challenge', name: 'Recovery Score >80%', desc: 'Maintain a high metabolic recovery score', rewardXP: 300, category: 'Wellness' },
  { id: 'meditation_challenge', name: '10 Min Daily Breathing', desc: 'Complete daily mindfulness breathing loop', rewardXP: 250, category: 'Mind' },
  { id: 'fat_loss_challenge', name: 'Zero Sugar Sprint', desc: 'Avoid added refined sugars for 3 days', rewardXP: 350, category: 'Diet' },
  { id: 'muscle_gain_challenge', name: '3x Heavy Compound Lifting', desc: 'Complete 3 strength resistance workouts', rewardXP: 500, category: 'Strength' },
];

interface GamificationHubProps {
  isOpen?: boolean;
  onClose?: () => void;
  onTriggerToast: (msg: string) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  isOpen = true,
  onClose,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'streaks' | 'challenges' | 'achievements' | 'leaderboard' | 'rewards'>('streaks');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'friends' | 'family' | 'weekly' | 'global'>('weekly');

  const [game, setGame] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('nutrimind_gamification_state');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      streakDays: 14,
      lifetimeStreak: 42,
      streakFrozen: false,
      freezesRemaining: 2,
      totalXP: 4850,
      coins: 620,
      completedChallenges: ['water_3l', 'sleep_8h'],
      unlockedAchievements: ['first_workout', 'steps_10k', 'hydration_master', 'healthy_eating', 'ai_health_hero'],
      activeWeeklyChallenge: 'protein_challenge'
    };
  });

  useEffect(() => {
    localStorage.setItem('nutrimind_gamification_state', JSON.stringify(game));
  }, [game]);

  // Calculate current level
  const currentLevel = HEALTH_LEVELS.find(l => game.totalXP >= l.minXP && game.totalXP <= l.maxXP) || HEALTH_LEVELS[0];
  const nextLevel = HEALTH_LEVELS[HEALTH_LEVELS.indexOf(currentLevel) + 1] || currentLevel;
  const xpInCurrentLevel = game.totalXP - currentLevel.minXP;
  const xpNeededForNextLevel = nextLevel.minXP - currentLevel.minXP || 1;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // AI Dynamic Motivation Text
  const getAiMotivationMessage = () => {
    if (game.streakDays >= 30) {
      return `🔥 Amazing! You have maintained a ${game.streakDays}-day streak! Keep going!`;
    }
    if (xpNeededForNextLevel - xpInCurrentLevel <= 300) {
      return `🚀 Keep going! Only ${xpNeededForNextLevel - xpInCurrentLevel} XP left to reach ${nextLevel.name} Level!`;
    }
    return `⭐ Congratulations! You are currently at ${currentLevel.name} Level with ${game.totalXP} XP!`;
  };

  const handleClaimChallenge = (id: string, rewardXP: number) => {
    if (game.completedChallenges.includes(id)) {
      onTriggerToast('Challenge already completed!');
      return;
    }
    setGame(prev => ({
      ...prev,
      totalXP: prev.totalXP + rewardXP,
      coins: prev.coins + 50,
      completedChallenges: [...prev.completedChallenges, id]
    }));
    onTriggerToast(`🎉 Challenge Completed! +${rewardXP} XP and +50 Coins earned!`);
  };

  const handleFreezeStreak = () => {
    if (game.freezesRemaining <= 0) {
      onTriggerToast('No Streak Freezes left! Upgrade to PRO+ for extra freezes.');
      return;
    }
    setGame(prev => ({
      ...prev,
      streakFrozen: !prev.streakFrozen,
      freezesRemaining: prev.streakFrozen ? prev.freezesRemaining : prev.freezesRemaining - 1
    }));
    onTriggerToast(game.streakFrozen ? 'Streak Freeze deactivated.' : '🛡️ Streak Freeze activated for 24 hours!');
  };

  const handleRecoverStreak = () => {
    setGame(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      coins: Math.max(0, prev.coins - 100)
    }));
    onTriggerToast('⚡ Streak recovered using 100 coins!');
  };

  const renderLeaderboard = () => {
    const list = [
      { rank: 1, name: 'Utpal Bikash Deb', xp: 8420, streak: 34, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', badge: '🥇 Legend' },
      { rank: 2, name: 'Mitrabha Deb', xp: game.totalXP, streak: game.streakDays, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80', badge: `🥈 ${currentLevel.name}`, isUser: true },
      { rank: 3, name: 'Aarav Sharma', xp: 4200, streak: 18, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80', badge: '🥉 Gold' },
      { rank: 4, name: 'Priya Mukherjee', xp: 3900, streak: 14, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80', badge: '⭐ Gold' },
      { rank: 5, name: 'David Miller', xp: 3100, streak: 9, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', badge: '✨ Silver' },
    ];

    return (
      <div className="space-y-3">
        {/* Category Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-2xl border border-white/10 text-[10px]">
          {(['weekly', 'friends', 'family', 'global'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setLeaderboardCategory(cat)}
              className={`py-1.5 rounded-xl font-bold capitalize transition ${
                leaderboardCategory === cat ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {list.map((item) => (
            <div 
              key={item.rank}
              className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                item.isUser 
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 border-cyan-400/50 shadow-lg' 
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-xs ${item.rank === 1 ? 'text-yellow-400' : item.rank === 2 ? 'text-slate-300' : item.rank === 3 ? 'text-amber-500' : 'text-slate-500'}`}>
                  #{item.rank}
                </span>
                <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                <div>
                  <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                    {item.name}
                    {item.isUser && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30">YOU</span>}
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🔥 {item.streak} Day Streak</span>
                    <span>•</span>
                    <span className="text-cyan-400">{item.badge}</span>
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="font-black text-cyan-300 text-xs">{item.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-white/10 rounded-3xl p-4 text-white space-y-4 shadow-2xl">
      {/* AI Motivation Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 border border-cyan-500/40 p-3 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">AI Health Motivation</span>
            <p className="text-xs font-semibold text-white mt-0.5">{getAiMotivationMessage()}</p>
          </div>
        </div>
      </div>

      {/* Top Stats Overview Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Streak */}
        <div className="bg-slate-900/80 border border-amber-500/30 p-3 rounded-2xl text-center relative overflow-hidden">
          <div className="absolute top-1 right-1 text-amber-500 opacity-20">
            <Flame size={32} />
          </div>
          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">Daily Streak</span>
          <span className="text-xl font-black text-amber-400 font-display flex items-center justify-center gap-1 mt-0.5">
            🔥 {game.streakDays} <span className="text-xs font-sans text-slate-400">days</span>
          </span>
          <span className="text-[8px] text-slate-400 font-mono block mt-1">Best: {game.lifetimeStreak} days</span>
        </div>

        {/* Level & XP */}
        <div className="bg-slate-900/80 border border-cyan-500/30 p-3 rounded-2xl text-center relative overflow-hidden">
          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Health Level</span>
          <span className={`text-sm font-black font-display block mt-1 ${currentLevel.color}`}>
            {currentLevel.name}
          </span>
          <span className="text-[9px] text-cyan-300 font-mono block mt-0.5">{game.totalXP} XP Total</span>
        </div>

        {/* Coins */}
        <div className="bg-slate-900/80 border border-yellow-500/30 p-3 rounded-2xl text-center relative overflow-hidden">
          <span className="text-[9px] font-mono text-yellow-400 uppercase tracking-wider block font-bold">NutriCoins</span>
          <span className="text-xl font-black text-yellow-400 font-display flex items-center justify-center gap-1 mt-0.5">
            🪙 {game.coins}
          </span>
          <span className="text-[8px] text-slate-400 font-mono block mt-1">Earn rewards</span>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-white flex items-center gap-1">
            <Trophy size={12} className="text-yellow-400" />
            Level: <span className={currentLevel.color}>{currentLevel.name}</span>
          </span>
          <span className="font-mono text-slate-400">
            Next: <span className="text-cyan-400">{nextLevel.name}</span> ({xpInCurrentLevel} / {xpNeededForNextLevel} XP)
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelProgressPct}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full"
          />
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-2xl border border-white/10 text-[9.5px]">
        {(['streaks', 'challenges', 'achievements', 'leaderboard', 'rewards'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 rounded-xl font-bold capitalize transition ${
              activeTab === tab 
                ? 'bg-cyan-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'streaks' ? 'Streaks' : tab === 'challenges' ? 'Weekly' : tab === 'achievements' ? 'Badges' : tab === 'leaderboard' ? 'Ranks' : 'Rewards'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {/* STREAKS TAB */}
        {activeTab === 'streaks' && (
          <div className="space-y-3">
            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400 fill-amber-400" />
                    Streak Protection & Freeze
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Protect your streak if you miss a logging day</p>
                </div>
                <button
                  onClick={handleFreezeStreak}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono transition flex items-center gap-1 ${
                    game.streakFrozen 
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                      : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Snowflake size={12} className={game.streakFrozen ? "text-cyan-400 animate-spin" : ""} />
                  {game.streakFrozen ? 'FROZEN (ACTIVE)' : `FREEZE (${game.freezesRemaining} left)`}
                </button>
              </div>

              {/* Streak Milestones Badges */}
              <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/10 text-center">
                {[1, 7, 30, 100, 365].map(days => {
                  const achieved = game.lifetimeStreak >= days || game.streakDays >= days;
                  return (
                    <div key={days} className={`p-2 rounded-xl border ${achieved ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-950/50 border-white/5 text-slate-600'}`}>
                      <span className="text-[10px] font-black block font-mono">{days}D</span>
                      <span className="text-[8px] block mt-0.5">{achieved ? '✓ Unlocked' : 'Locked'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recovery Option */}
              <div className="bg-slate-950 p-2.5 rounded-xl flex items-center justify-between border border-white/5 text-[10px]">
                <div>
                  <span className="font-bold text-slate-200">Streak Recovery Option</span>
                  <span className="text-[9px] text-slate-400 block">Restore a missed streak using NutriCoins</span>
                </div>
                <button
                  onClick={handleRecoverStreak}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg font-bold transition"
                >
                  Recover (100 🪙)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
            {WEEKLY_CHALLENGES.map(ch => {
              const completed = game.completedChallenges.includes(ch.id);
              return (
                <div key={ch.id} className={`p-3 rounded-2xl border flex items-center justify-between transition ${completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/70 border-white/10'}`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded uppercase">
                        {ch.category}
                      </span>
                      <h5 className="font-bold text-white text-xs">{ch.name}</h5>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{ch.desc}</p>
                  </div>
                  <button
                    onClick={() => handleClaimChallenge(ch.id, ch.rewardXP)}
                    disabled={completed}
                    className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] transition shrink-0 ml-2 ${
                      completed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md cursor-pointer'
                    }`}
                  >
                    {completed ? '✓ Claimed' : `+${ch.rewardXP} XP`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
            {ACHIEVEMENTS_LIST.map(ach => {
              const unlocked = game.unlockedAchievements.includes(ach.id);
              return (
                <div key={ach.id} className={`p-2.5 rounded-2xl border flex items-start gap-2 transition ${unlocked ? 'bg-slate-900/90 border-cyan-500/40 shadow-md' : 'bg-slate-950/40 border-white/5 opacity-50'}`}>
                  <span className="text-xl shrink-0 p-1 bg-white/5 rounded-xl">{ach.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h6 className="font-bold text-white text-[11px] truncate">{ach.title}</h6>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{ach.desc}</p>
                    <span className="text-[8px] font-mono text-cyan-400 font-bold block mt-1">+{ach.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && renderLeaderboard()}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div className="space-y-2">
            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-2.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Gift size={14} className="text-yellow-400" />
                Redeem NutriCoins & Rewards
              </h4>
              <p className="text-[10px] text-slate-400">Exchange your hard-earned NutriCoins for PRO+ coupons & discounts</p>

              <div className="space-y-2 pt-1">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-white text-[11px]">50% OFF PRO+ Subscription</h6>
                    <p className="text-[9px] text-cyan-300">Promo Code: <span className="font-mono font-bold">GOLDSTREAK50</span></p>
                  </div>
                  <button 
                    onClick={() => onTriggerToast('Coupons redeemed! Code GOLDSTREAK50 copied.')}
                    className="px-2.5 py-1 bg-yellow-500 text-slate-950 font-bold rounded-lg text-[9px]"
                  >
                    500 🪙 Redeem
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-white text-[11px]">Free Premium Health Report PDF</h6>
                    <p className="text-[9px] text-slate-400">Download full medical metabolic report</p>
                  </div>
                  <button 
                    onClick={() => onTriggerToast('Health Report unlocked!')}
                    className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-[9px]"
                  >
                    200 🪙 Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
