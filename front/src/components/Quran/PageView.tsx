/**
 * PageView Component - Quran page image loader with preloading and navigation
 * Displays page images from King Fahd Complex API
 * Supports keyboard and touch navigation
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getPageImage } from '../../services/quranService';

interface PageViewProps {
  pageNumber: number;
  onPageChange: (newPage: number) => void;
  onAyahClick?: (surah: number, ayah: number) => void;
  className?: string;
}

export default function PageView({
  pageNumber,
  onPageChange,
  onAyahClick: _onAyahClick,
  className = ''
}: PageViewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Preload adjacent pages
  useEffect(() => {
    const preloadImages: string[] = [];
    
    // Preload next page
    if (pageNumber < 604) {
      preloadImages.push(getPageImage(pageNumber + 1));
    }
    
    // Preload previous page
    if (pageNumber > 1) {
      preloadImages.push(getPageImage(pageNumber - 1));
    }

    // Create image objects to trigger browser preload
    preloadImages.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [pageNumber]);

  // Load current page image
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const url = getPageImage(pageNumber);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الصفحة');
      setLoading(false);
    }
  }, [pageNumber]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setError('فشل تحميل صورة الصفحة');
    setLoading(false);
  }, []);

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (pageNumber < 604) {
      onPageChange(pageNumber + 1);
    }
  }, [pageNumber, onPageChange]);

  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  }, [pageNumber, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goToNextPage(); // In RTL, left arrow goes to next page
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          goToPreviousPage(); // In RTL, right arrow goes to previous page
          break;
        case 'Home':
          e.preventDefault();
          onPageChange(1);
          break;
        case 'End':
          e.preventDefault();
          onPageChange(604);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPreviousPage, onPageChange]);

  // Touch navigation
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left (RTL: next page)
        goToNextPage();
      } else {
        // Swiped right (RTL: previous page)
        goToPreviousPage();
      }
    }
  }, [goToNextPage, goToPreviousPage]);

  return (
    <div 
      className={`relative flex items-center justify-center bg-gray-100 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الصفحة {pageNumber}...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-error">
            <p className="text-lg font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary mt-4"
              aria-label="إعادة المحاولة"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {imageUrl && (
        <img
          ref={imageRef}
          src={imageUrl}
          alt={`صفحة ${pageNumber} من المصحف الشريف`}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      )}

      {/* Navigation buttons - visible on hover/touch */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
        <button
          onClick={goToPreviousPage}
          disabled={pageNumber <= 1}
          className="btn btn-circle btn-ghost opacity-0 hover:opacity-100 focus:opacity-100 pointer-events-auto transition-opacity m-4"
          aria-label="الصفحة السابقة"
          title="الصفحة السابقة (→)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= 604}
          className="btn btn-circle btn-ghost opacity-0 hover:opacity-100 focus:opacity-100 pointer-events-auto transition-opacity m-4"
          aria-label="الصفحة التالية"
          title="الصفحة التالية (←)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Page number indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
        صفحة {pageNumber} / 604
      </div>
    </div>
  );
}
