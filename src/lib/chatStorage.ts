import { ChatThread, ChatMessage, AIMemoryItem, PrivacySettings } from '../types';

const STORAGE_KEY_THREADS = 'nutrimind_chat_threads_v2';
const STORAGE_KEY_MEMORIES = 'nutrimind_ai_memories_v2';
const STORAGE_KEY_PRIVACY = 'nutrimind_privacy_settings_v2';
const STORAGE_KEY_MEMORY_CONSENT = 'nutrimind_ai_memory_consent';

// P0-07: memory sharing with the AI requires explicit user consent.
// Default is OFF - memories (including Medical/Allergy entries) are never
// sent to the LLM until the user opts in.
export const getAiMemoryConsent = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY_MEMORY_CONSENT) === 'true';
  } catch (e) {
    return false;
  }
};

export const setAiMemoryConsent = (consent: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_MEMORY_CONSENT, consent ? 'true' : 'false');
  } catch (e) {
    console.warn('Error saving AI memory consent:', e);
  }
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  incognitoByDefault: false,
  disableHistory: false,
  adminAccessLocked: true,
  autoDeleteAfterDays: 0
};

// P0-07: storage is plaintext JSON in localStorage (per-browser). It is NOT
// encrypted - we never claim otherwise. decodeLegacyBase64 exists only to
// migrate data written by earlier builds that base64-obfuscated it; new
// writes are plaintext.
const decodeLegacyBase64 = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch (e) {
    return data;
  }
};

// 2. THREAD STORAGE OPERATORS
export const loadChatThreads = (): ChatThread[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THREADS);
    if (!raw) return [];
    const decoded = raw.startsWith('eyJ') || raw.startsWith('W3') ? decodeLegacyBase64(raw) : raw;
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error loading chat threads from local storage:', e);
    return [];
  }
};

export const saveChatThreads = (threads: ChatThread[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  } catch (e) {
    console.warn('Error saving chat threads:', e);
  }
};

// 3. MEMORY STORAGE OPERATORS
export const loadAIMemories = (): AIMemoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (!raw) return [];
    const decoded = raw.startsWith('eyJ') || raw.startsWith('W3') ? decodeLegacyBase64(raw) : raw;
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveAIMemories = (memories: AIMemoryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.warn('Error saving AI memories:', e);
  }
};

// 4. PRIVACY SETTINGS STORAGE OPERATORS
export const loadPrivacySettings = (): PrivacySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRIVACY);
    if (!raw) return DEFAULT_PRIVACY_SETTINGS;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PRIVACY_SETTINGS;
  }
};

export const savePrivacySettings = (settings: PrivacySettings) => {
  try {
    localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving privacy settings:', e);
  }
};

// 5. TIME GROUPING HELPER
export interface GroupedThreads {
  today: ChatThread[];
  yesterday: ChatThread[];
  last7Days: ChatThread[];
  last30Days: ChatThread[];
  older: ChatThread[];
  pinned: ChatThread[];
  archived: ChatThread[];
}

export const groupThreadsByTimePeriod = (threads: ChatThread[]): GroupedThreads => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 6 * 86400000;
  const startOf30Days = startOfToday - 29 * 86400000;

  const result: GroupedThreads = {
    today: [],
    yesterday: [],
    last7Days: [],
    last30Days: [],
    older: [],
    pinned: [],
    archived: []
  };

  threads.forEach(thread => {
    if (thread.archived) {
      result.archived.push(thread);
      return;
    }
    if (thread.pinned) {
      result.pinned.push(thread);
    }

    const tTime = new Date(thread.updatedAt || thread.timestamp).getTime();

    if (tTime >= startOfToday) {
      result.today.push(thread);
    } else if (tTime >= startOfYesterday) {
      result.yesterday.push(thread);
    } else if (tTime >= startOf7Days) {
      result.last7Days.push(thread);
    } else if (tTime >= startOf30Days) {
      result.last30Days.push(thread);
    } else {
      result.older.push(thread);
    }
  });

  return result;
};

