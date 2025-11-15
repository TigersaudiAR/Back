import type { Ayah, Surah } from "../types/index.js";
import { getAyat, getSurahAyat, getSurahIndex } from "./dataService.js";

// API configuration - using a public Quran API
const API_BASE = "https://api.alquran.cloud/v1";

let cachedSurahIndex: Surah[] | null = null;
type CachedAyatEntry = {
  ayat: Ayah[];
  expiresAt: number | null;
};

const cachedAyat = new Map<number, CachedAyatEntry>();
const FALLBACK_TTL_MS = 5 * 60 * 1000;

export const FAILED_AYAT_RETRY_DELAY_MS = 60_000;

// Helper function to map API response to our Ayah type
function mapAyah(surahId: number, apiAyah: any): Ayah {
  return {
    surah_id: surahId,
    ayah_number: apiAyah.numberInSurah || apiAyah.number,
    text_ar: apiAyah.text || "",
    page: apiAyah.page,
    juz: apiAyah.juz,
    hizb: apiAyah.hizbQuarter
  };
}

export async function fetchSurahIndex(): Promise<{ surahs: Surah[]; fromCache: boolean }> {
  if (cachedSurahIndex) {
    return { surahs: cachedSurahIndex.map((item) => ({ ...item })), fromCache: true };
  }

  const surahs = getSurahIndex();
  cachedSurahIndex = surahs.map((item) => ({ ...item }));
  return { surahs: cachedSurahIndex.map((item) => ({ ...item })), fromCache: false };
}

export async function fetchSurahAyat(surahId: number): Promise<{ ayat: Ayah[]; fromCache: boolean }> {
  const cachedEntry = cachedAyat.get(surahId);
  if (cachedEntry) {
    if (cachedEntry.expiresAt && cachedEntry.expiresAt <= Date.now()) {
      cachedAyat.delete(surahId);
    } else {
      return { ayat: cachedEntry.ayat, fromCache: true };
    }
  }

  try {
    const response = await fetch(`${API_BASE}/surah/${surahId}/ar`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahId}: ${response.status}`);
    }
    const payload = await response.json();
    const verses = Array.isArray(payload?.data?.ayahs)
      ? payload.data.ayahs.map((item: any) => mapAyah(surahId, item))
      : [];
    if (!verses.length) {
      throw new Error("Empty ayah list from API");
    }
    cachedAyat.set(surahId, { ayat: verses, expiresAt: null });
    return { ayat: verses, fromCache: false };
  } catch (error) {
    console.error(`Remote surah ${surahId} failed`, error);
    const fallback = getAyat().filter((item) => item.surah_id === surahId);
    if (!fallback.length) {
      console.warn(`No local fallback for surah ${surahId}`);
      cachedAyat.delete(surahId);
      return { ayat: [], fromCache: true };
    }
    cachedAyat.set(surahId, {
      ayat: fallback,
      expiresAt: Date.now() + FALLBACK_TTL_MS
    });
    return { ayat: fallback, fromCache: true };
  }
}
