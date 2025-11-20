import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPage } from '../../services/quranService';
import type { Ayah } from '../../types/quran';

interface PageViewProps {
  initialPage?: number;
  onPageChange?: (pageNumber: number) => void;
  showNavigation?: boolean;
}

/**
 * PageView Component
 * Loads and displays Quran page images with navigation
 * Preloads next/previous pages for smooth browsing
 */
export default function PageView({
  initialPage = 1,
  onPageChange,
  showNavigation = true,
}: PageViewProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load page data
  const loadPage = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const pageData = await getPage(pageNumber);
      setImageUrl(pageData.imageUrl);
      setAyat(pageData.ayat || []);
      
      // Preload adjacent pages
      if (pageNumber > 1) {
        getPage(pageNumber - 1).catch(() => {
          /* Ignore preload errors */
        });
      }
      if (pageNumber < 604) {
        getPage(pageNumber + 1).catch(() => {
          /* Ignore preload errors */
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPreviousPage();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(z + 0.1, 3));
      } else if (e.key === '-') {
        setZoom(z => Math.max(z - 0.1, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Touch/Swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isRightSwipe) {
      goToNextPage(); // RTL: right swipe goes forward
    } else if (isLeftSwipe) {
      goToPreviousPage(); // RTL: left swipe goes back
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(604, prev + 1));
  };

  const handlePageInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const page = parseInt(formData.get('page') as string, 10);
    
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-sm text-gray-400">{t('quranReader.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadPage(currentPage)}
            className="btn btn-sm btn-primary"
          >
            {t('quranReader.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="quran-page-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Page Image */}
      <div className="relative overflow-auto" style={{ maxHeight: '80vh' }}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt={`${t('quranReader.pageNumber', { page: currentPage })}`}
          className="quran-page-image"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          loading="lazy"
        />
      </div>

      {/* Navigation Controls */}
      {showNavigation && (
        <div className="flex items-center justify-between mt-4 gap-4" dir="rtl">
          <button
            onClick={goToNextPage}
            disabled={currentPage >= 604}
            className="btn btn-circle btn-sm"
            aria-label={t('quranReader.next')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <form onSubmit={handlePageInput} className="flex items-center gap-2">
              <input
                type="number"
                name="page"
                min="1"
                max="604"
                defaultValue={currentPage}
                className="input input-sm w-20 text-center"
                aria-label={t('quranReader.goToPage')}
              />
              <span className="text-sm text-gray-400">/ 604</span>
            </form>
          </div>

          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="btn btn-circle btn-sm"
            aria-label={t('quranReader.previous')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
          className="btn btn-xs"
          aria-label={t('quranReader.zoomOut')}
        >
          -
        </button>
        <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
          className="btn btn-xs"
          aria-label={t('quranReader.zoomIn')}
        >
          +
        </button>
        <button
          onClick={() => setZoom(1)}
          className="btn btn-xs"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
