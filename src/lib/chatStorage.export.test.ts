import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { exportThreadToPDF } from './chatStorage';
import type { ChatThread } from '../types';

/**
 * P0-08: exportThreadToPDF must build the print document with DOM APIs and
 * textContent ONLY. We drive the real function with a fake window/document
 * that has NO innerHTML / document.write support — if the implementation
 * ever regresses to unsafe string interpolation, this test fails hard.
 */

class FakeElement {
  tagName: string;
  className = '';
  children: FakeElement[] = [];
  private text = '';
  textSetViaTextContent = false;

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  get textContent(): string {
    return this.text;
  }
  set textContent(value: string) {
    this.text = String(value);
    this.textSetViaTextContent = true;
  }

  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }
}

const allElements: FakeElement[] = [];

function makeFakePrintWindow() {
  const print = vi.fn();
  const focus = vi.fn();
  const doc = {
    open: vi.fn(),
    close: vi.fn(),
    createElement: (tag: string) => {
      const el = new FakeElement(tag);
      allElements.push(el);
      return el;
    },
    appendChild: vi.fn(),
  };
  const printWindow = { document: doc, print, focus };
  globalThis.window = { open: () => printWindow } as unknown as Window & typeof globalThis;
  return { printWindow, doc, print, focus };
}

const maliciousTitle = '<script>alert(1)</script>';
const maliciousText = '<img src=x onerror=alert(2)> <b>bold</b> & "quoted"';

function buildThread(): ChatThread {
  return {
    id: 't-<script>id</script>',
    title: maliciousTitle,
    timestamp: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      { id: 'm1', sender: 'user', text: maliciousText, timestamp: new Date().toISOString() },
      { id: 'm2', sender: 'assistant', text: 'Safe assistant reply.', timestamp: new Date().toISOString() },
    ],
  };
}

describe('exportThreadToPDF (P0-08 XSS-safe DOM build)', () => {
  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).window;
    allElements.length = 0;
    vi.useRealTimers();
  });

  it('builds the document with DOM APIs and schedules print', () => {
    vi.useFakeTimers();
    const { doc, print, focus } = makeFakePrintWindow();

    exportThreadToPDF(buildThread());

    expect(doc.open).toHaveBeenCalled();
    expect(doc.appendChild).toHaveBeenCalled();
    expect(doc.close).toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(focus).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
  });

  it('renders a malicious title as literal text in the <title> element', () => {
    vi.useFakeTimers();
    makeFakePrintWindow();

    exportThreadToPDF(buildThread());

    const titleEl = allElements.find((el) => el.tagName === 'title');
    expect(titleEl).toBeDefined();
    expect(titleEl!.textContent).toContain(maliciousTitle);
    expect(titleEl!.textSetViaTextContent).toBe(true);
  });

  it('renders malicious message text as literal textContent, never as HTML', () => {
    vi.useFakeTimers();
    makeFakePrintWindow();

    exportThreadToPDF(buildThread());

    const textEls = allElements.filter((el) => el.className === 'text');
    expect(textEls.length).toBe(2);
    // The raw payload survives byte-for-byte as TEXT - if it had been
    // interpolated into an HTML string, the fake DOM (no innerHTML support)
    // would have thrown during the call.
    expect(textEls[0].textContent).toBe(maliciousText);
    expect(textEls[0].textSetViaTextContent).toBe(true);
  });

  it('never uses document.write or innerHTML', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/chatStorage.ts'), 'utf8');
    expect(source).not.toContain('document.write');
    expect(source).not.toContain('innerHTML');
    expect(source).not.toContain('insertAdjacentHTML');
  });
});
