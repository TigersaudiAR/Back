/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URL for King Fahd Complex API
const QURAN_BASE = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_COMPLEX_API = QURAN_BASE;

// Constants
const TOTAL_QURAN_PAGES = 604;
const TOTAL_QURAN_AYAT = 6236;

// Cache TTL in milliseconds (default: 1 hour)
const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL) || 3600000;

// Cache prefix for localStorage keys
const CACHE_PREFIX = 'quran_cache_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Page metadata type for verse coordinates
 * Coordinates are relative to the page image dimensions
 */
interface PageMetadata {
  verses?: Array<{
    surah_id: number;
    ayah_number: number;
    ayah_id?: number;
    /** X coordinate (pixels, relative to image width) */
    x: number;
    /** Y coordinate (pixels, relative to image height) */
    y: number;
    /** Width of bounding box (pixels) */
    width: number;
    /** Height of bounding box (pixels) */
    height: number;
  }>;
  [key: string]: unknown;
}

/**
 * Last reading position data structure
 */
export interface LastPosition {
  pageNumber: number;
  surahId?: number;
  ayahNumber?: number;
  timestamp: number;
}

/**
 * Get data from localStorage cache
 */
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Save data to localStorage cache
 * Note: Silently fails if localStorage is full. Consider showing user notification
 * or implementing fallback strategy for production use.
 */
function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // Silently fail if localStorage is full or unavailable
    // TODO: Consider implementing user notification or fallback strategy
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
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

/**
 * الحصول على قائمة السور (مع التخزين المؤقت)
 * Get list of all Surahs (with caching)
 */
export async function getChapters(): Promise<Surah[]> {
  const cacheKey = 'chapters';
  
  // Try to get from cache first
  const cached = getFromCache<Surah[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Note: The actual endpoint may vary. This is a placeholder structure
    // based on common API patterns. Adjust according to actual API documentation.
    const response = await axios.get(`${QURAN_COMPLEX_API}/surahs`);
    const data = response.data;
    
    // Save to cache
    saveToCache(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching surah list from Quran Complex:', error);
    throw error;
  }
}

/**
 * الحصول على قائمة السور (اسم بديل للتوافق)
 * Get list of all Surahs (alias for compatibility)
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
 * الحصول على صورة صفحة المصحف
 * Get Quran page image URL
 * @param pageNumber - رقم الصفحة (1-604)
 */
export function getPageImage(pageNumber: number): string {
  if (pageNumber < 1 || pageNumber > TOTAL_QURAN_PAGES) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and ${TOTAL_QURAN_PAGES}.`);
  }

  const paddedNumber = String(pageNumber).padStart(3, '0');
  // Using the official Quran Complex image CDN or fallback
  return `${QURAN_BASE}/pages/${paddedNumber}.png`;
}

/**
 * الحصول على معلومات الصفحة (metadata)
 * Get page metadata including verse coordinates
 * @param pageNumber - رقم الصفحة (1-604)
 */
export async function getPageMeta(pageNumber: number): Promise<PageMetadata> {
  if (pageNumber < 1 || pageNumber > TOTAL_QURAN_PAGES) {
    throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and ${TOTAL_QURAN_PAGES}.`);
  }

  const cacheKey = `page_meta_${pageNumber}`;
  
  // Try cache first
  const cached = getFromCache<PageMetadata>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${QURAN_COMPLEX_API}/page/${pageNumber}/meta`);
    const data = response.data as PageMetadata;
    
    saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching metadata for page ${pageNumber}:`, error);
    throw error;
  }
}

/**
 * الحصول على آية محددة حسب ID العالمي
 * Get a specific Ayah by global ID
 * @param ayahId - معرّف الآية العالمي (1-6236)
 */
