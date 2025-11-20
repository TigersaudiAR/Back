import { useState, useEffect, useRef } from 'react';
import { X, Volume2, BookOpen } from 'lucide-react';
import { getAyah, getTafsir, getAyahAudioUrl } from '../../services/quranService';
import type { Ayah, Tafsir } from '../../types/quran';
import AudioPlayer from './AudioPlayer';

interface VerseCoordinate {
  surah_id: number;
  ayah_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahOverlayProps {
  verses: VerseCoordinate[];
  imageElement: HTMLImageElement;
  selectedVerse: VerseCoordinate | null;
  onVerseClick: (verse: VerseCoordinate) => void;
  onClose: () => void;
}

/**
 * Ayah Overlay Component
 * Renders interactive bounding boxes over Quran page image
 * Shows popover with ayah text, tafsir, and audio controls
 */
function AyahOverlay({
  verses,
  imageElement,
  selectedVerse,
  onVerseClick,
  onClose,
}: AyahOverlayProps) {
  const [ayahData, setAyahData] = useState<Ayah | null>(null);
  const [tafsirData, setTafsirData] = useState<Tafsir[]>([]);
  const [showTafsir, setShowTafsir] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match image
    const rect = imageElement.getBoundingClientRect();
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw boxes for each verse
    verses.forEach((verse) => {
      const isSelected = selectedVerse?.ayah_number === verse.ayah_number &&
                         selectedVerse?.surah_id === verse.surah_id;

      ctx.strokeStyle = isSelected ? '#10b981' : 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(verse.x, verse.y, verse.width, verse.height);

      if (isSelected) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(verse.x, verse.y, verse.width, verse.height);
      }
    });
  }, [verses, selectedVerse, imageElement]);

  // Load ayah data when selected
  useEffect(() => {
    if (!selectedVerse) {
      setAyahData(null);
      setTafsirData([]);
      setShowTafsir(false);
      return;
    }

    const loadAyahData = async () => {
      setLoading(true);
      try {
        const ayah = await getAyah(selectedVerse.surah_id, selectedVerse.ayah_number);
        setAyahData(ayah);
      } catch (error) {
        console.error('Error loading ayah:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAyahData();
  }, [selectedVerse]);

  // Load tafsir when requested
  const loadTafsir = async () => {
    if (!selectedVerse || tafsirData.length > 0) {
      setShowTafsir(!showTafsir);
      return;
    }

    setLoading(true);
    try {
      const tafsir = await getTafsir(selectedVerse.surah_id, selectedVerse.ayah_number);
      setTafsirData(tafsir);
      setShowTafsir(true);
    } catch (error) {
      console.error('Error loading tafsir:', error);
      alert('فشل تحميل التفسير');
    } finally {
      setLoading(false);
    }
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clickedVerse = verses.find(
      (v) => x >= v.x && x <= v.x + v.width && y >= v.y && y <= v.y + v.height
    );

    if (clickedVerse) {
      onVerseClick(clickedVerse);
    } else {
      onClose();
    }
  };

  // Handle canvas hover for cursor
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const hoveredVerse = verses.find(
      (v) => x >= v.x && x <= v.x + v.width && y >= v.y && y <= v.y + v.height
    );

    canvas.style.cursor = hoveredVerse ? 'pointer' : 'default';
  };

  const audioUrl = selectedVerse
    ? getAyahAudioUrl(selectedVerse.surah_id, selectedVerse.ayah_number)
    : '';

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Popover with Ayah Details */}
      {selectedVerse && (
        <div
          className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-lg rounded-lg shadow-2xl p-6 pointer-events-auto max-w-2xl mx-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-green-800">
              سورة {selectedVerse.surah_id} - آية {selectedVerse.ayah_number}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {loading && !ayahData && (
            <div className="flex justify-center py-4">
              <div className="loading loading-spinner loading-md text-green-700"></div>
            </div>
          )}

          {/* Ayah Text */}
          {ayahData && (
            <div className="space-y-4">
              <p className="text-2xl leading-relaxed text-right font-arabic quran-ayah__text">
                {ayahData.text_ar}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={loadTafsir}
                  className="btn btn-sm btn-outline gap-2"
                  disabled={loading}
                  aria-label="عرض التفسير"
                >
                  <BookOpen className="w-4 h-4" />
                  {showTafsir ? 'إخفاء التفسير' : 'عرض التفسير'}
                </button>
              </div>

              {/* Tafsir Section */}
              {showTafsir && tafsirData.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">التفسير</h4>
                  {tafsirData.map((tafsir, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {tafsir.text_ar}
                      </p>
                      {tafsir.source && (
                        <p className="text-xs text-gray-500 mt-1">
                          المصدر: {tafsir.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div className="mt-4">
                  <AudioPlayer
                    audioUrl={audioUrl}
                    ayahInfo={{
                      surah: selectedVerse.surah_id,
                      ayah: selectedVerse.ayah_number,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AyahOverlay;
