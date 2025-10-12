import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuranCanvas from "../../components/QuranCanvas";
import HiddenToolbar from "../../components/HiddenToolbar";
import TopBar from "../../components/TopBar";
import TafsirPopover from "../../components/TafsirPopover";
import AudioBar from "../../components/AudioBar";
import surahList from "../../data/surah_index.json";
import ayatData from "../../data/sample_ayahs.json";
import tafsirData from "../../data/tafsir_samples.json";
import type { Ayah, Recitation, Surah, Tafsir } from "../../types/quran";
import { useAutoHide } from "../../hooks/useAutoHide";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const mockRecitations: Recitation[] = [
  {
    surah_id: 1,
    reciter: "الشيخ ماهر المعيقلي",
    url: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/001.mp3"
  }
];

function QuranModernPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { visible, show, setVisible } = useAutoHide();
  const [currentSurahId, setCurrentSurahId] = useState<number>(
    Number(query.get("surah")) || 1
  );
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [fontSize, setFontSize] = useState(32);

  const surah: Surah | undefined = useMemo(
    () => surahList.find((item) => item.id === currentSurahId),
    [currentSurahId]
  );

  const ayat: Ayah[] = useMemo(
    () => ayatData.filter((ayah) => ayah.surah_id === currentSurahId),
    [currentSurahId]
  );

  const tafsir: Tafsir | undefined = useMemo(
    () =>
      tafsirData.find(
        (item) => item.surah_id === currentSurahId && item.ayah_number === activeAyah
      ),
    [currentSurahId, activeAyah]
  );

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
  }, []);

  useEffect(() => {
    localStorage.setItem("last-reading", JSON.stringify({ surah: currentSurahId, ayah: activeAyah }));
  }, [currentSurahId, activeAyah]);

  const goPrev = () => {
    const index = surahList.findIndex((s) => s.id === currentSurahId);
    if (index > 0) {
      setCurrentSurahId(surahList[index - 1].id);
      navigate(`?surah=${surahList[index - 1].id}`);
    }
  };

  const goNext = () => {
    const index = surahList.findIndex((s) => s.id === currentSurahId);
    if (index < surahList.length - 1) {
      setCurrentSurahId(surahList[index + 1].id);
      navigate(`?surah=${surahList[index + 1].id}`);
    }
  };

  return (
    <div className="w-full h-full bg-primary-dark text-gray-100" onClick={() => show()}>
      <TopBar
        surah={surah}
        onToggleMode={() => navigate("/quran/classic?surah=" + currentSurahId)}
        onOpenSearch={() => show()}
      />
      <div className="pt-16 h-full" style={{ fontSize }}>
        <QuranCanvas
          ayat={ayat}
          activeAyah={activeAyah}
          onSelectAyah={(ayah) => {
            setActiveAyah(ayah.ayah_number);
            const range = window.getSelection();
            const rect = range?.getRangeAt(0).getBoundingClientRect();
            setAnchorRect(rect ?? null);
            show();
          }}
          onSwipe={(direction) => (direction === "next" ? goNext() : goPrev())}
        />
      </div>
      <AudioBar
        recitations={mockRecitations.map((recitation) => ({ ...recitation, surah_id: currentSurahId }))}
        onProgress={(time) => {
          const index = Math.floor(time / 5);
          setActiveAyah(ayat[index]?.ayah_number);
        }}
      />
      <HiddenToolbar
        visible={visible}
        surahList={surahList}
        currentSurah={surah}
        onToggleMode={() => navigate("/quran/classic?surah=" + currentSurahId)}
        onSelectSurah={(id) => {
          setCurrentSurahId(id);
          navigate(`?surah=${id}`);
        }}
        onPrev={goPrev}
        onNext={goNext}
        onFontChange={(delta) => setFontSize((prev) => Math.max(22, prev + delta))}
        onToggleAudio={() => show()}
        onShowTafsir={() => show()}
      />
      <TafsirPopover tafsir={tafsir} anchorRect={anchorRect} onClose={() => setActiveAyah(undefined)} />
    </div>
  );
}

export default QuranModernPage;
