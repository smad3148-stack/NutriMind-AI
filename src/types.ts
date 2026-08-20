/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core business entities for NutriMind AI

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  score: number;   // Health score 1-100
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  timestamp: string;
  analysis?: string; // Detailed Gemini AI breakdown
  confidence?: number; // Confidence percentage (0-100)
  portion?: string; // Portion size, e.g. "1 Plate (150g)"
  portionLabel?: string;
  goalAdvice?: string;
  top_3_candidates?: { food: string; confidence: number }[];
  thali_segmentation?: { item: string; confidence: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  languageDetected?: string;
  feedback?: 'like' | 'dislike' | null;
  tokensUsed?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  timestamp: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
  archived?: boolean;
  incognito?: boolean;
  language?: string;
  tags?: string[];
  contextSnapshot?: {
    goal?: string;
    caloriesTarget?: number;
    allergies?: string[];
    wearablesConnected?: string[];
    userProfileName?: string;
  };
}

export interface AIMemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'Goal' | 'Allergy' | 'Preference' | 'Medical' | 'Workout' | 'Dietary' | 'General';
  sourceThreadId?: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface PrivacySettings {
  incognitoByDefault: boolean;
  disableHistory: boolean;
  adminAccessLocked: boolean;
  autoDeleteAfterDays: number; // 0 = never
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  dailyCalorieGoal: number;
  caloriesConsumed: number;
  waterGoalMl: number;
  waterConsumedMl: number;
  avatarUrl?: string;
  statusMessage?: string;
  steps?: number;
  caloriesBurned?: number;
  sleepHours?: number;
  weightKg?: number;
  heartRateBpm?: number;
  workoutHistory?: string[];
  privacy?: 'Public' | 'Family Only' | 'Private';
}

export interface WearableMetrics {
  id: string;
  device: string; // Brand/Model name e.g. "Garmin Fenix 7 Pro", "Oura Ring Gen3", "Health Connect"
  brand?: string; // Brand category e.g. "Samsung", "Apple", "Fitbit", "Garmin", "Oura", "Dexcom", "Withings", etc.
  category?: 'watch' | 'ring' | 'band' | 'scale' | 'bp' | 'cgm' | 'platform' | 'plugin';
  connected: boolean;
  heartRateBpm: number;
  steps: number;
  caloriesBurned: number;
  sleepHours: number;
  hrvMs?: number;
  weightKg?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  glucoseMgDl?: number;
  recoveryScore?: number;
  stressLevel?: number; // 0-100%
  spO2Percent?: number; // e.g. 98%
  workoutTimeMins?: number;
  bodyTempC?: number; // e.g. 36.6
  distanceKm?: number; // e.g. 8.4 km
  readinessScore?: number; // 0-100
  waterIntakeMl?: number;
  femaleHealthCycleDay?: number;
  lastSynced: string | null;
  familyMemberId?: string;
  batteryLevel?: number;
  driverVersion?: string;
  protocol?: 'OAuth2' | 'HealthKit' | 'HealthConnect' | 'BLE_Direct' | 'REST_Webhook' | 'PluginDriver';
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
}

export interface SystemPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive';
  category: 'integrations' | 'ai' | 'analytics' | 'core';
  isInstalled: boolean;
  permissions?: string;
  dependencies?: string;
  author?: string;
  rating?: number;
  installCount?: number;
}

export interface OtaUpdate {
  id: string;
  version: string;
  channel: 'development' | 'beta' | 'staging' | 'production';
  description: string;
  bundleUrl: string;
  status: 'published' | 'retracted';
  createdAt: string;
  deployedAt: string;
}

export interface OtaDeployment {
  id: string;
  otaUpdateId: string;
  version: string;
  channel: 'development' | 'beta' | 'staging' | 'production';
  action: 'deploy' | 'rollback';
  deployedBy: string;
  status: 'success' | 'failed';
  notes?: string;
  createdAt: string;
}

export interface RevenueMetric {
  mrr: number;
  arr: number;
  activeSubscribers: number;
  conversionRate: number;
  revenueByMonth: { month: string; amount: number; target: number }[];
  recentTransactions: {
    id: string;
    userEmail: string;
    plan: 'Premium Monthly' | 'Family Plan Annual' | 'Pro Coach Addon';
    amount: number;
    status: 'success' | 'pending' | 'failed';
    timestamp: string;
  }[];
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  timestamp: string;
}
