/**
 * QuranReader Page
 *
 * Modern Quran reader with edge-to-edge page image viewer
 * Features:
 * - Page image viewer from King Fahd Complex
 * - Fixed RTL header with navigation
 * - Hidden bottom toolbar (toggle with tap or 'T' key)
 * - RTL swipe, arrow-key, and touch navigation
 * - Persistent last-read position (localStorage)
 * - Ayah overlay with popovers
 * - Audio playback controls
 * - Dark/light mode toggle
 * - Search functionality (placeholder)
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Sun, Moon, List } from "lucide-react";
import PageView from "../components/Quran/PageView";
import AyahOverlay from "../components/Quran/AyahOverlay";
import AudioPlayer from "../components/Quran/AudioPlayer";
import { saveLastRead, getLastRead } from "../services/quranService";
import type { AyahBoundingBox } from "../types/quran";

export default function QuranReader() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial page from URL or last read position
  const getInitialPage = (): number => {
    const urlPage = searchParams.get("page");
    if (urlPage) {
      const page = parseInt(urlPage, 10);
      if (page >= 1 && page <= 604) return page;
    }

    // Try to get last read position
    const lastRead = getLastRead();
    if (lastRead?.pageNumber) {
      return lastRead.pageNumber;
    }

    return 1; // Default to first page
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [audioUrl] = useState<string>("");

  // Update URL when page changes
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
    // Save last read position
    saveLastRead(0, undefined, currentPage);
  }, [currentPage, setSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Toggle toolbar visibility
  const handleToggleToolbar = useCallback(() => {
    setToolbarVisible((prev) => !prev);
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.setAttribute(
        "data-theme",
        newMode ? "dark" : "light",
      );
      return newMode;
    });
  }, []);

  // Navigate back
  const handleGoBack = () => {
    navigate("/quran");
  };

  // Open search
  const handleOpenSearch = () => {
    setSearchOpen(true);
    setToolbarVisible(false);
  };

  // Toggle index/navigation panel
  const handleToggleIndex = () => {
    setShowIndex((prev) => !prev);
  };

  // Get current surah name (placeholder - would need API data)
  const getSurahName = (): string => {
    // TODO: Map page number to surah name using API data
    return "المصحف الشريف";
  };

  // Placeholder ayah boxes - in production, fetch from API
  // Type will be properly defined when API integration is complete
  const ayahBoxes: AyahBoundingBox[] = [];

  return (
    <div className="fixed inset-0 flex flex-col bg-base-100" dir="rtl">
      {/* Fixed Header - RTL */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-base-100 border-b border-base-300 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Right side: Back button */}
          <button
            onClick={handleGoBack}
            className="btn btn-ghost btn-sm gap-2"
            aria-label="رجوع"
          >
            <ArrowRight size={20} />
            <span>رجوع</span>
          </button>

          {/* Center: Surah name */}
          <h1 className="text-lg font-bold text-center flex-1">
            {getSurahName()}
          </h1>

          {/* Left side: Search and Dark mode */}
          <div className="flex gap-2">
            <button
              onClick={handleOpenSearch}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="بحث"
            >
              <Search size={20} />
            </button>
            <button
              onClick={handleToggleDarkMode}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="تبديل الوضع"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content - Page viewer */}
      <main className="flex-1 mt-14 mb-0">
        <PageView
          pageNumber={currentPage}
          onPageChange={handlePageChange}
          onTap={handleToggleToolbar}
          className="h-full"
        />

        {/* Ayah overlay (when bounding box data available) */}
        {ayahBoxes.length > 0 && (
          <AyahOverlay
            pageNumber={currentPage}
            ayahBoxes={ayahBoxes}
            onAyahClick={(ayahId) => {
              console.log("Ayah clicked:", ayahId);
              // TODO: Fetch audio URL and set it
            }}
          />
        )}
      </main>

      {/* Bottom Toolbar - Hidden by default, toggle with tap or 'T' */}
      {toolbarVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-base-100 border-t border-base-300 shadow-lg">
          <div className="p-4 space-y-4">
            {/* Page navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleIndex}
                className="btn btn-ghost btn-sm gap-2"
                aria-label="الفهرس"
              >
                <List size={18} />
                <span>الفهرس</span>
              </button>

              <div className="flex-1 text-center">
                <span className="text-sm">صفحة</span>
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value, 10);
                    if (page >= 1 && page <= 604) {
                      handlePageChange(page);
                    }
                  }}
                  className="input input-sm input-bordered w-20 mx-2 text-center"
                />
                <span className="text-sm">من 604</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className="btn btn-sm"
                  disabled={currentPage <= 1}
                >
                  السابقة
                </button>
                <button
                  onClick={() =>
                    handlePageChange(Math.min(604, currentPage + 1))
                  }
                  className="btn btn-sm btn-primary"
                  disabled={currentPage >= 604}
                >
                  التالية
                </button>
              </div>
            </div>

            {/* Audio player */}
            {audioUrl && (
              <AudioPlayer
                audioUrl={audioUrl}
                onProgress={(time: number, duration: number) => {
                  console.log("Audio progress:", time, duration);
                }}
              />
            )}

            {/* TODO: Add more controls as needed */}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4"
            dir="rtl"
          >
            <h2 className="text-xl font-bold mb-4">بحث في القرآن</h2>
            <input
              type="text"
              placeholder="ابحث في القرآن الكريم..."
              className="input input-bordered w-full mb-4"
              dir="rtl"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSearchOpen(false)}
                className="btn btn-ghost"
              >
                إلغاء
              </button>
              <button className="btn btn-primary">بحث</button>
            </div>
            <p className="text-sm text-base-content text-opacity-70 mt-4 text-center">
              قريباً - سيتم ربط البحث بـ API الرسمي
            </p>
          </div>
        </div>
      )}

      {/* Index/Navigation Panel */}
      {showIndex && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            dir="rtl"
          >
            <h2 className="text-xl font-bold mb-4">فهرس المصحف</h2>
            <p className="text-sm text-base-content text-opacity-70 mb-4">
              قريباً - سيتم عرض قائمة السور والأجزاء
            </p>
            <button
              onClick={() => setShowIndex(false)}
              className="btn btn-primary w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
