/**
 * QuranClassic Page
 * Classic text view for Quran with Uthmanic font
 * Optimized for printing and reading
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Printer } from "lucide-react";
import { getSurahAyat, getChapters } from "../services/quranService";
import "../styles/quran.css";

interface Surah {
  id: number;
  name_ar: string;
  ayah_count: number;
  bismillah_pre?: boolean;
}

interface Ayah {
  ayah_number: number;
  text_ar: string;
}

export default function QuranClassic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const surahIdParam = searchParams.get("surah");
  
  const [chapters, setChapters] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [surahData, setSurahData] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load chapters on mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const data = await getChapters();
        setChapters(data);
        
        // Set initial surah from URL or default to 1
        const initialSurah = surahIdParam ? parseInt(surahIdParam, 10) : 1;
        if (initialSurah >= 1 && initialSurah <= 114) {
          setSelectedSurah(initialSurah);
        }
      } catch (error) {
        console.error("Error loading chapters:", error);
        // Use fallback data if API fails
        setChapters([
          { id: 1, name_ar: "الفاتحة", ayah_count: 7 },
          { id: 2, name_ar: "البقرة", ayah_count: 286 },
          // Add more as needed
        ]);
      }
    };

    loadChapters();
  }, [surahIdParam]);

  // Load surah ayahs when selection changes
  useEffect(() => {
    const loadSurah = async () => {
      setIsLoading(true);
      try {
        const ayahsData = await getSurahAyat(selectedSurah);
        setAyahs(ayahsData);
        
        const surah = chapters.find((s) => s.id === selectedSurah);
        setSurahData(surah || null);
      } catch (error) {
        console.error("Error loading surah:", error);
        setAyahs([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedSurah && chapters.length > 0) {
      loadSurah();
    }
  }, [selectedSurah, chapters]);

  const handleSurahChange = (surahId: number) => {
    setSelectedSurah(surahId);
    navigate(`/quran/classic?surah=${surahId}`, { replace: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const goBack = () => {
    navigate(-1);
  };

  const bismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header - hidden on print */}
      <header className="quran-header print:hidden">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={goBack}
            className="btn btn-ghost btn-sm"
            aria-label="رجوع"
          >
            <ArrowRight size={20} />
            <span className="mr-2">رجوع</span>
          </button>

          <div className="flex items-center gap-4">
            <select
              value={selectedSurah}
              onChange={(e) => handleSurahChange(parseInt(e.target.value, 10))}
              className="select select-bordered select-sm"
              aria-label="اختر السورة"
            >
              {chapters.map((surah) => (
                <option key={surah.id} value={surah.id}>
                  {surah.id}. {surah.name_ar}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="طباعة"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="quran-classic-view pt-20">
        {isLoading ? (
          <div className="quran-loading">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Surah header */}
            {surahData && (
              <div className="surah-header">
                <h1 className="surah-name">{surahData.name_ar}</h1>
                <p className="text-sm opacity-70">
                  {surahData.ayah_count} آية
                </p>
              </div>
            )}

            {/* Bismillah - skip for Al-Fatiha and At-Tawbah */}
            {surahData && surahData.id !== 1 && surahData.id !== 9 && (
              <div className="quran-bismillah">
                <p className="quran-ayah__text">{bismillah}</p>
              </div>
            )}

            {/* Ayahs */}
            <div className="quran-manuscript">
              <div className="quran-manuscript__body">
                {ayahs.map((ayah) => (
                  <div key={ayah.ayah_number} className="quran-ayah">
                    <div className="quran-ayah__text">
                      {ayah.text_ar}
                      <span className="ayah-number">{ayah.ayah_number}</span>
                    </div>
                  </div>
                ))}

                {ayahs.length === 0 && (
                  <div className="text-center py-8 opacity-70">
                    لم يتم العثور على آيات
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
