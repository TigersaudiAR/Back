import { useCallback, useEffect, useMemo, useState } from "react";
import type { AyahTranslation } from "../types/quran";

type StoredTranslation = {
  translations: AyahTranslation[];
  source?: string;
};

type RemoteTranslationItem = {
  verse_key?: string;
  verse_number?: number;
  text?: string;
  resource_name?: string;
};

type RemoteTranslationResponse = {
  translations?: RemoteTranslationItem[];
  resource_name?: string;
};

const getStorageKey = (surahId: number, translatorId: number) => `quran-translation-${translatorId}-${surahId}-v1`;

const getStoredTranslation = (surahId: number, translatorId: number): StoredTranslation | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(surahId, translatorId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.translations)) {
      return parsed as StoredTranslation;
    }
  } catch (error) {
    console.warn("Failed to parse stored translation", error);
  }
  return null;
};

const setStoredTranslation = (surahId: number, translatorId: number, data: StoredTranslation) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getStorageKey(surahId, translatorId), JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to persist translation", error);
  }
};

export function useSurahTranslation(surahId: number, translatorId = 131, enabled = true) {
  const initial = useMemo(() => getStoredTranslation(surahId, translatorId), [surahId, translatorId]);
  const [translations, setTranslations] = useState<AyahTranslation[]>(initial?.translations ?? []);
  const [source, setSource] = useState<string | undefined>(initial?.source);
  const [loading, setLoading] = useState<boolean>(enabled && !initial?.translations?.length);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetId = surahId) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.quran.com/api/v4/quran/translations/${translatorId}?chapter_number=${targetId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch translation (${response.status})`);
        }
        const payload: RemoteTranslationResponse = await response.json();
        const items: AyahTranslation[] = Array.isArray(payload?.translations)
          ? payload.translations.map((item) => {
              const verseKey = String(item.verse_key ?? "");
              const ayahNumber = Number(verseKey.split(":")[1] ?? item.verse_number ?? 0);
              return {
                surah_id: targetId,
                ayah_number: ayahNumber,
                text: String(item.text ?? ""),
                source: item.resource_name ?? payload?.resource_name ?? undefined
              } satisfies AyahTranslation;
            })
          : [];
        const resourceName: string | undefined = items[0]?.source ?? payload?.resource_name;
        setTranslations(items);
        setSource(resourceName);
        setStoredTranslation(targetId, translatorId, { translations: items, source: resourceName });
      } catch (err) {
        console.warn("Failed to fetch surah translation", err);
        setError("تعذر تحميل الترجمة، يرجى التحقق من الاتصال.");
      } finally {
        setLoading(false);
      }
    },
    [enabled, surahId, translatorId]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const cached = getStoredTranslation(surahId, translatorId);
    if (cached) {
      setTranslations(cached.translations);
      setSource(cached.source);
      setError(null);
      if (!cached.translations.length) {
        load(surahId).catch(() => undefined);
      } else {
        setLoading(false);
      }
    } else {
      setTranslations([]);
      setSource(undefined);
      setLoading(true);
      load(surahId).catch(() => undefined);
    }
  }, [surahId, translatorId, enabled, load]);

  return { translations, loading, error, refresh: load, source };
}
