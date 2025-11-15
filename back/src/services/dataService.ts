import { loadJson } from "../utils/loadData.js";
import { ensureSurahListSlugs } from "../utils/surah.js";
import type {
  Ayah,
  DhikrSet,
  Hadith,
  RecitationConfig,
  Surah,
  Tafsir
} from "../types/index.js";

type DirectoryEntry = {
  surah_id: number;
  file: string;
  ayah_count: number;
};

let surahIndexCache: Surah[] | null = null;
let ayatIndexCache: DirectoryEntry[] | null = null;
let tafsirIndexCache: DirectoryEntry[] | null = null;
let recitationConfigCache: RecitationConfig | null = null;
const ayatCache = new Map<number, Ayah[]>();
const tafsirCache = new Map<number, Tafsir[]>();
let allAyatCache: Ayah[] | null = null;
let allTafsirCache: Tafsir[] | null = null;

function loadAyatIndex(): DirectoryEntry[] {
  if (!ayatIndexCache) {
    const index = loadJson<{ surahs: DirectoryEntry[] }>("ayat/index.json");
    ayatIndexCache = index.surahs;
  }
  return ayatIndexCache;
}

function loadTafsirIndex(): DirectoryEntry[] {
  if (!tafsirIndexCache) {
    const index = loadJson<{ surahs: DirectoryEntry[] }>("tafsir/index.json");
    tafsirIndexCache = index.surahs;
  }
  return tafsirIndexCache;
}

function resolveEntry(entries: DirectoryEntry[], surahId: number): DirectoryEntry {
  const entry = entries.find((item) => item.surah_id === surahId);
  if (!entry) {
    throw new Error(`Missing dataset entry for surah ${surahId}`);
  }
  return entry;
}

export function getSurahIndex(): Surah[] {
  if (!surahIndexCache) {
    surahIndexCache = loadJson<Surah[]>("surah_index.json");
  }
  return surahIndexCache;
}

export function getSurahAyat(surahId: number): Ayah[] {
  if (!ayatCache.has(surahId)) {
    const entry = resolveEntry(loadAyatIndex(), surahId);
    const ayat = loadJson<Ayah[]>(`ayat/${entry.file}`);
    ayatCache.set(surahId, ayat);
  }
  return ayatCache.get(surahId)!;
}

export function getAyat(): Ayah[] {
  if (!allAyatCache) {
    allAyatCache = loadAyatIndex().flatMap((entry) => getSurahAyat(entry.surah_id));
  }
  return allAyatCache;
}

export function getTafsirForSurah(surahId: number): Tafsir[] {
  if (!tafsirCache.has(surahId)) {
    const entry = resolveEntry(loadTafsirIndex(), surahId);
    const tafsir = loadJson<Tafsir[]>(`tafsir/${entry.file}`);
    tafsirCache.set(surahId, tafsir);
  }
  return tafsirCache.get(surahId)!;
}

export function getTafsir(): Tafsir[] {
  if (!allTafsirCache) {
    allTafsirCache = loadTafsirIndex().flatMap((entry) => getTafsirForSurah(entry.surah_id));
  }
  return allTafsirCache;
}

export function getRecitationConfig(): RecitationConfig {
  if (!recitationConfigCache) {
    recitationConfigCache = loadJson<RecitationConfig>("recitations/index.json");
  }
  return recitationConfigCache;
}

export function getAdhkar(): DhikrSet[] {
  return loadJson<DhikrSet[]>("adhkar_sets.json");
}

export function getHadith(): Hadith[] {
  return loadJson<Hadith[]>("hadith_samples.json");
}

export function getFaqs(): { question: string; answer: string }[] {
  return loadJson("faq_scholars.json");
}

export function getRecitationTimings(): RecitationTimingMap {
  if (!recitationTimingsCache) {
    recitationTimingsCache = loadJson<RecitationTimingMap>("recitation_timings.json");
  }
  return recitationTimingsCache;
}
