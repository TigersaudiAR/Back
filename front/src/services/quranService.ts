/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 *
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 *
 * Features:
 * - localStorage caching with TTL (24 hours default)
 * - Automatic cache invalidation
 * - Retry logic for failed requests
 * - Environment variable configuration
 *
 * TODO: Future enhancement - migrate to IndexedDB for larger cache capacity
 * localStorage has ~5-10MB limit; IndexedDB can handle 50MB+ and structured data
 */

import axios from "axios";
import type { Surah, Ayah, Tafsir, QuranPage } from "../types/quran";

// Base URL for King Fahd Complex API - can be overridden via environment variable
const QURAN_BASE =
  import.meta.env.VITE_QURAN_BASE || "https://qurancomplex.gov.sa/quran-dev";
const QURAN_PROXY = import.meta.env.VITE_QURAN_PROXY; // Optional proxy for Netlify Functions

// Cache configuration
const CACHE_VERSION = "v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_PREFIX = `quran_cache_${CACHE_VERSION}_`;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple localStorage cache abstraction
 * TODO: Migrate to IndexedDB for production (better capacity, structured queries)
 */
class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = CACHE_PREFIX) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache entry is still valid
      if (now - entry.timestamp > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      console.error("Cache set error:", error);
      // If localStorage is full, try to clear old entries
      this.clearExpired();
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error("Cache remove error:", error);
    }
  }

  clearExpired(): void {
    try {
      const now = Date.now();
      const keysToCheck: string[] = [];

      // First, collect all keys that match our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToCheck.push(key);
        }
      }

      // Then, check and remove expired entries
      keysToCheck.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(item);
            if (now - entry.timestamp > entry.ttl) {
              localStorage.removeItem(key);
            }
          } catch {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error("Cache clearExpired error:", error);
    }
  }

  clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Cache clearAll error:", error);
    }
  }
}

const cache = new LocalStorageCache();

/**
 * Helper to build API URL (with optional proxy)
 */
function getApiUrl(endpoint: string): string {
  if (QURAN_PROXY) {
    return `${QURAN_PROXY}${endpoint}`;
  }
  return `${QURAN_BASE}${endpoint}`;
}

/**
 * الحصول على قائمة السور
 * Get list of all Surahs (chapters)
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = "chapters";

  // Try to get from cache first
  const cached = cache.get<Surah[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl("/chapters"));
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error("Error fetching chapters from Quran Complex:", error);
    throw error;
  }
}

/**
 * الحصول على قائمة السور (alias for getChapters)
 * Get list of all Surahs
 */
export const getSurahList = getChapters;

/**
 * الحصول على صفحة من المصحف
 * Get Quran page information (1-604)
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPage(pageNumber: number): Promise<QuranPage> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(
      `Invalid page number: ${pageNumber}. Must be between 1 and 604.`,
    );
  }

  const cacheKey = `page_${pageNumber}`;

  // Try to get from cache first
  const cached = cache.get<QuranPage>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl(`/page/${pageNumber}`));
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
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
      throw new Error(
        `Invalid surah ID: ${surahId}. Must be between 1 and 114.`,
      );
    }

    const cacheKey = `surah_${surahId}_ayat`;

    // Try to get from cache first
    const cached = cache.get<Ayah[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await axios.get(getApiUrl(`/surah/${surahId}`));
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching ayat for surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة
 * Get a specific Ayah
 * @param ayahId - معرف الآية (يمكن أن يكون رقم عالمي أو surah:ayah)
 */
export async function getAyah(ayahId: string | number): Promise<Ayah> {
  const cacheKey = `ayah_${ayahId}`;

  // Try to get from cache first
  const cached = cache.get<Ayah>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(getApiUrl(`/ayah/${ayahId}`));
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على التفسير لآية محددة
 * Get Tafsir for a specific Ayah
 * @param ayahId - معرف الآية
 * @param tafsirSource - مصدر التفسير (اختياري)
 */
export async function getTafsir(
  ayahId: string | number,
  tafsirSource?: string,
): Promise<Tafsir[]> {
  const cacheKey = `tafsir_${ayahId}_${tafsirSource || "default"}`;

  // Try to get from cache first
  const cached = cache.get<Tafsir[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(getApiUrl(`/ayah/${ayahId}/tafsir`), {
      params,
    });
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching tafsir for ayah ${ayahId}:`, error);
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
  tafsirSource?: string,
): Promise<Tafsir[]> {
  const cacheKey = `tafsir_surah_${surahId}_${tafsirSource || "default"}`;

  // Try to get from cache first
  const cached = cache.get<Tafsir[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(getApiUrl(`/surah/${surahId}/tafsir`), {
      params,
    });
    const data = response.data;

    // Cache the result
    cache.set(cacheKey, data);

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
  try {
    const response = await axios.get(getApiUrl("/search"), {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching Quran:", error);
    throw error;
  }
}

/**
 * الحصول على معلومات الصفحة (alias for getPage)
 * Get page information
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageAyat(pageNumber: number): Promise<Ayah[]> {
  return getPage(pageNumber);
}

/**
 * Get audio URLs for an ayah or page
 * @param identifier - ayah ID, surah:ayah, or page number
 * @param reciter - Optional reciter name (default: 'ar.mahermuaiqly')
 */
export async function getAudioUrls(
  identifier: string | number,
  reciter: string = "ar.mahermuaiqly",
): Promise<string[]> {
  try {
    // For now, construct audio URL using the Islamic Network CDN
    // This is a fallback pattern - actual API may provide direct links
    const baseUrl = "https://cdn.islamic.network/quran/audio/128";

    // If identifier is a page number, we'd need to get all ayat on that page
    if (typeof identifier === "number" && identifier <= 604) {
      // Fetch page data to get ayat - currently not used but available for future implementation
      await getPage(identifier);
      // TODO: Extract ayah IDs from page data and return corresponding audio URLs
      // For now, return a placeholder URL pattern
      return [`${baseUrl}/${reciter}/${identifier}.mp3`];
    }

    // For individual ayah
    return [`${baseUrl}/${reciter}/${identifier}.mp3`];
  } catch (error) {
    console.error(`Error getting audio URLs for ${identifier}:`, error);
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
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

/**
 * Clear cache utilities
 */
export function clearQuranCache(): void {
  cache.clearAll();
}

export function clearExpiredCache(): void {
  cache.clearExpired();
}

/**
 * Save last read position to localStorage
 */
export function saveLastRead(
  surahId: number,
  ayahNumber?: number,
  pageNumber?: number,
): void {
  try {
    const lastRead = {
      surahId,
      ayahNumber,
      pageNumber,
      timestamp: Date.now(),
    };
    localStorage.setItem("quran_last_read", JSON.stringify(lastRead));
  } catch (error) {
    console.error("Error saving last read position:", error);
  }
}

/**
 * Get last read position from localStorage
 */
export function getLastRead(): {
  surahId: number;
  ayahNumber?: number;
  pageNumber?: number;
} | null {
  try {
    const item = localStorage.getItem("quran_last_read");
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error("Error getting last read position:", error);
    return null;
  }
}
