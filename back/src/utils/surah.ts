import type { Surah } from "../types/index.js";
import { slugMatches, slugify } from "./slug.js";

export const ensureSurahSlug = (surah: Surah): Surah => {
  const existingSlug = surah.slug?.trim();
  if (existingSlug) {
    const normalizedExisting = slugify(existingSlug);
    if (normalizedExisting === existingSlug) {
      return surah;
    }
    return { ...surah, slug: normalizedExisting };
  }

  const computed = slugify(surah.name_en ?? surah.name_ar ?? surah.id);
  if (!computed) {
    return surah;
  }
  return { ...surah, slug: computed };
};

export const ensureSurahListSlugs = (surahs: Surah[]): Surah[] =>
  surahs.map((surah) => ensureSurahSlug(surah));

export const findSurahBySlug = (surahs: Surah[], slug: string): Surah | undefined => {
  if (!slug.trim()) {
    return undefined;
  }
  return surahs.find((surah) => {
    const candidate = surah.slug ?? surah.name_en ?? surah.name_ar ?? "";
    return slugMatches(candidate, slug);
  });
};
