import { v4 as uuid } from "uuid";

import { loadJson } from "../utils/loadData.js";
import { readStoredJson, writeStoredJson } from "../utils/storage.js";
import type {
  Ayah,
  Dhikr,
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
  const base = loadJson<DhikrSet[]>("adhkar_sets.json");
  const stored = readStoredJson<DhikrSet[]>("adhkar_custom.json") ?? [];

  const merged = new Map<string, DhikrSet>();
  for (const set of base) {
    merged.set(set.name, set);
  }

  for (const set of stored) {
    merged.set(set.name, set);
  }

  return Array.from(merged.values());
}

export function getHadith(): Hadith[] {
  const base = loadJson<Hadith[]>("hadith_samples.json");
  const stored = readStoredJson<Hadith[]>("hadith_custom.json") ?? [];

  const merged = new Map<string, Hadith>();
  for (const hadith of base) {
    merged.set(hadith.id, hadith);
  }

  for (const hadith of stored) {
    merged.set(hadith.id, hadith);
  }

  return Array.from(merged.values());
}

export function getFaqs(): { question: string; answer: string }[] {
  return loadJson("faq_scholars.json");
}

function normalizeHadithTopics(topic: unknown): string[] | undefined {
  if (topic == null) {
    return undefined;
  }

  const topics = Array.isArray(topic) ? topic : [topic];
  const normalized: string[] = [];

  for (const entry of topics) {
    if (entry == null) {
      continue;
    }

    if (typeof entry === "object") {
      throw new Error("موضوع الحديث يجب أن يكون نصًا صالحًا");
    }

    const coerced = String(entry).trim();
    if (coerced) {
      normalized.push(coerced);
    }
  }

  return normalized.length ? normalized : undefined;
}

function normalizeDhikrItems(setId: string, items: Dhikr[]): Dhikr[] {
  return items.map((item, index) => {
    if (!item.text?.trim()) {
      throw new Error(`النص الأساسي للذكر رقم ${index + 1} مطلوب`);
    }

    return {
      id: item.id?.trim() || `dhikr-${setId}-${index + 1}`,
      title: item.title?.trim() || `ذكر ${index + 1}`,
      text: item.text.trim(),
      count: item.count,
      tags: Array.isArray(item.tags) ? item.tags : [],
      reference: item.reference?.trim() || undefined
    } satisfies Dhikr;
  });
}

export function saveDhikrSet(input: Partial<DhikrSet>): DhikrSet {
  if (!input?.name?.trim()) {
    throw new Error("اسم مجموعة الأذكار مطلوب");
  }

  if (!Array.isArray(input.items) || !input.items.length) {
    throw new Error("يجب توفير أذكار واحدة على الأقل");
  }

  const setId = input.id?.trim() || `adhkar-${uuid()}`;
  const normalized: DhikrSet = {
    id: setId,
    name: input.name.trim(),
    title: input.title?.trim(),
    description: input.description?.trim(),
    items: normalizeDhikrItems(setId, input.items)
  };

  const stored = readStoredJson<DhikrSet[]>("adhkar_custom.json") ?? [];
  const index = stored.findIndex((set) => set.id === normalized.id || set.name === normalized.name);

  if (index >= 0) {
    stored[index] = normalized;
  } else {
    stored.push(normalized);
  }

  writeStoredJson("adhkar_custom.json", stored);
  return normalized;
}

export function saveHadith(input: Partial<Hadith>): Hadith {
  if (!input?.text_ar?.trim()) {
    throw new Error("متن الحديث مطلوب");
  }

  if (!input?.source?.trim()) {
    throw new Error("مصدر الحديث مطلوب");
  }

  const hadithId = input.id?.trim() || `hadith-${uuid()}`;
  const normalized: Hadith = {
    id: hadithId,
    title: input.title?.trim(),
    narrator: input.narrator?.trim(),
    source: input.source.trim(),
    number: input.number?.trim(),
    text_ar: input.text_ar.trim(),
    grade: input.grade?.trim(),
    topic: normalizeHadithTopics(input.topic)
  };

  const stored = readStoredJson<Hadith[]>("hadith_custom.json") ?? [];
  const index = stored.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    stored[index] = normalized;
  } else {
    stored.push(normalized);
  }

  writeStoredJson("hadith_custom.json", stored);
  return normalized;
}
