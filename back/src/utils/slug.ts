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
