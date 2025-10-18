import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import type { Ayah, Recitation, Surah, Tafsir } from "../types/quran";

type IndexResponse = { surahs: Surah[]; cached?: boolean };
type SurahResponse = {
  surah: Surah;
  ayat: Ayah[];
  tafsir: Tafsir[];
  recitations: Recitation[];
  cached?: boolean;
  message?: string;
};

const INDEX_STORAGE_KEY = "quran-surah-index-v1";

const REMOTE_RECITERS: Array<{ id: string; name: string; bitrate: number }> = [
  { id: "mahermuaiqly", name: "الشيخ ماهر المعيقلي", bitrate: 128 },
  { id: "alafasy", name: "الشيخ مشاري العفاسي", bitrate: 128 },
  { id: "husary", name: "الشيخ محمود الحصري", bitrate: 64 }
];

const buildRecitations = (surahId: number): Recitation[] =>
  REMOTE_RECITERS.map((reciter) => ({
    surah_id: surahId,
    reciter: reciter.name,
    bitrate: reciter.bitrate,
    url: `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/ar.${reciter.id}/${String(surahId).padStart(3, "0")}.mp3`,
    reciter_id: reciter.id,
    timings: undefined
  }));

const fetchTafsirForSurah = async (surahId: number): Promise<Tafsir[]> => {
  try {
    const response = await api.get<{ tafsir: Tafsir[] }>("/quran/tafsir");
    return response.data.tafsir.filter((item) => item.surah_id === surahId);
  } catch (error) {
    console.warn("Failed to fetch tafsir list", error);
    return [];
  }
};

type RemoteSurahPayload = {
  surah: Surah;
  ayat: Ayah[];
};

const getRemoteSurahIndexFallback = (surahId: number): Surah | null => {
  const cached = getStoredIndex();
  if (!cached?.length) return null;
  return cached.find((item) => item.id === surahId) ?? null;
};

