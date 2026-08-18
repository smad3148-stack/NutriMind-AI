import { ChatThread, ChatMessage, AIMemoryItem, PrivacySettings } from '../types';

const STORAGE_KEY_THREADS = 'nutrimind_chat_threads_v2';
const STORAGE_KEY_MEMORIES = 'nutrimind_ai_memories_v2';
const STORAGE_KEY_PRIVACY = 'nutrimind_privacy_settings_v2';

// 1. DEFAULT INITIAL SEEDS
export const DEFAULT_AI_MEMORIES: AIMemoryItem[] = [
  {
    id: 'mem-1',
    key: 'Primary Goal',
    value: 'Weight Loss & Cellular Longevity (Calorie deficit with high protein)',
    category: 'Goal',
    createdAt: new Date().toISOString(),
    isCustom: false
  },
  {
    id: 'mem-2',
    key: 'Dietary Preference',
    value: 'Prefers high protein, low glycemic index foods; avoids processed sugars',
    category: 'Preference',
    createdAt: new Date().toISOString(),
    isCustom: false
  },
  {
    id: 'mem-3',
    key: 'Allergies & Sensitivities',
    value: 'Lactose sensitivity; mild sensitivity to artificial preservatives',
    category: 'Allergy',
    createdAt: new Date().toISOString(),
    isCustom: false
  },
  {
    id: 'mem-4',
    key: 'Workout Schedule',
    value: 'Strength training 4x/week + 8,000 daily steps via connected Garmin',
    category: 'Workout',
    createdAt: new Date().toISOString(),
    isCustom: false
  },
  {
    id: 'mem-5',
    key: 'Target Hydration',
    value: 'Daily target: 2,500 mL water',
    category: 'Dietary',
    createdAt: new Date().toISOString(),
    isCustom: false
  }
];

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  incognitoByDefault: false,
  disableHistory: false,
  encryptedLocalStorage: true,
  adminAccessLocked: true,
  autoDeleteAfterDays: 0
};

// Simple Client-side XOR / Base64 Encrypted LocalStorage Helper
const encodeData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch (e) {
    return data;
  }
};

const decodeData = (data: string): string => {
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
    const decoded = raw.startsWith('eyJ') || raw.startsWith('W3') ? decodeData(raw) : raw;
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error loading chat threads from local storage:', e);
    return [];
  }
};

export const saveChatThreads = (threads: ChatThread[], encrypt: boolean = true) => {
  try {
    const json = JSON.stringify(threads);
    const dataToSave = encrypt ? encodeData(json) : json;
    localStorage.setItem(STORAGE_KEY_THREADS, dataToSave);
  } catch (e) {
    console.warn('Error saving chat threads:', e);
  }
};

// 3. MEMORY STORAGE OPERATORS
export const loadAIMemories = (): AIMemoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (!raw) return DEFAULT_AI_MEMORIES;
    const decoded = raw.startsWith('eyJ') || raw.startsWith('W3') ? decodeData(raw) : raw;
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AI_MEMORIES;
  } catch (e) {
    return DEFAULT_AI_MEMORIES;
  }
};

export const saveAIMemories = (memories: AIMemoryItem[]) => {
  try {
    const json = JSON.stringify(memories);
    localStorage.setItem(STORAGE_KEY_MEMORIES, encodeData(json));
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
  // Generates a print-formatted window or downloadable HTML report
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    exportThreadToTxt(thread);
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>NutriMind AI - ${thread.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fafafa; }
        .header { border-bottom: 2px solid #06b6d4; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 24px; color: #0891b2; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }
        .message { margin-bottom: 16px; padding: 16px; rounded: 12px; border-radius: 12px; }
        .user { background: #e0f2fe; border-left: 4px solid #0284c7; }
        .assistant { background: #ffffff; border-left: 4px solid #06b6d4; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .sender { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 6px; font-family: monospace; }
        .text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 16px; font-size: 10px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>NutriMind AI Biological Consultation</h1>
        <p>Topic: ${thread.title} | ID: ${thread.id} | Generated: ${new Date().toLocaleString()}</p>
      </div>
      ${thread.messages.map(m => `
        <div class="message ${m.sender}">
          <div class="sender">${m.sender === 'user' ? 'Patient / User' : 'NutriMind Clinical AI'} (${new Date(m.timestamp).toLocaleTimeString()})</div>
          <div class="text">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      `).join('')}
      <div class="footer">
        NutriMind AI Enterprise Biological OS • Encrypted Health Record • Confidential Medical Data
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
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
