import { loadJson } from "../utils/loadData.js";
import type {
  Ayah,
  DhikrSet,
  Hadith,
  Surah,
  Tafsir
} from "../types/index.js";

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