const remoteLoaders: Array<(surahId: number) => Promise<RemoteSurahPayload>> = [
  async (surahId) => {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar`);
    if (!response.ok) {
      throw new Error(`alquran.cloud failed with status ${response.status}`);
    }
    const payload = await response.json();
    const meta = payload?.data;
    const ayahs = Array.isArray(meta?.ayahs)
      ? (meta.ayahs as any[]).map((item) => ({
          surah_id: surahId,
          ayah_number: Number(item.numberInSurah),
          text_ar: String(item.text)
        }))
      : [];
    if (!ayahs.length) {
      throw new Error("alquran.cloud responded without ayat");
    }
    const surah: Surah = {
      id: Number(meta.number) || surahId,
      name_ar: meta.name ?? getRemoteSurahIndexFallback(surahId)?.name_ar ?? "",
      name_en: meta.englishName ?? getRemoteSurahIndexFallback(surahId)?.name_en,
      revelation_place:
        meta.revelationType === "Medinan" ? "Medina" : meta.revelationType === "Meccan" ? "Mecca" : getRemoteSurahIndexFallback(surahId)?.revelation_place,
      ayah_count: Number(meta.numberOfAyahs) || ayahs.length,
      bismillah_pre: surahId !== 1 && surahId !== 9
    };
    return { surah, ayat: ayahs };
  },
  async (surahId) => {
    const [versesResponse, chapterResponse] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`),
      fetch(`https://api.quran.com/api/v4/chapters/${surahId}`)
    ]);
    if (!versesResponse.ok) {
      throw new Error(`quran.com verses failed ${versesResponse.status}`);
    }
    if (!chapterResponse.ok) {
      throw new Error(`quran.com chapter failed ${chapterResponse.status}`);
    }
    const versesPayload = await versesResponse.json();
    const chapterPayload = await chapterResponse.json();
    const verses = Array.isArray(versesPayload?.verses)
      ? (versesPayload.verses as any[]).map((item) => {
          const verseKey: string = item.verse_key ?? "";
          const ayahNumber = Number(verseKey.split(":")[1] ?? item.verse_number ?? 0);
          return {
            surah_id: surahId,
            ayah_number: ayahNumber,
            text_ar: String(item.text_uthmani ?? item.text_indopak ?? item.text_madani ?? "")
          };
        })
      : [];
    if (!verses.length) {
      throw new Error("quran.com responded without verses");
    }
    const chapter = chapterPayload?.chapter;
    const surah: Surah = {
      id: Number(chapter?.id) || surahId,
      name_ar: chapter?.name_arabic ?? getRemoteSurahIndexFallback(surahId)?.name_ar ?? "",
      name_en: chapter?.name_simple ?? getRemoteSurahIndexFallback(surahId)?.name_en,
      revelation_place:
        chapter?.revelation_place === "madinah"
          ? "Medina"
          : chapter?.revelation_place === "makkah"
          ? "Mecca"
          : getRemoteSurahIndexFallback(surahId)?.revelation_place,
      ayah_count: Number(chapter?.verses_count) || verses.length,
      bismillah_pre: surahId !== 1 && surahId !== 9
    };
    return { surah, ayat: verses };
  },
  async (surahId) => {
    const padded = String(surahId).padStart(3, "0");
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/surah-${padded}.json`
    );
    if (!response.ok) {
      throw new Error(`cdn.jsdelivr failed ${response.status}`);
    }
    const payload = await response.json();
    const verses = Array.isArray(payload?.verses)
      ? (payload.verses as any[]).map((item) => ({
          surah_id: surahId,
          ayah_number: Number(item.id ?? item.verse ?? item.ayah ?? 0),
          text_ar: String(item.text ?? item.ayat ?? "")
        }))
      : [];
    if (!verses.length) {
      throw new Error("cdn dataset missing verses");
    }
    const meta = payload?.chapter ?? payload;
    const fallback = getRemoteSurahIndexFallback(surahId);
    const surah: Surah = {
      id: Number(meta?.id ?? surahId),
      name_ar: meta?.nameArabic ?? meta?.name ?? fallback?.name_ar ?? "",
      name_en: meta?.nameSimple ?? meta?.englishName ?? fallback?.name_en,
      revelation_place:
        meta?.revelationPlace === "medinan"
          ? "Medina"
          : meta?.revelationPlace === "meccan"
          ? "Mecca"
          : fallback?.revelation_place,
      ayah_count: Number(meta?.versesCount ?? verses.length ?? fallback?.ayah_count ?? verses.length),
      bismillah_pre: surahId !== 1 && surahId !== 9
    };
    return { surah, ayat: verses };
  }
];

const fetchRemoteSurah = async (surahId: number): Promise<SurahResponse | null> => {
  for (const loader of remoteLoaders) {
    try {
      const result = await loader(surahId);
      const tafsir = await fetchTafsirForSurah(surahId);
      return {
        surah: result.surah,
        ayat: result.ayat,
        tafsir,
        recitations: buildRecitations(surahId),
        cached: false,
        message: "تم جلب السورة من مصدر خارجي مباشر"
      };
    } catch (error) {
      console.warn("Remote surah loader failed", error);
    }
  }
  return null;
};

const getStoredIndex = (): Surah[] | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(INDEX_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Surah[];
  } catch (error) {
    console.warn("Failed to parse cached surah index", error);
  }
  return null;
};

const setStoredIndex = (data: Surah[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(data));
};

const getSurahStorageKey = (surahId: number) => `quran-surah-${surahId}-v1`;

const getStoredSurah = (surahId: number): SurahResponse | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(getSurahStorageKey(surahId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.ayat)) {
      return parsed as SurahResponse;
    }
  } catch (error) {
    console.warn("Failed to parse cached surah", error);
  }
  return null;
};

const setStoredSurah = (surahId: number, data: SurahResponse) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSurahStorageKey(surahId), JSON.stringify(data));
};

export function useSurahIndex() {
  const [surahs, setSurahs] = useState<Surah[]>(() => getStoredIndex() ?? []);
  const [loading, setLoading] = useState(surahs.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<IndexResponse>("/quran/index");
      setSurahs(response.data.surahs);
      setFromCache(Boolean(response.data.cached));
      setStoredIndex(response.data.surahs);
    } catch (err) {
      console.error(err);
      setError("تعذر تحميل فهرس السور، تحقق من الاتصال بالإنترنت.");
      if (!surahs.length) {
        setSurahs(getStoredIndex() ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [surahs.length]);

  useEffect(() => {
    if (!surahs.length) {
      load().catch(() => undefined);
    }
  }, [surahs.length, load]);

  return { surahs, loading, error, refresh: load, fromCache };
}

export function useQuranSurah(surahId: number) {
  const [data, setData] = useState<SurahResponse | null>(() => getStoredSurah(surahId));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<SurahResponse>("/quran", { params: { surah: id } });
        if (response.data.ayat.length === 0) {
          const remote = await fetchRemoteSurah(id);
          if (remote) {
            setData(remote);
            setStoredSurah(id, remote);
            setError(null);
            return;
          }
          setError(response.data.message ?? "تعذر تحميل بيانات السورة من المصدر المحلي.");
          const cached = getStoredSurah(id);
          if (cached) {
            setData(cached);
          }
          return;
        }
        setData(response.data);
        setStoredSurah(id, response.data);
      } catch (err: any) {
        console.error(err);
        const remote = await fetchRemoteSurah(id);
        if (remote) {
          setData(remote);
          setStoredSurah(id, remote);
          setError(null);
          return;
        }
        if (err?.response?.data?.message) {
          setError(err.response.data.message as string);
          const cached = getStoredSurah(id);
          if (cached) {
            setData(cached);
          }
        } else {
          setError("تعذر تحميل بيانات السورة، يرجى التحقق من الاتصال بالإنترنت.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(surahId).catch(() => undefined);
  }, [surahId, load]);

  return { data, loading, error, refresh: load };
}
