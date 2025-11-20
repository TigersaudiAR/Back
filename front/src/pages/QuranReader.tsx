/**
 * QuranReader Page
 * Modern Quran reader with page images from King Fahd Complex
 * Features: RTL navigation, zoom, audio, ayah overlay, persistent position
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Search, Moon, Sun, ZoomIn, ZoomOut, BookOpen, Menu } from 'lucide-react';
import PageView from '../components/Quran/PageView';
import AudioPlayer from '../components/Quran/AudioPlayer';
import ErrorToast from '../components/ErrorToast';
import { getAudioUrls } from '../services/quranService';
import '../styles/quran.css';

const LAST_PAGE_KEY = 'quran_last_page';
const THEME_KEY = 'quran_theme';

const QuranReader: React.FC = () => {
  // Load last read position from localStorage
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem(LAST_PAGE_KEY);
    return saved ? parseInt(saved, 10) : 1;
  });

  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : true;
  });
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showAudio, setShowAudio] = useState(false);
  const [surahName, setSurahName] = useState('القرآن الكريم');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Save last read position
  useEffect(() => {
    localStorage.setItem(LAST_PAGE_KEY, currentPage.toString());
  }, [currentPage]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Toggle toolbar visibility
  const toggleToolbar = useCallback(() => {
    setToolbarVisible(prev => !prev);
  }, []);

  // Toggle search
  const toggleSearch = useCallback(() => {
    setSearchVisible(prev => !prev);
    if (!searchVisible) {
      setToolbarVisible(false);
    }
  }, [searchVisible]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  // Page navigation
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= 604) {
      setCurrentPage(newPage);
    }
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < 604) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    const pageNum = parseInt(page.toString(), 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
      setCurrentPage(pageNum);
      setToolbarVisible(false);
    }
  }, []);

  // Audio playback (قريباً - Coming Soon)
  const handlePlayAudio = useCallback(async () => {
    try {
      const urls = await getAudioUrls(currentPage);
      if (urls && urls.length > 0) {
        setAudioUrl(urls[0]);
        setShowAudio(true);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setErrorMessage('عذراً، حدث خطأ في تحميل الصوت');
    }
  }, [currentPage]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-base-100">
      {/* Fixed RTL Header */}
      <header className="quran-header">
        <div className="quran-header-controls">
          <button
            onClick={() => window.history.back()}
            className="btn btn-ghost btn-sm quran-button"
            aria-label="رجوع"
          >
            <ArrowRight size={20} />
            <span className="hidden sm:inline mr-1">رجوع</span>
          </button>

          <h1 className="text-lg font-bold text-base-content flex-1 text-center">
            {surahName} - صفحة {currentPage}
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSearch}
              className="btn btn-ghost btn-sm quran-button"
              aria-label="بحث"
              title="بحث - قريباً"
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm quran-button"
              aria-label={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleToolbar}
              className="btn btn-ghost btn-sm quran-button"
              aria-label="القائمة"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page View */}
      <div className="pt-14">
        <PageView
          pageNumber={currentPage}
          onPageChange={handlePageChange}
          onTap={toggleToolbar}
          zoom={zoom}
        />
      </div>

      {/* Bottom Toolbar (Hidden by default, toggle with tap or 'T') */}
      <div className={`quran-toolbar ${toolbarVisible ? 'visible' : ''}`}>
        <div className="quran-toolbar-controls">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToNextPage}
              disabled={currentPage >= 604}
              className="btn btn-sm btn-primary quran-button"
              aria-label="الصفحة التالية"
            >
              التالي
            </button>

            <input
              type="number"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10))}
              className="input input-sm input-bordered w-20 text-center"
              aria-label="رقم الصفحة"
            />

            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="btn btn-sm btn-primary quran-button"
              aria-label="الصفحة السابقة"
            >
              السابق
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="btn btn-sm btn-ghost quran-button"
              aria-label="تصغير"
            >
              <ZoomOut size={20} />
            </button>

            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="btn btn-sm btn-ghost quran-button"
              aria-label="تكبير"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Audio controls - قريباً */}
          <button
            onClick={handlePlayAudio}
            className="btn btn-sm btn-ghost quran-button"
            aria-label="تشغيل الصوت - قريباً"
            title="قريباً"
          >
            <BookOpen size={20} />
            <span className="hidden sm:inline mr-1">قريباً</span>
          </button>
        </div>
      </div>

      {/* Audio Player (when active) */}
      {showAudio && audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          title={`صفحة ${currentPage}`}
          onEnded={() => setShowAudio(false)}
        />
      )}

      {/* Search Panel (قريباً - Coming Soon) */}
      {searchVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-base-100 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">البحث في القرآن الكريم</h2>
            <p className="text-center py-8 text-base-content/70">
              ميزة البحث قيد التطوير - قريباً إن شاء الله
            </p>
            <button
              onClick={toggleSearch}
              className="btn btn-primary w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  );
};

export default QuranReader;
