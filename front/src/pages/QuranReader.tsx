/**
 * QuranReader Page Component
 * Main page for reading Quran with page images and interactive overlays
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageView from '../components/Quran/PageView';
import AyahOverlay from '../components/Quran/AyahOverlay';
import AudioPlayer from '../components/Quran/AudioPlayer';
import type { AyahBoundingBox } from '../components/Quran/AyahOverlay';
import { 
  getPageBoundingBoxes,
  saveLastReadPosition,
  getLastReadPosition,
  getAyahAudioUrl,
} from '../services/quranService';
import { Book, Home, Menu } from 'lucide-react';
import '../styles/quran.css';

interface AyahData {
  text: string;
  tafsir?: string;
  audioUrl?: string;
}

const QuranReader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const pageParam = searchParams.get('page');
    const lastRead = getLastReadPosition();
    return pageParam ? parseInt(pageParam, 10) : (lastRead?.page || 1);
  });
  
  const [boundingBoxes, setBoundingBoxes] = useState<AyahBoundingBox[]>([]);
  const [activeAyah, setActiveAyah] = useState<number | undefined>();
  const [ayahData, setAyahData] = useState<AyahData | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Load bounding boxes for current page
  useEffect(() => {
    const loadBoundingBoxes = async () => {
      try {
        const boxes = await getPageBoundingBoxes(currentPage);
        setBoundingBoxes(boxes);
      } catch (error) {
        console.error('Error loading bounding boxes:', error);
        setBoundingBoxes([]);
      }
    };

    loadBoundingBoxes();
  }, [currentPage]);

  // Update URL when page changes
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
  }, [currentPage, setSearchParams]);

  // Save last read position
  useEffect(() => {
    if (activeAyah) {
      // TODO: Get actual surah from page data
      saveLastReadPosition(1, activeAyah, currentPage);
    }
  }, [currentPage, activeAyah]);

  // Toggle toolbar with 'T' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowToolbar(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowToolbar(false);
        setAyahData(null);
        setActiveAyah(undefined);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setActiveAyah(undefined);
    setAyahData(null);
    setAudioUrl(null);
  }, []);

  const handleAyahClick = useCallback(async (surahId: number, ayahNumber: number) => {
    setActiveAyah(ayahNumber);
    
    try {
      // TODO: Fetch actual ayah text and tafsir from API
      // For now, show placeholder
      setAyahData({
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        tafsir: 'التفسير سيتم إضافته قريباً من المصدر الرسمي',
        audioUrl: getAyahAudioUrl(surahId, ayahNumber),
      });
      
      const audio = getAyahAudioUrl(surahId, ayahNumber);
      setAudioUrl(audio);
    } catch (error) {
      console.error('Error loading ayah data:', error);
    }
  }, []);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleGoToClassic = useCallback(() => {
    window.location.href = '/quran/classic';
  }, []);

  // Calculate Juz and Hizb from page
  const getPageInfo = (page: number) => {
    const juz = Math.ceil(page / 20);
    const hizb = Math.ceil(page / 10);
    return { juz, hizb };
  };

  const pageInfo = getPageInfo(currentPage);

  return (
    <div className="quran-container min-h-screen bg-[#041b10] relative">
      {/* Top Bar */}
      {showTopBar && (
        <div className="quran-top-bar flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="btn btn-sm btn-ghost"
              aria-label="الرئيسية"
            >
              <Home size={20} />
            </button>
            <h1 className="text-lg font-bold">مصحف الهدى</h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span>الجزء {pageInfo.juz}</span>
            <span className="opacity-50">•</span>
            <span>الحزب {pageInfo.hizb}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToClassic}
              className="btn btn-sm btn-ghost"
              aria-label="العرض التقليدي"
            >
              <Book size={20} />
            </button>
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="btn btn-sm btn-ghost"
              aria-label="الأدوات"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative" style={{ height: 'calc(100vh - 3rem)' }}>
        <PageView
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={604}
        />
        
        {/* TODO: Add AyahOverlay when bounding box data is available */}
        {boundingBoxes.length > 0 && (
          <AyahOverlay
            boundingBoxes={boundingBoxes}
            imageWidth={1000}
            imageHeight={1400}
            onAyahClick={handleAyahClick}
            activeAyah={activeAyah}
            ayahData={ayahData}
          />
        )}
        
        {/* TODO Notice for bounding boxes */}
        {boundingBoxes.length === 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-900/80 text-yellow-100 px-4 py-2 rounded-lg text-sm">
            تنبيه: بيانات الآيات التفاعلية قيد التطوير
          </div>
        )}
      </div>

      {/* Hidden Toolbar */}
      <div className={`hidden-toolbar ${showToolbar ? 'visible' : ''}`}>
        <div className="toolbar-controls">
          <div className="flex items-center gap-2">
            <label className="text-sm">الانتقال إلى صفحة:</label>
            <input
              type="number"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value, 10);
                if (page >= 1 && page <= 604) {
                  handlePageChange(page);
                }
              }}
              className="input input-sm w-20"
              aria-label="رقم الصفحة"
            />
          </div>
          
          <button
            onClick={() => setShowTopBar(!showTopBar)}
            className="btn btn-sm btn-outline"
            aria-label="إخفاء/إظهار الشريط العلوي"
          >
            {showTopBar ? 'إخفاء الشريط العلوي' : 'إظهار الشريط العلوي'}
          </button>
          
          <div className="text-sm opacity-70">
            اضغط T لإخفاء/إظهار الأدوات
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          onEnded={() => setAudioUrl(null)}
          className="fixed bottom-0 left-0 right-0"
        />
      )}

      {/* Instructions Overlay (First Time) */}
      {currentPage === 1 && !localStorage.getItem('quran_instructions_shown') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">مرحباً بك في مصحف الهدى</h2>
            <div className="text-right space-y-2 mb-6">
              <p>• استخدم الأسهم أو السحب للتنقل بين الصفحات</p>
              <p>• اضغط على الآية لعرض التفسير والاستماع</p>
              <p>• اضغط T لإظهار/إخفاء الأدوات</p>
              <p>• اضغط ESC للخروج من أي قائمة</p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('quran_instructions_shown', 'true');
                window.location.reload();
              }}
              className="btn btn-primary"
            >
              فهمت، ابدأ القراءة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranReader;
