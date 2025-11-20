/**
 * QuranClassic Page
 * Printable classic text view with Uthmanic font
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSurahList, getSurahAyat } from '../../services/quranService';
import type { Surah, Ayah } from '../../types/quran';
import '../../styles/quran.css';

export default function QuranClassic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get surah from URL
  const surahId = parseInt(searchParams.get('surah') || '1', 10);

  // Load surahs list
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const data = await getSurahList();
        setSurahs(data);
      } catch (err) {
        console.error('Error loading surahs:', err);
      }
    };
    loadSurahs();
  }, []);

  // Load surah data
  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      setError(null);

      try {
        const surah = surahs.find(s => s.id === surahId);
        if (surah) {
          setCurrentSurah(surah);
        }

        const ayatData = await getSurahAyat(surahId);
        setAyat(ayatData);
      } catch (err) {
        console.error('Error loading surah:', err);
        setError('فشل تحميل السورة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (surahs.length > 0) {
      loadSurah();
    }
  }, [surahId, surahs]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/quran');
  };

  const handleSurahChange = (newSurahId: number) => {
    navigate(`/quran/classic?surah=${newSurahId}`);
  };

  const renderBismillah = () => {
    // Don't show Bismillah for Surah At-Tawbah (9) or Al-Fatihah (it's included in text)
    if (currentSurah && currentSurah.id !== 9 && currentSurah.id !== 1) {
      return (
        <div className="quran-bismillah">
          بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Hidden in print */}
      <div className="quran-top-bar bg-white border-b border-gray-300 print:hidden">
        <button
          className="toolbar-btn border-gray-600 text-gray-700"
          onClick={handleBack}
          aria-label="رجوع"
        >
          رجوع
        </button>

        <div className="flex items-center gap-3">
          <select
            className="select select-sm select-bordered"
            value={surahId}
            onChange={(e) => handleSurahChange(parseInt(e.target.value, 10))}
            aria-label="اختيار السورة"
          >
            {surahs.map((surah) => (
              <option key={surah.id} value={surah.id}>
                {surah.name_ar}
              </option>
            ))}
          </select>

          <button
            className="toolbar-btn border-gray-600 text-gray-700"
            onClick={handlePrint}
            aria-label="طباعة"
          >
            🖨️ طباعة
          </button>

          <button
            className="toolbar-btn border-gray-600 text-gray-700"
            onClick={() => navigate(`/quran/modern?page=1`)}
            aria-label="العرض الحديث"
          >
            📱 العرض الحديث
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="quran-classic-view">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="mt-4 text-sm text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {!loading && !error && currentSurah && (
          <>
            {/* Surah Header */}
            <div className="surah-header">
              <div className="surah-name text-gray-900">
                سُورَةُ {currentSurah.name_ar}
              </div>
              <div className="surah-info text-gray-600">
                {currentSurah.revelation_place === 'Mecca' ? 'مكية' : 'مدنية'} - {currentSurah.ayah_count} آية
              </div>
            </div>

            {/* Bismillah */}
            {renderBismillah()}

            {/* Ayat */}
            <div className="quran-text text-gray-900">
              {ayat.map((ayah) => (
                <span key={ayah.ayah_number} className="ayah">
                  {ayah.text_ar}
                  <span className="ayah-number border-gray-900 text-gray-900">
                    {ayah.ayah_number}
                  </span>
                  {' '}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer - Print only */}
      <div className="hidden print:block text-center text-sm text-gray-600 mt-8 pb-4">
        <p>مصحف الهدى التعليمية - QuranCareem.edu</p>
        <p className="text-xs mt-1">المصدر: مجمع الملك فهد لطباعة المصحف الشريف</p>
      </div>
    </div>
  );
}
