/**
 * خدمة API لمجمع الملك فهد لطباعة المصحف الشريف
 * King Fahd Glorious Quran Printing Complex API Service
 * 
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import axios from 'axios';
import type { Surah, Ayah, Tafsir } from '../types/quran';

// Base URL for King Fahd Complex API
const QURAN_COMPLEX_API = 'https://qurancomplex.gov.sa/quran-dev';

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
