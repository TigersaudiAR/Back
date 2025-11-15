import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import type { AudioProgressPayload } from "../../components/AudioBar";
import type { Ayah, Surah, Tafsir } from "../../types/quran";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { findSurahBySlug } from "../../utils/quran";
import { getJuzNumber, getHizbNumber, getPageNumber } from "../../utils/quranDivisions";
import { useAuthStore } from "../../store/auth";

const TafsirPopover = lazy(() => import("../../components/TafsirPopover"));

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

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-gray-100" onClick={() => show()}>
      <TopBar
        surah={surah}
        onToggleMode={() => navigate(`/quran/classic?surah=${currentSurahId}`)}
        onOpenSearch={() => show()}
      />
      <div className="relative flex flex-1 flex-col items-center gap-6 py-6">
        {data?.message && <div className="quran-alert">{data.message}</div>}
        <QuranCanvas
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
          surahName={surah?.name_arabic}
          placeholder={placeholderContent}
        />
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
