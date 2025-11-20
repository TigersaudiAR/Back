/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir, Recitation } from '../types/quran';
import { getCached, setCached } from './quranCache';

// Base URL for King Fahd Complex API - configurable via environment
const QURAN_COMPLEX_API = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';
const QURAN_PROXY = import.meta.env.VITE_QURAN_PROXY || '';

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  CHAPTERS: 30 * 24 * 60 * 60 * 1000, // 30 days
  PAGE: 7 * 24 * 60 * 60 * 1000,      // 7 days
  AYAH: 7 * 24 * 60 * 60 * 1000,      // 7 days
  TAFSIR: 7 * 24 * 60 * 60 * 1000,    // 7 days
  AUDIO: 24 * 60 * 60 * 1000,         // 1 day
};

/**
 * Get API base URL (use proxy if configured)
 */
function getApiBase(): string {
  return QURAN_PROXY || QURAN_COMPLEX_API;
}

/**
 * Get request headers
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (QURAN_API_KEY) {
    headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
  }
  
  return headers;
}

/**
 * الحصول على قائمة السور (Chapters)
 * Get list of all Surahs/Chapters
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = 'chapters';
  
  // Try cache first
  const cached = await getCached<Surah[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await axios.get(`${getApiBase()}/surahs`, {
      headers: getHeaders(),
    });
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.CHAPTERS);
    
    return data;
  } catch (error) {
    console.error('Error fetching chapters from Quran Complex:', error);
    throw error;
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
  
  const cacheKey = `surah_ayat_${surahId}`;
  
  // Try cache first
  const cached = await getCached<Ayah[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${getApiBase()}/surah/${surahId}`, {
      headers: getHeaders(),
    });
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.AYAH);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ayat for surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة
 * Get a specific Ayah
 * @param ayahId - معرف الآية أو (surahId, ayahNumber)
 */
export async function getAyah(surahId: number, ayahNumber: number): Promise<Ayah>;
export async function getAyah(ayahId: string): Promise<Ayah>;
export async function getAyah(
  surahIdOrAyahId: number | string,
  ayahNumber?: number
): Promise<Ayah> {
  let surahId: number;
  let ayahNum: number;
  let cacheKey: string;
  
  if (typeof surahIdOrAyahId === 'string') {
    cacheKey = `ayah_${surahIdOrAyahId}`;
    // Parse ayahId format like "1:1" or "1-1"
    const parts = surahIdOrAyahId.split(/[:-]/);
    surahId = parseInt(parts[0], 10);
    ayahNum = parseInt(parts[1], 10);
  } else {
    surahId = surahIdOrAyahId;
    ayahNum = ayahNumber!;
    cacheKey = `ayah_${surahId}_${ayahNum}`;
  }
  
  // Try cache first
  const cached = await getCached<Ayah>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await axios.get(
      `${getApiBase()}/surah/${surahId}/ayah/${ayahNum}`,
      { headers: getHeaders() }
    );
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.AYAH);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahNum} from surah ${surahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على التفسير لآية محددة
 * Get Tafsir for a specific Ayah
 * @param ayahId - معرف الآية أو (surahId, ayahNumber)
 * @param tafsirSource - مصدر التفسير (اختياري)
 */
export async function getTafsir(
  surahIdOrAyahId: number | string,
  ayahNumberOrSource?: number | string,
  tafsirSource?: string
): Promise<Tafsir[]> {
  let surahId: number;
  let ayahNum: number;
  let source: string | undefined;
  let cacheKey: string;
  
  if (typeof surahIdOrAyahId === 'string') {
    // Parse ayahId format
    const parts = surahIdOrAyahId.split(/[:-]/);
    surahId = parseInt(parts[0], 10);
    ayahNum = parseInt(parts[1], 10);
    source = typeof ayahNumberOrSource === 'string' ? ayahNumberOrSource : undefined;
    cacheKey = `tafsir_${surahIdOrAyahId}_${source || 'default'}`;
  } else {
    surahId = surahIdOrAyahId;
    ayahNum = ayahNumberOrSource as number;
    source = tafsirSource;
    cacheKey = `tafsir_${surahId}_${ayahNum}_${source || 'default'}`;
  }
  
  // Try cache first
  const cached = await getCached<Tafsir[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const params = source ? { source } : {};
    const response = await axios.get(
      `${getApiBase()}/surah/${surahId}/ayah/${ayahNum}/tafsir`,
      { params, headers: getHeaders() }
    );
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.TAFSIR);
    
    return data;
  } catch (error) {
    console.error(`Error fetching tafsir for ayah ${ayahNum} from surah ${surahId}:`, error);
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
  
  // Try cache first
  const cached = await getCached<Tafsir[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const params = tafsirSource ? { source: tafsirSource } : {};
    const response = await axios.get(
      `${getApiBase()}/surah/${surahId}/tafsir`,
      { params, headers: getHeaders() }
    );
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.TAFSIR);
    
    return data;
  } catch (error) {
    console.error(`Error fetching tafsir for surah ${surahId}:`, error);
    throw error;
  }
}

