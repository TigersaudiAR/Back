import { loadJson } from "../utils/loadData.js";
import type {
  Ayah,
  DhikrSet,
  Hadith,
  RecitationTimingMap,
  Surah,
  Tafsir
} from "../types/index.js";

let recitationTimingsCache: RecitationTimingMap | null = null;

export function getSurahIndex(): Surah[] {
  return loadJson<Surah[]>("surah_index.json");
}

export function getAyat(): Ayah[] {
  return loadJson<Ayah[]>("sample_ayahs.json");
}

export function getTafsir(): Tafsir[] {
  return loadJson<Tafsir[]>("tafsir_samples.json");
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
