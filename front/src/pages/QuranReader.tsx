import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import PageView from '../components/Quran/PageView';
import { getPageImageUrl } from '../services/quranService';

/**
 * Modern Quran Reader with edge-to-edge page viewer
 * Features:
 * - Edge-to-edge image viewer with RTL support
 * - Small fixed header
 * - Hidden bottom toolbar (toggle with tap or 'T' key)
 * - Persistent last-read position
 * - Swipe, arrow-key, and touch navigation
 * - Ayah bounding box overlays
 */
function QuranReader() {
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('quran-last-page');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const TOTAL_PAGES = 604;

  // Save last read position
  useEffect(() => {
    localStorage.setItem('quran-last-page', currentPage.toString());
  }, [currentPage]);

  // Update image URL when page changes
  useEffect(() => {
    setImageUrl(getPageImageUrl(currentPage));
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        // Go to next page (RTL: left arrow = next)
        goToPage(currentPage + 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        // Go to previous page (RTL: right arrow = previous)
        goToPage(currentPage - 1);
        e.preventDefault();
      } else if (e.key === 't' || e.key === 'T') {
        // Toggle toolbar
        setToolbarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Detect horizontal swipe (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right = previous page (RTL)
          goToPage(currentPage - 1);
        } else {
          // Swipe left = next page (RTL)
          goToPage(currentPage + 1);
        }
      } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Tap to toggle toolbar
        setToolbarVisible(prev => !prev);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col" dir="rtl">
      {/* Fixed Header - Small and subtle */}
      <header className="bg-gradient-to-b from-gray-900/95 to-gray-900/80 backdrop-blur-sm text-white py-2 px-4 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">القرآن الكريم</h1>
          <span className="text-sm text-gray-400">
            صفحة {currentPage} من {TOTAL_PAGES}
          </span>
        </div>
        <button
          onClick={() => setToolbarVisible(!toolbarVisible)}
          className="btn btn-sm btn-ghost"
          aria-label="إظهار/إخفاء شريط الأدوات"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area - Edge to Edge */}
      <main className="flex-1 overflow-hidden relative bg-black">
        <PageView
          pageNumber={currentPage}
          imageUrl={imageUrl}
          onPageChange={goToPage}
        />
      </main>

      {/* Bottom Toolbar - Hidden by default, toggles on tap */}
      {toolbarVisible && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 to-gray-900/80 backdrop-blur-sm text-white p-4 z-20 animate-slide-up">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Previous Page Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-circle btn-primary"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Page Input */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={TOTAL_PAGES}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="input input-bordered w-20 text-center bg-gray-800 border-gray-700"
                aria-label="رقم الصفحة"
              />
              <span className="text-sm text-gray-400">من {TOTAL_PAGES}</span>
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
              className="btn btn-circle btn-primary"
              aria-label="الصفحة التالية"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-3 text-xs text-gray-400">
            استخدم الأسهم أو اسحب للتنقل • اضغط T أو انقر لإظهار/إخفاء الأدوات
          </div>
        </div>
      )}

      {/* Accessibility hint for keyboard users */}
      <div className="sr-only" role="status" aria-live="polite">
        صفحة {currentPage} من {TOTAL_PAGES}
      </div>
    </div>
  );
}

export default QuranReader;
