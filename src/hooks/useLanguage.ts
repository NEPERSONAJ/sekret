import { create } from 'zustand';

type Language = 'en' | 'ru';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>((set) => ({
  language: 'ru',
  setLanguage: (lang) => set({ language: lang }),
}));