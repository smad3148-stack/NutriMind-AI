import { WearableMetrics } from '../types';

export interface DeviceBrandInfo {
  id: string;
  name: string;
  brand: string;
  category: 'watch' | 'ring' | 'band' | 'scale' | 'bp' | 'cgm' | 'platform' | 'plugin';
  iconEmoji: string;
  badgeColor: string;
  supportedPlatforms: ('Android' | 'iPhone' | 'Tablet' | 'Desktop' | 'Web')[];
  metricsSupported: ('heartRate' | 'steps' | 'calories' | 'sleep' | 'hrv' | 'weight' | 'bloodPressure' | 'glucose' | 'recovery')[];
  description: string;
  defaultProtocol: 'OAuth2' | 'HealthKit' | 'HealthConnect' | 'BLE_Direct' | 'REST_Webhook' | 'PluginDriver';
  isFutureReady?: boolean;
}

export const DEVICE_ECOSYSTEM_CATALOG: DeviceBrandInfo[] = [
  {
    id: 'health_connect',
    name: 'Health Connect',
    brand: 'Google Health',
    category: 'platform',
    iconEmoji: '💚',
    badgeColor: 'from-emerald-600 to-teal-700',
    supportedPlatforms: ['Android', 'Tablet'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'weight', 'bloodPressure'],
    description: 'Android system-wide encrypted health repository syncing all installed fitness apps.',
    defaultProtocol: 'HealthConnect'
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    brand: 'Apple',
    category: 'platform',
    iconEmoji: '🍎',
    badgeColor: 'from-rose-600 to-pink-700',
    supportedPlatforms: ['iPhone', 'Tablet', 'Desktop'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'weight', 'bloodPressure'],
    description: 'iOS HealthKit encrypted bridge syncing Apple Watch, scale, and fitness applications.',
    defaultProtocol: 'HealthKit'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    brand: 'Fitbit',
    category: 'band',
    iconEmoji: '⌚',
    badgeColor: 'from-cyan-600 to-blue-700',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Fitbit Sense 2, Charge 6 & Versa continuous biometric pulse and sleep tracking.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'samsung_galaxy_watch',
    name: 'Samsung Galaxy Watch',
    brand: 'Samsung',
    category: 'watch',
    iconEmoji: '🌌',
    badgeColor: 'from-blue-600 to-indigo-800',
    supportedPlatforms: ['Android', 'Tablet'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'bloodPressure'],
    description: 'Samsung Galaxy Watch 6/7 Pro Wear OS with BIA body composition & ECG sensors.',
    defaultProtocol: 'HealthConnect'
  },
  {
    id: 'google_pixel_watch',
    name: 'Google Pixel Watch',
    brand: 'Google',
    category: 'watch',
    iconEmoji: '🌐',
    badgeColor: 'from-amber-500 to-emerald-600',
    supportedPlatforms: ['Android', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Pixel Watch 2/3 Wear OS with continuous cEDA stress & optical heart rate.',
    defaultProtocol: 'HealthConnect'
  },
  {
    id: 'apple_watch',
    name: 'Apple Watch',
    brand: 'Apple',
    category: 'watch',
    iconEmoji: '⌚',
    badgeColor: 'from-slate-700 to-zinc-900',
    supportedPlatforms: ['iPhone', 'Tablet'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Apple Watch Series 9 & Ultra 2 with ECG, blood oxygen, and V02 max telemetry.',
    defaultProtocol: 'HealthKit'
  },
  {
    id: 'garmin',
    name: 'Garmin',
    brand: 'Garmin',
    category: 'watch',
    iconEmoji: '⛰️',
    badgeColor: 'from-sky-600 to-blue-900',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Garmin Fenix 7, Forerunner & Epix multi-sport GPS with Body Battery & HRV Status.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'amazfit',
    name: 'Amazfit',
    brand: 'Amazfit',
    category: 'watch',
    iconEmoji: '⚡',
    badgeColor: 'from-orange-500 to-red-700',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv'],
    description: 'Amazfit Balance, GTR & T-Rex Zepp OS bio-tracking ecosystem.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'xiaomi_smart_band',
    name: 'Xiaomi Smart Band',
    brand: 'Xiaomi',
    category: 'band',
    iconEmoji: '🟧',
    badgeColor: 'from-amber-600 to-orange-700',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep'],
    description: 'Xiaomi Smart Band 8/9 Pro lightweight continuous step & sleep monitor.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'oneplus_watch',
    name: 'OnePlus Watch',
    brand: 'OnePlus',
    category: 'watch',
    iconEmoji: '🔴',
    badgeColor: 'from-red-600 to-red-900',
    supportedPlatforms: ['Android', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv'],
    description: 'OnePlus Watch 2 dual-engine Wear OS precision activity monitor.',
    defaultProtocol: 'HealthConnect'
  },
  {
    id: 'huawei_watch',
    name: 'Huawei Watch',
    brand: 'Huawei',
    category: 'watch',
    iconEmoji: '🌸',
    badgeColor: 'from-rose-700 to-red-900',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv'],
    description: 'Huawei Watch GT 4 & Ultimate TruSeen 5.5+ cardiovascular monitoring.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'oppo_watch',
    name: 'OPPO Watch',
    brand: 'OPPO',
    category: 'watch',
    iconEmoji: '🟢',
    badgeColor: 'from-emerald-600 to-teal-800',
    supportedPlatforms: ['Android', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv'],
    description: 'OPPO Watch X with OHealth dual frequency cardiac telemetry.',
    defaultProtocol: 'HealthConnect'
  },
  {
    id: 'realme_watch',
    name: 'Realme Watch',
    brand: 'Realme',
    category: 'watch',
    iconEmoji: '🟡',
    badgeColor: 'from-yellow-500 to-amber-700',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep'],
    description: 'Realme Watch 3 Pro & S2 fitness biometric tracking.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'nothing_ecosystem',
    name: 'Nothing Health',
    brand: 'Nothing',
    category: 'watch',
    iconEmoji: '🚀',
    badgeColor: 'from-stone-700 to-black',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Nothing CMF Watch Pro & future Nothing OS dot-matrix bio-sensory ecosystem.',
    defaultProtocol: 'PluginDriver',
    isFutureReady: true
  },
  {
    id: 'polar',
    name: 'Polar',
    brand: 'Polar',
    category: 'watch',
    iconEmoji: '❄️',
    badgeColor: 'from-blue-700 to-cyan-900',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'recovery'],
    description: 'Polar Vantage V3 & H10 chest strap clinical-grade cardiac recovery telemetry.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'suunto',
    name: 'Suunto',
    brand: 'Suunto',
    category: 'watch',
    iconEmoji: '🧭',
    badgeColor: 'from-yellow-600 to-amber-800',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'recovery'],
    description: 'Suunto Race & Vertical outdoor expedition biometrics.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'withings',
    name: 'Withings ScanWatch',
    brand: 'Withings',
    category: 'watch',
    iconEmoji: '🤍',
    badgeColor: 'from-cyan-500 to-blue-600',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'weight', 'bloodPressure'],
    description: 'Withings ScanWatch 2 hybrid smartwatch with medical-grade ECG & body temp.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'oura_ring',
    name: 'Oura Ring',
    brand: 'Oura',
    category: 'ring',
    iconEmoji: '💍',
    badgeColor: 'from-slate-700 to-slate-900',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['sleep', 'hrv', 'recovery', 'heartRate'],
    description: 'Oura Ring Gen 3 titanium smart ring specialized in sleep staging & HRV.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'whoop',
    name: 'Whoop Strap 4.0',
    brand: 'Whoop',
    category: 'band',
    iconEmoji: '⬛',
    badgeColor: 'from-slate-800 to-black',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['hrv', 'recovery', 'sleep', 'calories', 'heartRate'],
    description: 'Whoop Strap 4.0 continuous strain, HRV & athletic recovery monitor.',
    defaultProtocol: 'OAuth2'
  },
  {
    id: 'smart_scale',
    name: 'Smart Weighing Scale',
    brand: 'Withings / Eufy / Garmin',
    category: 'scale',
    iconEmoji: '⚖️',
    badgeColor: 'from-cyan-600 to-slate-800',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['weight'],
    description: 'Smart wifi/BLE bio-impedance scales for weight & visceral fat tracking.',
    defaultProtocol: 'BLE_Direct'
  },
  {
    id: 'bp_monitor',
    name: 'Blood Pressure Monitor',
    brand: 'Omron / Withings',
    category: 'bp',
    iconEmoji: '🩺',
    badgeColor: 'from-indigo-600 to-purple-800',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['bloodPressure', 'heartRate'],
    description: 'Omron & Withings upper-arm wireless systolic/diastolic blood pressure cuff.',
    defaultProtocol: 'BLE_Direct'
  },
  {
    id: 'glucose_cgm',
    name: 'Continuous Glucose Monitor (CGM)',
    brand: 'Dexcom / FreeStyle Libre',
    category: 'cgm',
    iconEmoji: '🩸',
    badgeColor: 'from-emerald-500 to-cyan-800',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['glucose'],
    description: 'Dexcom G7 & FreeStyle Libre 3 real-time interstitial blood glucose sensor.',
    defaultProtocol: 'OAuth2',
    isFutureReady: true
  },
  {
    id: 'custom_plugin_driver',
    name: 'Custom Open Health Plugin Driver',
    brand: 'Plugin Architecture',
    category: 'plugin',
    iconEmoji: '🔌',
    badgeColor: 'from-cyan-500 to-slate-900',
    supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Desktop', 'Web'],
    metricsSupported: ['heartRate', 'steps', 'calories', 'sleep', 'hrv', 'weight', 'bloodPressure', 'glucose', 'recovery'],
    description: 'Universal REST / WebSockets / BLE driver extension loader for present and future devices.',
    defaultProtocol: 'PluginDriver',
    isFutureReady: true
  }
];

export interface AggregatedHealthMetrics {
  totalSteps: number;
  avgHeartRateBpm: number;
  totalActiveCalories: number;
  totalSleepHours: number;
  avgHrvMs: number;
  latestWeightKg?: number;
  latestBloodPressure?: { systolic: number; diastolic: number };
  latestGlucoseMgDl?: number;
  avgRecoveryScore?: number;
  avgStressLevel?: number;
  avgSpO2Percent?: number;
  totalWorkoutTimeMins?: number;
  latestBodyTempC?: number;
  totalDistanceKm?: number;
  avgReadinessScore?: number;
  syncedWaterMl?: number;
  activeDeviceCount: number;
  connectedBrands: string[];
  primarySource: string;
}

/**
 * Aggregates live health telemetry across ALL connected devices.
 */
export function aggregateHealthMetrics(wearables: WearableMetrics[]): AggregatedHealthMetrics {
  const connected = wearables.filter(w => w.connected);
  if (connected.length === 0) {
    return {
      totalSteps: 0,
      avgHeartRateBpm: 0,
      totalActiveCalories: 0,
      totalSleepHours: 0,
      avgHrvMs: 0,
      latestWeightKg: undefined,
      latestBloodPressure: undefined,
      latestGlucoseMgDl: undefined,
      avgRecoveryScore: undefined,
      avgStressLevel: undefined,
      avgSpO2Percent: undefined,
      totalWorkoutTimeMins: undefined,
      latestBodyTempC: undefined,
      totalDistanceKm: undefined,
      avgReadinessScore: undefined,
      syncedWaterMl: undefined,
      activeDeviceCount: 0,
      connectedBrands: [],
      primarySource: 'None'
    };
  }

  // Steps & Calories: max or sum depending on overlap
  const totalSteps = Math.max(...connected.map(w => w.steps || 0));
  const totalActiveCalories = Math.max(...connected.map(w => w.caloriesBurned || 0));

  // Heart Rate: average of non-zero active devices
  const hrDevices = connected.filter(w => w.heartRateBpm > 0);
  const avgHeartRateBpm = hrDevices.length > 0 
    ? Math.round(hrDevices.reduce((sum, w) => sum + w.heartRateBpm, 0) / hrDevices.length)
    : 0;

  // Sleep: max logged sleep hours
  const totalSleepHours = Math.max(...connected.map(w => w.sleepHours || 0));

  // HRV: average of non-zero HRV devices
  const hrvDevices = connected.filter(w => (w.hrvMs || 0) > 0);
  const avgHrvMs = hrvDevices.length > 0
    ? Math.round(hrvDevices.reduce((sum, w) => sum + (w.hrvMs || 0), 0) / hrvDevices.length)
    : undefined;

  // Weight: latest non-zero weight
  const weightDevice = connected.find(w => (w.weightKg || 0) > 0);
  const latestWeightKg = weightDevice ? weightDevice.weightKg : undefined;

  // BP
  const bpDevice = connected.find(w => w.bloodPressure && w.bloodPressure.systolic > 0);
  const latestBloodPressure = bpDevice ? bpDevice.bloodPressure : undefined;

  // Glucose
  const cgmDevice = connected.find(w => (w.glucoseMgDl || 0) > 0);
  const latestGlucoseMgDl = cgmDevice ? cgmDevice.glucoseMgDl : undefined;

  // Recovery & Readiness
  const recoveryDevices = connected.filter(w => (w.recoveryScore || 0) > 0);
  const avgRecoveryScore = recoveryDevices.length > 0
    ? Math.round(recoveryDevices.reduce((sum, w) => sum + (w.recoveryScore || 0), 0) / recoveryDevices.length)
    : undefined;

  const readinessDevices = connected.filter(w => (w.readinessScore || 0) > 0);
  const avgReadinessScore = readinessDevices.length > 0
    ? Math.round(readinessDevices.reduce((sum, w) => sum + (w.readinessScore || 0), 0) / readinessDevices.length)
    : undefined;

  // Stress & SpO2
  const stressDevices = connected.filter(w => (w.stressLevel || 0) > 0);
  const avgStressLevel = stressDevices.length > 0
    ? Math.round(stressDevices.reduce((sum, w) => sum + (w.stressLevel || 0), 0) / stressDevices.length)
    : undefined;

  const spo2Devices = connected.filter(w => (w.spO2Percent || 0) > 0);
  const avgSpO2Percent = spo2Devices.length > 0
    ? Math.round(spo2Devices.reduce((sum, w) => sum + (w.spO2Percent || 0), 0) / spo2Devices.length)
    : undefined;

  // Workout Time & Distance
  const workoutDevices = connected.filter(w => (w.workoutTimeMins || 0) > 0);
  const totalWorkoutTimeMins = workoutDevices.length > 0
    ? Math.max(...workoutDevices.map(w => w.workoutTimeMins || 0))
    : undefined;

  const distanceDevices = connected.filter(w => (w.distanceKm || 0) > 0);
  const totalDistanceKm = distanceDevices.length > 0
    ? Math.max(...distanceDevices.map(w => w.distanceKm || 0))
    : undefined;

  const tempDevice = connected.find(w => (w.bodyTempC || 0) > 0);
  const latestBodyTempC = tempDevice ? tempDevice.bodyTempC : undefined;

  const waterDevice = connected.find(w => (w.waterIntakeMl || 0) > 0);
  const syncedWaterMl = waterDevice ? waterDevice.waterIntakeMl : undefined;

  const connectedBrands = Array.from(new Set(connected.map(w => w.brand || w.device)));

  // P0-05: only devices that actually carry data count as active, so the AI
  // prompt is never told "LIVE TELEMETRY SYNCED" for connected-but-empty
  // devices.
  const dataDevices = connected.filter(
    w =>
      (w.steps || 0) > 0 ||
      (w.heartRateBpm || 0) > 0 ||
      (w.caloriesBurned || 0) > 0 ||
      (w.sleepHours || 0) > 0 ||
      (w.hrvMs || 0) > 0 ||
      (w.weightKg || 0) > 0 ||
      (w.glucoseMgDl || 0) > 0 ||
      (w.recoveryScore || 0) > 0,
  );

  return {
    totalSteps,
    avgHeartRateBpm,
    totalActiveCalories,
    totalSleepHours,
    avgHrvMs,
    latestWeightKg,
    latestBloodPressure,
    latestGlucoseMgDl,
    avgRecoveryScore,
    avgStressLevel,
    avgSpO2Percent,
    totalWorkoutTimeMins,
    latestBodyTempC,
    totalDistanceKm,
    avgReadinessScore,
    syncedWaterMl,
    activeDeviceCount: dataDevices.length,
    connectedBrands,
    primarySource: connectedBrands.join(' + ')
  };
}

/**
 * Dynamic Plugin Driver Registry for future devices
 */
export interface CustomDevicePlugin {
  id: string;
  name: string;
  brand: string;
  version: string;
  protocol: 'REST_Webhook' | 'BLE_Direct' | 'PluginDriver';
  endpointUrl?: string;
  apiKey?: string;
  supportedMetrics: string[];
  registeredAt: string;
}

const CUSTOM_DEVICE_PLUGINS_KEY = 'nutrimind_custom_device_plugins';

export function getRegisteredCustomPlugins(): CustomDevicePlugin[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DEVICE_PLUGINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function registerCustomDevicePlugin(plugin: Omit<CustomDevicePlugin, 'registeredAt'>): CustomDevicePlugin {
  const newPlugin: CustomDevicePlugin = {
    ...plugin,
    registeredAt: new Date().toISOString()
  };
  const current = getRegisteredCustomPlugins();
  const updated = [...current.filter(p => p.id !== plugin.id), newPlugin];
  try {
    localStorage.setItem(CUSTOM_DEVICE_PLUGINS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return newPlugin;
}
