/**
 * PageView Component
 * Displays Quran page images with navigation controls
 * Supports keyboard, touch, and swipe navigation
 * Preloads adjacent pages for smooth experience
 */

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageImage, getPageMeta, saveLastPosition } from "../../services/quranService";
import AyahOverlay from "./AyahOverlay";

interface PageViewProps {
  initialPage?: number;
  onPageChange?: (page: number) => void;
  enableOverlay?: boolean;
}

interface PageMetadata {
  page: number;
  ayahs: Array<{
    surahId: number;
    ayahNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export default function PageView({
  initialPage = 1,
  onPageChange,
  enableOverlay = false,
}: PageViewProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  // Load page metadata for ayah overlays
  useEffect(() => {
    if (!enableOverlay) return;

    const loadMetadata = async () => {
      try {
        const meta = await getPageMeta(currentPage);
        setPageMetadata(meta);
      } catch (error) {
        console.error("Error loading page metadata:", error);
        setPageMetadata(null);
      }
    };

    loadMetadata();
  }, [currentPage, enableOverlay]);

  // Preload adjacent pages
  useEffect(() => {
    const preloadPages = () => {
      // Preload next page
      if (currentPage < 604) {
        const nextImg = new Image();
        nextImg.src = getPageImage(currentPage + 1);
      }

      // Preload previous page
      if (currentPage > 1) {
        const prevImg = new Image();
        prevImg.src = getPageImage(currentPage - 1);
      }
    };

    preloadPages();
  }, [currentPage]);

  // Save current position
  useEffect(() => {
    saveLastPosition(currentPage);
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // RTL: Right arrow goes to previous page, Left arrow to next page
      if (e.key === "ArrowRight" && currentPage > 1) {
        e.preventDefault();
        setCurrentPage((prev) => prev - 1);
      } else if (e.key === "ArrowLeft" && currentPage < 604) {
        e.preventDefault();
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe threshold: 50px
    if (Math.abs(diff) > 50) {
      // RTL: Swipe left to go to previous page, swipe right to go to next page
      if (diff > 0 && currentPage < 604) {
        // Swiped left -> next page
        setCurrentPage((prev) => prev + 1);
      } else if (diff < 0 && currentPage > 1) {
        // Swiped right -> previous page
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const imageUrl = getPageImage(currentPage);

  return (
    <div
      ref={containerRef}
      className="quran-page-view"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Page image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt={`صفحة ${currentPage} من المصحف الشريف`}
        className="quran-page-image"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.error("Error loading page image:", e);
          setIsLoading(false);
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Ayah overlays */}
      {enableOverlay && pageMetadata && pageMetadata.ayahs && (
        <AyahOverlay
          boundingBoxes={pageMetadata.ayahs}
          containerWidth={imageRef.current?.naturalWidth || 1}
          containerHeight={imageRef.current?.naturalHeight || 1}
        />
      )}

      {/* Navigation buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="btn btn-circle"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={24} />
        </button>

        <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-semibold">
            صفحة {currentPage} من 604
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === 604}
          className="btn btn-circle"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    </div>
  );
}
