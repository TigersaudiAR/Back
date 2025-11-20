/**
 * i18next Configuration
 *
 * Internationalization setup with Arabic as default language
 * Supports Arabic (ar) and English (en)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import ar from "./locales/ar.json";
import en from "./locales/en.json";

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      ar: {
        translation: ar,
      },
      en: {
        translation: en,
      },
    },
    lng: "ar", // Default language (Arabic)
    fallbackLng: "ar", // Fallback language

    interpolation: {
      escapeValue: false, // React already safes from XSS
    },

    // Optional: Add detection if needed
    // detection: {
    //   order: ['localStorage', 'navigator'],
    //   caches: ['localStorage'],
    // },
  });

export default i18n;
