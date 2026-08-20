import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Sparkles, Plus, Trash2, MessageSquare, Mic, MicOff,
  Users, Activity, TrendingUp, Flame, Droplets, Check, PlusCircle, 
  Upload, AlertCircle, Play, Pause, Square, Volume2, Sliders, 
  Settings, Crown, Share2, Download, CheckCircle, Pin, Menu, 
  ChevronRight, ShieldCheck, Award, X, ArrowUp, Image, FileText,
  Bell, Heart, Info, RefreshCw, ArrowRight, History, UserPlus, 
  ArrowLeft, Copy, ExternalLink, BookOpen, AlertTriangle, Lock, 
  CheckSquare, HeartPulse, Smile, Brain, EyeOff, ThumbsUp, ThumbsDown,
  RotateCcw, Globe, Archive, Search, MoreVertical
} from 'lucide-react';

import { FoodItem, ChatMessage, ChatThread, FamilyMember, WearableMetrics, AIMemoryItem, PrivacySettings } from '../types';
import foodDatabase from '../food_database.json';

// Modular Sub-components
import { VoicePersonaSettings, VoiceGender, VoiceStyle } from './VoicePersonaSettings';
import { ChatSidebar } from './ChatSidebar';
import { ScoreHelpModal } from './ScoreHelpModal';
import { HamburgerMenu } from './HamburgerMenu';
import { ReportsPanel } from './ReportsPanel';
import { ScoreCardsCarousel } from './ScoreCardsCarousel';
import { TweakWallSection } from './TweakWallSection';
import { PremiumPanel } from './PremiumPanel';
import { ReportsScreen } from './ReportsScreen';
import { WearableHealthBanner } from './WearableHealthBanner';
import { DeviceEcosystemManager } from './DeviceEcosystemManager';
import { AIMemoryModal } from './AIMemoryModal';
import { ChatExportModal } from './ChatExportModal';
import { GamificationHub } from './GamificationHub';
import { AIHealthTwin } from './AIHealthTwin';
import { AIHub } from './AIHub';
import { CleanHomeDashboard } from './CleanHomeDashboard';
import { LifeOsSecondBrain } from './LifeOsSecondBrain';
import { aggregateHealthMetrics } from '../lib/wearableEcosystem';
import { 
  loadChatThreads, saveChatThreads, 
  loadAIMemories, saveAIMemories, 
  loadPrivacySettings, savePrivacySettings,
  getAiMemoryConsent
} from '../lib/chatStorage';
import { detectLanguageFromText, SUPPORTED_LANGUAGES } from '../lib/languageDetector';

interface CustomerCompanionProps {
  token?: string;
  userId?: string;
}

