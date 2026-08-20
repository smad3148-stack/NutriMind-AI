import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * P0-07 contract test: false security claims must never return, and AI
 * memory sharing must stay behind explicit user consent (default off).
 */

const FILES = [
  'src/lib/chatStorage.ts',
  'src/components/ChatExportModal.tsx',
  'src/components/AIMemoryModal.tsx',
  'src/components/LifeOsSecondBrain.tsx',
  'src/App.tsx',
  'src/components/AIHealthTwin.tsx',
  'src/components/GlobalPaymentModal.tsx',
  'src/components/PremiumPanel.tsx',
  'src/types.ts',
  'src/components/CustomerCompanion.tsx',
];

// Strings that only ever existed as false security claims.
const FORBIDDEN_PATTERNS = [
  'AES-256',
  '256-Bit',
  'End-to-end encrypted',
  'ZERO ACCESS',
  'Secure Connection',
  'encryptedLocalStorage',
  'Encrypted Local',
  'encrypted client-side',
];

describe('P0-07: no false security claims', () => {
  for (const file of FILES) {
    it(`${file} contains no false security claims`, () => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      const hits = FORBIDDEN_PATTERNS.filter((p) => source.includes(p));
      expect(hits, `false claims found in ${file}: ${hits.join(', ')}`).toEqual([]);
    });
  }
});

describe('P0-07: honest storage', () => {
  const chatStorage = readFileSync(resolve(process.cwd(), 'src/lib/chatStorage.ts'), 'utf8');

  it('never base64-obfuscates as encryption on write', () => {
    expect(chatStorage).not.toContain('btoa');
    expect(chatStorage).not.toContain('encodeData');
  });

  it('does not inject fabricated default memories', () => {
    expect(chatStorage).not.toContain('DEFAULT_AI_MEMORIES');
  });

  it('labels storage honestly', () => {
    expect(chatStorage).toContain('not encrypted');
  });
});

describe('P0-07: AI memory consent gate (default off)', () => {
  const chatStorage = readFileSync(resolve(process.cwd(), 'src/lib/chatStorage.ts'), 'utf8');
  const customer = readFileSync(resolve(process.cwd(), 'src/components/CustomerCompanion.tsx'), 'utf8');

  it('exposes a consent flag that defaults to off', () => {
    expect(chatStorage).toContain('getAiMemoryConsent');
    expect(chatStorage).toContain('setAiMemoryConsent');
    expect(chatStorage).toContain("return localStorage.getItem(STORAGE_KEY_MEMORY_CONSENT) === 'true'");
  });

  it('gates memories before they are sent to the AI', () => {
    expect(customer).toContain('getAiMemoryConsent() ? aiMemories.map');
  });
});
