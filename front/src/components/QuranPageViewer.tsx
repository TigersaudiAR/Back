import React, { useState, useEffect } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Verse {
  ayah_number: number;
  bounding_box: BoundingBox;
}

interface PageCoordinates {
  page: number;
  surah_id?: number;
  verses: Verse[];
}

interface QuranPageViewerProps {
  pageNumber: number;
  onVerseClick?: (surahId: number, ayahNumber: number) => void;
}

export const QuranPageViewer: React.FC<QuranPageViewerProps> = ({ 
  pageNumber, 
  onVerseClick 
}) => {
  const [pageImage, setPageImage] = useState<string>('');
  const [coordinates, setCoordinates] = useState<PageCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  useEffect(() => {
    loadPage();
  }, [pageNumber]);

  const loadPage = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load page information
      const pageRes = await fetch(`/api/quran-pages/${pageNumber}`);
      if (!pageRes.ok) throw new Error('Failed to load page');
      
      const pageData = await pageRes.json();
      setPageImage(pageData.image_url);

      // Try to load coordinates
      if (pageData.has_coordinates) {
        const coordsRes = await fetch(`/api/quran-pages/${pageNumber}/coordinates`);
        if (coordsRes.ok) {
          const coordsData = await coordsRes.json();
          setCoordinates(coordsData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الصفحة');
    } finally {
      setLoading(false);
    }
  };

  const handleVerseClick = (verse: Verse) => {
    setSelectedVerse(verse.ayah_number);
    if (onVerseClick && coordinates?.surah_id) {
      onVerseClick(coordinates.surah_id, verse.ayah_number);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            صفحة {pageNumber} من {604}
          </h2>
          <div className="text-sm text-gray-600">
            {coordinates?.verses.length || 0} آية
          </div>
        </div>

        <div className="relative">
          <img 
            src={pageImage} 
            alt={`Quran Page ${pageNumber}`}
            className="w-full h-auto rounded-lg shadow-md"
          />
          
          {/* Overlay bounding boxes if coordinates are available */}
          {coordinates && coordinates.verses.length > 0 && (
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 1500"
              preserveAspectRatio="none"
            >
              {coordinates.verses.map((verse) => (
                <rect
                  key={verse.ayah_number}
                  x={verse.bounding_box.x}
                  y={verse.bounding_box.y}
                  width={verse.bounding_box.width}
                  height={verse.bounding_box.height}
                  fill={selectedVerse === verse.ayah_number ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}
                  stroke={selectedVerse === verse.ayah_number ? '#10b981' : 'transparent'}
                  strokeWidth="2"
                  className="pointer-events-auto cursor-pointer hover:fill-emerald-100 hover:stroke-emerald-500 transition-all"
                  onClick={() => handleVerseClick(verse)}
                />
              ))}
            </svg>
          )}
        </div>

        {selectedVerse && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800">
              الآية المحددة: {selectedVerse}
            </p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => pageNumber > 1 && window.location.href = `?page=${pageNumber - 1}`}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
          >
            ← السابق
          </button>
          
          <span className="text-gray-600">
            الصفحة {pageNumber}
          </span>
          
          <button
            onClick={() => pageNumber < 604 && window.location.href = `?page=${pageNumber + 1}`}
            disabled={pageNumber >= 604}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
          >
            التالي →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuranPageViewer;
