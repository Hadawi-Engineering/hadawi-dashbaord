// i18n utility functions
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

export type Language = 'ar' | 'en';

export const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return the key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export const getAvailableLanguages = (): { code: Language; name: string; nativeName: string }[] => {
  return [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
