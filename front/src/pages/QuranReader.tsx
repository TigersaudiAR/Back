/**
 * QuranReader Page
 * Modern Quran reader with edge-to-edge page image viewer
 * Features: RTL header, hidden toolbar, swipe/keyboard navigation, persistent position
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Moon, Sun, Menu, Maximize2, Minimize2 } from "lucide-react";
import PageView from "../components/Quran/PageView";
import { loadLastPosition, getChapters } from "../services/quranService";
import "../styles/quran.css";

export default function QuranReader() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [surahName, setSurahName] = useState("الفاتحة");
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapters, setChapters] = useState<Array<{ id: number; name_ar: string }>>([]);

  // Load last reading position on mount
  useEffect(() => {
    const lastPosition = loadLastPosition();
    if (lastPosition && lastPosition.page) {
      setCurrentPage(lastPosition.page);
    }

    // Load chapters for surah names
    getChapters()
      .then((data: Array<{ id: number; name_ar: string }>) => setChapters(data))
      .catch((error: Error) => console.error("Error loading chapters:", error));
  }, []);

  // Update surah name based on current page
  useEffect(() => {
    // TODO: Map page to surah name using chapters data
    // This is a simplified version - implement proper page-to-surah mapping
    if (chapters.length > 0) {
      // Placeholder logic
      const pageToSurahMap = Math.ceil(currentPage / 5.3); // Approximate
      const surah = chapters[Math.min(pageToSurahMap - 1, chapters.length - 1)];
      if (surah) {
        setSurahName(surah.name_ar || "القرآن الكريم");
      }
    }
  }, [currentPage, chapters]);

  // Toggle toolbar with 'T' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t") {
        setShowToolbar((prev) => !prev);
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [isFullscreen]);

  const toggleToolbar = () => {
    setShowToolbar((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.setAttribute("data-theme", !isDarkMode ? "dark" : "light");
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error("Error entering fullscreen:", error);
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    alert("قريباً - البحث في القرآن الكريم");
  };

  const handlePageJump = () => {
    const page = prompt(`اذهب إلى صفحة (1-604):`, currentPage.toString());
    if (page) {
      const pageNum = parseInt(page, 10);
      if (pageNum >= 1 && pageNum <= 604) {
        setCurrentPage(pageNum);
      } else {
        alert("رقم صفحة غير صالح. يرجى إدخال رقم بين 1 و 604.");
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed RTL Header */}
      <header className="quran-header">
        <div className="flex items-center justify-between">
          {/* Right side: Back button */}
          <button
            onClick={goBack}
            className="btn btn-ghost btn-sm"
            aria-label="رجوع"
          >
            <ArrowRight size={20} />
            <span className="mr-2">رجوع</span>
          </button>

          {/* Center: Surah name */}
          <h1 className="text-lg font-semibold">{surahName}</h1>

          {/* Left side: Search and theme toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="بحث"
            >
              <Search size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="تبديل الوضع"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content: Page viewer */}
      <main
        className="pt-16 pb-20"
        onClick={toggleToolbar}
        style={{ cursor: showToolbar ? "default" : "pointer" }}
      >
        <PageView
          initialPage={currentPage}
          onPageChange={setCurrentPage}
          enableOverlay={false} // TODO: Enable when API provides bounding boxes
        />
      </main>

      {/* Hidden bottom toolbar */}
      <div className={`quran-toolbar ${showToolbar ? "visible" : ""}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePageJump}
              className="btn btn-sm"
              aria-label="انتقل إلى صفحة"
            >
              <Menu size={16} />
              <span className="mr-2">صفحة {currentPage}</span>
            </button>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm"
              aria-label="الصفحة السابقة"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
              disabled={currentPage === 604}
              className="btn btn-sm"
              aria-label="الصفحة التالية"
            >
              التالي
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="btn btn-sm btn-circle"
              aria-label={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        <div className="text-xs text-center mt-2 opacity-70">
          اضغط على الشاشة أو اضغط 'T' لإظهار/إخفاء شريط الأدوات
        </div>
      </div>
    </div>
  );
}