// 6. EXPORT / SHARE HELPERS
export const exportThreadToTxt = (thread: ChatThread) => {
  let content = `NUTRIMIND AI - CLINICAL & METABOLIC CHAT REPORT\n`;
  content += `Title: ${thread.title}\n`;
  content += `Date: ${new Date(thread.timestamp).toLocaleString()}\n`;
  content += `Language: ${thread.language || 'English'}\n`;
  content += `--------------------------------------------------------\n\n`;

  thread.messages.forEach(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    const sender = msg.sender === 'user' ? 'USER' : 'NUTRIMIND AI';
    content += `[${time}] ${sender}:\n${msg.text}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NutriMind_Chat_${thread.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportThreadToPDF = (thread: ChatThread) => {
  // Generates a print-formatted window. P0-08: the document is built with
  // DOM APIs only — every user-controlled value (thread title, message text)
  // is assigned via textContent, which the browser treats as plain text.
  // No string-based document building is used, so a chat message containing
  // <script> or markup can never execute or alter the export layout.
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    exportThreadToTxt(thread);
    return;
  }

  const doc = printWindow.document;
  doc.open();

  const root = doc.createElement('html');

  const head = doc.createElement('head');
  const pageTitle = doc.createElement('title');
  pageTitle.textContent = `NutriMind AI - ${thread.title}`;
  head.appendChild(pageTitle);

  const style = doc.createElement('style');
  style.textContent = [
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fafafa; }',
    '.header { border-bottom: 2px solid #06b6d4; padding-bottom: 16px; margin-bottom: 24px; }',
    '.header h1 { margin: 0; font-size: 24px; color: #0891b2; }',
    '.header p { margin: 4px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }',
    '.message { margin-bottom: 16px; padding: 16px; border-radius: 12px; }',
    '.user { background: #e0f2fe; border-left: 4px solid #0284c7; }',
    '.assistant { background: #ffffff; border-left: 4px solid #06b6d4; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }',
    '.sender { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 6px; font-family: monospace; }',
    '.text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; }',
    '.footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 10px; color: #94a3b8; text-align: center; }',
  ].join('\n');
  head.appendChild(style);
  root.appendChild(head);

  const body = doc.createElement('body');

  const headerDiv = doc.createElement('div');
  headerDiv.className = 'header';
  const h1 = doc.createElement('h1');
  h1.textContent = 'NutriMind AI Biological Consultation';
  const headerP = doc.createElement('p');
  headerP.textContent = `Topic: ${thread.title} | ID: ${thread.id} | Generated: ${new Date().toLocaleString()}`;
  headerDiv.appendChild(h1);
  headerDiv.appendChild(headerP);
  body.appendChild(headerDiv);

  thread.messages.forEach((msg) => {
    const msgDiv = doc.createElement('div');
    msgDiv.className = `message ${msg.sender === 'user' ? 'user' : 'assistant'}`;

    const senderDiv = doc.createElement('div');
    senderDiv.className = 'sender';
    senderDiv.textContent = `${msg.sender === 'user' ? 'Patient / User' : 'NutriMind Clinical AI'} (${new Date(msg.timestamp).toLocaleTimeString()})`;
    msgDiv.appendChild(senderDiv);

    const textDiv = doc.createElement('div');
    textDiv.className = 'text';
    // textContent = auto-escaped plain text; a message containing <script>
    // or markup renders literally.
    textDiv.textContent = msg.text;
    msgDiv.appendChild(textDiv);

    body.appendChild(msgDiv);
  });

  const footerDiv = doc.createElement('div');
  footerDiv.className = 'footer';
  footerDiv.textContent =
    'NutriMind AI Enterprise Biological OS • Local export (not encrypted) • Contains personal data';
  body.appendChild(footerDiv);

  root.appendChild(body);
  doc.appendChild(root);
  doc.close();

  // Print once the print window has laid out (no inline scripts are used).
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 200);
};

export const exportAllDataJSON = (threads: ChatThread[], memories: AIMemoryItem[]) => {
  const payload = {
    app: 'NutriMind AI',
    version: '2027.2',
    exportDate: new Date().toISOString(),
    memories,
    threadsCount: threads.length,
    threads
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NutriMind_Full_Backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
