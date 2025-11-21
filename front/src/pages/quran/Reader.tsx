/**
 * QuranReader Page - Modern Image-based Quran Reader
 * قارئ القرآن الكريم - عرض حديث بالصور
 * 
 * Features:
 * - Edge-to-edge page images from King Fahd Complex
 * - Interactive verse highlighting with overlay
 * - Swipe/keyboard navigation
 * - Last reading position persistence
 * - Audio playback for verses
 * - Tafsir popover display
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search, Sun, Moon } from 'lucide-react';
import PageView from '../../components/Quran/PageView';
import AyahOverlay from '../../components/Quran/AyahOverlay';
import type { VerseBox } from '../../components/Quran/AyahOverlay';
import { getPageMeta } from '../../services/quranService';
import '../../styles/quran.css';

const QuranReader: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showOverlay, setShowOverlay] = useState(false);
  const [verses, setVerses] = useState<VerseBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(1200);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);

  // Load verse coordinates for the current page
  useEffect(() => {
    const loadPageCoordinates = async () => {
      setLoading(true);
      try {
        const meta = await getPageMeta(currentPage);
        
        if (meta && meta.verses) {
          setVerses(meta.verses);
        } else {
          // If no coordinates available, set empty array
          setVerses([]);
        }
      } catch (error) {
        // Coordinates not available for this page - this is expected behavior
        // The UI will show an appropriate message to the user
        setVerses([]);
      } finally {
        setLoading(false);
      }
    };

    loadPageCoordinates();
  }, [currentPage]);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    navigate(`?${params.toString()}`, { replace: true });
  }, [currentPage, navigate]);

  // Toggle toolbar visibility with 'T' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') {
        setShowToolbar(prev => !prev);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    setShowOverlay(false); // Hide overlay when changing pages
  }, []);

  const handlePageClick = useCallback(() => {
    if (verses.length > 0) {
      setShowOverlay(prev => !prev);
    }
  }, [verses]);

  const handleBack = () => {
    navigate('/quran');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div 
      className={`relative min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gray-100'}`}
      dir="rtl"
    >
      {/* Top Toolbar */}
      <div 
        className={`quran-toolbar ${showToolbar ? 'quran-toolbar-visible' : 'quran-toolbar-hidden'}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="btn btn-sm btn-ghost gap-2"
            aria-label="رجوع إلى الفهرس"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">رجوع</span>
          </button>

          <h1 className="text-lg font-semibold text-accent flex items-center gap-2">
            <BookOpen size={20} />
            <span>قارئ القرآن الكريم</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlay(prev => !prev)}
            className={`btn btn-sm ${showOverlay ? 'btn-primary' : 'btn-ghost'}`}
            disabled={verses.length === 0}
            aria-label="عرض الآيات التفاعلية"
            title={verses.length === 0 ? 'الإحداثيات غير متوفرة لهذه الصفحة' : 'عرض الآيات التفاعلية'}
          >
            <Search size={18} />
            {showOverlay ? 'إخفاء' : 'الآيات'}
          </button>

          <button
            onClick={toggleDarkMode}
            className="btn btn-sm btn-ghost"
            aria-label="تبديل الوضع الليلي"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        <PageView
          initialPage={currentPage}
          onPageChange={handlePageChange}
          onPageClick={handlePageClick}
          showNavigation={true}
          enableSwipe={true}
          enableKeyboard={true}
        />

        {/* Verse Overlay */}
        {showOverlay && verses.length > 0 && (
          <AyahOverlay
            pageNumber={currentPage}
            verses={verses}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            visible={showOverlay}
            onClose={() => setShowOverlay(false)}
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            جاري تحميل بيانات الصفحة...
          </div>
        )}

        {/* Info message when coordinates not available */}
        {!loading && verses.length === 0 && showOverlay && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm max-w-md text-center">
            إحداثيات الآيات غير متوفرة لهذه الصفحة حالياً
          </div>
        )}
      </div>

      {/* Bottom Toolbar (hidden by default, shown with 'T' key) */}
      <div className={`quran-bottom-bar ${showToolbar ? 'visible' : ''}`}>
        <div className="text-sm text-gray-400">
          اضغط T لإخفاء/إظهار الأشرطة • اضغط على الصفحة لعرض الآيات التفاعلية
          {verses.length > 0 && ` • ${verses.length} آية متاحة`}
        </div>
      </div>
    </div>
  );
};

export default QuranReader;
