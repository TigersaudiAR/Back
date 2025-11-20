import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Sun, Moon } from 'lucide-react';
import PageView from '../components/Quran/PageView';
import AudioPlayer from '../components/Quran/AudioPlayer';
import { AyahOverlayContainer } from '../components/Quran/AyahOverlay';
import { getPage, getAudioUrls, getTafsir } from '../services/quranService';
import type { Ayah, Tafsir, Recitation } from '../types/quran';
import '../styles/quran.css';

/**
 * QuranReader Page
 * Modern Quran page viewer with image display, navigation, and interactive features
 */
export default function QuranReader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Math.min(604, initialPage))
  );
  const [showToolbar, setShowToolbar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ayat, setAyat] = useState<Ayah[]>([]);
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [tafsirMap, setTafsirMap] = useState<Map<string, Tafsir>>(new Map());
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);

  // Save last read position
  useEffect(() => {
    localStorage.setItem('quran-last-page', currentPage.toString());
  }, [currentPage]);

  // Update URL when page changes
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  // Load page data
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const pageData = await getPage(currentPage);
        setAyat(pageData.ayat || []);
        
        // Load audio for page
        const audioData = await getAudioUrls('page', currentPage);
        setRecitations(audioData);
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    loadPageData();
  }, [currentPage]);

  // Load tafsir for selected ayah
  useEffect(() => {
    if (!selectedAyah) return;

    const loadTafsir = async () => {
      try {
        const tafsirData = await getTafsir(
          selectedAyah.surah_id,
          selectedAyah.ayah_number
        );
        
        if (tafsirData.length > 0) {
          const key = `${selectedAyah.surah_id}-${selectedAyah.ayah_number}`;
          setTafsirMap(prev => new Map(prev).set(key, tafsirData[0]));
        }
      } catch (error) {
        console.warn('Could not load tafsir:', error);
      }
    };

    loadTafsir();
  }, [selectedAyah]);

  // Toggle toolbar with 'T' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') {
        setShowToolbar(prev => !prev);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Toggle toolbar on tap/click (for mobile)
  const handlePageTap = useCallback(() => {
    setShowToolbar(prev => !prev);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedAyah(null);
    setHighlightedAyah(null);
  }, []);

  const handleSelectAyah = useCallback((ayah: Ayah) => {
    setSelectedAyah(ayah);
  }, []);

  const handleAudioHighlight = useCallback((ayahNumber: number | null) => {
    setHighlightedAyah(ayahNumber);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleBack = () => {
    navigate('/quran');
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-gray-50 to-white text-gray-900'}`}
      dir="rtl"
    >
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-primary-dark/95 backdrop-blur-sm border-b border-primary-light/30 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-sm gap-2"
            aria-label={t('quranReader.back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('quranReader.back')}</span>
          </button>

          <h1 className="text-lg font-bold text-accent">
            {t('quranReader.title')}
          </h1>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm btn-circle"
              aria-label={t('quranReader.search')}
              title={t('quranReader.search')}
            >
              <Search className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label={t('quranReader.toggleMode')}
              title={t('quranReader.toggleMode')}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32 px-4" onClick={handlePageTap}>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <PageView
              initialPage={currentPage}
              onPageChange={handlePageChange}
              showNavigation={!showToolbar}
            />
            
            {/* Ayah Overlays - TODO: Add bounding boxes from API */}
            {/* <AyahOverlayContainer
              ayat={ayat}
              boundingBoxes={[]}
              tafsirMap={tafsirMap}
              onSelectAyah={handleSelectAyah}
              activeAyah={highlightedAyah || selectedAyah?.ayah_number}
            /> */}
          </div>
        </div>
      </main>

      {/* Bottom Toolbar - Hidden by default, toggle with tap or 'T' key */}
      {showToolbar && (
        <div className="fixed bottom-20 left-0 right-0 z-30 bg-primary-dark/95 backdrop-blur-sm border-t border-primary-light/30 shadow-lg p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-sm text-gray-300">
                {t('quranReader.pageNumber', { page: currentPage })} / 604
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="btn btn-sm"
                disabled={currentPage <= 1}
              >
                {t('quranReader.previous')}
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(604, prev + 1))}
                className="btn btn-sm"
                disabled={currentPage >= 604}
              >
                {t('quranReader.next')}
              </button>
              
              <button
                onClick={() => setShowToolbar(false)}
                className="btn btn-sm btn-ghost"
              >
                {t('quranReader.hideToolbar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player - Fixed at bottom */}
      {recitations.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AudioPlayer
            recitations={recitations}
            onHighlight={handleAudioHighlight}
          />
        </div>
      )}
    </div>
  );
}
