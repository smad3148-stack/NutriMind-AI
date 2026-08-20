import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * P0-11 contract test: hardcoded profile PII must never return. The codebase
 * previously shipped a real person's identity as built-in defaults: a
 * personal Gmail address (OTA attribution, demo transaction, payment modal),
 * real names, phone numbers, a date of birth, emergency contacts and family
 * members, plus a hidden coach-chat backdoor (handlePresetAcceptanceTests)
 * that answered "Mitrabha" queries with a scripted fake Gemini response
 * claiming to have "securely logged" that profile. This test greps the
 * actual source and fails if any of it reappears.
 *
 * Deliberate exception: the "Founder & Creator" attribution lines in
 * App.tsx and HamburgerMenu.tsx are authorship credits, not profile data.
 */

const SERVER = readFileSync(resolve(process.cwd(), 'server.ts'), 'utf8');
const CUSTOMER = readFileSync(resolve(process.cwd(), 'src/components/CustomerCompanion.tsx'), 'utf8');
const MODAL = readFileSync(resolve(process.cwd(), 'src/components/GlobalPaymentModal.tsx'), 'utf8');
const PROFILE = readFileSync(resolve(process.cwd(), 'src/components/EditProfileModal.tsx'), 'utf8');
const APP = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const HAMBURGER = readFileSync(resolve(process.cwd(), 'src/components/HamburgerMenu.tsx'), 'utf8');

const COMPONENTS_DIR = resolve(process.cwd(), 'src/components');
const LIB_DIR = resolve(process.cwd(), 'src/lib');
const scannedFiles: Record<string, string> = { 'server.ts': SERVER, 'src/App.tsx': APP };
for (const f of readdirSync(COMPONENTS_DIR)) {
  if (f.endsWith('.tsx') && !f.endsWith('.test.tsx')) {
    scannedFiles[`src/components/${f}`] = readFileSync(resolve(COMPONENTS_DIR, f), 'utf8');
  }
}
for (const f of readdirSync(LIB_DIR)) {
  if (f.endsWith('.ts') && !f.endsWith('.test.ts')) {
    scannedFiles[`src/lib/${f}`] = readFileSync(resolve(LIB_DIR, f), 'utf8');
  }
}

const BANNED_EVERYWHERE = [
  'ecovisionfilm',   // personal email (local part)
  '+918787642594',   // personal phone
  '+919862123456',   // emergency-contact phone
  '1998-05-14',      // personal date of birth
  'Utpal',           // personal name / nickname
  'Sunita',          // family member name
  'Aarav Deb',       // family member name
];

describe('P0-11: no hardcoded profile PII', () => {
  it('no personal email, phone, DOB, or family names anywhere in shipped source', () => {
    for (const [file, content] of Object.entries(scannedFiles)) {
      for (const banned of BANNED_EVERYWHERE) {
        expect(content.includes(banned), `${file} must not contain "${banned}"`).toBe(false);
      }
    }
  });

  it('personal name appears nowhere except the deliberate founder credits', () => {
    for (const [file, content] of Object.entries(scannedFiles)) {
      if (file === 'src/App.tsx' || file === 'src/components/HamburgerMenu.tsx') continue;
      expect(content.includes('Mitrabha'), `${file} must not contain the personal name`).toBe(false);
    }
    // The two exceptions are single founder-credit lines, not profile data.
    const appHits = APP.split('\n').filter(l => l.includes('Mitrabha'));
    expect(appHits.length).toBe(1);
    expect(appHits[0]).toContain('Founder & Creator');
    const menuHits = HAMBURGER.split('\n').filter(l => l.includes('Mitrabha'));
    expect(menuHits.length).toBe(1);
  });

  it('coach chat has no preset canned-response backdoor', () => {
    expect(SERVER).not.toContain('handlePresetAcceptanceTests');
    expect(SERVER).not.toContain('securely logged your profile');
  });

  it('OTA deploy/rollback are attributed to the verified admin identity, never a hardcoded person', () => {
    expect(SERVER).toContain("req.user?.email || deployedBy || 'admin'");
  });

  it('demo transaction seed carries no personal identity', () => {
    expect(SERVER).toContain("userEmail: 'demo.user@example.com'");
    expect(SERVER).toContain("userName: 'Demo User'");
  });

  it('client profile state starts empty instead of prefilled with personal data', () => {
    expect(CUSTOMER).toContain("const [profileName, setProfileName] = useState('');");
    expect(CUSTOMER).toContain("const [profilePhone, setProfilePhone] = useState('');");
    expect(CUSTOMER).not.toContain('userName="Mitrabha"');
    expect(CUSTOMER).not.toContain('userName="Utpal"');
    expect(MODAL).toContain("profileName = '',");
    expect(MODAL).toContain("profileEmail = '',");
  });

  it('profile editor has no prefilled personal or family data', () => {
    expect(PROFILE).toContain("useState<{ id: string; name: string; relation: string; goal: string }[]>([])");
    expect(PROFILE).not.toContain("relation: 'Son'");
    expect(PROFILE).not.toContain("relation: 'Spouse', goal");
  });
});
