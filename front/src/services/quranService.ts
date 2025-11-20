/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URL for King Fahd Complex API - can be overridden via env variable
const QURAN_BASE_URL = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_PROXY_URL = import.meta.env.VITE_QURAN_PROXY || '';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';

// Cache configuration
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CACHE_PREFIX = 'quran_cache_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Simple localStorage cache abstraction
 * TODO: Migrate to IndexedDB for better performance and larger storage capacity
 * Plan: Use idb library when cache size exceeds localStorage limits
 */
class QuranCache {
  private static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static get<T>(key: string): T | null {
    if (!this.isAvailable()) return null;
    
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache is still valid
      if (now - entry.timestamp > CACHE_TTL) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static set<T>(key: string, data: T): void {
    if (!this.isAvailable()) return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
      // If storage is full, try to clear old entries
      this.clearOldEntries();
    }
  }

  static remove(key: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static clearOldEntries(): void {
    if (!this.isAvailable()) return;
    
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item);
              if (now - entry.timestamp > CACHE_TTL) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  static clear(): void {
    if (!this.isAvailable()) return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

/**
 * Get the appropriate API URL (proxy or direct)
 */
function getApiUrl(endpoint: string): string {
  const baseUrl = QURAN_PROXY_URL || QURAN_BASE_URL;
  return `${baseUrl}${endpoint}`;
}

/**
 * Get axios config with API key if available
 */
function getAxiosConfig() {
  const config: any = {};
  if (QURAN_API_KEY) {
    config.headers = {
      'X-API-Key': QURAN_API_KEY,
    };
  }
  return config;
}

/**
 * الحصول على قائمة السور (متوافق مع الاسم الجديد)
 * Get list of all Surahs (chapters)
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = 'chapters';
  const cached = QuranCache.get<Surah[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Note: Actual endpoint depends on King Fahd Complex API structure
    const response = await axios.get(getApiUrl('/chapters'), getAxiosConfig());
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching chapters from Quran Complex:', error);
    throw error;
  }
}

/**
 * الحصول على قائمة السور (backward compatibility)
 * Get list of all Surahs
 */
export async function getSurahList(): Promise<Surah[]> {
  return getChapters();
}

/**
 * الحصول على روابط الصوت للآيات
 * Get audio URLs for ayahs
 * @param identifier - ayahId, pageNumber, or surahId
 * @param reciter - القارئ (اختياري، افتراضي: ماهر المعيقلي)
 */
export async function getAudioUrls(
  identifier: number | string,
  reciter: string = 'ar.mahermuaiqly'
): Promise<string[]> {
  const cacheKey = `audio_${identifier}_${reciter}`;
  const cached = QuranCache.get<string[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // For King Fahd Complex, construct audio URLs based on their CDN structure
    // This is a fallback implementation - adjust based on actual API
    const response = await axios.get(
      getApiUrl(`/audio/${identifier}`),
      {
        ...getAxiosConfig(),
        params: { reciter },
      }
    );
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching audio URLs for ${identifier}:`, error);
    // Fallback to CDN pattern if API doesn't provide audio URLs
    // Note: Adjust this pattern based on actual King Fahd Complex CDN structure
    const baseUrl = 'https://cdn.islamic.network/quran/audio/128';
    return [`${baseUrl}/${reciter}/${identifier}.mp3`];
  }
}

/**
 * الحصول على آيات سورة محددة
 * Get ayat for a specific Surah
 * @param surahId - رقم السورة (1-114)
 */
export async function getSurahAyat(surahId: number): Promise<Ayah[]> {
  // Validate surah ID
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
  }

  const cacheKey = `surah_${surahId}`;
  const cached = QuranCache.get<Ayah[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl(`/surah/${surahId}`), getAxiosConfig());
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ayat for surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة بمعرف الآية الفريد
 * Get a specific Ayah by unique ID
 * @param ayahId - معرف الآية الفريد
 */
export async function getAyah(ayahId: number | string): Promise<Ayah> {
  const cacheKey = `ayah_${ayahId}`;
  const cached = QuranCache.get<Ayah>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl(`/ayah/${ayahId}`), getAxiosConfig());
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة من سورة
 * Get a specific Ayah from a Surah
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 */
export async function getAyahBySurah(surahId: number, ayahNumber: number): Promise<Ayah> {
  const cacheKey = `ayah_${surahId}_${ayahNumber}`;
  const cached = QuranCache.get<Ayah>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(
      getApiUrl(`/surah/${surahId}/ayah/${ayahNumber}`),
      getAxiosConfig()
    );
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahNumber} from surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على التفسير لآية محددة
 * Get Tafsir for a specific Ayah
 * @param ayahId - معرف الآية أو رقم السورة
 * @param ayahNumber - رقم الآية (إذا تم تقديم رقم السورة)
 * @param tafsirSource - مصدر التفسير (اختياري)
 */
export async function getTafsir(
  ayahId: number | string,
  ayahNumber?: number,
  tafsirSource?: string
): Promise<Tafsir[]> {
  // Build cache key based on parameters
  const cacheKey = ayahNumber 
    ? `tafsir_${ayahId}_${ayahNumber}_${tafsirSource || 'default'}`
    : `tafsir_${ayahId}_${tafsirSource || 'default'}`;
  
  const cached = QuranCache.get<Tafsir[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    let endpoint: string;
    const params = tafsirSource ? { source: tafsirSource } : {};
    
    if (ayahNumber !== undefined) {
      // Using surahId and ayahNumber
      endpoint = `/surah/${ayahId}/ayah/${ayahNumber}/tafsir`;
    } else {
      // Using ayah ID
      endpoint = `/ayah/${ayahId}/tafsir`;
    }
    
    const response = await axios.get(getApiUrl(endpoint), {
      ...getAxiosConfig(),
      params,
    });
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching tafsir:`, error);
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
  const cacheKey = `surah_tafsir_${surahId}_${tafsirSource || 'default'}`;
  const cached = QuranCache.get<Tafsir[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(
      getApiUrl(`/surah/${surahId}/tafsir`),
      {
        ...getAxiosConfig(),
        params,
      }
    );
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
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
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cacheKey = `search_${query.trim()}`;
  const cached = QuranCache.get<Ayah[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl('/search'), {
      ...getAxiosConfig(),
      params: { q: query.trim() },
    });
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

/**
 * الحصول على صفحة من المصحف
 * Get a page from the Quran (1-604)
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPage(pageNumber: number): Promise<Ayah[]> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }

  const cacheKey = `page_${pageNumber}`;
  const cached = QuranCache.get<Ayah[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl(`/page/${pageNumber}`), getAxiosConfig());
    const data = response.data;
    QuranCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

/**
 * الحصول على معلومات الصفحة (backward compatibility)
 * Get page information
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageAyat(pageNumber: number): Promise<Ayah[]> {
  return getPage(pageNumber);
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
 * مسح ذاكرة التخزين المؤقت
 * Clear the cache
 */
export function clearCache(): void {
  QuranCache.clear();
}

/**
 * مسح المدخلات القديمة من ذاكرة التخزين المؤقت
 * Clear old cache entries
 */
export function cleanupCache(): void {
  QuranCache.clearOldEntries();
}

/**
 * الحصول على عنوان URL الأساسي للقرآن
 * Get the base URL for Quran resources (page images, etc.)
 */
export function getQuranBaseUrl(): string {
  return QURAN_BASE_URL;
}
