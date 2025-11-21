/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URL for King Fahd Complex API
const QURAN_COMPLEX_API = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';
const QURAN_PROXY = import.meta.env.VITE_QURAN_PROXY || '';

// Cache configuration
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CACHE_PREFIX = 'quran_cache_';

// Simple localStorage cache abstraction with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(getCacheKey(key));
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

function setInCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // TODO: Migrate to IndexedDB for larger storage capacity
  }
}

// Axios instance with API key if available
const apiClient = axios.create({
  baseURL: QURAN_PROXY || QURAN_COMPLEX_API,
  headers: QURAN_API_KEY ? { 'X-API-Key': QURAN_API_KEY } : {}
});

/**
 * الحصول على قائمة السور (Chapters)
 * Get list of all Surahs/Chapters
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = 'chapters';
  const cached = getFromCache<Surah[]>(cacheKey);
  if (cached) return cached;

  try {
    // Note: Adjust endpoint based on actual API documentation
    const response = await apiClient.get('/chapters');
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching chapters from Quran Complex:', error);
    throw error;
  }
}

/**
 * الحصول على قائمة السور
 * Get list of all Surahs
 */
export async function getSurahList(): Promise<Surah[]> {
  return getChapters();
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

    const cacheKey = `surah_${surahId}`;
    const cached = getFromCache<Ayah[]>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/surah/${surahId}`);
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
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
    const cacheKey = `ayah_${surahId}_${ayahNumber}`;
    const cached = getFromCache<Ayah>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/surah/${surahId}/ayah/${ayahNumber}`);
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
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
    const cacheKey = `tafsir_${surahId}_${ayahNumber}_${tafsirSource || 'default'}`;
    const cached = getFromCache<Tafsir[]>(cacheKey);
    if (cached) return cached;

    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await apiClient.get(
      `/surah/${surahId}/ayah/${ayahNumber}/tafsir`,
      { params }
    );
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
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
    const cacheKey = `surah_tafsir_${surahId}_${tafsirSource || 'default'}`;
    const cached = getFromCache<Tafsir[]>(cacheKey);
    if (cached) return cached;

    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await apiClient.get(
      `/surah/${surahId}/tafsir`,
      { params }
    );
    const data = response.data;
    setInCache(cacheKey, data);
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
    const response = await apiClient.get('/search', {
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

    const cacheKey = `page_${pageNumber}`;
    const cached = getFromCache<Ayah[]>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/page/${pageNumber}`);
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

/**
 * الحصول على صورة الصفحة
 * Get page image URL
 * @param pageNumber - رقم الصفحة (1-604)
 */
export function getPageImage(pageNumber: number): string {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  const baseUrl = QURAN_COMPLEX_API;
  const paddedPage = pageNumber.toString().padStart(3, '0');
  return `${baseUrl}/images/pages/page${paddedPage}.png`;
}

/**
 * الحصول على معلومات الصفحة (metadata)
 * Get page metadata (ayah bounding boxes, etc.)
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageMeta(pageNumber: number): Promise<any> {
  try {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
    }

    const cacheKey = `page_meta_${pageNumber}`;
    const cached = getFromCache<any>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/page/${pageNumber}/meta`);
    const data = response.data;
    setInCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching page metadata ${pageNumber}:`, error);
    // Return empty metadata if not available
    return { page: pageNumber, ayahs: [] };
  }
}

/**
 * الحصول على روابط الصوت للسورة
 * Get audio URLs for a surah
 * @param surahId - رقم السورة
 * @param reciterId - معرّف القارئ (اختياري، الافتراضي: المعيقلي)
 */
export function getAudioUrls(surahId: number, reciterId: string = 'ar.mahermuaiqly'): string[] {
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
  }
  
  // Base URL for audio from Islamic Network CDN
  const audioBaseUrl = 'https://cdn.islamic.network/quran/audio/128';
  const paddedSurah = surahId.toString().padStart(3, '0');
  
  // Return array with surah audio URL
  return [`${audioBaseUrl}/${reciterId}/${paddedSurah}.mp3`];
}

/**
 * حفظ آخر موضع قراءة
 * Save last reading position
 * @param pageNumber - رقم الصفحة
 * @param surahId - رقم السورة (اختياري)
 * @param ayahNumber - رقم الآية (اختياري)
 */
export function saveLastPosition(pageNumber: number, surahId?: number, ayahNumber?: number): void {
  try {
    const position = {
      page: pageNumber,
      surah: surahId,
      ayah: ayahNumber,
      timestamp: Date.now()
    };
    localStorage.setItem('quran_last_position', JSON.stringify(position));
  } catch (error) {
    console.error('Error saving last position:', error);
  }
}

/**
 * تحميل آخر موضع قراءة
 * Load last reading position
 * @returns {page, surah?, ayah?, timestamp} or null
 */
export function loadLastPosition(): { page: number; surah?: number; ayah?: number; timestamp: number } | null {
  try {
    const saved = localStorage.getItem('quran_last_position');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading last position:', error);
    return null;
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
