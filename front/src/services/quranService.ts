/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir, AyahTiming } from '../types/quran';

// Base URL for King Fahd Complex API
const QURAN_COMPLEX_API = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';

// Cache configuration
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CACHE_PREFIX = 'quran_cache_';

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
 * Cache helper functions using localStorage
 * TODO: Migrate to IndexedDB for better performance with large datasets
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function getCached<T>(key: string): T | null {
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
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

/**
 * الحصول على قائمة السور مع التخزين المؤقت
 * Get list of all Chapters/Surahs with caching
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = 'chapters';
  const cached = getCached<Surah[]>(cacheKey);
  
  if (cached) return cached;

  try {
    const headers = QURAN_API_KEY ? { 'Authorization': `Bearer ${QURAN_API_KEY}` } : {};
    const response = await axios.get(`${QURAN_COMPLEX_API}/surahs`, { headers });
    const data = response.data;
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching chapters from Quran Complex:', error);
    throw error;
  }
}

/**
 * الحصول على معلومات صفحة محددة مع الآيات والإحداثيات
 * Get page information with ayat and bounding boxes
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPage(pageNumber: number): Promise<{
  page: number;
  ayat: Ayah[];
  boundingBoxes?: Array<{
    ayah_number: number;
    surah_id: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }

  const cacheKey = `page_${pageNumber}`;
  const cached = getCached<ReturnType<typeof getPage> extends Promise<infer T> ? T : never>(cacheKey);
  
  if (cached) return cached;

  try {
    const headers = QURAN_API_KEY ? { 'Authorization': `Bearer ${QURAN_API_KEY}` } : {};
    const response = await axios.get(`${QURAN_COMPLEX_API}/page/${pageNumber}`, { headers });
    const data = response.data;
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة بواسطة المعرف
 * Get a specific Ayah by ID
 * @param ayahId - معرف الآية الفريد
 */
export async function getAyahById(ayahId: string): Promise<Ayah> {
  const cacheKey = `ayah_${ayahId}`;
  const cached = getCached<Ayah>(cacheKey);
  
  if (cached) return cached;

  try {
    const headers = QURAN_API_KEY ? { 'Authorization': `Bearer ${QURAN_API_KEY}` } : {};
    const response = await axios.get(`${QURAN_COMPLEX_API}/ayah/${ayahId}`, { headers });
    const data = response.data;
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على روابط الصوت للآية أو الصفحة
 * Get audio URLs for ayah or page
 * @param params - معاملات الصوت
 */
export async function getAudioUrls(params: {
  ayahId?: string;
  pageNumber?: number;
  reciterId?: string;
}): Promise<{
  url: string;
  reciter: string;
  timings?: AyahTiming[];
}[]> {
  const { ayahId, pageNumber, reciterId } = params;
  
  try {
    const headers = QURAN_API_KEY ? { 'Authorization': `Bearer ${QURAN_API_KEY}` } : {};
    const queryParams = new URLSearchParams();
    
    if (ayahId) queryParams.set('ayah', ayahId);
    if (pageNumber) queryParams.set('page', pageNumber.toString());
    if (reciterId) queryParams.set('reciter', reciterId);
    
    const response = await axios.get(
      `${QURAN_COMPLEX_API}/audio?${queryParams.toString()}`,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching audio URLs:', error);
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
