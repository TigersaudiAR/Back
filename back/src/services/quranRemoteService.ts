import type { Ayah, Surah } from "../types/index.js";
import { getAyat, getSurahIndex } from "./dataService.js";

const API_BASE = "https://api.alquran.cloud/v1";

let cachedSurahIndex: Surah[] | null = null;
const cachedAyat = new Map<number, Ayah[]>();
const failedAyatFetches = new Map<number, number>();

export const FAILED_AYAT_RETRY_DELAY_MS = 60_000;

function mapSurah(item: any): Surah {
  return {
    id: Number(item.number),
    name_ar: item.name,
    name_en: item.englishName,
    revelation_place: item.revelationType === "Medinan" ? "Medina" : "Mecca",
    ayah_count: Number(item.numberOfAyahs),
    bismillah_pre: item.number !== 1 && item.number !== 9
  };
}

function mapAyah(surahId: number, item: any): Ayah {
  return {
    surah_id: surahId,
    ayah_number: Number(item.numberInSurah),
    text_ar: item.text
  };
}

export async function fetchSurahIndex(): Promise<{ surahs: Surah[]; fromCache: boolean }> {
  if (cachedSurahIndex) {
    return { surahs: cachedSurahIndex, fromCache: true };
  }

  try {
    const response = await fetch(`${API_BASE}/surah`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah index: ${response.status}`);
    }
    const payload = await response.json();
    const surahs = Array.isArray(payload?.data) ? payload.data.map(mapSurah) : [];
    if (!surahs.length) {
      throw new Error("Empty surah list from API");
    }
    cachedSurahIndex = surahs;
    return { surahs, fromCache: false };
  } catch (error) {
    console.error("Remote surah index failed", error);
    const fallback = getSurahIndex();
    cachedSurahIndex = fallback;
    return { surahs: fallback, fromCache: true };
  }
}

export async function fetchSurahAyat(
  surahId: number
): Promise<{ ayat: Ayah[]; fromCache: boolean }> {
  if (cachedAyat.has(surahId)) {
    return { ayat: cachedAyat.get(surahId)! as Ayah[], fromCache: true };
  }

  const lastFailure = failedAyatFetches.get(surahId);
  if (typeof lastFailure === "number") {
    const elapsed = Date.now() - lastFailure;
    if (elapsed < FAILED_AYAT_RETRY_DELAY_MS) {
      return { ayat: [], fromCache: true };
    }
    failedAyatFetches.delete(surahId);
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
    cachedAyat.set(surahId, verses);
    failedAyatFetches.delete(surahId);
    return { ayat: verses, fromCache: false };
  } catch (error) {
    console.error(`Remote surah ${surahId} failed`, error);
    const fallback = getAyat().filter((item) => item.surah_id === surahId);
    if (!fallback.length) {
      console.warn(`No local fallback for surah ${surahId}`);
      failedAyatFetches.set(surahId, Date.now());
      return { ayat: [], fromCache: true };
    }
    cachedAyat.set(surahId, fallback);
    failedAyatFetches.delete(surahId);
    return { ayat: fallback, fromCache: true };
  }
}
