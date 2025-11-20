/**
 * QuranClassic Page
 * 
 * Classic text-based Quran view for reading and printing
 * Features:
 * - Uthmanic text font
 * - Printable layout
 * - Text-align: justify
 * - RTL direction
 * - Print-friendly styling
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';
import { getSurahAyat, getChapters } from '../services/quranService';
import type { Ayah, Surah } from '../types/quran';

export default function QuranClassic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const surahParam = searchParams.get('surah');
  const initialSurah = surahParam ? parseInt(surahParam, 10) : 1;

  const [currentSurah, setCurrentSurah] = useState(initialSurah);
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [surahInfo, setSurahInfo] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch surah data
  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch surah ayat
        const ayatData = await getSurahAyat(currentSurah);
        setAyat(ayatData);

        // Fetch chapters list to get surah info
        const chapters = await getChapters();
        const surah = chapters.find((s: Surah) => s.id === currentSurah);
        setSurahInfo(surah || null);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching surah data:', err);
        setError('فشل في تحميل بيانات السورة');
        setLoading(false);
      }
    };

    if (currentSurah >= 1 && currentSurah <= 114) {
      fetchSurahData();
    }
  }, [currentSurah]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate('/quran');
  };

  return (
    <div className="min-h-screen bg-base-100" dir="rtl">
      {/* Header - hidden on print */}
      <header className="bg-base-200 border-b border-base-300 print:hidden sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="btn btn-ghost btn-sm gap-2"
              aria-label="رجوع"
            >
              <ArrowRight size={20} />
              <span>رجوع</span>
            </button>

            <h1 className="text-xl font-bold">
              {surahInfo?.name_arabic || 'القرآن الكريم'}
            </h1>

            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm gap-2"
              aria-label="طباعة"
            >
              <Printer size={18} />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="mt-4 text-base-content">جاري التحميل...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="quran-manuscript">
            {/* Surah header */}
            {surahInfo && (
              <div className="text-center mb-8 print:mb-4">
                <h2 className="text-3xl font-bold mb-2 quran-manuscript__body">
                  سورة {surahInfo.name_arabic}
                </h2>
                <p className="text-base-content text-opacity-70">
                  {surahInfo.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {surahInfo.verses_count} آية
                </p>
              </div>
            )}

            {/* Bismillah (except for Al-Tawbah) */}
            {currentSurah !== 9 && currentSurah !== 1 && (
              <div className="quran-bismillah">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            {/* Ayat */}
            <div className="quran-manuscript__body">
              {ayat.length > 0 ? (
                <div className="space-y-6">
                  {ayat.map((ayah: Ayah, index: number) => (
                    <div key={ayah.id || index} className="quran-ayah">
                      <p className="quran-ayah__text">
                        {ayah.text_uthmani || ayah.text || 'نص الآية غير متوفر'}
                        <span className="quran-ayah__number">
                          {ayah.verse_number || index + 1}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-base-content text-opacity-70 py-8">
                  قريباً - سيتم جلب نص السورة من API الرسمي
                </p>
              )}
            </div>

            {/* Print footer */}
            <div className="hidden print:block mt-8 text-center text-sm text-base-content text-opacity-70">
              <p>مصحف الهدى التعليمية</p>
              <p>المصدر: مجمع الملك فهد لطباعة المصحف الشريف</p>
            </div>
          </div>
        )}
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          
          .quran-manuscript {
            max-width: 100%;
            padding: 0;
          }

          .quran-manuscript__body {
            padding: 1cm;
          }

          .quran-ayah__text {
            font-size: 18pt;
            line-height: 2.5;
          }

          .quran-ayah__number {
            font-size: 14pt;
          }

          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