export async function getAyahById(ayahId: number): Promise<Ayah> {
  if (ayahId < 1 || ayahId > TOTAL_QURAN_AYAT) {
    throw new Error(`Invalid ayah ID: ${ayahId}. Must be between 1 and ${TOTAL_QURAN_AYAT}.`);
  }

  const cacheKey = `ayah_${ayahId}`;
  
  const cached = getFromCache<Ayah>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${QURAN_COMPLEX_API}/ayah/${ayahId}`);
    const data = response.data;
    
    saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahId}:`, error);
    throw error;
  }
}

/**
 * الحصول على روابط الصوت لتلاوة السورة أو الآية
 * Get audio URLs for recitation
 * 
 * NOTE: This function returns a URL template pattern.
 * For actual ayah audio, use `getAyahAudioUrl(surahId, ayahNumber)` instead.
 * 
 * @param surahId - رقم السورة
 * @param reciterId - معرّف القارئ (اختياري، افتراضي: ماهر المعيقلي)
 * @returns نمط URL للآية (يحتاج إلى رقم الآية)
 * @deprecated Use getAyahAudioUrl for direct audio URL generation
 */
export function getAudioUrls(surahId: number, reciterId: string = 'ar.mahermuaiqly'): string[] {
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid surah ID: ${surahId}. Must be between 1 and 114.`);
  }

  // Using Islamic Network CDN for audio
  const baseUrl = `https://cdn.islamic.network/quran/audio/128/${reciterId}`;
  
  // Return URL pattern - replace {ayahNumber} with actual ayah number
  // Better approach: Use getAyahAudioUrl(surahId, ayahNumber) instead
  return [`${baseUrl}/{ayahNumber}.mp3`];
}

/**
 * الحصول على رابط صوت آية محددة
 * Get audio URL for a specific ayah
 * 
 * NOTE: This is a simplified implementation using a direct URL pattern.
 * For production, consider implementing proper ayah numbering lookup
 * or using a more reliable audio URL generation method.
 * 
 * @param surahId - رقم السورة
 * @param ayahNumber - رقم الآية
 * @param reciterId - معرّف القارئ (اختياري)
 */
export function getAyahAudioUrl(
  surahId: number, 
  ayahNumber: number, 
  reciterId: string = 'ar.mahermuaiqly'
): string {
  // Calculate global ayah number
  // This is a simplified calculation. In production, use accurate ayah numbering
  // For now, use a direct URL pattern
  const baseUrl = `https://cdn.islamic.network/quran/audio/128/${reciterId}`;
  
  // Format: surahNumber:ayahNumber (e.g., 001001 for Al-Fatiha, ayah 1)
  const paddedSurah = String(surahId).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');
  
  return `${baseUrl}/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * NOTE: للترقية المستقبلية
 * TODO: Upgrade to IndexedDB for better storage capacity and performance
 * localStorage has size limitations (~5-10MB). For caching many pages,
 * consider migrating to IndexedDB which supports much larger storage.
 * 
 * يُنصح بالترقية إلى IndexedDB لاحقاً لدعم تخزين أكبر وأداء أفضل
 */

/**
 * حفظ آخر موضع قراءة
 * Save last reading position
 * @param pageNumber - رقم الصفحة
 * @param surahId - رقم السورة (اختياري)
 * @param ayahNumber - رقم الآية (اختياري)
 */
export function saveLastPosition(
  pageNumber: number,
  surahId?: number,
  ayahNumber?: number
): void {
  try {
    const position: LastPosition = {
      pageNumber,
      surahId,
      ayahNumber,
      timestamp: Date.now(),
    };
    localStorage.setItem('quran_last_position', JSON.stringify(position));
  } catch (error) {
    console.error('Error saving last position:', error);
  }
}

/**
 * استرجاع آخر موضع قراءة
 * Load last reading position
 * @returns آخر موضع قراءة أو null
 */
export function loadLastPosition(): LastPosition | null {
  try {
    const saved = localStorage.getItem('quran_last_position');
    if (!saved) return null;
    
    return JSON.parse(saved) as LastPosition;
  } catch (error) {
    console.error('Error loading last position:', error);
    return null;
  }
}
