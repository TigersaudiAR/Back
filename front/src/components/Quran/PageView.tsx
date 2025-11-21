/**
 * PageView Component for Image-based Quran Page Display
 * عرض الصفحة المصورة من المصحف
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageImage } from '../../services/quranService';

export interface PageViewProps {
  /** Initial page number (1-604) */
  initialPage?: number;
  /** Called when page changes */
  onPageChange?: (pageNumber: number) => void;
  /** Called when a page is clicked */
  onPageClick?: (pageNumber: number, event: React.MouseEvent) => void;
  /** Show navigation buttons */
  showNavigation?: boolean;
  /** Enable swipe gestures */
  enableSwipe?: boolean;
  /** Enable keyboard navigation */
  enableKeyboard?: boolean;
}

const TOTAL_PAGES = 604;
const LAST_READING_KEY = 'quran_last_page';

const PageView: React.FC<PageViewProps> = ({
  initialPage = 1,
  onPageChange,
  onPageClick,
  showNavigation = true,
  enableSwipe = true,
  enableKeyboard = true,
}) => {
  // Try to restore last reading position
  const getInitialPage = () => {
    try {
      const saved = localStorage.getItem(LAST_READING_KEY);
      if (saved) {
        const page = parseInt(saved, 10);
        if (page >= 1 && page <= TOTAL_PAGES) {
          return page;
        }
      }
    } catch (error) {
      console.error('Error reading last position:', error);
    }
    return initialPage;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Save last reading position
  useEffect(() => {
    try {
      localStorage.setItem(LAST_READING_KEY, currentPage.toString());
    } catch (error) {
      console.error('Error saving last position:', error);
    }
  }, [currentPage]);

  // Notify parent of page change
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  // Preload adjacent pages for smooth navigation
  useEffect(() => {
    const preloadPages = [];
    
    // Preload previous page
    if (currentPage > 1) {
      preloadPages.push(currentPage - 1);
    }
    
    // Preload next page
    if (currentPage < TOTAL_PAGES) {
      preloadPages.push(currentPage + 1);
    }

    preloadPages.forEach(page => {
      const img = new Image();
      img.src = getPageImage(page);
    });
  }, [currentPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(currentPage + 1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      
      // RTL: Left arrow goes to next page, Right arrow goes to previous page
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToNextPage, goToPreviousPage]);

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!enableSwipe) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance

    // RTL: Swipe left to go to previous page, swipe right to go to next page
    if (diff > threshold) {
      goToPreviousPage();
    } else if (diff < -threshold) {
      goToNextPage();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (onPageClick) {
      onPageClick(currentPage, e);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  const imageUrl = getPageImage(currentPage);

  return (
    <div 
      className="quran-page-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Buttons */}
      {showNavigation && (
        <>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= TOTAL_PAGES}
            className="page-nav-btn next"
            aria-label="الصفحة التالية"
            title="الصفحة التالية"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="page-nav-btn prev"
            aria-label="الصفحة السابقة"
            title="الصفحة السابقة"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Page Image */}
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">جاري تحميل الصفحة {currentPage}...</div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-400 text-center">
              <p>فشل تحميل الصفحة {currentPage}</p>
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoaded(false);
                }}
                className="mt-2 px-4 py-2 bg-primary text-white rounded"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        <img
          src={imageUrl}
          alt={`صفحة ${currentPage} من المصحف الشريف`}
          className="quran-page-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handlePageClick}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </div>

      {/* Page Number Display */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
        صفحة {currentPage} من {TOTAL_PAGES}
      </div>
    </div>
  );
};

export default PageView;
