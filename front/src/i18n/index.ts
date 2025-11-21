/**
 * i18n Configuration
 * إعدادات الترجمة متعددة اللغات
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: arTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: 'ar', // Default language - Arabic
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      // Disable Suspense to avoid loading delays in the UI
      // This means translations load immediately without waiting for React.Suspense
      // Consider enabling Suspense if you want to show loading states for i18n
      useSuspense: false,
    },
  });

export default i18n;
