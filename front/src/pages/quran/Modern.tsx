import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import TafsirPopover from "../../components/TafsirPopover";
import type { AudioProgressPayload } from "../../components/AudioBar";
import type { Ayah, Surah, Tafsir } from "../../types/quran";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { findSurahBySlug } from "../../utils/quran";

function QuranModernPage() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const surahParam = query.get("surah");
  const slugParam = query.get("slug") ?? undefined;
  const parsedSurahId = surahParam ? Number(surahParam) : NaN;
  const hasValidSurahParam = !Number.isNaN(parsedSurahId) && parsedSurahId > 0;
  const initialSurahId = hasValidSurahParam ? parsedSurahId : 1;
  const [currentSurahId, setCurrentSurahId] = useState<number>(initialSurahId);
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false);
  const activeReciterRef = useRef<string | null>(null);

  const computeAutoFont = useCallback(() => {
    if (typeof window === "undefined") return 30;
    const width = window.innerWidth;
    if (width >= 1600) return 38;
    if (width >= 1280) return 34;
    if (width >= 1024) return 30;
    if (width >= 768) return 26;
    if (width >= 480) return 22;
    return 20;
  }, []);

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
  const ayat: Ayah[] = useMemo(() => data?.ayat ?? [], [data?.ayat]);
  const tafsirMap = useMemo(() => {
    const map = new Map<string, Tafsir>();
    data?.tafsir?.forEach((item) => {
      map.set(`${item.surah_id}-${item.ayah_number}`, item);
    });
    return map;
  }, [data?.tafsir]);

  const ayahNumbers = useMemo(() => new Set(ayat.map((item) => item.ayah_number)), [ayat]);

  const tafsir = activeAyah ? tafsirMap.get(`${currentSurahId}-${activeAyah}`) : undefined;

  const goPrev = useCallback(() => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index > 0) {
      const target = surahs[index - 1].id;
      setCurrentSurahId(target);
      navigate(buildQueryForSurah(target));
    }
  }, [buildQueryForSurah, currentSurahId, navigate, surahs]);

  const goNext = useCallback(() => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index >= 0 && index < surahs.length - 1) {
      const target = surahs[index + 1].id;
      setCurrentSurahId(target);
      navigate(buildQueryForSurah(target));
    }
  }, [buildQueryForSurah, currentSurahId, navigate, surahs]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goNext();
      }
      if (event.key === "ArrowLeft") {
        goPrev();
      }
      if (event.key.toLowerCase() === "b") {
        setControlsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [goNext, goPrev]);

  useEffect(() => {
    localStorage.setItem("last-reading", JSON.stringify({ surah: currentSurahId, ayah: activeAyah }));
  }, [currentSurahId, activeAyah]);

  useEffect(() => {
    if (!isAutoFont) return;
    const update = () => setFontSize(computeAutoFont());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [computeAutoFont, isAutoFont]);

  const handleFontChange = useCallback((delta: number) => {
    setIsAutoFont(false);
    setFontSize((prev) => Math.min(46, Math.max(18, prev + delta)));
  }, []);

  const resetFont = useCallback(() => {
    setIsAutoFont(true);
    setFontSize(computeAutoFont());
  }, [computeAutoFont]);

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

  const handleToggleControls = useCallback(() => setControlsOpen((prev) => !prev), []);

  const handleShowTafsir = useCallback(() => {
    const ensureAnchor = (ayahNumber: number) => {
      const element = document.querySelector<HTMLElement>(`[data-ayah-id="${ayahNumber}"]`);
      if (element) {
        setAnchorRect(element.getBoundingClientRect());
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    if (!activeAyah && ayat[0]) {
      const fallbackAyah = ayat[0];
      setActiveAyah(fallbackAyah.ayah_number);
      ensureAnchor(fallbackAyah.ayah_number);
    }

    if (activeAyah && !anchorRect) {
      ensureAnchor(activeAyah);
    }
    setControlsOpen(false);
  }, [activeAyah, anchorRect, ayat]);

  const handleSelectAyah = useCallback((ayah: Ayah, rect: DOMRect | null) => {
    setActiveAyah(ayah.ayah_number);
    setAnchorRect(rect);
  }, []);

  const handleSwipe = useCallback(
    (direction: "next" | "prev") => {
      if (direction === "next") {
        goNext();
        return;
      }
      goPrev();
    },
    [goNext, goPrev]
  );

  const handleNavigateToClassic = useCallback(() => {
    setControlsOpen(false);
    navigate(`/quran/classic${buildQueryForSurah(currentSurahId)}`);
  }, [buildQueryForSurah, currentSurahId, navigate]);

  const handleOpenSearch = useCallback(() => {
    setControlsOpen(true);
    setPendingSearchFocus(true);
  }, []);

  const handleSelectSurah = useCallback(
    (id: number) => {
      setCurrentSurahId(id);
      navigate(buildQueryForSurah(id));
      setControlsOpen(false);
    },
    [buildQueryForSurah, navigate]
  );

  const handlePrevFromToolbar = useCallback(() => {
    goPrev();
    setControlsOpen(false);
  }, [goPrev]);

  const handleNextFromToolbar = useCallback(() => {
    goNext();
    setControlsOpen(false);
  }, [goNext]);

  const handleSearchFocusHandled = useCallback(() => setPendingSearchFocus(false), []);

  const handleCloseTafsir = useCallback(() => setActiveAyah(undefined), []);

  const handleRetry = useCallback(() => {
    void refresh(currentSurahId).catch(() => undefined);
  }, [currentSurahId, refresh]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-primary-dark text-gray-100">
      <TopBar surah={surah} onToggleMode={handleNavigateToClassic} onOpenSearch={handleOpenSearch} />
      <div className="flex-1 pt-16">
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
            <button className="btn btn-sm" onClick={handleRetry}>
              إعادة المحاولة
            </button>
          </div>
        )}
        {!loading && !error && ayat.length > 0 && (
          <QuranCanvas
            surah={surah}
            ayat={ayat}
            activeAyah={activeAyah}
            onSelectAyah={handleSelectAyah}
            onSwipe={handleSwipe}
            fontSize={fontSize}
          />
        )}
      </div>
      <HiddenToolbar
        open={controlsOpen}
        onToggle={handleToggleControls}
        surahList={surahs}
        currentSurah={surah}
        recitations={recitations.map((recitation) => ({ ...recitation, surah_id: currentSurahId }))}
        onToggleMode={handleNavigateToClassic}
        onSelectSurah={handleSelectSurah}
        onPrev={handlePrevFromToolbar}
        onNext={handleNextFromToolbar}
        onFontChange={handleFontChange}
        onShowTafsir={handleShowTafsir}
        onResetFont={resetFont}
        onAudioProgress={handleAudioProgress}
        shouldFocusSearch={pendingSearchFocus}
        onSearchFocusHandled={handleSearchFocusHandled}
      />
      <TafsirPopover tafsir={tafsir} anchorRect={anchorRect} onClose={handleCloseTafsir} />
      {!loadingIndex && !surahs.length && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary-dark/80 text-sm text-red-200">
          تعذر تحميل فهرس السور، يرجى التحقق من الاتصال.
        </div>
      )}
    </div>
  );
}

export default QuranModernPage;
