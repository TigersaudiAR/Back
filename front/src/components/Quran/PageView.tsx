/**
 * PageView Component
 * Edge-to-edge page image viewer with navigation and preloading
 */
import { useEffect, useState, useCallback, useRef } from 'react';

interface PageViewProps {
  pageNumber: number;
  onPageChange: (page: number) => void;
  onTap?: () => void;
  baseUrl?: string;
}

export default function PageView({
  pageNumber,
  onPageChange,
  onTap,
  baseUrl = import.meta.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev'
}: PageViewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const getImageUrl = useCallback((page: number) => {
    return `${baseUrl}/images/pages/page${String(page).padStart(3, '0')}.png`;
  }, [baseUrl]);

  const currentImageUrl = getImageUrl(pageNumber);

  // Preload adjacent pages
  useEffect(() => {
    const preloadPages = [];
    
    if (pageNumber > 1) {
      const prevImg = new Image();
      prevImg.src = getImageUrl(pageNumber - 1);
      preloadPages.push(prevImg);
    }
    
    if (pageNumber < 604) {
      const nextImg = new Image();
      nextImg.src = getImageUrl(pageNumber + 1);
      preloadPages.push(nextImg);
    }
  }, [pageNumber, getImageUrl]);

  // Handle image load
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [pageNumber]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && pageNumber < 604) {
        onPageChange(pageNumber + 1);
      } else if (e.key === 'ArrowLeft' && pageNumber > 1) {
        onPageChange(pageNumber - 1);
      } else if (e.key.toLowerCase() === 't') {
        onTap?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, onPageChange, onTap]);

  // Touch navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && pageNumber < 604) {
        // Swipe left (RTL: next page)
        onPageChange(pageNumber + 1);
      } else if (diff < 0 && pageNumber > 1) {
        // Swipe right (RTL: previous page)
        onPageChange(pageNumber - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [pageNumber, onPageChange]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleClick = () => {
    onTap?.();
  };

  return (
    <div
      className="quran-page-viewer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role="img"
      aria-label={`صفحة ${pageNumber} من القرآن الكريم`}
    >
      {!imageLoaded && !imageError && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-sm text-gray-400">جاري تحميل الصفحة {pageNumber}...</p>
          </div>
        </div>
      )}

      {imageError && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400">فشل تحميل صفحة {pageNumber}</p>
            <button
              className="btn btn-sm btn-primary mt-4"
              onClick={() => {
                setImageError(false);
                setImageLoaded(false);
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      <img
        ref={imageRef}
        src={currentImageUrl}
        alt={`صفحة ${pageNumber} من القرآن الكريم`}
        className={`quran-page-image ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />
    </div>
  );
}
