import { useCallback, useEffect, useState } from "react";
import localSurahIndex from "../data/quran/surahs.json";
import localTafsir from "../data/tafsir_samples.json";
import {
  RECITATION_AUDIO_BASE64,
  RECITATION_MIME_TYPE
} from "../data/quran/recitations";
import type { Ayah, Recitation, Surah, Tafsir } from "../types/quran";
type SurahResponse = {
  surah: Surah;
  ayat: Ayah[];
  tafsir: Tafsir[];
  recitations: Recitation[];
  cached?: boolean;
  message?: string;
};

const INDEX_STORAGE_KEY = "quran-surah-index-v1";
const LOCAL_RECITERS: Array<{ id: string; name: string; bitrate: number }> = [
  { id: "mahermuaiqly", name: "الشيخ ماهر المعيقلي", bitrate: 160 },
  { id: "alafasy", name: "الشيخ مشاري العفاسي", bitrate: 160 },
  { id: "husary", name: "الشيخ محمود الحصري", bitrate: 128 }
];

const ayatModules = import.meta.glob<Ayah[]>("../data/quran/ayat/*.json", {
  import: "default"
});

const tafsirDataset: Tafsir[] = Array.isArray(localTafsir) ? (localTafsir as Tafsir[]) : [];
const surahDataset: Surah[] = Array.isArray(localSurahIndex) ? (localSurahIndex as Surah[]) : [];
const localSurahCache = new Map<number, SurahResponse>();

const reciterUrlCache = new Map<string, string>();

const getReciterUrl = (reciterId: string) => {
  if (!reciterUrlCache.has(reciterId)) {
    const base64 = RECITATION_AUDIO_BASE64[reciterId];
    if (!base64) {
      throw new Error(`Missing recitation audio payload for ${reciterId}`);
    }
    const trimmed = base64.trim();
    const dataUrl = `data:${RECITATION_MIME_TYPE};base64,${trimmed}`;
    reciterUrlCache.set(reciterId, dataUrl);
  }
  return reciterUrlCache.get(reciterId)!;
};

const buildRecitations = (surahId: number): Recitation[] => {
  const padded = String(surahId).padStart(3, "0");
  return LOCAL_RECITERS.map((reciter) => {
    const baseUrl = getReciterUrl(reciter.id);
    const url = `${baseUrl}#surah=${padded}`;
    return {
      surah_id: surahId,
      reciter: reciter.name,
      bitrate: reciter.bitrate,
      url
    };
  });
};

const loadLocalAyat = async (surahId: number): Promise<Ayah[]> => {
  const padded = String(surahId).padStart(3, "0");
  const key = `../data/quran/ayat/${padded}.json`;
  const loader = ayatModules[key];
  if (!loader) {
    throw new Error(`Missing local ayat dataset for surah ${surahId}`);
  }
  const result = await loader();
  return Array.isArray(result) ? (result as Ayah[]) : result;
};

const loadLocalSurah = async (surahId: number): Promise<SurahResponse> => {
  if (localSurahCache.has(surahId)) {
    return localSurahCache.get(surahId)!;
  }
  const surah = surahDataset.find((item) => item.id === surahId);
  if (!surah) {
    throw new Error(`Surah ${surahId} not found in local dataset`);
  }
  const ayat = await loadLocalAyat(surahId);
  const tafsir = tafsirDataset.filter((item) => item.surah_id === surahId);
  const response: SurahResponse = {
    surah,
    ayat,
    tafsir,
    recitations: buildRecitations(surahId),
    cached: true,
    message: "تم تحميل البيانات من النسخة المحلية"
  };
  localSurahCache.set(surahId, response);
  return response;
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
  const [surahs, setSurahs] = useState<Surah[]>(() => getStoredIndex() ?? surahDataset);
  const [loading, setLoading] = useState(surahs.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(() => Boolean(getStoredIndex()?.length));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSurahs(surahDataset);
      setStoredIndex(surahDataset);
      setFromCache(false);
    } catch (err) {
      console.error(err);
      setError("تعذر تحميل فهرس السور من النسخة المحلية.");
      if (!surahs.length) {
        const cached = getStoredIndex();
        if (cached?.length) {
          setSurahs(cached);
          setFromCache(true);
        }
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
        const local = await loadLocalSurah(id);
        setData(local);
        setStoredSurah(id, local);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("تعذر تحميل بيانات السورة من النسخة المحلية.");
        const cached = getStoredSurah(id);
        if (cached) {
          setData(cached);
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
