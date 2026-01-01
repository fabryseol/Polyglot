export enum View {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  TRANSLATOR_PREVIEW = 'TRANSLATOR_PREVIEW',
  SLUG_MANAGER = 'SLUG_MANAGER',
  EXPORT = 'EXPORT'
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface SlugRule {
  id: string;
  original: string;
  translated: string;
  lang: string;
}

export interface AppConfig {
  apiKey: string;
  defaultLang: string;
  targetLangs: Language[];
  slugRules: SlugRule[];
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];