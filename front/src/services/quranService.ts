/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Environment variables with fallback to official API
const QURAN_BASE_URL = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';
const QURAN_PROXY_URL = import.meta.env.VITE_QURAN_PROXY || '';

// Base URL for King Fahd Complex API (backward compatibility)
const QURAN_COMPLEX_API = QURAN_BASE_URL;

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface PageMetadata {
  page: number;
  ayahs: Array<{
    surah: number;
    ayah: number;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

interface LastPosition {
  page?: number;
  surah?: number;
  ayah?: number;
  timestamp: number;
}

/**
 * localStorage cache helper with TTL
 * TODO: Migrate to IndexedDB for better performance with large images
 */
class LocalStorageCache {
  private prefix = 'quran_cache_';

  set<T>(key: string, data: T): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('localStorage cache write failed:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const age = Date.now() - item.timestamp;

      if (age > CACHE_TTL) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('localStorage cache read failed:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('localStorage cache remove failed:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('localStorage cache clear failed:', error);
    }
  }
}

const cache = new LocalStorageCache();

/**
 * الحصول على قائمة السور
 * Get list of all Surahs
 */
export async function getSurahList(): Promise<Surah[]> {
  try {
    // Note: The actual endpoint may vary. This is a placeholder structure
    // based on common API patterns. Adjust according to actual API documentation.
    const response = await axios.get(`${QURAN_COMPLEX_API}/surahs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching surah list from Quran Complex:', error);
    throw error;
  }
}

/**
 * الحصول على آيات سورة محددة
 * Get ayat for a specific Surah
 * @param surahId - رقم السورة (1-114)
 */
export async function getSurahAyat(surahId: number): Promise<Ayah[]> {
  try {
    // Validate surah ID
    if (surahId < 1 || surahId > 114) {
      throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
    }

    const response = await axios.get(`${QURAN_COMPLEX_API}/surah/${surahId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ayat for surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة
 * Get a specific Ayah
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 */
export async function getAyah(surahId: number, ayahNumber: number): Promise<Ayah> {
  try {
    const response = await axios.get(`${QURAN_COMPLEX_API}/surah/${surahId}/ayah/${ayahNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahNumber} from surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على التفسير لآية محددة
 * Get Tafsir for a specific Ayah
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 * @param tafsirSource - مصدر التفسير (اختياري)
 */
export async function getTafsir(
  surahId: number,
  ayahNumber: number,
  tafsirSource?: string
): Promise<Tafsir[]> {
  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(
      `${QURAN_COMPLEX_API}/surah/${surahId}/ayah/${ayahNumber}/tafsir`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching tafsir for ayah ${ayahNumber} from surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على التفسير لسورة كاملة
 * Get Tafsir for an entire Surah
 * @param surahId - رقم السورة
 * @param tafsirSource - مصدر التفسير (اختياري)
 */
export async function getSurahTafsir(
  surahId: number,
  tafsirSource?: string
): Promise<Tafsir[]> {
  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(
      `${QURAN_COMPLEX_API}/surah/${surahId}/tafsir`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching tafsir for surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * البحث في القرآن الكريم
 * Search in the Quran
 * @param query - نص البحث
 */
export async function searchQuran(query: string): Promise<Ayah[]> {
  try {
    const response = await axios.get(`${QURAN_COMPLEX_API}/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

/**
 * الحصول على معلومات الصفحة
 * Get page information
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageAyat(pageNumber: number): Promise<Ayah[]> {
  try {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
    }

    const response = await axios.get(`${QURAN_COMPLEX_API}/page/${pageNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

/**
 * Helper function للتعامل مع الأخطاء وإعادة المحاولة
 * Helper function to handle errors and retry
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

/**
 * الحصول على قائمة السور (alias for compatibility)
 * Get list of all chapters/surahs
 */
export async function getChapters(): Promise<Surah[]> {
  return getSurahList();
}

/**
 * الحصول على صورة الصفحة
 * Get page image URL from King Fahd Complex
 * @param pageNumber - رقم الصفحة (1-604)
 */
export function getPageImage(pageNumber: number): string {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }

  // King Fahd Complex page image pattern
  // Note: Adjust URL pattern based on actual API documentation
  const imageUrl = `${QURAN_BASE_URL}/images/pages/page${String(pageNumber).padStart(3, '0')}.png`;
  
  return imageUrl;
}

/**
 * الحصول على البيانات الوصفية للصفحة (مواضع الآيات)
 * Get page metadata including ayah bounding boxes
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageMeta(pageNumber: number): Promise<PageMetadata | null> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }

  const cacheKey = `page_meta_${pageNumber}`;
  const cached = cache.get<PageMetadata>(cacheKey);
  if (cached) return cached;

  try {
    // Note: Adjust endpoint based on actual API documentation
    const response = await axios.get(`${QURAN_COMPLEX_API}/pages/${pageNumber}/meta`);
    const metadata = response.data;
    cache.set(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.warn(`Page metadata not available for page ${pageNumber}:`, error);
    // Metadata may not be available for all pages
    return null;
  }
}

/**
 * الحصول على روابط الصوتيات
 * Get audio URLs for recitation
 * @param surahId - رقم السورة
 * @param reciterId - معرف القارئ (اختياري)
 */
export async function getAudioUrls(
  surahId: number,
  reciterId: string = 'ar.alafasy'
): Promise<string[]> {
  const cacheKey = `audio_${surahId}_${reciterId}`;
  const cached = cache.get<string[]>(cacheKey);
  if (cached) return cached;

  try {
    // King Fahd Complex audio pattern or CDN
    // Note: Adjust based on actual API documentation
    const response = await axios.get(`${QURAN_COMPLEX_API}/audio/${reciterId}/${surahId}`);
    const audioUrls = response.data;
    cache.set(cacheKey, audioUrls);
    return audioUrls;
  } catch (error) {
    console.warn(`Audio not available for surah ${surahId}:`, error);
    return [];
  }
}

/**
 * حفظ آخر موضع قراءة
 * Save last reading position to localStorage
 */
export function saveLastPosition(position: {
  page?: number;
  surah?: number;
  ayah?: number;
}): void {
  try {
    const data: LastPosition = {
      ...position,
      timestamp: Date.now()
    };
    localStorage.setItem('quran_last_position', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save last position:', error);
  }
}

/**
 * تحميل آخر موضع قراءة
 * Load last reading position from localStorage
 */
export function loadLastPosition(): LastPosition | null {
  try {
    const stored = localStorage.getItem('quran_last_position');
    if (!stored) return null;

    const position: LastPosition = JSON.parse(stored);
    return position;
  } catch (error) {
    console.warn('Failed to load last position:', error);
    return null;
  }
}

/**
 * مسح ذاكرة التخزين المؤقت
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}
