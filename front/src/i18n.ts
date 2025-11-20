/**
 * i18n Configuration
 * Internationalization setup with Arabic as default
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  ar: {
    translation: {
      // QuranReader UI strings
      'quran.back': 'رجوع',
      'quran.search': 'بحث',
      'quran.darkMode': 'الوضع الليلي',
      'quran.lightMode': 'الوضع النهاري',
      'quran.menu': 'القائمة',
      'quran.page': 'صفحة',
      'quran.next': 'التالي',
      'quran.previous': 'السابق',
      'quran.zoomIn': 'تكبير',
      'quran.zoomOut': 'تصغير',
      'quran.audio': 'تشغيل الصوت',
      'quran.comingSoon': 'قريباً',
      'quran.loading': 'جاري التحميل...',
      'quran.loadingPage': 'جاري تحميل الصفحة',
      'quran.error': 'حدث خطأ',
      'quran.retry': 'إعادة المحاولة',
      'quran.close': 'إغلاق',
      'quran.tafsir': 'التفسير',
      'quran.play': 'تشغيل',
      'quran.pause': 'إيقاف مؤقت',
      'quran.mute': 'كتم الصوت',
      'quran.unmute': 'إلغاء كتم الصوت',
      'quran.repeat': 'إعادة',
      'quran.skipBackward': 'رجوع 10 ثوان',
      'quran.skipForward': 'تقديم 10 ثوان',
      'quran.volume': 'مستوى الصوت',
      'quran.currentPosition': 'موضع التشغيل',
      
      // Search
      'search.title': 'البحث في القرآن الكريم',
      'search.placeholder': 'ابحث عن آية أو كلمة...',
      'search.noResults': 'لا توجد نتائج',
      'search.comingSoon': 'ميزة البحث قيد التطوير - قريباً إن شاء الله',
      
      // Common
      'common.holyQuran': 'القرآن الكريم',
      'common.surah': 'سورة',
      'common.ayah': 'آية',
      'common.juz': 'جزء',
      'common.hizb': 'حزب',
    },
  },
  en: {
    translation: {
      // QuranReader UI strings (English fallback)
      'quran.back': 'Back',
      'quran.search': 'Search',
      'quran.darkMode': 'Dark Mode',
      'quran.lightMode': 'Light Mode',
      'quran.menu': 'Menu',
      'quran.page': 'Page',
      'quran.next': 'Next',
      'quran.previous': 'Previous',
      'quran.zoomIn': 'Zoom In',
      'quran.zoomOut': 'Zoom Out',
      'quran.audio': 'Play Audio',
      'quran.comingSoon': 'Coming Soon',
      'quran.loading': 'Loading...',
      'quran.loadingPage': 'Loading page',
      'quran.error': 'Error occurred',
      'quran.retry': 'Retry',
      'quran.close': 'Close',
      'quran.tafsir': 'Tafsir',
      'quran.play': 'Play',
      'quran.pause': 'Pause',
      'quran.mute': 'Mute',
      'quran.unmute': 'Unmute',
      'quran.repeat': 'Repeat',
      'quran.skipBackward': 'Skip Backward 10s',
      'quran.skipForward': 'Skip Forward 10s',
      'quran.volume': 'Volume',
      'quran.currentPosition': 'Current Position',
      
      // Search
      'search.title': 'Search the Holy Quran',
      'search.placeholder': 'Search for ayah or word...',
      'search.noResults': 'No results found',
      'search.comingSoon': 'Search feature coming soon - Insha Allah',
      
      // Common
      'common.holyQuran': 'Holy Quran',
      'common.surah': 'Surah',
      'common.ayah': 'Ayah',
      'common.juz': 'Juz',
      'common.hizb': 'Hizb',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language is Arabic
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
