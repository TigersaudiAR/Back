import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import TafsirPopover from "../../components/TafsirPopover";
import AudioBar, { type AudioProgressPayload } from "../../components/AudioBar";
import type { Ayah, Surah, Tafsir } from "../../types/quran";
import { useAutoHide } from "../../hooks/useAutoHide";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { findSurahBySlug } from "../../utils/quran";

function QuranModernPage() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const { visible, show, setVisible } = useAutoHide();
  const surahParam = query.get("surah");
  const slugParam = query.get("slug") ?? undefined;
  const parsedSurahId = surahParam ? Number(surahParam) : NaN;
  const hasValidSurahParam = !Number.isNaN(parsedSurahId) && parsedSurahId > 0;
  const initialSurahId = hasValidSurahParam ? parsedSurahId : 1;
  const [currentSurahId, setCurrentSurahId] = useState<number>(initialSurahId);
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const activeReciterRef = useRef<string | null>(null);

  const computeAutoFont = () => {
    if (typeof window === "undefined") return 30;
    const width = window.innerWidth;
    if (width >= 1600) return 38;
    if (width >= 1280) return 34;
    if (width >= 1024) return 30;
    if (width >= 768) return 26;
    if (width >= 480) return 22;
    return 20;
  };

  const [fontSize, setFontSize] = useState<number>(() => computeAutoFont());
  const [isAutoFont, setIsAutoFont] = useState(true);

  const { surahs, loading: loadingIndex } = useSurahIndex();

  useEffect(() => {
    if (hasValidSurahParam && !Number.isNaN(parsedSurahId) && parsedSurahId !== currentSurahId) {
      setCurrentSurahId(parsedSurahId);
    }
  }, [hasValidSurahParam, parsedSurahId, currentSurahId]);

  useEffect(() => {
    if (hasValidSurahParam || !slugParam || !surahs.length) {
      return;
    }
    const match = findSurahBySlug(surahs, slugParam);
    if (match && match.id !== currentSurahId) {
      setCurrentSurahId(match.id);
    }
  }, [hasValidSurahParam, slugParam, surahs, currentSurahId]);

  const buildQueryForSurah = useCallback(
    (id: number) => {
      const params = new URLSearchParams();
      params.set("surah", String(id));
      const info = surahs.find((item) => item.id === id);
      if (info?.slug) {
        params.set("slug", info.slug);
      }
      return `?${params.toString()}`;
    },
    [surahs]
  );

  useEffect(() => {
    if (!surahs.length) {
      return;
    }
    const expected = buildQueryForSurah(currentSurahId);
    if (expected !== location.search) {
      navigate(expected, { replace: true });
    }
  }, [surahs, currentSurahId, buildQueryForSurah, location.search, navigate]);

  const { data, loading, error, refresh } = useQuranSurah(currentSurahId);

  const surah: Surah | undefined = data?.surah;
  const ayat: Ayah[] = data?.ayat ?? [];
  const tafsirMap = useMemo(() => new Map<string, Tafsir>(), [data?.tafsir]);
  const ayahNumbers = useMemo(() => new Set(ayat.map((item) => item.ayah_number)), [ayat]);

  if (data?.tafsir) {
    data.tafsir.forEach((item) => tafsirMap.set(`${item.surah_id}-${item.ayah_number}`, item));
  }

  const tafsir = activeAyah ? tafsirMap.get(`${currentSurahId}-${activeAyah}`) : undefined;

  const goPrev = () => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index > 0) {
      const target = surahs[index - 1].id;
      setCurrentSurahId(target);
      navigate(buildQueryForSurah(target));
    }
  };

  const goNext = () => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index >= 0 && index < surahs.length - 1) {
      const target = surahs[index + 1].id;
      setCurrentSurahId(target);
      navigate(buildQueryForSurah(target));
    }
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "t") {
        setVisible((prev) => !prev);
      }
      if (event.key === "ArrowRight") {
        goNext();
      }
      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [goNext, goPrev, setVisible]);

  useEffect(() => {
    localStorage.setItem("last-reading", JSON.stringify({ surah: currentSurahId, ayah: activeAyah }));
  }, [currentSurahId, activeAyah]);

  useEffect(() => {
    if (!isAutoFont) return;
    const update = () => setFontSize(computeAutoFont());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isAutoFont]);

  const handleFontChange = (delta: number) => {
    setIsAutoFont(false);
    setFontSize((prev) => Math.min(46, Math.max(18, prev + delta)));
  };

  const resetFont = () => {
    setIsAutoFont(true);
    setFontSize(computeAutoFont());
  };

  const recitations = data?.recitations ?? [];

  useEffect(() => {
    activeReciterRef.current = null;
    setActiveAyah(undefined);
  }, [currentSurahId]);

  const handleAudioProgress = useCallback(
    (progress: AudioProgressPayload) => {
      if (!progress) return;
      const reciterChanged = activeReciterRef.current && activeReciterRef.current !== progress.reciterId;
      activeReciterRef.current = progress.reciterId;

      if (typeof progress.ayahNumber === "number" && ayahNumbers.has(progress.ayahNumber)) {
        setActiveAyah(progress.ayahNumber);
        return;
      }

      if (reciterChanged) {
        setActiveAyah(undefined);
      }
    },
    [ayahNumbers]
  );

  return (
    <div className="relative flex h-full min-h-[100dvh] w-full flex-col bg-primary-dark text-gray-100" onClick={() => show()}>
      <TopBar
        surah={surah}
        onToggleMode={() => navigate(`/quran/classic${buildQueryForSurah(currentSurahId)}`)}
        onOpenSearch={() => show()}
      />
      <div className="flex-1">
        {data?.message && (
          <div className="mx-auto my-4 max-w-4xl rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-200">
            {data.message}
          </div>
        )}
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-gray-300">جاري تحميل الآيات...</div>
        )}
        {!loading && error && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-red-300">
            <p>{error}</p>
            <button className="btn btn-sm" onClick={() => refresh(currentSurahId).catch(() => undefined)}>
              إعادة المحاولة
            </button>
          </div>
        )}
        {!loading && !error && ayat.length > 0 && (
          <QuranCanvas
            surah={surah}
            ayat={ayat}
            activeAyah={activeAyah}
            onSelectAyah={(ayah) => {
              setActiveAyah(ayah.ayah_number);
              try {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const rect = selection.getRangeAt(0).getBoundingClientRect();
                  setAnchorRect(rect ?? null);
                } else {
                  setAnchorRect(null);
                }
              } catch (err) {
                console.warn("Failed to read selection", err);
                setAnchorRect(null);
              }
              show();
            }}
            onSwipe={(direction) => (direction === "next" ? goNext() : goPrev())}
            fontSize={fontSize}
          />
        )}
      </div>
      {recitations.length > 0 && (
        <AudioBar
          recitations={recitations.map((recitation) => ({ ...recitation, surah_id: currentSurahId }))}
          onProgress={handleAudioProgress}
        />
      )}
      <HiddenToolbar
        visible={visible}
        surahList={surahs}
        currentSurah={surah}
        onToggleMode={() => navigate(`/quran/classic${buildQueryForSurah(currentSurahId)}`)}
        onSelectSurah={(id) => {
          setCurrentSurahId(id);
          navigate(buildQueryForSurah(id));
        }}
        onPrev={goPrev}
        onNext={goNext}
        onFontChange={handleFontChange}
        onToggleAudio={() => show()}
        onShowTafsir={() => show()}
        onResetFont={resetFont}
      />
      <TafsirPopover tafsir={tafsir} anchorRect={anchorRect} onClose={() => setActiveAyah(undefined)} />
      {!loadingIndex && !surahs.length && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary-dark/80 text-sm text-red-200">
          تعذر تحميل فهرس السور، يرجى التحقق من الاتصال.
        </div>
      )}
    </div>
  );
}

export default QuranModernPage;
