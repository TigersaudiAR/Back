import type { Ayah, Surah } from "../types/index.js";
import { getSurahAyat, getSurahIndex } from "./dataService.js";

let cachedSurahIndex: Surah[] | null = null;
const cachedAyat = new Map<number, Ayah[]>();
const failedAyatFetches = new Map<number, number>();

export const FAILED_AYAT_RETRY_DELAY_MS = 60_000;

export async function fetchSurahIndex(): Promise<{ surahs: Surah[]; fromCache: boolean }> {
  if (cachedSurahIndex) {
    return { surahs: cachedSurahIndex.map((item) => ({ ...item })), fromCache: true };
  }

  const surahs = getSurahIndex();
  cachedSurahIndex = surahs.map((item) => ({ ...item }));
  return { surahs: cachedSurahIndex.map((item) => ({ ...item })), fromCache: false };
}

export async function fetchSurahAyat(
  surahId: number
): Promise<{ ayat: Ayah[]; fromCache: boolean }> {
  if (cachedAyat.has(surahId)) {
    const cached = cachedAyat.get(surahId)!;
    return { ayat: cached.map((item) => ({ ...item })), fromCache: true };
  }

  const ayat = getSurahAyat(surahId);
  cachedAyat.set(surahId, ayat.map((item) => ({ ...item })));
  return { ayat: ayat.map((item) => ({ ...item })), fromCache: false };
}
