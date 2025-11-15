import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import TafsirPopover from "../../components/TafsirPopover";
import AudioBar, { type AudioProgressPayload } from "../../components/AudioBar";
import ReadingPreferenceSwitcher from "../../components/ReadingPreferenceSwitcher";
import QuranTranslationView from "../../components/QuranTranslationView";
import type { Ayah, Surah, Tafsir } from "../../types/quran";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { useSurahTranslation } from "../../hooks/useSurahTranslation";

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

type ViewMode = "reading" | "translation";

function QuranModernPage() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const { visible, show, setVisible } = useAutoHide();
  const [currentSurahId, setCurrentSurahId] = useState<number>(Number(query.get("surah")) || 1);
  const [viewMode, setViewMode] = useState<ViewMode>(query.get("view") === "translation" ? "translation" : "reading");
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false);
  const activeReciterRef = useRef<string | null>(null);
  const { role } = useAuthStore();

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
  const {
    translations,
    loading: translationsLoading,
    error: translationsError,
    source: translationSource,
    refresh: refreshTranslations
  } = useSurahTranslation(currentSurahId, 131, viewMode === "translation");

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
  const translationMap = useMemo(() => {
    return new Map(translations.map((item) => [item.ayah_number, item]));
  }, [translations]);

  const tafsir = activeAyah ? tafsirMap.get(`${currentSurahId}-${activeAyah}`) : undefined;

  const buildSearch = useCallback(
    (surahId: number, mode: ViewMode = viewMode) => {
      const params = new URLSearchParams();
      params.set("surah", String(surahId));
      if (mode === "translation") {
        params.set("view", "translation");
      }
      return `?${params.toString()}`;
    },
    [viewMode]
  );

  const navigateToSurah = useCallback(
    (surahId: number, mode: ViewMode = viewMode) => {
      navigate(buildSearch(surahId, mode));
    },
    [buildSearch, navigate, viewMode]
  );

  const goPrev = useCallback(() => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index > 0) {
      const target = surahs[index - 1].id;
      setCurrentSurahId(target);
      navigateToSurah(target);
    }
  }, [currentSurahId, navigateToSurah, surahs]);

  const goNext = useCallback(() => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index >= 0 && index < surahs.length - 1) {
      const target = surahs[index + 1].id;
      setCurrentSurahId(target);
      navigateToSurah(target);
    }
  }, [currentSurahId, navigateToSurah, surahs]);

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
    localStorage.setItem(
      "last-reading",
      JSON.stringify({ surah: currentSurahId, ayah: activeAyah, view: viewMode })
    );
  }, [currentSurahId, activeAyah, viewMode]);

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

  const placeholderContent = loading
    ? <span className="quran-status-text">جاري تحميل الآيات...</span>
    : error
      ? (
          <div className="quran-status-error">
            <p>{error}</p>
            <button className="btn btn-sm" onClick={handleRetry}>
              إعادة المحاولة
            </button>
          </div>
        )
      : ayat.length === 0
        ? <span className="quran-status-text">لا توجد آيات متاحة لهذه السورة حالياً.</span>
        : null;

  useEffect(() => {
    const targetSurah = Number(query.get("surah")) || 1;
    if (targetSurah !== currentSurahId) {
      setCurrentSurahId(targetSurah);
    }
    const queryView = query.get("view") === "translation" ? "translation" : "reading";
    if (queryView !== viewMode) {
      setViewMode(queryView);
    }
  }, [query, currentSurahId, viewMode]);

  const handleViewChange = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    navigate(buildSearch(currentSurahId, mode), { replace: true });
  };

  const handleAyahSelection = useCallback(
    (ayah: Ayah, fallbackRect?: DOMRect | null) => {
      setActiveAyah(ayah.ayah_number);
      let rect: DOMRect | null = null;
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          rect = selection.getRangeAt(0).getBoundingClientRect();
        }
      } catch (err) {
        console.warn("Failed to read selection", err);
      }
      if (!rect && fallbackRect) {
        rect = fallbackRect;
      }
      setAnchorRect(rect ?? null);
      show();
    },
    [show]
  );

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-gray-100" onClick={() => show()}>
      <TopBar
        surah={surah}
        onToggleMode={() => navigate(`/quran/classic?surah=${currentSurahId}`)}
        onOpenSearch={() => show()}
      />
      <ReadingPreferenceSwitcher
        mode={viewMode}
        onChange={handleViewChange}
        translationSource={translationSource}
        translationLoading={translationsLoading}
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
        {!loading && !error && ayat.length > 0 && viewMode === "reading" && (
          <QuranCanvas
            surah={surah}
            ayat={ayat}
            activeAyah={activeAyah}
            onSelectAyah={(ayah) => handleAyahSelection(ayah)}
            onSwipe={(direction) => (direction === "next" ? goNext() : goPrev())}
            fontSize={fontSize}
          />
        )}
        {!loading && !error && ayat.length > 0 && viewMode === "translation" && (
          <QuranTranslationView
            ayat={ayat}
            translations={translationMap}
            loading={translationsLoading}
            error={translationsError}
            onRetry={() => refreshTranslations(currentSurahId).catch(() => undefined)}
            activeAyah={activeAyah}
            onSelectAyah={(ayah, rect) => handleAyahSelection(ayah, rect)}
          />
        )}
      </div>
      {recitations.length > 0 && (
        <AudioBar
          recitations={recitations.map((recitation) => ({ ...recitation, surah_id: currentSurahId }))}
          onProgress={handleAudioProgress}
        />
      </div>
      <HiddenToolbar
        open={controlsOpen}
        onToggle={handleToggleControls}
        surahList={surahs}
        currentSurah={surah}
        onToggleMode={() => navigate(`/quran/classic?surah=${currentSurahId}`)}
        onSelectSurah={(id) => {
          setCurrentSurahId(id);
          navigateToSurah(id);
        }}
        onPrev={goPrev}
        onNext={goNext}
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
