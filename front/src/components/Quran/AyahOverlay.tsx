/**
 * AyahOverlay Component - Draws bounding boxes for ayahs and shows popover
 * Uses page metadata from King Fahd Complex API to display ayah locations
 */

import { useState, useCallback } from 'react';
import { getAyah, getTafsir } from '../../services/quranService';
import type { Tafsir } from '../../types/quran';

interface AyahBounds {
  surah: number;
  ayah: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AyahOverlayProps {
  ayahBounds: AyahBounds[];
  containerWidth: number;
  containerHeight: number;
  onAyahClick?: (surah: number, ayah: number) => void;
}

interface PopoverData {
  surah: number;
  ayah: number;
  text: string;
  tafsir?: Tafsir[];
  position: { x: number; y: number };
}

export default function AyahOverlay({
  ayahBounds,
  containerWidth,
  containerHeight,
  onAyahClick
}: AyahOverlayProps) {
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAyahClick = useCallback(async (bounds: AyahBounds, event: React.MouseEvent) => {
    if (onAyahClick) {
      onAyahClick(bounds.surah, bounds.ayah);
    }

    setLoading(true);
    
    try {
      // Fetch ayah text and tafsir
      const [ayahData, tafsirData] = await Promise.allSettled([
        getAyah(bounds.surah, bounds.ayah),
        getTafsir(bounds.surah, bounds.ayah)
      ]);

      const ayahText = ayahData.status === 'fulfilled' ? ayahData.value.text_ar : '';
      const tafsir = tafsirData.status === 'fulfilled' ? tafsirData.value : undefined;

      setPopover({
        surah: bounds.surah,
        ayah: bounds.ayah,
        text: ayahText,
        tafsir,
        position: {
          x: event.clientX,
          y: event.clientY
        }
      });
    } catch (error) {
      console.error('Error loading ayah details:', error);
    } finally {
      setLoading(false);
    }
  }, [onAyahClick]);

  const closePopover = useCallback(() => {
    setPopover(null);
  }, []);

  return (
    <>
      {/* SVG overlay for bounding boxes */}
      <svg
        className="absolute inset-0 pointer-events-none"
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        {ayahBounds.map((bounds, index) => {
          const { x, y, width, height } = bounds.bounds;
          
          return (
            <rect
              key={`${bounds.surah}-${bounds.ayah}-${index}`}
              x={x}
              y={y}
              width={width}
              height={height}
              fill="rgba(111, 191, 115, 0.1)"
              stroke="rgba(111, 191, 115, 0.3)"
              strokeWidth="1"
              className="pointer-events-auto cursor-pointer hover:fill-[rgba(111,191,115,0.2)] transition-colors"
              onClick={(e) => handleAyahClick(bounds, e as unknown as React.MouseEvent)}
              role="button"
              aria-label={`سورة ${bounds.surah} آية ${bounds.ayah}`}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAyahClick(bounds, e as unknown as React.MouseEvent);
                }
              }}
            />
          );
        })}
      </svg>

      {/* Popover with ayah text and tafsir */}
      {popover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={closePopover}>
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-primary text-primary-content p-4 rounded-t-lg flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                سورة {popover.surah} - آية {popover.ayah}
              </h3>
              <button
                onClick={closePopover}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="إغلاق"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              ) : (
                <>
                  {/* Ayah Text */}
                  {popover.text && (
                    <div className="quran-text text-2xl leading-loose text-center p-4 bg-gray-50 rounded-lg">
                      {popover.text}
                    </div>
                  )}

                  {/* Tafsir */}
                  {popover.tafsir && popover.tafsir.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">التفسير</h4>
                      {popover.tafsir.map((tafsir, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">{tafsir.source}</p>
                          <p className="text-base leading-relaxed text-gray-800">{tafsir.text_ar}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio Controls - TODO: Implement audio playback */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 text-center">
                      التلاوة الصوتية - قريباً
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-100 p-4 rounded-b-lg flex justify-end gap-2">
              <button
                onClick={closePopover}
                className="btn btn-primary"
                aria-label="إغلاق"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
