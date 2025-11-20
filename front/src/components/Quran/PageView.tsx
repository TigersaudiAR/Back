import { useState, useEffect, useRef } from 'react';
import AyahOverlay from './AyahOverlay';
import { getPageCoordinates } from '../../services/quranService';

interface PageViewProps {
  pageNumber: number;
  imageUrl: string;
  onPageChange?: (page: number) => void; // eslint-disable-line @typescript-eslint/no-unused-vars
}

interface VerseCoordinate {
  surah_id: number;
  ayah_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Page View Component
 * Displays Quran page image with interactive ayah overlays
 */
function PageView({ pageNumber, imageUrl }: PageViewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<VerseCoordinate[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<VerseCoordinate | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load coordinates for current page
  useEffect(() => {
    setLoading(true);
    setImageLoaded(false);
    setSelectedVerse(null);

    const loadCoords = async () => {
      try {
        const data = await getPageCoordinates(pageNumber);
        setCoordinates(data.verses || []);
      } catch (error) {
        console.warn('Could not load coordinates:', error);
        setCoordinates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoords();
  }, [pageNumber]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleVerseClick = (verse: VerseCoordinate) => {
    setSelectedVerse(verse);
  };

  const handleCloseOverlay = () => {
    setSelectedVerse(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black"
    >
      {/* Loading Indicator */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-white mb-4"></div>
            <p className="text-white text-sm">جاري تحميل الصفحة...</p>
          </div>
        </div>
      )}

      {/* Page Image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt={`صفحة ${pageNumber}`}
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error('Image load error:', e);
          setImageLoaded(true); // Show error state
        }}
      />

      {/* Ayah Overlay - Only show when image is loaded and coordinates available */}
      {imageLoaded && coordinates.length > 0 && imageRef.current && (
        <AyahOverlay
          verses={coordinates}
          imageElement={imageRef.current}
          selectedVerse={selectedVerse}
          onVerseClick={handleVerseClick}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
}

export default PageView;
