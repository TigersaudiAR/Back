/**
 * QuranReader Page - Modern edge-to-edge image page reader
 * RTL support with small fixed header and hidden bottom toolbar
 * Saves last-read position in localStorage
 * Keyboard and touch navigation with ayah overlays
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageView from '../components/Quran/PageView';
import AyahOverlay from '../components/Quran/AyahOverlay';
import AudioPlayer from '../components/Quran/AudioPlayer';
import { getPageMeta, saveLastPosition, loadLastPosition, getAudioUrls } from '../services/quranService';
import type { PageMetadata } from '../types/quranReader';
import { BookOpen, Settings, Home } from 'lucide-react';

export default function QuranReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize page from URL or last position
  const getInitialPage = (): number => {
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const page = parseInt(urlPage, 10);
      if (page >= 1 && page <= 604) return page;
    }
    
    const lastPos = loadLastPosition();
    return lastPos?.page || 1;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [showToolbar, setShowToolbar] = useState(false);
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);

  // Load page metadata for ayah overlays
  useEffect(() => {
    getPageMeta(currentPage)
      .then(setPageMetadata)
      .catch(console.error);
  }, [currentPage]);

  // Save current page to localStorage and URL
  useEffect(() => {
    saveLastPosition({ page: currentPage });
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setShowToolbar(false); // Hide toolbar when navigating
  }, []);

  // Handle ayah click - load audio
  const handleAyahClick = useCallback(async (surah: number, _ayah: number) => {
    try {
      const urls = await getAudioUrls(surah);
      if (urls && urls.length > 0) {
        // TODO: Select specific ayah audio URL based on ayah number
        setAudioUrl(urls[0]);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }, []);

  // Toggle toolbar with 'T' key or tap
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        setShowToolbar(prev => !prev);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Handle main content tap to toggle toolbar
  const handleContentTap = useCallback(() => {
    setShowToolbar(prev => !prev);
  }, []);

  // Go to page dialog
  const handleGoToPage = useCallback(() => {
    const pageStr = prompt('انتقل إلى صفحة (1-604):', currentPage.toString());
    if (pageStr) {
      const page = parseInt(pageStr, 10);
      if (page >= 1 && page <= 604) {
        handlePageChange(page);
      } else {
        alert('رقم الصفحة غير صحيح. يجب أن يكون بين 1 و 604.');
      }
    }
  }, [currentPage, handlePageChange]);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900" dir="rtl">
      {/* Fixed Header - Small and unobtrusive */}
      <header className="flex-none bg-primary text-primary-content shadow-lg z-20">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <BookOpen size={20} />
            <h1 className="text-lg font-semibold">مصحف الهدى</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToPage}
              className="btn btn-ghost btn-sm"
              aria-label="الانتقال إلى صفحة"
              title="الانتقال إلى صفحة (G)"
            >
              <span className="text-sm">صفحة {currentPage}</span>
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="الإعدادات"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="الصفحة الرئيسية"
            >
              <Home size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Page Viewer */}
      <main 
        className="flex-1 relative overflow-hidden"
        onClick={handleContentTap}
      >
        <PageView
          pageNumber={currentPage}
          onPageChange={handlePageChange}
          onAyahClick={handleAyahClick}
          className="w-full h-full"
        />

        {/* Ayah Overlays - only show if metadata is available and has bounds */}
        {pageMetadata?.ayahs && (
          <AyahOverlay
            ayahBounds={pageMetadata.ayahs.filter(ayah => ayah.bounds !== undefined) as any[]}
            containerWidth={1000} // TODO: Get actual container dimensions
            containerHeight={1400}
            onAyahClick={handleAyahClick}
          />
        )}
      </main>

      {/* Bottom Toolbar - Hidden, toggled by tap or 'T' key */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-base-200 shadow-lg transition-transform duration-300 z-10 ${
          showToolbar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4">
          {/* Audio Player */}
          {audioUrl && (
            <AudioPlayer
              audioUrl={audioUrl}
              className="mb-4"
            />
          )}

          {/* Quick Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(1)}
              className="btn btn-sm btn-ghost"
              aria-label="الصفحة الأولى"
            >
              البداية
            </button>
            
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 10))}
              className="btn btn-sm btn-ghost"
              aria-label="رجوع 10 صفحات"
            >
              -10
            </button>
            
            <button
              onClick={handleGoToPage}
              className="btn btn-sm btn-primary"
              aria-label="انتقل إلى صفحة"
            >
              انتقل إلى صفحة
            </button>
            
            <button
              onClick={() => handlePageChange(Math.min(604, currentPage + 10))}
              className="btn btn-sm btn-ghost"
              aria-label="تقدم 10 صفحات"
            >
              +10
            </button>
            
            <button
              onClick={() => handlePageChange(604)}
              className="btn btn-sm btn-ghost"
              aria-label="الصفحة الأخيرة"
            >
              النهاية
            </button>
          </div>

          <div className="text-center mt-2 text-sm text-base-content/70">
            اضغط في أي مكان أو اضغط 'T' لإخفاء/إظهار الأدوات
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowSettings(false)}>
          <div 
            className="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">الإعدادات</h2>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <div>
                  <div className="text-sm">
                    <p className="font-semibold mb-1">اختصارات لوحة المفاتيح:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>← / صفحة لأسفل: الصفحة التالية</li>
                      <li>→ / صفحة لأعلى: الصفحة السابقة</li>
                      <li>T: إظهار/إخفاء الأدوات</li>
                      <li>Home: أول صفحة</li>
                      <li>End: آخر صفحة</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning">
                <div className="text-sm">
                  <p className="font-semibold mb-1">ملاحظة:</p>
                  <p>جميع البيانات القرآنية مأخوذة من مجمع الملك فهد لطباعة المصحف الشريف</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-primary"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
