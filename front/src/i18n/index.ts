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
      // Disable Suspense because translations are bundled and synchronously available.
      // There is no async loading, so Suspense is not needed.
      // Consider enabling Suspense if you switch to async loading and want to show loading states for i18n.
      useSuspense: false,
    },
  });

export default i18n;