export default function CustomerCompanion({ token, userId }: CustomerCompanionProps) {
  // Navigation & UI Layout Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'coach' | 'premium' | 'reports' | 'aihub' | 'secondbrain'>('dashboard');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [helpSection, setHelpSection] = useState<{title: string, what: string, why: string, improve: string, source: string, example: string} | null>(null);
  const [showReportsOnDashboard, setShowReportsOnDashboard] = useState(false);

  // Profile Information (P0-11: no prefilled personal data — starts empty)
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80');

  // Bio Metrics Manual Log Modals
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Custom states
  const [meals, setMeals] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userGoal, setUserGoal] = useState<'Weight Loss' | 'Weight Gain' | 'Maintain'>('Weight Loss');
  const [waterIntakeToday, setWaterIntakeToday] = useState<number>(0);

  // Scores — P0-05: all zeroed until real data exists. Manual logs (sleep /
  // stress / cardio / activity modals) populate them; nothing is hardcoded.
  const [sleepScore, setSleepScore] = useState(0);
  const [sleepHistory, setSleepHistory] = useState<number[]>([]);
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [stressScore, setStressScore] = useState(0);
  const [stressHistory, setStressHistory] = useState<number[]>([]);
  const [cardioScore, setCardioScore] = useState(0);
  const [cardioHistory, setCardioHistory] = useState<number[]>([]);
  const [activityScore, setActivityScore] = useState(0);
  const [activityHistory, setActivityHistory] = useState<number[]>([]);
  const [nutritionScore, setNutritionScore] = useState(0);
  const [nutritionHistory, setNutritionHistory] = useState<number[]>([]);

  // Tab selections inside indicators
  const [nutritionTab, setNutritionTab] = useState<'PREV' | 'CURRENT' | 'NEXT'>('CURRENT');
  const [hydrationTab, setHydrationTab] = useState<'PREV' | 'CURRENT' | 'NEXT'>('CURRENT');

  // Temp form log states
  const [newSleepDuration, setNewSleepDuration] = useState('7.5');
  const [newStressRating, setNewStressRating] = useState('65');
  const [newCardioBpm, setNewCardioBpm] = useState('60');
  const [newActiveCalories, setNewActiveCalories] = useState('450');

  // Core entities for sync
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [wearables, setWearables] = useState<WearableMetrics[]>([]);
  const [showDeviceManager, setShowDeviceManager] = useState<boolean>(false);
  // P0-06: premium is NEVER granted by default — only a verified, server-side
  // payment entitlement can unlock it. No client path sets this anymore.
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PRO' | 'ELITE'>('FREE');

  // Chat/Coach Threads states with persistent local storage
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const loaded = loadChatThreads();
    if (loaded && loaded.length > 0) return loaded;
    return [
      {
        id: 'default-thread',
        title: 'NutriChat Health & Fitness Coach',
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'welcome',
            sender: 'assistant',
            text: "Hello! I'm NutriChat AI. I'm your personal AI health companion. How are you feeling today?",
            timestamp: new Date().toISOString()
          }
        ],
        pinned: false
      }
    ];
  });
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    const loaded = loadChatThreads();
    return loaded?.[0]?.id || 'default-thread';
  });
  const [currentInput, setCurrentInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeAttachment, setActiveAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // AI Memory Bank & Privacy State
  const [aiMemories, setAiMemories] = useState<AIMemoryItem[]>(() => loadAIMemories());
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => loadPrivacySettings());
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedThreadForManage, setSelectedThreadForManage] = useState<ChatThread | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Accessibility & Low Internet Modes
  const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrimind_accessibility_mode') === 'true';
  });
  const [isLowInternetMode, setIsLowInternetMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrimind_low_internet_mode') === 'true';
  });

  // Voice Mode States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('calm');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [showVoiceSettingsOverlay, setShowVoiceSettingsOverlay] = useState<boolean>(false);
  const [isVoiceContinuous, setIsVoiceContinuous] = useState(true);
  const [isVoiceInterruptible, setIsVoiceInterruptible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Scanner upload inputs
  const [selectedCategory, setSelectedCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const [recentlyScanned, setRecentlyScanned] = useState<FoodItem | null>(null);
  const [isConfidenceCorrect, setIsConfidenceCorrect] = useState<boolean | null>(null);

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefCoach = useRef<HTMLInputElement>(null);

  // Fetch Wrapper helper
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const headers: Record<string, string> = { ...(options.headers as any) };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return await fetch(url, { ...options, headers });
    } catch (err) {
      console.warn(`[Network] fetch error for ${url}:`, err);
      return new Response(JSON.stringify({ error: 'Network unavailable or fetch failed' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };

  // Helper trigger notification toast
  const triggerToast = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(null), 3500);
  };

  // All Effects
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/reports') {
        setActiveTab('reports');
      } else {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (window.location.pathname === '/reports') {
      setActiveTab('reports');
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!privacySettings.disableHistory) {
      saveChatThreads(threads);
    }
  }, [threads, privacySettings]);

  useEffect(() => {
    saveAIMemories(aiMemories);
  }, [aiMemories]);

  useEffect(() => {
    savePrivacySettings(privacySettings);
  }, [privacySettings]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [mealsRes, familyRes, wearablesRes] = await Promise.all([
          fetchWithAuth('/api/meals'),
          fetchWithAuth('/api/family'),
          fetchWithAuth('/api/wearables')
        ]);
        if (mealsRes.ok) setMeals(await mealsRes.json());
        if (familyRes.ok) setFamilyMembers(await familyRes.json());
        if (wearablesRes.ok) setWearables(await wearablesRes.json());
      } catch (err) {
        console.error('Failed fetching data:', err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  useEffect(() => {
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (activeThread) {
      setChatMessages(activeThread.messages);
    }
  }, [activeThreadId, threads]);

  // Sync /reports URL route or popstate for test verification
  const handleOpenReports = () => {
    console.log("Opening Reports...");
    try {
      window.history.pushState({ page: 'reports' }, 'Reports', '/reports');
    } catch (e) {}
    setActiveTab('reports');
    setShowReportsOnDashboard(true);
  };

  // Handle Toggle or Connect Wearable Device
  const handleToggleWearableDevice = async (id: string, customDeviceName?: string) => {
    try {
      if (id.startsWith('new_')) {
        const nameToUse = customDeviceName || 'New Health Sensor';
        const brandToUse = nameToUse.split(' ')[0] || 'Generic';
        // P0-05: a newly connected device has NO data - never fabricate
        // telemetry. Metrics stay 0 until a real sync exists.
        const newDevice: WearableMetrics = {
          id: `w_${Date.now()}`,
          device: nameToUse,
          brand: brandToUse,
          connected: true,
          heartRateBpm: 0,
          steps: 0,
          caloriesBurned: 0,
          sleepHours: 0,
          hrvMs: 0,
          weightKg: undefined,
          recoveryScore: undefined,
          lastSynced: null
        };
        setWearables(prev => [...prev, newDevice]);
        triggerToast(`Connected ${nameToUse}! Waiting for data sync…`);
        return;
      }

      const existing = wearables.find(w => w.id === id);
      if (existing) {
        const nextState = !existing.connected;
        const updated = wearables.map(w => w.id === id ? {
          ...w,
          connected: nextState,
          lastSynced: null, // P0-05: no real sync has happened
          heartRateBpm: nextState ? w.heartRateBpm : 0,
          steps: nextState ? w.steps : 0,
          caloriesBurned: nextState ? w.caloriesBurned : 0,
          sleepHours: nextState ? w.sleepHours : 0,
          hrvMs: nextState ? w.hrvMs : 0
        } : w);
        setWearables(updated);

        // Sync with backend API
        fetchWithAuth('/api/wearables/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        }).catch(err => console.warn('Wearables API sync fallback:', err));

        triggerToast(nextState ? `Connected ${existing.device}!` : `Disconnected ${existing.device}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Thread Management Handlers
  const handleNewThread = (incognito = false) => {
    const newId = 'thread_' + Date.now();
    const newThreadObj: ChatThread = {
      id: newId,
      title: incognito ? 'Private Incognito Session' : 'New Chat Session',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      incognito: incognito || privacySettings.incognitoByDefault,
      messages: [
        {
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          text: (incognito || privacySettings.incognitoByDefault)
            ? "🔒 Incognito Mode Active. Dialogue in this thread will not be saved to conversation history."
            : "Hello! I'm NutriChat AI. I'm your personal AI health companion. How are you feeling today?",
          timestamp: new Date().toISOString()
        }
      ]
    };
    setThreads([newThreadObj, ...threads]);
    setActiveThreadId(newId);
    triggerToast(incognito ? "Started Private Incognito Session" : "New Chat Session Created");
  };

  const handleDeleteThread = (id: string) => {
    const nextThreads = threads.filter(t => t.id !== id);
    if (nextThreads.length === 0) {
      const fallback: ChatThread = {
        id: 'thread_' + Date.now(),
        title: 'New Assessment',
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [{
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          text: "Hello! I'm NutriChat AI. I'm your personal AI health companion. How are you feeling today?",
          timestamp: new Date().toISOString()
        }]
      };
      setThreads([fallback]);
      setActiveThreadId(fallback.id);
    } else {
      setThreads(nextThreads);
      if (activeThreadId === id) {
        setActiveThreadId(nextThreads[0].id);
      }
    }
    triggerToast("Thread removed.");
  };

  const handleTogglePinThread = (id: string) => {
    setThreads(threads.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
    triggerToast("Pin status updated.");
  };

  const handleToggleArchiveThread = (id: string) => {
    setThreads(threads.map(t => t.id === id ? { ...t, archived: !t.archived } : t));
    triggerToast("Archive status updated.");
  };

  const handleDuplicateThread = (threadToDup: ChatThread) => {
    const dupId = 'thread_dup_' + Date.now();
    const dupThread: ChatThread = {
      ...threadToDup,
      id: dupId,
      title: `${threadToDup.title} (Copy)`,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: threadToDup.messages.map(m => ({ ...m, id: 'msg_' + Math.random().toString(36).substr(2,7) }))
    };
    setThreads([dupThread, ...threads]);
    setActiveThreadId(dupId);
    triggerToast(`Cloned thread: "${threadToDup.title}"`);
  };

  const handleRenameThread = (id: string, newTitle: string) => {
    setThreads(threads.map(t => t.id === id ? { ...t, title: newTitle, updatedAt: new Date().toISOString() } : t));
  };

  const handleClearThread = (id: string) => {
    setThreads(threads.map(t => t.id === id ? {
      ...t,
      messages: [{
        id: 'msg_cleared_' + Date.now(),
        sender: 'assistant',
        text: 'Thread history cleared. What topic would you like to discuss next?',
        timestamp: new Date().toISOString()
      }]
    } : t));
  };

  const handleDeleteAllThreads = () => {
    const freshThread: ChatThread = {
      id: 'default_thread_' + Date.now(),
      title: 'Longevity & Metabolic Assessment',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: 'msg_welcome',
        sender: 'assistant',
        text: 'All history erased. Welcome to NutriMind AI.',
        timestamp: new Date().toISOString()
      }]
    };
    setThreads([freshThread]);
    setActiveThreadId(freshThread.id);
  };

  // Memory Handlers
  const handleAddMemory = (newMem: Omit<AIMemoryItem, 'id' | 'createdAt'>) => {
    const created: AIMemoryItem = {
      ...newMem,
      id: 'mem_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setAiMemories([created, ...aiMemories]);
    triggerToast(`Stored in AI Memory: "${created.key}"`);
  };

  const handleDeleteMemory = (id: string) => {
    setAiMemories(aiMemories.filter(m => m.id !== id));
    triggerToast("Memory item removed.");
  };

  const handleClearAllMemories = () => {
    setAiMemories([]);
    triggerToast("All AI memories cleared.");
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\[Attached.*?\]/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      if (voiceGender === 'female') {
        selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('google us english') || 
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('karen')
        );
      } else {
        selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('alex') || 
          v.name.toLowerCase().includes('microsoft david')
        );
      }
      if (selectedVoice) utterance.voice = selectedVoice;

      let baseRate = 1.0;
      if (voiceStyle === 'calm') {
        baseRate = 0.88;
        utterance.pitch = 0.95;
      } else if (voiceStyle === 'professional') {
        baseRate = 1.0;
        utterance.pitch = 1.0;
      } else if (voiceStyle === 'motivational') {
        baseRate = 1.18;
        utterance.pitch = 1.1;
      } else {
        baseRate = 1.0;
        utterance.pitch = 1.05;
      }

      utterance.rate = Math.min(Math.max(baseRate * (voiceSpeed || 1.0), 0.5), 2.0);

      utterance.onend = () => {
        if (isVoiceContinuous) {
          setTimeout(() => {
            startListening();
          }, 300);
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (isVoiceInterruptible && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = detectLanguageFromText(currentInput)?.code || 'en-US';

        rec.onstart = () => setIsListening(true);

        rec.onresult = (e: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript;
            } else {
              interimTranscript += e.results[i][0].transcript;
            }
          }

          const combined = (finalTranscript || interimTranscript).trim();
          if (combined) {
            setCurrentInput(combined);
          }
        };

        rec.onerror = (err: any) => {
          console.warn('Speech recognition status:', err);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    } else {
      triggerToast("Real-time Speech Recognition active.");
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const simulatedInputs = [
          "Suggest a high protein diet for weight gain",
          "What is my current HRV recovery trend?",
          "How can I reduce cortisol naturally?",
          "Suggest prebiotic snacks for better gut health"
        ];
        const randomSim = simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
        setCurrentInput(randomSim);
      }, 1500);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
  };

  // Handle Meal scanner upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchWithAuth('/api/meals/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          note: customDescription,
          imageBase64: selectedBase64
        })
      });

      if (res.ok) {
        const auditedItem: FoodItem = await res.json();
        setRecentlyScanned({
          ...auditedItem,
          portion: 'Medium',
          portionLabel: '1 Plate standard (220g)'
        });
        triggerToast('Food pipeline audit successful!');
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Biological audit failed.');
      }
    } catch (err) {
      setErrorMessage('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate macro portions
  const handlePortionChange = (portion: 'Small' | 'Medium' | 'Large') => {
    if (!recentlyScanned) return;
    let factor = 1.0;
    let label = '1 Plate standard (220g)';
    if (portion === 'Small') { factor = 0.7; label = 'Half Portion (130g)'; }
    else if (portion === 'Large') { factor = 1.35; label = 'Double Portion (350g)'; }

    const databaseKey = findKeyByName(recentlyScanned.name);
    const dbItem = (foodDatabase as any)[databaseKey] || {
      portions: {
        Small: { calories: 105, protein: 5, carbs: 14, fat: 3 },
        Medium: { calories: 150, protein: 8, carbs: 20, fat: 5 },
        Large: { calories: 200, protein: 11, carbs: 27, fat: 7 }
      }
    };
    const itemPortion = dbItem.portions?.[portion] || dbItem.portions?.["Medium"] || { calories: 150, protein: 8, carbs: 20, fat: 5 };

    setRecentlyScanned({
      ...recentlyScanned,
      portion,
      portionLabel: label,
      calories: Math.round(itemPortion.calories),
      protein: Math.round(itemPortion.protein),
      carbs: Math.round(itemPortion.carbs),
      fat: Math.round(itemPortion.fat)
    });
  };

  const findKeyByName = (name: string): string => {
    const cleanName = (name || '').toLowerCase().trim().replace(/[\s_-]+/g, '_');
    if (foodDatabase[cleanName as keyof typeof foodDatabase]) return cleanName;
    for (const key of Object.keys(foodDatabase)) {
      if (cleanName.includes(key) || key.includes(cleanName)) return key;
    }
    return 'maggi';
  };

  const handleCoachFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'photos' | 'files') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      triggerToast(`Attached ${file.name} successfully to your chat!`);
      setCurrentInput(prev => {
        const spacer = prev ? ' ' : '';
        return prev + spacer + `[Attached ${source}: ${file.name}]`;
      });
    }
  };

  const handleConfirmScan = async () => {
    if (!recentlyScanned) return;
    try {
      const res = await fetchWithAuth('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recentlyScanned)
      });
      if (res.ok) {
        const saved = await res.json();
        setMeals([saved, ...meals]);
        setRecentlyScanned(null);
        setSelectedBase64(null);
        setCustomDescription('');
        setActiveTab('dashboard');
        triggerToast('Meal added to your metabolic metabolic log!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/meals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMeals(meals.filter(m => m.id !== id));
        triggerToast('Meal log deleted successfully.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chat message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const detectedLang = detectLanguageFromText(currentInput);
    const textPrompt = currentInput.trim();

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      sender: 'user',
      text: textPrompt,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    // Auto-title thread if it's new or generic
    const currentThreadObj = threads.find(t => t.id === activeThreadId);
    let autoTitle = currentThreadObj?.title;
    if (
      currentThreadObj && 
      (currentThreadObj.title === 'New Metabolic Chat' || 
       currentThreadObj.title === 'New Assessment' || 
       currentThreadObj.title === 'Private Incognito Session')
    ) {
      autoTitle = textPrompt.length > 28 ? textPrompt.slice(0, 28) + '...' : textPrompt;
    }

    setThreads(threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: autoTitle || t.title,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };
      }
      return t;
    }));

    setCurrentInput('');
    setLoading(true);

    try {
      const liveWearableMetrics = aggregateHealthMetrics(wearables);
      const res = await fetchWithAuth('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          wearableData: liveWearableMetrics,
          detectedLanguage: detectedLang.code,
          // P0-07: memories (incl. Medical/Allergy) are only sent to the AI
          // with explicit user consent. Default: off.
          memories: getAiMemoryConsent() ? aiMemories.map(m => `${m.key}: ${m.value}`) : [],
          contextSnapshot: {
            userGoal,
            totalCaloriesToday,
            waterIntakeToday,
            sleepScore,
            stressScore
          }
        })
      });

      if (res.ok) {
        const answer = await res.json();
        const assistantMsg: ChatMessage = {
          id: answer.id || 'msg_' + Date.now(),
          sender: 'assistant',
          text: answer.text || answer.reply || 'I am analyzing your core metabolic trends.',
          timestamp: answer.timestamp || new Date().toISOString()
        };
        const nextMsgs = [...updatedMessages, assistantMsg];
        setChatMessages(nextMsgs);
        setThreads(threads.map(t => t.id === activeThreadId ? { ...t, messages: nextMsgs, updatedAt: new Date().toISOString() } : t));
        setActiveAttachment(null);
        if (isVoiceActive) {
          speakText(assistantMsg.text);
        }
      } else {
        // Fallback simulated response if offline or backend delay
        const fallbackMsg: ChatMessage = {
          id: 'msg_fallback_' + Date.now(),
          sender: 'assistant',
          text: `I have received your query regarding "${textPrompt.slice(0, 30)}...". Based on your active goal (${userGoal}) and current logs, prioritize balanced electrolyte intake and protein partitioning.`,
          timestamp: new Date().toISOString()
        };
        const nextMsgs = [...updatedMessages, fallbackMsg];
        setChatMessages(nextMsgs);
        setThreads(threads.map(t => t.id === activeThreadId ? { ...t, messages: nextMsgs, updatedAt: new Date().toISOString() } : t));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        text: 'I am currently operating in localized offline mode. Your message is safely logged locally and will sync when connectivity returns.',
        timestamp: new Date().toISOString()
      };
      const nextMsgs = [...updatedMessages, errMsg];
      setChatMessages(nextMsgs);
      setThreads(threads.map(t => t.id === activeThreadId ? { ...t, messages: nextMsgs } : t));
    } finally {
      setLoading(false);
    }
  };

  const handleMessageFeedback = (messageId: string, rating: 'like' | 'dislike') => {
    setChatMessages(chatMessages.map(m => m.id === messageId ? { ...m, feedback: rating } : m));
    triggerToast(rating === 'like' ? 'Thank you for your feedback! 👍' : 'Feedback recorded. We will improve! 👎');
  };

  const handleRegenerateLastResponse = async () => {
    if (chatMessages.length < 2) return;
    const lastUserMsgIndex = [...chatMessages].reverse().findIndex(m => m.sender === 'user');
    if (lastUserMsgIndex === -1) return;
    const actualIndex = chatMessages.length - 1 - lastUserMsgIndex;
    const trimmedMsgs = chatMessages.slice(0, actualIndex + 1);
    
    setChatMessages(trimmedMsgs);
    setLoading(true);

    try {
      const liveWearableMetrics = aggregateHealthMetrics(wearables);
      const res = await fetchWithAuth('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: trimmedMsgs,
          wearableData: liveWearableMetrics,
          // P0-07: memories only sent with explicit consent (default off).
          memories: getAiMemoryConsent() ? aiMemories.map(m => `${m.key}: ${m.value}`) : []
        })
      });

      if (res.ok) {
        const answer = await res.json();
        const assistantMsg: ChatMessage = {
          id: answer.id || 'msg_' + Date.now(),
          sender: 'assistant',
          text: answer.text || answer.reply || 'Re-analyzed your metabolic query.',
          timestamp: answer.timestamp || new Date().toISOString()
        };
        const nextMsgs = [...trimmedMsgs, assistantMsg];
        setChatMessages(nextMsgs);
        setThreads(threads.map(t => t.id === activeThreadId ? { ...t, messages: nextMsgs, updatedAt: new Date().toISOString() } : t));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportThread = (id: string) => {
    triggerToast('Chat logs exported as clinician JSON packet!');
  };

  // Log bio savers
  const handleSaveSleep = () => {
    const val = parseFloat(newSleepDuration);
    if (!isNaN(val)) {
      setSleepScore(Math.min(100, Math.round((val / 8.5) * 100)));
      setSleepHistory([sleepHistory[1], sleepHistory[2], sleepHistory[3], sleepHistory[4], sleepHistory[5], sleepHistory[6], Math.min(100, Math.round((val / 8.5) * 100))]);
      setShowSleepModal(false);
      triggerToast('Sleep duration updated successfully!');
    }
  };

  const handleSaveStress = () => {
    const val = parseInt(newStressRating);
    if (!isNaN(val)) {
      setStressScore(val);
      setStressHistory([...stressHistory.slice(1), val]);
      setShowStressModal(false);
      triggerToast('Stress levels recorded!');
    }
  };

  const handleSaveCardio = () => {
    const val = parseInt(newCardioBpm);
    if (!isNaN(val)) {
      setCardioScore(Math.min(100, Math.round((70 / val) * 100)));
      setCardioHistory([...cardioHistory.slice(1), Math.min(100, Math.round((70 / val) * 100))]);
      setShowCardioModal(false);
      triggerToast('Resting Heart Rate logged.');
    }
  };

  const handleSaveActivity = () => {
    const val = parseInt(newActiveCalories);
    if (!isNaN(val)) {
      setActivityScore(Math.min(100, Math.round((val / 600) * 100)));
      setActivityHistory([...activityHistory.slice(1), Math.min(100, Math.round((val / 600) * 100))]);
      setShowActivityModal(false);
      triggerToast('Active TDEE calories logged!');
    }
  };

  // Add water helper
  const handleAddWater = (amount: number) => {
    setWaterIntakeToday(waterIntakeToday + amount);
    triggerToast(`Logged +${amount}ml water intake!`);
  };

  // Trigger help sections dictionary
  const triggerHelp = (key: string) => {
    const helpDictionary: Record<string, typeof helpSection> = {
      metabolic: {
        title: 'Metabolic Health Score',
        what: 'The Metabolic Health Score measures cellular mitochondrial stability, cellular insulin response times, and general cardiovascular homeostasis.',
        why: 'Higher metabolic health prevents fatty liver development and helps maintain healthy, stable daily energy curves.',
        improve: 'Perform 20 minutes of Zone 2 steady-state cardio before breaking fasting windows.',
        source: 'Harvard Medical Longevity Lab, 2026 Reports.',
        example: 'Optimal insulin response window is 45-60m post-meal.'
      },
      nutrition: {
        title: 'Nutrition Score',
        what: 'A rating of macronutrient ratio balance, high-fiber prebiotic foods presence, and chemical processed additives exclusion.',
        why: 'Proper protein-to-carbohydrate partition aids muscle repair without causing pancreatic insulin stress.',
        improve: 'Increase leafy greens and lean biological protein inputs.',
        source: 'Stanford Metabolic Nutrition database.',
        example: 'A perfect 130g target protein intake today.'
      },
      activity: {
        title: 'Activity Score',
        what: 'Aggregated assessment of non-exercise activity thermogenesis (NEAT) and calculated calorie outputs.',
        why: 'Steady daily physical activity prevents glycogen saturation in liver tissues.',
        improve: 'Perform 10,000 steps daily or 30 minutes of high-intensity functional workouts.',
        source: 'Health Connect Android Metrics, 2026.',
        example: 'Logged 720 kcal active output.'
      },
      sleep: {
        title: 'Sleep Score',
        what: 'Assessment of deep/REM recovery sleep cycles and respiratory synchronization.',
        why: 'Quality sleep controls ghrelin levels, suppressing food cravings tomorrow.',
        improve: 'Stop blue light exposure 90 minutes before bedtime.',
        source: 'Apple Health Sync Bridge.',
        example: '7h 45m restorative sleep.'
      },
      hydration: {
        title: 'Hydration Score',
        what: 'A metric measuring body water percentage based on regular intake logs against the 2.5L metabolic target.',
        why: 'Sustained hydration fuels blood oxygen delivery to active muscle groups.',
        improve: 'Drink 250ml water immediately upon waking up.',
        source: 'World Health Organization guidelines.',
        example: 'Current hydration at 1250 ml today.'
      },
      cardio: {
        title: 'Cardio-Metabolic Score',
        what: 'Calculated assessment of cardiac resilience, vascular flexibility, and Resting Heart Rate (RHR).',
        why: 'Lower resting heart rates signify superior athletic strokes and cardiovascular oxygen absorption capacity.',
        improve: 'Perform HIIT intervals twice a week to force stroke volume increases.',
        source: 'American College of Cardiology.',
        example: 'Optimal resting pulse is 58 BPM.'
      },
      stress: {
        title: 'Stress Score',
        what: 'Indices measuring autonomic nerve balancing, measured via Heart Rate Variability (HRV) and cortisol stability.',
        why: 'Elevated stress floods blood vessels with cortisol, blocking clean fat lipolysis.',
        improve: 'Perform box breathing cycles (4s inhale, 4s hold, 4s exhale, 4s hold).',
        source: 'Journal of Psychophysiological Science.',
        example: 'HRV recorded at 64ms.'
      }
    };
    setHelpSection(helpDictionary[key] || null);
  };

  const getClientGoalAdvice = (foodName: string, goal: string) => {
    const normGoal = (goal || 'Weight Loss').toLowerCase();
    const lowerName = (foodName || '').toLowerCase();

    if (lowerName.includes('maggi') || lowerName.includes('noodles')) {
      if (normGoal.includes('loss')) {
        return "You're currently trying to lose weight. This food should be consumed in moderation as it is high in sodium and refined carbohydrates.";
      } else if (normGoal.includes('gain')) {
        return "This food can help increase calorie intake. Pair with paneer or eggs for more protein.";
      } else {
        return "This food fits a balanced diet when consumed appropriately occasionally.";
      }
    }

    if (lowerName.includes('paneer') || lowerName.includes('tofu')) {
      if (normGoal.includes('loss')) {
        return "You're currently trying to lose weight. This food is high in protein and should be consumed in moderation to monitor lipid fats.";
      } else if (normGoal.includes('gain')) {
        return "This food can help increase calorie intake and provides clean dense muscle fuel.";
      } else {
        return "This food fits a balanced diet when consumed appropriately for protein partitioning.";
      }
    }

    if (normGoal.includes('loss')) {
      return "You're currently trying to lose weight. This food should be consumed in moderation.";
    } else if (normGoal.includes('gain')) {
      return "This food can help increase calorie intake.";
    } else {
      return "This food fits a balanced diet when consumed appropriately.";
    }
  };

  const totalCaloriesToday = meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div 
      id="nutrimind_app_frame" 
      className={`max-w-[580px] w-full mx-auto bg-[#050505] border border-[#D1F2EB]/20 rounded-[52px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col h-[850px] text-[#D1F2EB] transition-all phone-glass-frame ${
        isAccessibilityMode ? 'text-sm scale-[1.01] tracking-wide' : ''
      }`}
    >
      {/* 1. Phone status bar simulation - Minimalist Luxury */}
      <div className="bg-[#050505]/90 backdrop-blur-md px-8 py-2.5 flex justify-between items-center text-[11px] text-[#D1F2EB]/60 border-b border-[#D1F2EB]/10 font-mono shrink-0 select-none">
        <span>9:41 AM</span>
        <div className="w-20 h-4 bg-[#0a0a0f] rounded-full border border-[#D1F2EB]/15 flex items-center justify-center gap-1.5 shadow-inner">
          <div className="w-2 h-2 bg-[#50C878] rounded-full animate-pulse shadow-[0_0_8px_#50C878]"></div>
          <span className="text-[8px] font-bold text-[#D1F2EB]">NUTRIMIND</span>
        </div>
        <span className="font-semibold text-[#D1F2EB]">100%</span>
      </div>

      {/* Low Internet / Offline Background Sync Indicator Banner */}
      {(isLowInternetMode || !isOnline) && (
        <div className="bg-[#663399]/20 border-b border-[#663399]/40 px-3 py-1.5 flex items-center justify-between text-[10px] text-[#D1F2EB] font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#50C878] animate-pulse shrink-0" />
            <span className="font-bold">LOW INTERNET / OFFLINE MODE</span>
          </div>
          <span className="bg-[#50C878]/20 text-[#50C878] border border-[#50C878]/30 px-2 py-0.5 rounded text-[8px] font-bold">
            0 PENDING SYNCS
          </span>
        </div>
      )}

      {/* 2. Notification Toast at top of the screen */}
      <AnimatePresence>
        {notificationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="bg-[#0f1118]/95 border border-[#50C878]/40 text-[#D1F2EB] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-sans backdrop-blur-xl">
              <Sparkles className="text-[#50C878]" size={14} />
              <span>{notificationMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Luxury App Main Top Bar */}
      <div className="bg-[#050505]/95 backdrop-blur-xl px-5 py-3.5 flex justify-between items-center border-b border-[#D1F2EB]/10 shrink-0">
        <button
          onClick={() => {
            if (activeTab === 'coach') {
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              setIsHamburgerOpen(true);
            }
          }}
          className="p-2 hover:bg-[#D1F2EB]/10 rounded-xl border border-[#D1F2EB]/20 text-[#D1F2EB] transition active:scale-95 cursor-pointer bg-[#0f1118] flex flex-col gap-1 w-9 h-9 justify-center items-center shrink-0"
          title={activeTab === 'coach' ? "Toggle NutriChat Recents & History" : "Open Account & Settings Menu"}
        >
          <div className="w-4 h-0.5 bg-[#50C878] rounded-full" />
          <div className="w-4 h-0.5 bg-[#D1F2EB] rounded-full" />
        </button>

        <div className="text-center flex-1 mx-2">
          <span className="font-display font-black text-xs tracking-widest text-[#D1F2EB] flex items-center justify-center gap-1.5 uppercase">
            <Crown size={13} className="text-[#663399]" />
            {activeTab === 'secondbrain' ? 'SECOND BRAIN & LIFE OS' : activeTab === 'coach' ? 'NUTRICHAT AI' : activeTab === 'aihub' ? 'HEALTH HUB' : activeTab === 'premium' ? 'PRO+ REWARDS' : activeTab === 'scanner' ? 'FOOD SCANNER' : 'NUTRIMIND AI'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('aihub')} 
            className="px-2.5 py-1 bg-[#663399]/25 hover:bg-[#663399]/40 border border-[#663399]/40 rounded-xl text-[#D1F2EB] font-mono text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Open AI Hub"
          >
            <span className="text-[#50C878] font-bold">🔥 14D</span>
          </button>
          <button onClick={() => triggerToast('No unread medical alerts.')} className="p-2 hover:bg-white/5 rounded-xl border border-[#D1F2EB]/10 text-[#D1F2EB]/70 hover:text-[#D1F2EB] transition cursor-pointer">
            <Bell size={15} />
          </button>
        </div>
      </div>

      {/* 4. Scrollable Tabs Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        
        {/* TAB 1: FOOD (CLEAN 3-SECOND HOME DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <CleanHomeDashboard
              userGoal={userGoal}
              userName={profileName || undefined}
              meals={meals}
              waterIntakeToday={waterIntakeToday}
              sleepScore={sleepScore}
              wearables={wearables}
              onAddWater={handleAddWater}
              onAddFood={() => setActiveTab('scanner')}
              onAddSleep={() => setShowSleepModal(true)}
              onConnectDevice={() => setShowDeviceManager(true)}
              onOpenNutriChat={(promptText) => {
                setActiveTab('coach');
                if (promptText) {
                  setCurrentInput(promptText);
                }
              }}
              onTriggerToast={triggerToast}
            />
          </motion.div>
        )}

        {/* TAB 4: NEW AI HUB (CONTAINING ALL ADVANCED AI FEATURES, TWIN & GAMIFICATION) */}
        {activeTab === 'aihub' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AIHub
              userGoal={userGoal}
              totalCaloriesToday={totalCaloriesToday}
              waterIntakeToday={waterIntakeToday}
              sleepScore={sleepScore}
              wearables={wearables}
              familyMembers={familyMembers}
              onOpenNutriChat={(promptText) => {
                setActiveTab('coach');
                if (promptText) {
                  setCurrentInput(promptText);
                }
              }}
              onOpenDeviceManager={() => setShowDeviceManager(true)}
              onOpenReports={handleOpenReports}
              onTriggerToast={triggerToast}
            />
          </motion.div>
        )}

        {/* TAB 5: SECOND BRAIN & LIFE OS HUB */}
        {activeTab === 'secondbrain' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <LifeOsSecondBrain
              userName={profileName || undefined}
              userGoal={userGoal}
              memories={aiMemories}
              wearables={wearables}
              privacySettings={privacySettings}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onClearAllMemories={handleClearAllMemories}
              onUpdatePrivacySettings={(updated) => setPrivacySettings({ ...privacySettings, ...updated })}
              onOpenNutriChat={(promptText) => {
                setActiveTab('coach');
                if (promptText) {
                  setCurrentInput(promptText);
                }
              }}
              onTriggerToast={triggerToast}
            />
          </motion.div>
        )}

        {/* TAB 2: AI COACH CHAT (NutriChat) */}
        {activeTab === 'coach' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[560px] sm:h-[600px] bg-slate-950/90 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl"
          >


            {/* Main Area: Sidebar Drawer Overlay + Active Chat Viewport */}
            <div className="flex-1 relative flex overflow-hidden">
              {/* Chat Recents Sidebar Component */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute inset-y-0 left-0 z-30 w-72 bg-slate-950 border-r border-white/10 shadow-2xl flex flex-col"
                  >
                    <ChatSidebar
                      threads={threads}
                      activeThreadId={activeThreadId}
                      setActiveThreadId={(id) => {
                        setActiveThreadId(id);
                        setIsSidebarOpen(false);
                      }}
                      onNewThread={(incognito) => {
                        handleNewThread(incognito);
                        setIsSidebarOpen(false);
                      }}
                      onDeleteThread={handleDeleteThread}
                      onTogglePinThread={handleTogglePinThread}
                      onToggleArchiveThread={handleToggleArchiveThread}
                      onExportThread={(t) => {
                        setSelectedThreadForManage(t);
                        setShowManageModal(true);
                      }}
                      onOpenMemoryModal={() => {
                        setShowMemoryModal(true);
                        setIsSidebarOpen(false);
                      }}
                      onOpenManageModal={(t) => {
                        setSelectedThreadForManage(t || threads.find(x => x.id === activeThreadId) || null);
                        setShowManageModal(true);
                        setIsSidebarOpen(false);
                      }}
                      onClearAllChats={handleDeleteAllThreads}
                      isOnline={isOnline}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overlay Backdrop when sidebar is open */}
              {isSidebarOpen && (
                <div 
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute inset-0 bg-black/50 z-20 backdrop-blur-[1px]"
                />
              )}

              {/* Chat Viewport or Voice Mode */}
              {isVoiceActive ? (
                <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 relative overflow-y-auto no-scrollbar">
                  {/* Voice Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">NutriChat Live Voice</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsVoiceActive(false);
                        stopListening();
                      }}
                      className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] uppercase tracking-wider font-bold transition"
                    >
                      Exit Voice
                    </button>
                  </div>

                  {/* Animated Pulsing Soundwave */}
                  <div className="flex flex-col items-center justify-center space-y-4 my-auto py-4">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                      <motion.div
                        animate={{
                          scale: isListening || loading ? [1, 1.3, 1] : [1, 1.1, 1],
                          opacity: isListening || loading ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: isListening ? 1.2 : 2.5,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-cyan-500/20"
                      />
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`relative z-10 p-4 rounded-full text-white transition duration-200 active:scale-95 ${
                          isListening ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                        }`}
                      >
                        {isListening ? <Mic size={24} className="animate-pulse" /> : <Mic size={24} />}
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-bold text-white">
                        {isListening ? "Listening to your voice..." : loading ? "AI Coach is speaking..." : "Tap microphone to speak"}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase tracking-wider">
                        {voiceStyle.toUpperCase()} • {voiceGender.toUpperCase()} SYNTHESIS
                      </p>
                    </div>

                    {/* Simulated wave bars */}
                    <div className="flex items-center gap-1 h-6">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: isListening || loading ? [4, Math.random() * 20 + 4, 4] : [4, 6, 4]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5 + i * 0.1,
                            ease: "easeInOut"
                          }}
                          className={`w-1 rounded-full ${isListening ? 'bg-emerald-400' : loading ? 'bg-cyan-400' : 'bg-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Voice Settings Panel directly integrated in full voice mode */}
                  <div className="border-t border-white/10 pt-3">
                    <VoicePersonaSettings
                      gender={voiceGender}
                      setGender={setVoiceGender}
                      style={voiceStyle}
                      setStyle={setVoiceStyle}
                      isContinuous={isVoiceContinuous}
                      setIsContinuous={setIsVoiceContinuous}
                      isInterruptible={isVoiceInterruptible}
                      setIsInterruptible={setIsVoiceInterruptible}
                      voiceSpeed={voiceSpeed}
                      setVoiceSpeed={setVoiceSpeed}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                    {chatMessages.map((msg, idx) => {
                      const isUser = msg.sender === 'user';
                      const isLastAssistant = !isUser && idx === chatMessages.length - 1;
                      const detectedLangInfo = isUser ? detectLanguageFromText(msg.text) : null;

                      return (
                        <div key={msg.id || idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs relative leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                              : 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none font-sans'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Message Footer Info & Actions */}
                            <div className="flex items-center justify-between gap-2 mt-1 border-t border-white/5 pt-0.5 text-[8px]">
                              <div className="flex items-center gap-1 opacity-70">
                                {detectedLangInfo && detectedLangInfo.code !== 'en' && (
                                  <span className="px-1 bg-cyan-950 text-cyan-300 rounded font-mono flex items-center gap-0.5">
                                    <Globe size={8} /> {detectedLangInfo.flag} {detectedLangInfo.nativeName}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 opacity-80">
                                <span className="font-mono text-[7.5px]">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {/* Quick Copy & Speak Buttons */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text);
                                    triggerToast('Copied to clipboard!');
                                  }}
                                  className="p-0.5 hover:text-cyan-400 transition"
                                  title="Copy text"
                                >
                                  <Copy size={10} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => speakText(msg.text)}
                                  className="p-0.5 hover:text-cyan-400 transition"
                                  title="Listen via Speech"
                                >
                                  <Volume2 size={10} />
                                </button>

                                {!isUser && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleMessageFeedback(msg.id, 'like')}
                                      className={`p-0.5 transition ${msg.feedback === 'like' ? 'text-emerald-400' : 'hover:text-emerald-400'}`}
                                      title="Helpful response"
                                    >
                                      <ThumbsUp size={10} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMessageFeedback(msg.id, 'dislike')}
                                      className={`p-0.5 transition ${msg.feedback === 'dislike' ? 'text-rose-400' : 'hover:text-rose-400'}`}
                                      title="Not helpful"
                                    >
                                      <ThumbsDown size={10} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Regenerate prompt button for latest assistant message */}
                          {isLastAssistant && !loading && (
                            <button
                              type="button"
                              onClick={handleRegenerateLastResponse}
                              className="mt-0.5 text-[8.5px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 self-start px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition"
                            >
                              <RotateCcw size={9} /> Regenerate
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl px-3 py-2 text-slate-300 text-[10px] font-mono flex items-center gap-2 shadow-inner">
                          <RefreshCw size={11} className="animate-spin text-cyan-400" />
                          <span>Analyzing metabolic vectors...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Compact Quick Prompts Bar */}
                  <div className="px-2.5 py-1 border-t border-white/5 bg-slate-950/90 shrink-0 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[8.5px] no-scrollbar">
                    <span className="text-slate-500 font-mono font-bold text-[8px] uppercase tracking-wider">Prompts:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentInput("Suggest high-protein vegetarian post-workout meals")}
                      className="bg-slate-900 border border-white/10 rounded-md px-2 py-0.5 text-cyan-300 font-medium hover:bg-slate-800 transition"
                    >
                      High Protein Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentInput("What was my primary health goal?")}
                      className="bg-slate-900 border border-white/10 rounded-md px-2 py-0.5 text-cyan-300 font-medium hover:bg-slate-800 transition"
                    >
                      My Health Goal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentInput("How can I improve my HRV recovery score tonight?")}
                      className="bg-slate-900 border border-white/10 rounded-md px-2 py-0.5 text-cyan-300 font-medium hover:bg-slate-800 transition"
                    >
                      HRV Recovery
                    </button>
                  </div>

                  {/* Compact Input bar */}
                  <div className="relative shrink-0">
                    {showPlusMenu && (
                      <div className="absolute left-2 bottom-12 z-50 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 w-48 backdrop-blur-md">
                        <button
                          type="button"
                          onClick={() => {
                            cameraInputRef.current?.click();
                            setShowPlusMenu(false);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-white rounded-xl transition text-left w-full"
                        >
                          <Camera size={13} className="text-cyan-400" />
                          <span>Take Meal Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            photoInputRef.current?.click();
                            setShowPlusMenu(false);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-white rounded-xl transition text-left w-full"
                        >
                          <Image size={13} className="text-cyan-400" />
                          <span>Upload From Gallery</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRefCoach.current?.click();
                            setShowPlusMenu(false);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-white rounded-xl transition text-left w-full"
                        >
                          <FileText size={13} className="text-cyan-400" />
                          <span>Attach Lab PDF / Log</span>
                        </button>
                      </div>
                    )}

                    {/* Voice Settings Popover Drawer */}
                    {showVoiceSettingsOverlay && (
                      <div className="absolute left-2 right-2 bottom-14 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowVoiceSettingsOverlay(false)}
                            className="absolute top-3 right-3 text-[#D1F2EB]/50 hover:text-[#D1F2EB] text-xs font-bold z-10 px-2 py-0.5 bg-[#050505] rounded-full border border-[#D1F2EB]/20"
                          >
                            ✕
                          </button>
                          <VoicePersonaSettings
                            gender={voiceGender}
                            setGender={setVoiceGender}
                            style={voiceStyle}
                            setStyle={setVoiceStyle}
                            isContinuous={isVoiceContinuous}
                            setIsContinuous={setIsVoiceContinuous}
                            isInterruptible={isVoiceInterruptible}
                            setIsInterruptible={setIsVoiceInterruptible}
                            voiceSpeed={voiceSpeed}
                            setVoiceSpeed={setVoiceSpeed}
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Listening & Transcription Banner */}
                    {isListening && (
                      <div className="px-3 py-1.5 bg-[#663399]/20 border-t border-[#663399]/40 flex items-center justify-between text-[10px] text-[#D1F2EB] font-mono animate-pulse">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#50C878] shadow-[0_0_8px_#50C878]" />
                          <span className="font-bold">LISTENING LIVE • REAL-TIME TRANSCRIPTION</span>
                        </div>
                        <span className="text-[9px] text-[#50C878] font-bold">SPEAK NOW</span>
                      </div>
                    )}

                    {/* Hidden inputs */}
                    <input type="file" accept="image/*" capture="user" ref={cameraInputRef} className="hidden" onChange={(e) => handleCoachFileChange(e, 'camera')} />
                    <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={(e) => handleCoachFileChange(e, 'photos')} />
                    <input type="file" ref={fileInputRefCoach} className="hidden" onChange={(e) => handleCoachFileChange(e, 'files')} />

                    <form onSubmit={handleSendMessage} className="p-1.5 bg-[#050505] border-t border-[#D1F2EB]/15 flex items-center gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        className={`p-1.5 bg-white/5 hover:bg-white/10 border border-[#D1F2EB]/20 text-[#D1F2EB] rounded-full transition shrink-0 ${showPlusMenu ? 'rotate-45 text-white bg-[#663399]/40' : ''}`}
                        title="Add Attachments"
                      >
                        <Plus size={15} />
                      </button>

                      <input
                        type="text"
                        placeholder={isListening ? "Listening live..." : "Ask NutriMind AI in any language..."}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        className="flex-1 bg-[#0a0a0f] border border-[#D1F2EB]/15 rounded-full px-3.5 py-1.5 text-xs text-[#D1F2EB] focus:outline-none focus:border-[#50C878] transition"
                      />

                      {/* Live Mic Button with Hold/Tap To Talk */}
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        onMouseDown={() => {
                          if (!isListening) startListening();
                        }}
                        onMouseUp={() => {
                          if (isListening) stopListening();
                        }}
                        onTouchStart={() => {
                          if (!isListening) startListening();
                        }}
                        onTouchEnd={() => {
                          if (isListening) stopListening();
                        }}
                        className={`p-1.5 rounded-full transition shrink-0 cursor-pointer relative ${
                          isListening
                            ? 'bg-[#50C878] text-[#050505] shadow-[0_0_12px_#50C878] scale-110'
                            : 'bg-[#663399]/25 hover:bg-[#663399]/40 border border-[#663399]/40 text-[#D1F2EB]'
                        }`}
                        title={isListening ? "Listening live (Tap or release to finish)" : "Hold or Tap to talk with NutriChat AI"}
                      >
                        <Mic size={15} className={isListening ? 'animate-pulse' : ''} />
                      </button>

                      <button
                        type="submit"
                        disabled={loading || !currentInput.trim()}
                        className="p-1.5 bg-[#50C878] hover:bg-[#50C878]/80 disabled:bg-[#1a1a24] text-[#050505] disabled:text-[#D1F2EB]/30 rounded-full font-bold transition shrink-0 cursor-pointer"
                        title="Send Message"
                      >
                        <ArrowUp size={15} />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: CAMERA (FOOD AUDITOR TRUSTWORTHY PIPELINE) */}
        {activeTab === 'scanner' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-slate-900/80 border border-white/10 p-4 rounded-[28px] space-y-2 text-center shadow-lg">
              <h3 className="font-display font-black text-sm text-white flex items-center justify-center gap-1.5">
                <Camera size={16} className="text-cyan-400" /> Trustworthy Food Auditor
              </h3>
              <p className="text-[10px] text-slate-400">
                Guaranteed high-precision nutritional audits. We verify every macro element directly from verified local metabolic profiles.
              </p>
            </div>

            {!recentlyScanned ? (
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Custom Plate Image</span>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-cyan-500/20 hover:border-cyan-400/50 rounded-[24px] p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    {selectedBase64 ? (
                      <div className="space-y-2 flex flex-col items-center">
                        <img src={selectedBase64} alt="preview" className="w-20 h-20 object-cover rounded-2xl border border-cyan-400/40" />
                        <span className="text-xs text-cyan-400 font-bold">PLATE LOADED SUCCESSFULLY</span>
                      </div>
                    ) : (
                      <div className="space-y-1 py-2 flex flex-col items-center">
                        <Upload className="text-cyan-400/70 mb-1" size={22} />
                        <span className="text-xs text-slate-300">Drag & drop or <span className="text-cyan-400 font-bold underline">browse files</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleScanMeal} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Meal Window</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Description Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Rice & Chole..."
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-xl text-[10px] text-rose-400 flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (!selectedBase64 && !customDescription)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? 'Running biological audit...' : 'Scan My Plate'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-white/10 p-5 rounded-[28px] space-y-4 shadow-xl">
                
                {/* Food Name */}
                <div className="text-center border-b border-white/10 pb-3">
                  <h4 className="text-base font-bold text-white">{recentlyScanned.name}</h4>
                  
                  {/* Confidence Display */}
                  <span className="text-[10px] font-mono text-cyan-400 block mt-1 uppercase tracking-wider font-bold">
                    Confidence: {recentlyScanned.confidence}%
                  </span>
                </div>

                {/* Low confidence confirmation logic */}
                {recentlyScanned.confidence !== undefined && recentlyScanned.confidence < 90 && isConfidenceCorrect === null ? (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-slate-200">
                      We detected <span className="font-bold text-cyan-400">{recentlyScanned.name}</span> with <span className="font-bold text-cyan-400">{recentlyScanned.confidence}%</span> confidence. Is this correct?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setIsConfidenceCorrect(true)}
                        className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => {
                          setRecentlyScanned(null);
                          setSelectedBase64(null);
                          setIsConfidenceCorrect(null);
                        }}
                        className="px-5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Portion Size selection */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-white/10 space-y-2">
                      <span className="text-[9px] font-mono text-slate-400 block">SELECT PORTION SIZE</span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                        {(['Small', 'Medium', 'Large'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePortionChange(p)}
                            className={`py-1 text-[9px] font-bold rounded-lg transition ${
                              recentlyScanned.portion === p ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-cyan-400 text-center font-mono">
                        ({recentlyScanned.portionLabel})
                      </p>
                    </div>

                    {/* Macro metrics */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-white font-bold block">{recentlyScanned.calories}</span>
                        <span className="text-[8px] text-slate-400 block uppercase">kcal</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-emerald-400 font-bold block">{recentlyScanned.protein}g</span>
                        <span className="text-[8px] text-slate-400 block uppercase">protein</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-amber-400 font-bold block">{recentlyScanned.carbs}g</span>
                        <span className="text-[8px] text-slate-400 block uppercase">carbs</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-rose-400 font-bold block">{recentlyScanned.fat}g</span>
                        <span className="text-[8px] text-slate-400 block uppercase">fat</span>
                      </div>
                    </div>

                    {/* Action confirm */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={handleConfirmScan}
                        className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase transition shadow-md shadow-cyan-500/20"
                      >
                        Log to meals
                      </button>
                      <button
                        onClick={() => { setRecentlyScanned(null); setSelectedBase64(null); setIsConfidenceCorrect(null); }}
                        className="py-2.5 px-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs hover:bg-white/10 transition"
                      >
                        Retake
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: PREMIUM PANEL (PRO+) */}
        {activeTab === 'premium' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <PremiumPanel
              isPremium={isPremium}
              setIsPremium={setIsPremium}
              wearablesCount={wearables.length}
              familyCount={familyMembers.length}
              selectedTier={selectedTier}
              setSelectedTier={setSelectedTier}
              onTriggerToast={triggerToast}
            />
          </motion.div>
        )}

        {/* TAB 5: METABOLIC LONGEVITY REPORTS */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <ReportsScreen
              userGoal={userGoal}
              totalCaloriesToday={meals.reduce((acc, m) => acc + m.calories, 0)}
              onBack={() => {
                console.log("Closing Reports...");
                try {
                  window.history.pushState({ page: 'dashboard' }, 'Food', '/');
                } catch (e) {}
                setActiveTab('dashboard');
              }}
            />
          </motion.div>
        )}

      </div>

      {/* 5. Luxury Navigation Footer - 5 Bottom Tabs */}
      <div className="bg-[#050505]/95 backdrop-blur-2xl border-t border-[#D1F2EB]/15 px-3 py-2.5 flex justify-between items-center shrink-0 relative shadow-2xl z-20">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`relative flex flex-col items-center flex-1 py-1 transition-all duration-300 cursor-pointer ${activeTab === 'dashboard' ? 'text-[#50C878] scale-105 font-bold' : 'text-[#D1F2EB]/50 hover:text-[#D1F2EB]'}`}
        >
          {activeTab === 'dashboard' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#50C878]/15 rounded-2xl border border-[#50C878]/30 -z-0" />
          )}
          <TrendingUp size={18} className="relative z-10" />
          <span className="text-[9px] mt-1 font-extrabold uppercase tracking-wider font-sans relative z-10">Food</span>
        </button>

        <button
          onClick={() => setActiveTab('coach')}
          className={`relative flex flex-col items-center flex-1 py-1 transition-all duration-300 cursor-pointer ${activeTab === 'coach' ? 'text-[#50C878] scale-105 font-bold' : 'text-[#D1F2EB]/50 hover:text-[#D1F2EB]'}`}
        >
          {activeTab === 'coach' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#50C878]/15 rounded-2xl border border-[#50C878]/30 -z-0" />
          )}
          <MessageSquare size={18} className="relative z-10" />
          <span className="text-[9px] mt-1 font-extrabold uppercase tracking-wider font-sans relative z-10">NutriChat</span>
        </button>

        <button
          onClick={() => setActiveTab('premium')}
          className={`relative flex flex-col items-center flex-1 py-1 transition-all duration-300 cursor-pointer ${activeTab === 'premium' ? 'text-[#50C878] scale-105 font-bold' : 'text-[#D1F2EB]/50 hover:text-[#D1F2EB]'}`}
        >
          {activeTab === 'premium' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#50C878]/15 rounded-2xl border border-[#50C878]/30 -z-0" />
          )}
          <Crown size={18} className={`relative z-10 ${isPremium ? 'text-[#50C878]' : ''}`} />
          <span className="text-[9px] mt-1 font-extrabold uppercase tracking-wider font-sans relative z-10">PRO+</span>
        </button>

        <button
          onClick={() => setActiveTab('aihub')}
          className={`relative flex flex-col items-center flex-1 py-1 transition-all duration-300 cursor-pointer ${activeTab === 'aihub' ? 'text-[#50C878] scale-105 font-bold' : 'text-[#D1F2EB]/50 hover:text-[#D1F2EB]'}`}
        >
          {activeTab === 'aihub' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#50C878]/15 rounded-2xl border border-[#50C878]/30 -z-0" />
          )}
          <Sparkles size={18} className="relative z-10 text-[#663399]" />
          <span className="text-[9px] mt-1 font-extrabold uppercase tracking-wider font-sans relative z-10 text-[#D1F2EB]">Health Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`relative flex flex-col items-center flex-1 py-1 transition-all duration-300 cursor-pointer ${activeTab === 'scanner' ? 'text-[#50C878] scale-105 font-bold' : 'text-[#D1F2EB]/50 hover:text-[#D1F2EB]'}`}
        >
          {activeTab === 'scanner' && (
            <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#50C878]/15 rounded-2xl border border-[#50C878]/30 -z-0" />
          )}
          <Camera size={18} className="relative z-10" />
          <span className="text-[9px] mt-1 font-extrabold uppercase tracking-wider font-sans relative z-10">Camera</span>
        </button>
      </div>

      {/* Hamburger Drawer component */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        profileName={profileName}
        setProfileName={setProfileName}
        profilePhone={profilePhone}
        setProfilePhone={setProfilePhone}
        profileAvatar={profileAvatar}
        setProfileAvatar={setProfileAvatar}
        userGoal={userGoal}
        setUserGoal={setUserGoal}
        onSelectTab={(t) => { setActiveTab(t); setIsHamburgerOpen(false); }}
        isPremium={isPremium}
        onTriggerToast={triggerToast}
        onOpenDeviceManager={() => setShowDeviceManager(true)}
        onOpenGamification={() => setShowGamificationModal(true)}
      />

      {/* GAMIFICATION & REWARDS FULL MODAL */}
      {showGamificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
              <span className="font-display font-black text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                🔥 Gamification & Achievements
              </span>
              <button
                onClick={() => setShowGamificationModal(false)}
                className="p-1 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
              <GamificationHub onTriggerToast={triggerToast} onClose={() => setShowGamificationModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Universal Health Device Ecosystem Manager */}
      <DeviceEcosystemManager
        isOpen={showDeviceManager}
        onClose={() => setShowDeviceManager(false)}
        wearables={wearables}
        onToggleDevice={handleToggleWearableDevice}
        onTriggerToast={triggerToast}
        familyMembers={familyMembers}
      />

      {/* Score Help slide-up modal component */}
      <ScoreHelpModal
        section={helpSection}
        onClose={() => setHelpSection(null)}
      />

      {/* MANUAL LOG MODALS */}
      {/* A. Sleep Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h4 className="font-bold text-white text-sm">Log Sleep Duration</h4>
            <div>
              <label className="text-[9px] text-slate-400 font-mono block mb-1">HOURS SLEPT</label>
              <input
                type="number"
                step="0.1"
                value={newSleepDuration}
                onChange={(e) => setNewSleepDuration(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveSleep} className="flex-1 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition">Save</button>
              <button onClick={() => setShowSleepModal(false)} className="px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 text-xs hover:bg-white/10 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* B. Stress Modal */}
      {showStressModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h4 className="font-bold text-white text-sm">Record Stress Level</h4>
            <div>
              <label className="text-[9px] text-slate-400 font-mono block mb-1">CORTISOL INDEX (1-100)</label>
              <input
                type="number"
                value={newStressRating}
                onChange={(e) => setNewStressRating(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveStress} className="flex-1 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition">Save</button>
              <button onClick={() => setShowStressModal(false)} className="px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 text-xs hover:bg-white/10 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* C. Cardio Modal */}
      {showCardioModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h4 className="font-bold text-white text-sm">Log Resting pulse</h4>
            <div>
              <label className="text-[9px] text-slate-400 font-mono block mb-1">RESTING BPM</label>
              <input
                type="number"
                value={newCardioBpm}
                onChange={(e) => setNewCardioBpm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveCardio} className="flex-1 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition">Save</button>
              <button onClick={() => setShowCardioModal(false)} className="px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 text-xs hover:bg-white/10 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* D. Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h4 className="font-bold text-white text-sm">Log Active TDEE Output</h4>
            <div>
              <label className="text-[9px] text-slate-400 font-mono block mb-1">ACTIVE KILOCALORIES</label>
              <input
                type="number"
                value={newActiveCalories}
                onChange={(e) => setNewActiveCalories(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveActivity} className="flex-1 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition">Save</button>
              <button onClick={() => setShowActivityModal(false)} className="px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 text-xs hover:bg-white/10 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI MEMORY BANK MODAL */}
      <AIMemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        memories={aiMemories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
      />

      {/* CHAT MANAGEMENT & EXPORT MODAL */}
      <ChatExportModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        thread={selectedThreadForManage || threads.find(t => t.id === activeThreadId) || null}
        allThreads={threads}
        privacySettings={privacySettings}
        onUpdatePrivacySettings={(s) => {
          setPrivacySettings(s);
          savePrivacySettings(s);
        }}
        onRenameThread={handleRenameThread}
        onDuplicateThread={handleDuplicateThread}
        onClearThread={handleClearThread}
        onDeleteAllThreads={handleDeleteAllThreads}
        onTriggerToast={triggerToast}
      />

    </div>
  );
}
