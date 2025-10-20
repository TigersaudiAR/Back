import type { Surah } from "../types/quran";

export const slugify = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) {
    return "";
  }
  const stringValue = String(value);
  if (!stringValue.trim()) {
    return "";
  }

  const normalized = stringValue
    .normalize("NFKD")
    .replace(/['’`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const slugMatches = (candidate: string, query: string): boolean => {
  const normalizedCandidate = slugify(candidate);
  const normalizedQuery = slugify(query);
  if (!normalizedCandidate || !normalizedQuery) {
    return false;
  }
  if (normalizedCandidate === normalizedQuery) {
    return true;
  }
  const candidateCollapsed = normalizedCandidate.replace(/-/g, "");
  const queryCollapsed = normalizedQuery.replace(/-/g, "");
  return (
    candidateCollapsed === normalizedQuery ||
    candidateCollapsed === queryCollapsed ||
    normalizedCandidate === queryCollapsed
  );
};

export const ensureSurahSlug = (surah: Surah): Surah => {
  const existing = surah.slug?.trim();
  if (existing) {
    const normalized = slugify(existing);
    if (normalized === existing) {
      return surah;
    }
    return { ...surah, slug: normalized };
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
