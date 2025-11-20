/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 * Implements caching with localStorage/IndexedDB for offline support
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URLs for Quran APIs
const QURAN_COMPLEX_API = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_FALLBACK = 'https://api.quran.com/api/v4';
const AUDIO_BASE_URL = 'https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly';

// Cache TTL (Time To Live) in milliseconds - 7 days
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Cache key prefix
const CACHE_PREFIX = 'quran_cache_';

/**
 * Cache interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Get data from cache
 */
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
}

/**
 * Save data to cache
 */
function saveToCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Error saving to cache:', error);
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached);
          if (now - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
}

/**
 * الحصول على قائمة السور
 * Get list of all Surahs (with caching)
 */
export async function getSurahList(): Promise<Surah[]> {
  const cacheKey = 'surah_list';
  
  // Try cache first
  const cached = getFromCache<Surah[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Try Quran.com API as it has better documentation
    const response = await axios.get(`${QURAN_API_FALLBACK}/chapters`);
    const surahs = response.data.chapters || response.data;
    
    // Save to cache
    saveToCache(cacheKey, surahs);
    return surahs;
  } catch (error) {
    console.error('Error fetching surah list:', error);
    throw error;
  }
}

/**
 * الحصول على آيات سورة محددة
 * Get ayat for a specific Surah (with caching)
 * @param surahId - رقم السورة (1-114)
 */
export async function getSurahAyat(surahId: number): Promise<Ayah[]> {
  // Validate surah ID
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
  }

  const cacheKey = `surah_${surahId}_ayat`;
  
  // Try cache first
  const cached = getFromCache<Ayah[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Use Quran.com API for verses with Uthmani text
    const response = await axios.get(
      `${QURAN_API_FALLBACK}/quran/verses/uthmani`,
      { params: { chapter_number: surahId } }
    );
    const ayat = response.data.verses || response.data;
    
    // Save to cache
    saveToCache(cacheKey, ayat);
    return ayat;
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
 * Get audio URL for a specific ayah
 * @param surahId - Surah number
 * @param ayahNumber - Ayah number
 * @param reciter - Reciter ID (default: ar.mahermuaiqly)
 */
export function getAyahAudioUrl(
  surahId: number,
  ayahNumber: number,
  reciter: string = 'ar.mahermuaiqly'
): string {
  // Calculate global ayah number (needed for some CDNs)
  // This is a simplified version - actual calculation would need ayah count per surah
  const globalAyahNumber = calculateGlobalAyahNumber(surahId, ayahNumber);
  return `${AUDIO_BASE_URL}/${globalAyahNumber}.mp3`;
}

/**
 * Calculate global ayah number from surah and ayah
 * TODO: Implement proper calculation based on ayah counts per surah
 */
function calculateGlobalAyahNumber(surahId: number, ayahNumber: number): number {
  // This is a placeholder - needs proper implementation with ayah counts
  return ayahNumber;
}

/**
 * Get page image URL
 * @param pageNumber - Page number (1-604)
 */
export function getPageImageUrl(pageNumber: number): string {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  
  const paddedPage = String(pageNumber).padStart(3, '0');
  return `https://quran-images.pages.dev/pages/page${paddedPage}.png`;
}

/**
 * Get page bounding boxes for ayah overlay
 * @param pageNumber - Page number (1-604)
 */
export async function getPageBoundingBoxes(pageNumber: number): Promise<any[]> {
  const cacheKey = `page_${pageNumber}_boxes`;
  
  // Try cache first
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // TODO: Implement actual API call when available
    // For now, return empty array with TODO notice
    console.log('TODO: Implement bounding box API integration');
    const boxes: any[] = [];
    
    // Save to cache
    saveToCache(cacheKey, boxes);
    return boxes;
  } catch (error) {
    console.error(`Error fetching bounding boxes for page ${pageNumber}:`, error);
    return [];
  }
}

/**
 * Save last read position to localStorage
 */
export function saveLastReadPosition(surah: number, ayah: number, page?: number): void {
  try {
    const position = { surah, ayah, page, timestamp: Date.now() };
    localStorage.setItem('quran_last_read_position', JSON.stringify(position));
  } catch (error) {
    console.warn('Error saving last read position:', error);
  }
}

/**
 * Get last read position from localStorage
 */
export function getLastReadPosition(): { surah: number; ayah: number; page?: number } | null {
  try {
    const saved = localStorage.getItem('quran_last_read_position');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Error getting last read position:', error);
    return null;
  }
}
