import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * P0-05 contract test: fabricated biometrics and telemetry must never
 * return. Previously the app invented health data (72 BPM / 9,480 steps on
 * device connect, bio-age = age − 3.8, BP 118/76, glucose 92 mg/dL,
 * hardcoded scores and reports) and fed it to the AI coach as "LIVE
 * TELEMETRY". This test greps the actual source files for the removed
 * fabrication patterns and fails if any reappears.
 */

const FILES = [
  'server.ts',
  'src/components/AIHealthTwin.tsx',
  'src/components/CustomerCompanion.tsx',
  'src/components/ScoreCardsCarousel.tsx',
  'src/components/AIHub.tsx',
  'src/components/CleanHomeDashboard.tsx',
  'src/components/ReportsPanel.tsx',
  'src/components/ReportsScreen.tsx',
  'src/components/DeviceEcosystemManager.tsx',
  'src/lib/wearableEcosystem.ts',
];

// High-confidence strings that only ever existed as fabricated telemetry.
const FORBIDDEN_PATTERNS = [
  'steps = 9480',
  'updateData.steps = 9480',
  'heartRateBpm = 72',
  'heart_rate_bpm = 72',
  "device.steps = 9480",
  '118/76',
  'Live health telemetry streaming active',
  '21 Wearables Synced',
  'userAge - 3.8',
  'currentBMI = 21.5',
  'Last Synced: 2 Minutes Ago',
  'Top 5% Cohort',
  "'7.8h'",
  "'9,480'",
  "'520 kcal'",
  "'62 BPM'",
  "'420 kcal'",
  "'72.5 kg'",
  "'7.4 hrs'",
];

describe('P0-05: no fabricated biometrics in source', () => {
  for (const file of FILES) {
    it(`${file} contains no fabricated telemetry patterns`, () => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      const hits = FORBIDDEN_PATTERNS.filter((p) => source.includes(p));
      expect(hits, `fabricated patterns found in ${file}: ${hits.join(', ')}`).toEqual([]);
    });
  }
});
