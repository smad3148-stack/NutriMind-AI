// Automatic Language Detection & Multi-Language Support Engine for NutriMind AI

export interface DetectedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<string, DetectedLanguage> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
};

export const detectLanguageFromText = (text: string): DetectedLanguage => {
  if (!text || text.trim().length === 0) return SUPPORTED_LANGUAGES.en;

  const sample = text.trim();

  // Devanagari (Hindi) range: \u0900-\u097F
  if (/[\u0900-\u097F]/.test(sample)) {
    return SUPPORTED_LANGUAGES.hi;
  }

  // Bengali range: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(sample)) {
    return SUPPORTED_LANGUAGES.bn;
  }

  // Japanese Kanji/Hiragana/Katakana: \u3040-\u30ff, \u3400-\u4dbf, \u4e00-\u9fff
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(sample) && /[\u3040-\u309f\u30a0-\u30ff]/.test(sample)) {
    return SUPPORTED_LANGUAGES.ja;
  }

  // Korean Hangul: \uac00-\ud7af
  if (/[\uac00-\ud7af]/.test(sample)) {
    return SUPPORTED_LANGUAGES.ko;
  }

  // Chinese Hanzi: \u4e00-\u9fff
  if (/[\u4e00-\u9fff]/.test(sample)) {
    return SUPPORTED_LANGUAGES.zh;
  }

  // Arabic range: \u0600-\u06FF
  if (/[\u0600-\u06FF]/.test(sample)) {
    return SUPPORTED_LANGUAGES.ar;
  }

  // Cyrillic (Russian) range: \u0400-\u04FF
  if (/[\u0400-\u04FF]/.test(sample)) {
    return SUPPORTED_LANGUAGES.ru;
  }

  // Latin character checks with specific language keywords
  const lower = sample.toLowerCase();
  if (/\b(que|como|para|hola|gracias|buenos|salud|dieta|nutricion)\b/.test(lower)) {
    return SUPPORTED_LANGUAGES.es;
  }
  if (/\b(bonjour|merci|comment|sante|manger|repas|proteines)\b/.test(lower)) {
    return SUPPORTED_LANGUAGES.fr;
  }
  if (/\b(hallo|danke|gesundheit|essen|kalorien|wie|fragen)\b/.test(lower)) {
    return SUPPORTED_LANGUAGES.de;
  }

  return SUPPORTED_LANGUAGES.en;
};

export const getLanguageSystemInstruction = (lang: DetectedLanguage): string => {
  if (lang.code === 'en') return '';
  return `[LANGUAGE REQUIREMENT: Respond in ${lang.name} (${lang.nativeName}). Use simple, natural, friendly, human-like language in fluent, warm ${lang.name}.]`;
};