// Legacy export for backwards compatibility
export const getSurahList = getChapters;

/**
 * البحث في القرآن الكريم
 * Search in the Quran
 * @param query - نص البحث
 */
export async function searchQuran(query: string): Promise<Ayah[]> {
  try {
    const response = await axios.get(`${getApiBase()}/search`, {
      params: { q: query },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

/**
 * الحصول على روابط الصوت لآية أو صفحة
 * Get audio URLs for ayah or page
 */
export async function getAudioUrls(
  type: 'ayah' | 'page',
  id: string | number
): Promise<Recitation[]> {
  const cacheKey = `audio_${type}_${id}`;
  
  // Try cache first
  const cached = await getCached<Recitation[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    let endpoint: string;
    
    if (type === 'ayah') {
      // Parse ayah ID if string
      if (typeof id === 'string') {
        const parts = id.split(/[:-]/);
        const surahId = parts[0];
        const ayahNum = parts[1];
        endpoint = `${getApiBase()}/surah/${surahId}/ayah/${ayahNum}/audio`;
      } else {
        endpoint = `${getApiBase()}/ayah/${id}/audio`;
      }
    } else {
      endpoint = `${getApiBase()}/page/${id}/audio`;
    }
    
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
    });
    const data = response.data;
    
    // Cache the result
    await setCached(cacheKey, data, CACHE_TTL.AUDIO);
    
    return data;
  } catch (error) {
    console.warn(`Could not fetch audio for ${type} ${id}:`, error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * الحصول على معلومات الصفحة
 * Get page information and image URL
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPage(pageNumber: number): Promise<{
  pageNumber: number;
  imageUrl: string;
  ayat?: Ayah[];
}> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  
  const cacheKey = `page_${pageNumber}`;
  
  // Try cache first
  const cached = await getCached<{ pageNumber: number; imageUrl: string; ayat?: Ayah[] }>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    // Page image URL from Quran Complex
    const imageUrl = `${QURAN_COMPLEX_API}/images/page-${String(pageNumber).padStart(3, '0')}.png`;
    
    // Try to fetch ayat data for the page
    let ayat: Ayah[] | undefined;
    try {
      const response = await axios.get(`${getApiBase()}/page/${pageNumber}`, {
        headers: getHeaders(),
      });
      ayat = response.data;
    } catch (error) {
      console.warn(`Could not fetch ayat for page ${pageNumber}:`, error);
    }
    
    const pageData = {
      pageNumber,
      imageUrl,
      ayat,
    };
    
    // Cache the result
    await setCached(cacheKey, pageData, CACHE_TTL.PAGE);
    
    return pageData;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

export async function getPageAyat(pageNumber: number): Promise<Ayah[]> {
  const pageData = await getPage(pageNumber);
  return pageData.ayat || [];
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
