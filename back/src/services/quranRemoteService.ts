import type { Ayah, Surah } from "../types/index.js";
import { ensureSurahListSlugs } from "../utils/surah.js";
import { getAyat, getSurahIndex } from "./dataService.js";

const ALQURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_COM_API_BASE = "https://api.quran.com/api/v4";

let cachedSurahIndex: Surah[] | null = null;
const cachedAyat = new Map<number, Ayah[]>();

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

function mapQuranComAyah(surahId: number, item: any): Ayah {
  const verseKey = typeof item.verse_key === "string" ? item.verse_key : "";
  const [, versePart] = verseKey.split(":");
  const ayahNumber = Number(versePart ?? item.verse_number ?? 0);

  const candidates = [
    item.text_uthmani,
    item.text_uthmani_simple,
    item.text_indopak,
    item.text_madani,
    item.text_imlaei,
    item.text_qpc_hafs,
    item.text
  ];

  const text = candidates.find((value) => typeof value === "string" && value.trim().length > 0);

  return {
    surah_id: surahId,
    ayah_number: ayahNumber,
    text_ar: typeof text === "string" ? text : "",
    page: typeof item.page_number === "number" ? item.page_number : undefined,
    juz: typeof item.juz_number === "number" ? item.juz_number : undefined,
    hizb: typeof item.hizb_number === "number" ? item.hizb_number : undefined
  };
}

async function fetchQuranComAyat(surahId: number): Promise<Ayah[]> {
  const response = await fetch(`${QURAN_COM_API_BASE}/quran/verses/uthmani?chapter_number=${surahId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch verses from quran.com: ${response.status}`);
  }

  const payload = await response.json();
  const rawVerses = Array.isArray(payload?.verses) ? payload.verses : [];
  const verses = rawVerses
    .map((item: any) => mapQuranComAyah(surahId, item))
    .filter((verse: Ayah) => verse.ayah_number > 0 && verse.text_ar.trim().length > 0);

  if (!verses.length) {
    throw new Error("quran.com did not return any verses");
  }

  return verses;
}

export async function fetchSurahIndex(): Promise<{ surahs: Surah[]; fromCache: boolean }> {
  if (cachedSurahIndex) {
    return { surahs: cachedSurahIndex, fromCache: true };
  }

  try {
    const response = await fetch(`${ALQURAN_API_BASE}/surah`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah index: ${response.status}`);
    }
    const payload = await response.json();
    const surahs = Array.isArray(payload?.data) ? payload.data.map(mapSurah) : [];
    if (!surahs.length) {
      throw new Error("Empty surah list from API");
    }
    const normalized = ensureSurahListSlugs(surahs);
    cachedSurahIndex = normalized;
    return { surahs: normalized, fromCache: false };
  } catch (error) {
    console.error("Remote surah index failed", error);
    const fallback = ensureSurahListSlugs(getSurahIndex());
    cachedSurahIndex = fallback;
    return { surahs: fallback, fromCache: true };
  }
}

export async function fetchSurahAyat(surahId: number): Promise<{ ayat: Ayah[]; fromCache: boolean }> {
  const cached = cachedAyat.get(surahId);
  if (cached?.length) {
    return { ayat: cached, fromCache: true };
  }

  try {
    try {
      const verses = await fetchQuranComAyat(surahId);
      cachedAyat.set(surahId, verses);
      return { ayat: verses, fromCache: false };
    } catch (quranComError) {
      console.error(`quran.com verses for surah ${surahId} failed`, quranComError);
    }

    const response = await fetch(`${ALQURAN_API_BASE}/surah/${surahId}`);
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
    return { ayat: verses, fromCache: false };
  } catch (error) {
    console.error(`Remote surah ${surahId} failed`, error);
    const fallback = getAyat().filter((item) => item.surah_id === surahId);
    if (!fallback.length) {
      console.warn(`No local fallback for surah ${surahId}`);
      return { ayat: [], fromCache: true };
    }
    cachedAyat.set(surahId, fallback);
    return { ayat: fallback, fromCache: true };
  }
}
