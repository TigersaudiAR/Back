/**
 * PageView Component
 * Displays Quran page images with navigation and keyboard/touch support
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getQuranBaseUrl } from '../../services/quranService';

interface PageViewProps {
  pageNumber: number;
  onPageChange: (newPage: number) => void;
  onTap?: () => void;
  zoom?: number;
}

const PageView: React.FC<PageViewProps> = ({ 
  pageNumber, 
  onPageChange, 
  onTap,
  zoom = 1 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const baseUrl = getQuranBaseUrl();

  // Preload adjacent pages for smooth navigation
  const preloadPage = useCallback((page: number) => {
    if (page < 1 || page > 604) return;
    
    const img = new Image();
    img.src = `${baseUrl}/images/page${String(page).padStart(3, '0')}.png`;
  }, [baseUrl]);

  // Load current page
  useEffect(() => {
    setLoading(true);
    setError(null);

    const pageStr = String(pageNumber).padStart(3, '0');
    const src = `${baseUrl}/images/page${pageStr}.png`;
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
      
      // Preload next and previous pages
      preloadPage(pageNumber + 1);
      preloadPage(pageNumber - 1);
    };
    
    img.onerror = () => {
      setError('فشل تحميل الصفحة');
      setLoading(false);
    };
    
    img.src = src;
  }, [pageNumber, baseUrl, preloadPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // RTL: Left arrow goes to next page, Right arrow goes to previous
      if (e.key === 'ArrowLeft' && pageNumber < 604) {
        e.preventDefault();
        onPageChange(pageNumber + 1);
      } else if (e.key === 'ArrowRight' && pageNumber > 1) {
        e.preventDefault();
        onPageChange(pageNumber - 1);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        onTap?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, onPageChange, onTap]);

  // Touch/swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Minimum swipe distance
    const minSwipeDistance = 50;

    // Detect horizontal swipe (RTL: swipe left = next, swipe right = previous)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0 && pageNumber < 604) {
        // Swipe left (RTL: next page)
        onPageChange(pageNumber + 1);
      } else if (deltaX > 0 && pageNumber > 1) {
        // Swipe right (RTL: previous page)
        onPageChange(pageNumber - 1);
      }
    }

    touchStartRef.current = null;
  }, [pageNumber, onPageChange]);

  const handleClick = useCallback(() => {
    onTap?.();
  }, [onTap]);

  if (loading) {
    return (
      <div className="quran-loading">
        <div>
          <div className="quran-spinner"></div>
          <p>جاري تحميل الصفحة {pageNumber}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quran-loading">
        <div>
          <p className="text-error">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
            aria-label="إعادة المحاولة"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="quran-page-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
        src={imageSrc}
        alt={`صفحة ${pageNumber} من القرآن الكريم`}
        className="quran-page-image"
        style={{ 
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s ease',
        }}
        draggable={false}
      />
    </div>
  );
};

export default PageView;
