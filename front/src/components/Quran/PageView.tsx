/**
 * PageView Component
 * 
 * Displays Quran page images from King Fahd Complex
 * Features:
 * - Edge-to-edge page image viewer
 * - Preloads next/previous pages for smooth navigation
 * - Keyboard (arrow keys) and touch/swipe navigation
 * - Zoom controls
 * - RTL support
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';

interface PageViewProps {
  pageNumber: number;
  onPageChange: (pageNumber: number) => void;
  onTap?: () => void;
  className?: string;
}

const QURAN_BASE = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';

export default function PageView({
  pageNumber,
  onPageChange,
  onTap,
  className = '',
}: PageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling for swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Build page image URL
  const getPageImageUrl = (page: number): string => {
    // Pad page number to 3 digits (e.g., 001, 002, ...)
    const paddedPage = String(page).padStart(3, '0');
    return `${QURAN_BASE}/images/pages/page${paddedPage}.png`;
  };

  const currentPageUrl = getPageImageUrl(pageNumber);

  // Preload adjacent pages
  useEffect(() => {
    if (pageNumber > 1) {
      const prevImg = new Image();
      prevImg.src = getPageImageUrl(pageNumber - 1);
    }
    if (pageNumber < 604) {
      const nextImg = new Image();
      nextImg.src = getPageImageUrl(pageNumber + 1);
    }
  }, [pageNumber]);

  // Image load handlers
  const handleImageLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setLoading(false);
    setError('فشل تحميل صفحة المصحف');
  };

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (pageNumber < 604) {
      onPageChange(pageNumber + 1);
    }
  }, [pageNumber, onPageChange]);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  }, [pageNumber, onPageChange]);

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // RTL: Right arrow = previous, Left arrow = next
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        onTap?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, onTap]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      // RTL: Swipe right = next page, Swipe left = previous page
      if (diff > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-auto bg-base-200 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onTap}
      style={{ direction: 'rtl' }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 bg-opacity-90 z-10">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-base-content" dir="rtl">
              جاري تحميل الصفحة {pageNumber}...
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 z-10">
          <div className="text-center" dir="rtl">
            <p className="text-error text-lg mb-4">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Page image */}
      <div className="flex items-center justify-center min-h-full p-4">
        <img
          ref={imageRef}
          src={currentPageUrl}
          alt={`صفحة ${pageNumber} من المصحف الشريف`}
          className="max-w-full h-auto transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})` }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
        />
      </div>

      {/* Navigation buttons - RTL */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <button
          className="btn btn-circle btn-lg bg-base-100 bg-opacity-70 hover:bg-opacity-100 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            goToNextPage();
          }}
          disabled={pageNumber >= 604}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="btn btn-circle btn-lg bg-base-100 bg-opacity-70 hover:bg-opacity-100 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevPage();
          }}
          disabled={pageNumber <= 1}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
        <button
          className="btn btn-sm btn-circle bg-base-100 bg-opacity-70 hover:bg-opacity-100 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          aria-label="تصغير"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="btn btn-sm bg-base-100 bg-opacity-70 hover:bg-opacity-100 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomReset();
          }}
        >
          {zoom}%
        </button>
        <button
          className="btn btn-sm btn-circle bg-base-100 bg-opacity-70 hover:bg-opacity-100 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          aria-label="تكبير"
        >
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
