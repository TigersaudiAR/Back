/**
 * PageView Component - Quran Page Image Viewer
 * Edge-to-edge image viewer with swipe navigation, arrow keys, and touch support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageViewProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
}

const PageView: React.FC<PageViewProps> = ({ 
  currentPage, 
  onPageChange, 
  totalPages = 604 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Reset loading state when page changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        // RTL: Left arrow goes to next page, right arrow goes to previous
        if (e.key === 'ArrowLeft' && currentPage < totalPages) {
          onPageChange(currentPage + 1);
        } else if (e.key === 'ArrowRight' && currentPage > 1) {
          onPageChange(currentPage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  // Touch/Swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    // RTL: Swipe left goes to next page, swipe right goes to previous
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPage < totalPages) {
        // Swiped left - next page
        onPageChange(currentPage + 1);
      } else if (diff < 0 && currentPage > 1) {
        // Swiped right - previous page
        onPageChange(currentPage - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [currentPage, totalPages, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  // Format page number with padding
  const getPageImageUrl = (page: number): string => {
    const paddedPage = String(page).padStart(3, '0');
    // Try Quran Complex API first, fallback to quran-images CDN
    return `https://quran-images.pages.dev/pages/page${paddedPage}.png`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div 
      ref={containerRef}
      className="quran-page-view relative w-full h-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Spinner */}
      {!imageLoaded && !imageError && (
        <div className="quran-loading absolute inset-0 flex items-center justify-center">
          <div className="spinner"></div>
          <span className="sr-only">جاري تحميل الصفحة {currentPage}</span>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <p className="text-red-400 mb-4">عذراً، حدث خطأ في تحميل الصفحة</p>
          <button
            onClick={() => {
              setImageError(false);
              setImageLoaded(false);
            }}
            className="btn btn-sm btn-outline"
            aria-label="إعادة المحاولة"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Page Image */}
      <img
        src={getPageImageUrl(currentPage)}
        alt={`صفحة ${currentPage} من المصحف الشريف`}
        className={`quran-page-image ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />

      {/* Navigation Buttons */}
      {imageLoaded && (
        <>
          {/* Next Page Button (Left in RTL) */}
          {currentPage < totalPages && (
            <button
              onClick={goToNextPage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-base-100/80 hover:bg-base-100 p-3 rounded-full shadow-lg transition-all"
              aria-label={`الصفحة التالية (${currentPage + 1})`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Previous Page Button (Right in RTL) */}
          {currentPage > 1 && (
            <button
              onClick={goToPreviousPage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-base-100/80 hover:bg-base-100 p-3 rounded-full shadow-lg transition-all"
              aria-label={`الصفحة السابقة (${currentPage - 1})`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Page Number Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-base-100/90 px-4 py-2 rounded-full text-sm">
            صفحة {currentPage} من {totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default PageView;
