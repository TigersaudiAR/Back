/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URL for King Fahd Complex API - configurable via environment variable
const QURAN_COMPLEX_API = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = import.meta.env.VITE_QURAN_API_KEY || '';
const QURAN_PROXY = import.meta.env.VITE_QURAN_PROXY || '';

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// IndexedDB Schema
interface QuranDB extends DBSchema {
  'quran-cache': {
    key: string;
    value: {
      data: unknown;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<QuranDB>> | null = null;

/**
 * Initialize IndexedDB for caching
 */
async function getDB(): Promise<IDBPDatabase<QuranDB>> {
  if (!dbPromise) {
    dbPromise = openDB<QuranDB>('quran-alhuda-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('quran-cache')) {
          db.createObjectStore('quran-cache');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Get cached data from IndexedDB or localStorage fallback
 */
async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const cached = await db.get('quran-cache', key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    
    // Remove expired cache
    if (cached) {
      await db.delete('quran-cache', key);
    }
  } catch (error) {
    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.data as T;
        }
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }
  }
  
  return null;
}

/**
 * Set cached data in IndexedDB or localStorage fallback
 */
async function setCachedData<T>(key: string, data: T): Promise<void> {
  const cacheEntry = { data, timestamp: Date.now() };
  
  try {
    const db = await getDB();
    await db.put('quran-cache', cacheEntry, key);
  } catch (error) {
    // Fallback to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }
}

/**
 * Make API request with caching and retry logic
 */
async function fetchWithCache<T>(
  endpoint: string,
  cacheKey: string,
  options: { useProxy?: boolean; skipCache?: boolean } = {}
): Promise<T> {
  // Check cache first unless skipped
  if (!options.skipCache) {
    const cached = await getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Build URL - use proxy if configured and requested
  const baseUrl = (options.useProxy && QURAN_PROXY) ? QURAN_PROXY : QURAN_COMPLEX_API;
  const url = `${baseUrl}${endpoint}`;
  
  // Make request with retry
  const data = await fetchWithRetry<T>(async () => {
    const headers: Record<string, string> = {};
    if (QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
    }
    
    const response = await axios.get<T>(url, { headers });
    return response.data;
  });
  
  // Cache the result
  await setCachedData(cacheKey, data);
  
  return data;
}

/**
 * الحصول على قائمة السور
 * Get list of all Surahs
 */
export async function getSurahList(): Promise<Surah[]> {
  return fetchWithCache<Surah[]>('/surahs', 'surah-list');
}

/**
 * الحصول على آيات سورة محددة
 * Get ayat for a specific Surah
 * @param surahId - رقم السورة (1-114)
 */
export async function getSurahAyat(surahId: number): Promise<Ayah[]> {
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
  }
  
  return fetchWithCache<Ayah[]>(`/surah/${surahId}`, `surah-${surahId}-ayat`);
}

/**
 * الحصول على آية محددة
 * Get a specific Ayah
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 */
export async function getAyah(surahId: number, ayahNumber: number): Promise<Ayah> {
  return fetchWithCache<Ayah>(
    `/surah/${surahId}/ayah/${ayahNumber}`,
    `ayah-${surahId}-${ayahNumber}`
  );
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
  const endpoint = tafsirSource
    ? `/surah/${surahId}/ayah/${ayahNumber}/tafsir?source=${tafsirSource}`
    : `/surah/${surahId}/ayah/${ayahNumber}/tafsir`;
  
  const cacheKey = `tafsir-${surahId}-${ayahNumber}${tafsirSource ? `-${tafsirSource}` : ''}`;
  
  return fetchWithCache<Tafsir[]>(endpoint, cacheKey);
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
  const endpoint = tafsirSource
    ? `/surah/${surahId}/tafsir?source=${tafsirSource}`
    : `/surah/${surahId}/tafsir`;
  
  const cacheKey = `tafsir-surah-${surahId}${tafsirSource ? `-${tafsirSource}` : ''}`;
  
  return fetchWithCache<Tafsir[]>(endpoint, cacheKey);
}

/**
 * البحث في القرآن الكريم
 * Search in the Quran
 * @param query - نص البحث
 */
export async function searchQuran(query: string): Promise<Ayah[]> {
  // Search shouldn't be cached as it's dynamic
  const url = `${QURAN_COMPLEX_API}/search?q=${encodeURIComponent(query)}`;
  const headers: Record<string, string> = {};
  if (QURAN_API_KEY) {
    headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
  }
  
  const response = await axios.get<Ayah[]>(url, { headers });
  return response.data;
}

/**
 * الحصول على معلومات الصفحة
 * Get page information and ayat
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageAyat(pageNumber: number): Promise<Ayah[]> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  
  return fetchWithCache<Ayah[]>(`/page/${pageNumber}`, `page-${pageNumber}-ayat`);
}

/**
 * Get page image URL from King Fahd Complex
 * @param pageNumber - رقم الصفحة (1-604)
 */
export function getPageImageUrl(pageNumber: number): string {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  
  const paddedNumber = String(pageNumber).padStart(3, '0');
  // Use official King Fahd Complex page images or fallback
  return `https://quran-images.pages.dev/pages/${paddedNumber}.png`;
}

/**
 * Get bounding box coordinates for ayat on a page
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageCoordinates(pageNumber: number): Promise<{
  page: number;
  verses: Array<{
    surah_id: number;
    ayah_number: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and 604.`);
  }
  
  // Try to get from backend API first, fallback to empty if not available
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const response = await axios.get(`${apiBase}/api/quran-pages/${pageNumber}/coords`);
    return response.data;
  } catch (error) {
    console.warn(`Coordinates not available for page ${pageNumber}`);
    return { page: pageNumber, verses: [] };
  }
}

/**
 * Get audio URL for ayah recitation
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 * @param reciterId - معرف القارئ (default: ar.mahermuaiqly)
 */
export function getAyahAudioUrl(
  surahId: number,
  ayahNumber: number,
  reciterId: string = 'ar.mahermuaiqly'
): string {
  // Calculate global ayah number for audio file naming
  // This is a simplified version - actual implementation may need ayah index mapping
  const globalAyahNumber = calculateGlobalAyahNumber(surahId, ayahNumber);
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
}

/**
 * Helper to calculate global ayah number (simplified)
 */
function calculateGlobalAyahNumber(surahId: number, ayahNumber: number): number {
  // Ayah counts for each surah (1-114)
  const ayahCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
    89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
    12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
    30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
  ];
  
  let globalNumber = 0;
  for (let i = 0; i < surahId - 1; i++) {
    globalNumber += ayahCounts[i];
  }
  globalNumber += ayahNumber;
  
  return globalNumber;
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
