/**
 * QuranClassic Page Component
 * Classic text view with Uthmanic font and print support
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSurahList, getSurahAyat } from '../services/quranService';
import type { Surah, Ayah } from '../types/quran';
import { Printer, ArrowLeft, Book } from 'lucide-react';
import '../styles/quran.css';

const QuranClassic: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<number>(() => {
    const surahParam = searchParams.get('surah');
    return surahParam ? parseInt(surahParam, 10) : 1;
  });
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load surahs list
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const data = await getSurahList();
        setSurahs(data);
      } catch (err) {
        console.error('Error loading surahs:', err);
        setError('حدث خطأ في تحميل قائمة السور');
      }
    };

    loadSurahs();
  }, []);

  // Load ayat for current surah
  useEffect(() => {
    const loadAyat = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getSurahAyat(currentSurah);
        setAyat(data);
      } catch (err) {
        console.error('Error loading ayat:', err);
        setError('حدث خطأ في تحميل الآيات');
      } finally {
        setLoading(false);
      }
    };

    loadAyat();
  }, [currentSurah]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToReader = () => {
    navigate('/quran/reader');
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahId = parseInt(e.target.value, 10);
    setCurrentSurah(surahId);
    navigate(`/quran/classic?surah=${surahId}`);
  };

  const currentSurahData = surahs.find(s => s.id === currentSurah);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header - Hidden on Print */}
      <div className="bg-base-200 border-b border-base-300 print:hidden sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="btn btn-sm btn-ghost"
                aria-label="رجوع"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold">القرآن الكريم - العرض التقليدي</h1>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentSurah}
                onChange={handleSurahChange}
                className="select select-sm select-bordered"
                aria-label="اختر السورة"
              >
                {surahs.map(surah => (
                  <option key={surah.id} value={surah.id}>
                    {surah.name_ar}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGoToReader}
                className="btn btn-sm btn-outline"
                aria-label="عرض الصفحات"
              >
                <Book size={18} />
                <span className="hidden sm:inline">عرض الصفحات</span>
              </button>

              <button
                onClick={handlePrint}
                className="btn btn-sm btn-primary"
                aria-label="طباعة"
              >
                <Printer size={18} />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="quran-classic-view py-8">
        {loading && (
          <div className="quran-loading">
            <div className="spinner"></div>
            <p className="mt-4">جاري تحميل السورة...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && currentSurahData && (
          <>
            {/* Surah Header */}
            <div className="surah-header">
              <h2 className="surah-name">{currentSurahData.name_ar}</h2>
              <div className="surah-info">
                <span>{currentSurahData.revelation_place === 'Mecca' ? 'مكية' : 'مدنية'}</span>
                <span className="mx-2">•</span>
                <span>{currentSurahData.ayah_count} آية</span>
              </div>
            </div>

            {/* Bismillah */}
            {currentSurahData.bismillah_pre && currentSurah !== 1 && currentSurah !== 9 && (
              <div className="quran-bismillah">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            {/* Ayat */}
            <div className="space-y-6">
              {ayat.map((ayah) => (
                <div key={ayah.ayah_number} className="quran-ayah">
                  <div className="quran-ayah__button">
                    <span className="quran-ayah__text">
                      {ayah.text_ar}
                      <span className="ayah-number">
                        {ayah.ayah_number}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Centered */}
            <div className="text-center mt-12 pt-8 border-t border-base-300">
              <p className="text-sm opacity-70">
                صدق الله العظيم
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && ayat.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">لا توجد آيات</p>
          </div>
        )}
      </div>

      {/* Print-only Footer */}
      <div className="hidden print:block text-center mt-8 pt-4 border-t">
        <p className="text-sm">مصحف الهدى - منصة تعليمية للقرآن الكريم</p>
        <p className="text-xs opacity-70 mt-1">
          المصدر: مجمع الملك فهد لطباعة المصحف الشريف
        </p>
      </div>
    </div>
  );
};

export default QuranClassic;
