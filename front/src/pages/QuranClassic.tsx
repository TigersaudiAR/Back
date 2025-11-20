import { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { getSurahList, getSurahAyat } from '../services/quranService';
import type { Surah, Ayah } from '../types/quran';

/**
 * Classic text-based Quran view
 * Features:
 * - Printable layout with Uthmanic font
 * - Text-justify alignment
 * - Clean, distraction-free reading
 * - Print-optimized styling
 */
function QuranClassic() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load surah list on mount
  useEffect(() => {
    loadSurahList();
  }, []);

  const loadSurahList = async () => {
    try {
      setLoading(true);
      const data = await getSurahList();
      setSurahs(data);
    } catch (err) {
      setError('فشل تحميل قائمة السور');
      console.error('Error loading surahs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSurah = async (surahId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSurahAyat(surahId);
      setAyat(data);
      setSelectedSurah(surahId);
    } catch (err) {
      setError('فشل تحميل السورة');
      console.error('Error loading surah:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    alert('سيتم إضافة ميزة التحميل قريباً إن شاء الله');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" dir="rtl">
      {/* Header - Hidden when printing */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white py-6 px-4 print:hidden">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">
            القرآن الكريم - النص الكامل
          </h1>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <select
              value={selectedSurah || ''}
              onChange={(e) => loadSurah(parseInt(e.target.value))}
              className="select select-bordered bg-white text-gray-800 w-full max-w-xs"
              disabled={loading}
              aria-label="اختر السورة"
            >
              <option value="">اختر السورة...</option>
              {surahs.map((surah) => (
                <option key={surah.id} value={surah.id}>
                  {surah.name_ar} ({surah.ayah_count} آية)
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm gap-2"
              disabled={!selectedSurah}
              aria-label="طباعة السورة"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>

            <button
              onClick={handleDownload}
              className="btn btn-outline btn-sm gap-2"
              disabled={!selectedSurah}
              aria-label="تحميل السورة"
            >
              <Download className="w-4 h-4" />
              تحميل PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="alert alert-error mb-4 print:hidden">
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12 print:hidden">
            <div className="loading loading-spinner loading-lg text-green-700"></div>
          </div>
        )}

        {!selectedSurah && !loading && (
          <div className="text-center py-12 print:hidden">
            <p className="text-xl text-gray-600">
              اختر السورة من القائمة أعلاه لعرض نصها الكامل
            </p>
          </div>
        )}

        {selectedSurah && ayat.length > 0 && (
          <div className="quran-manuscript bg-white rounded-lg shadow-lg print:shadow-none">
            {/* Surah Header */}
            <div className="text-center py-8 border-b-2 border-green-200">
              <h2 className="text-3xl font-bold text-green-800 mb-2">
                {surahs.find(s => s.id === selectedSurah)?.name_ar}
              </h2>
              {surahs.find(s => s.id === selectedSurah)?.bismillah_pre !== false && (
                <p className="quran-bismillah text-2xl mt-4">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </div>

            {/* Ayat */}
            <div className="quran-manuscript__body">
              {ayat.map((ayah) => (
                <div key={`${ayah.surah_id}-${ayah.ayah_number}`} className="quran-ayah">
                  <p className="quran-ayah__text">
                    {ayah.text_ar}
                    {' '}
                    <span className="ayah-number" aria-label={`آية ${ayah.ayah_number}`}>
                      {ayah.ayah_number}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Footer - Only for print */}
            <div className="hidden print:block text-center py-6 border-t-2 border-green-200 text-sm text-gray-600">
              <p>مصحف الهدى - منصة تعليمية للقرآن الكريم</p>
              <p className="text-xs mt-2">
                المصدر: مجمع الملك فهد لطباعة المصحف الشريف
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default QuranClassic;
