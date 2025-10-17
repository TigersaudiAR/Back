import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import TafsirPopover from "../../components/TafsirPopover";
import AudioBar from "../../components/AudioBar";
import type { Ayah, Surah, Tafsir } from "../../types/quran";
import { useAutoHide } from "../../hooks/useAutoHide";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function QuranModernPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { visible, show, setVisible } = useAutoHide();
  const [currentSurahId, setCurrentSurahId] = useState<number>(Number(query.get("surah")) || 1);
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

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
  const { data, loading, error, refresh } = useQuranSurah(currentSurahId);

  const surah: Surah | undefined = data?.surah;
  const ayat: Ayah[] = data?.ayat ?? [];
  const tafsirMap = useMemo(() => new Map<string, Tafsir>(), [data?.tafsir]);

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
      navigate(`?surah=${target}`);
    }
  };

  const goNext = () => {
    if (!surahs.length) return;
    const index = surahs.findIndex((s) => s.id === currentSurahId);
    if (index >= 0 && index < surahs.length - 1) {
      const target = surahs[index + 1].id;
      setCurrentSurahId(target);
      navigate(`?surah=${target}`);
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

  return (
    <div className="relative flex h-full min-h-[100dvh] w-full flex-col bg-primary-dark text-gray-100" onClick={() => show()}>
      <TopBar
        surah={surah}
        onToggleMode={() => navigate(`/quran/classic?surah=${currentSurahId}`)}
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
          onProgress={(time) => {
            const index = Math.floor(time / 5);
            setActiveAyah(ayat[index]?.ayah_number);
          }}
        />
      )}
      <HiddenToolbar
        visible={visible}
        surahList={surahs}
        currentSurah={surah}
        onToggleMode={() => navigate(`/quran/classic?surah=${currentSurahId}`)}
        onSelectSurah={(id) => {
          setCurrentSurahId(id);
          navigate(`?surah=${id}`);
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
