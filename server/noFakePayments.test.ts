import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * P0-06 contract test: fake payment flows must never return. Previously the
 * checkout endpoint returned success for any payload, the payment UI granted
 * premium on errors, missions and a dev button re-granted free access, and
 * isPremium defaulted to true. This test greps the actual source and fails
 * if any fabricated payment/unlock path reappears.
 */

const SERVER = readFileSync(resolve(process.cwd(), 'server.ts'), 'utf8');
const CUSTOMER = readFileSync(resolve(process.cwd(), 'src/components/CustomerCompanion.tsx'), 'utf8');
const PREMIUM = readFileSync(resolve(process.cwd(), 'src/components/PremiumPanel.tsx'), 'utf8');
const MODAL = readFileSync(resolve(process.cwd(), 'src/components/GlobalPaymentModal.tsx'), 'utf8');

describe('P0-06: no fake payment flows', () => {
  it('checkout endpoint never fabricates success and reports not-configured', () => {
    expect(SERVER).toContain('Payment system not configured.');
    expect(SERVER).toContain('res.status(503).json');
    // The checkout handler must not write fake transactions anymore.
    expect(SERVER).not.toContain('globalTransactionsStore.unshift');
  });

  it('premium is never granted by default on the client', () => {
    expect(CUSTOMER).toContain('const [isPremium, setIsPremium] = useState<boolean>(false);');
    expect(CUSTOMER).toContain("useState<'FREE' | 'PRO' | 'ELITE'>('FREE');");
    expect(CUSTOMER).not.toContain('const [isPremium, setIsPremium] = useState<boolean>(true);');
  });

  it('premium panel has no client-side unlock paths', () => {
    expect(PREMIUM).not.toContain('setIsPremium(true)');
    expect(PREMIUM).not.toContain('Reset 14-Day Free Access');
    expect(PREMIUM).not.toContain('Payment Successful! Welcome');
  });

  it('payment modal never fakes success on error and has no unbacked guarantees', () => {
    expect(MODAL).not.toContain('Fallback success for offline/test mode');
    expect(MODAL).not.toContain('Money Back');
    expect(MODAL).toContain("setStep('ERROR')");
  });
});
