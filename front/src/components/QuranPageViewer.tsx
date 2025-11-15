import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Verse {
  surah_id: number;
  ayah_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

interface PageCoords {
  page: number;
  surah_id?: number;
  verses: Verse[];
  message?: string;
}

interface QuranPageViewerProps {
  initialPage?: number;
}

const QuranPageViewer: React.FC<QuranPageViewerProps> = ({ initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [coords, setCoords] = useState<PageCoords | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const QURAN_PAGE_BASE_URL = 'https://quran-images.pages.dev/pages';
  const TOTAL_PAGES = 604;

  // Load coordinates for current page
  useEffect(() => {
    const loadCoords = async () => {
      setLoading(true);
      try {
        const paddedNumber = String(currentPage).padStart(3, '0');
        const response = await axios.get<PageCoords>(
          `${API_BASE}/api/quran-pages/${currentPage}/coords`
        );
        setCoords(response.data);
      } catch (error) {
        console.error('Error loading coordinates:', error);
        setCoords({ page: currentPage, verses: [] });
      } finally {
        setLoading(false);
      }
    };

    loadCoords();
    setImageLoaded(false);
  }, [currentPage, API_BASE]);

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!imageLoaded || !coords || !canvasRef.current || !imageRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes for each verse
    coords.verses.forEach((verse) => {
      const isSelected = selectedVerse?.ayah_number === verse.ayah_number;
      
      // Draw box
      ctx.strokeStyle = isSelected ? '#10b981' : '#3b82f6';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(verse.x, verse.y, verse.width, verse.height);
      
      // Fill with semi-transparent color on hover
      if (isSelected) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(verse.x, verse.y, verse.width, verse.height);
      }
    });
  }, [imageLoaded, coords, selectedVerse]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!coords || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Find clicked verse
    const clickedVerse = coords.verses.find(
      (verse) =>
        x >= verse.x &&
        x <= verse.x + verse.width &&
        y >= verse.y &&
        y <= verse.y + verse.height
    );

    setSelectedVerse(clickedVerse || null);
  };

  // Handle canvas mouse move for hover effect
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!coords || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Find hovered verse
    const hoveredVerse = coords.verses.find(
      (verse) =>
        x >= verse.x &&
        x <= verse.x + verse.width &&
        y >= verse.y &&
        y <= verse.y + verse.height
    );

    canvas.style.cursor = hoveredVerse ? 'pointer' : 'default';
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
      setSelectedVerse(null);
    }
  };

  const paddedNumber = String(currentPage).padStart(3, '0');
  const imageUrl = `${QURAN_PAGE_BASE_URL}/${paddedNumber}.png`;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Navigation Controls */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-primary"
        >
          السابق
        </button>
        
        <div className="flex items-center gap-2">
          <label htmlFor="page-input" className="font-semibold">
            الصفحة:
          </label>
          <input
            id="page-input"
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="input input-bordered w-20 text-center"
          />
          <span className="text-gray-500">/ {TOTAL_PAGES}</span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === TOTAL_PAGES}
          className="btn btn-primary"
        >
          التالي
        </button>
      </div>

      {/* Page Viewer */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}
        
        <div className="relative">
          {/* Quran Page Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={`صفحة ${currentPage}`}
            className="max-w-full h-auto"
            onLoad={() => setImageLoaded(true)}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
          
          {/* Interactive Canvas Overlay */}
          {imageLoaded && (
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              className="absolute top-0 left-0 w-full h-full"
              style={{ pointerEvents: coords?.verses.length ? 'auto' : 'none' }}
            />
          )}
        </div>
      </div>

      {/* Selected Verse Info */}
      {selectedVerse && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl w-full">
          <h3 className="text-xl font-bold mb-2">
            سورة {selectedVerse.surah_id} - آية {selectedVerse.ayah_number}
          </h3>
          <p className="text-2xl text-right leading-relaxed font-arabic">
            {selectedVerse.text}
          </p>
        </div>
      )}

      {/* Info Message */}
      {coords?.message && (
        <div className="alert alert-info max-w-2xl">
          <span>{coords.message}</span>
        </div>
      )}

      {/* Verse Count Info */}
      {coords && coords.verses.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          عدد الآيات في هذه الصفحة: {coords.verses.length}
        </div>
      )}
    </div>
  );
};

export default QuranPageViewer;
