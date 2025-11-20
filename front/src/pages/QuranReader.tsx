/**
 * QuranReader Page
 * Modern edge-to-edge Quran page viewer with RTL navigation
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageView from '../components/Quran/PageView';
import AyahOverlay from '../components/Quran/AyahOverlay';
// import AudioPlayer from '../components/Quran/AudioPlayer'; // TODO: Implement audio feature
import { getPage, getChapters } from '../services/quranService';
import type { Ayah } from '../types/quran';
import '../styles/quran.css';

export default function QuranReader() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get page from URL or localStorage
  const getInitialPage = (): number => {
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const parsed = parseInt(urlPage, 10);
      if (parsed >= 1 && parsed <= 604) return parsed;
    }
    
    // Try to get last read position
    try {
      const lastRead = localStorage.getItem('quran-last-page');
      if (lastRead) {
        const parsed = parseInt(lastRead, 10);
        if (parsed >= 1 && parsed <= 604) return parsed;
      }
    } catch (e) {
      console.error('Error reading last page:', e);
    }
    
    return 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage());
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [pageData, setPageData] = useState<{
    ayat: Ayah[];
    boundingBoxes?: Array<{
      ayah_number: number;
      surah_id: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahName, setSurahName] = useState<string>('');
  const [darkMode, setDarkMode] = useState(true);

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPage(currentPage);
        setPageData(data);
        
        // Get surah name for the first ayah on the page
        if (data.ayat && data.ayat.length > 0) {
          const chapters = await getChapters();
          const surah = chapters.find(c => c.id === data.ayat[0].surah_id);
          if (surah) {
            setSurahName(surah.name_ar);
          }
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setError('فشل تحميل الصفحة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [currentPage]);

  // Update URL and localStorage when page changes
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
    localStorage.setItem('quran-last-page', currentPage.toString());
  }, [currentPage, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= 604) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleToolbar = () => {
    setToolbarVisible(!toolbarVisible);
  };

  const handleGoToPage = () => {
    const input = prompt('أدخل رقم الصفحة (1-604):', currentPage.toString());
    if (input) {
      const page = parseInt(input, 10);
      if (page >= 1 && page <= 604) {
        setCurrentPage(page);
      } else {
        alert('رقم صفحة غير صحيح');
      }
    }
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    alert('البحث - قريباً إن شاء الله');
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBack = () => {
    navigate('/quran');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Top Bar */}
      <div className="quran-top-bar">
        <button
          className="toolbar-btn"
          onClick={handleBack}
          aria-label="رجوع"
        >
          رجوع
        </button>
        
        <div className="quran-top-bar-title">
          {surahName || 'القرآن الكريم'} - صفحة {currentPage}
        </div>
        
        <div className="quran-top-bar-actions">
          <button
            className="toolbar-btn"
            onClick={handleSearch}
            aria-label="بحث"
          >
            🔍
          </button>
          <button
            className="toolbar-btn"
            onClick={handleToggleDarkMode}
            aria-label={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20">
        {loading && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="mt-4 text-sm text-gray-400">جاري التحميل...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <PageView
            pageNumber={currentPage}
            onPageChange={handlePageChange}
            onTap={handleToggleToolbar}
          />
        )}

        {/* Ayah Overlays - TODO: Implement when API provides bounding boxes */}
        {pageData?.boundingBoxes && pageData.boundingBoxes.length > 0 && (
          <AyahOverlay
            boundingBoxes={pageData.boundingBoxes}
            ayat={pageData.ayat}
            imageWidth={1000} // TODO: Get actual image dimensions
            imageHeight={1414}
          />
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className={`quran-toolbar ${!toolbarVisible ? 'hidden' : ''}`}>
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={handleGoToPage}
            aria-label="الذهاب إلى صفحة"
          >
            📑 فهرس
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="الصفحة السابقة"
          >
            →
          </button>
          <span className="text-sm text-gray-300">
            {currentPage} / 604
          </span>
          <button
            className="toolbar-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= 604}
            aria-label="الصفحة التالية"
          >
            ←
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => alert('الصوتيات - قريباً')}
            aria-label="تشغيل الصوت"
          >
            🔊 صوت
          </button>
        </div>
      </div>
    </div>
  );
}
