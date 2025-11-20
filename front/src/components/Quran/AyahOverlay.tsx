/**
 * AyahOverlay Component
 * Displays bounding boxes over page images and shows popover with ayah details
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getTafsir, getAyah } from '../../services/quranService';
import type { Ayah, Tafsir } from '../../types/quran';

interface BoundingBox {
  ayahId: string;
  surahId: number;
  ayahNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahOverlayProps {
  pageNumber: number;
  boundingBoxes: BoundingBox[];
  onAyahClick?: (ayahId: string) => void;
  imageWidth: number;
  imageHeight: number;
}

interface PopoverData {
  ayahId: string;
  ayah: Ayah | null;
  tafsir: Tafsir[] | null;
  loading: boolean;
  position: { x: number; y: number };
}

const AyahOverlay: React.FC<AyahOverlayProps> = ({ 
  pageNumber, 
  boundingBoxes,
  onAyahClick,
  imageWidth,
  imageHeight,
}) => {
  const [activeAyah, setActiveAyah] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleAyahClick = useCallback(async (box: BoundingBox, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const ayahId = box.ayahId;
    setActiveAyah(ayahId);
    onAyahClick?.(ayahId);

    // Set initial popover position
    const rect = event.currentTarget.getBoundingClientRect();
    setPopover({
      ayahId,
      ayah: null,
      tafsir: null,
      loading: true,
      position: { x: rect.left + rect.width / 2, y: rect.top },
    });

    try {
      // Fetch ayah and tafsir
      const [ayahData, tafsirData] = await Promise.all([
        getAyah(ayahId).catch((err) => {
          console.error('Error fetching ayah:', err);
          return null;
        }),
        getTafsir(ayahId).catch((err) => {
          console.error('Error fetching tafsir:', err);
          return null;
        }),
      ]);

      setPopover(prev => prev ? {
        ...prev,
        ayah: ayahData,
        tafsir: tafsirData,
        loading: false,
      } : null);
    } catch (error) {
      console.error('Error loading ayah data:', error);
      setPopover(prev => prev ? {
        ...prev,
        loading: false,
      } : null);
    }
  }, [onAyahClick]);

  const handleClosePopover = useCallback(() => {
    setPopover(null);
    setActiveAyah(null);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleClosePopover();
      }
    };

    if (popover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popover, handleClosePopover]);

  // Close popover on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePopover();
      }
    };

    if (popover) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [popover, handleClosePopover]);

  return (
    <>
      {/* Bounding boxes overlay */}
      {boundingBoxes.map((box) => (
        <div
          key={box.ayahId}
          className={`ayah-overlay ${activeAyah === box.ayahId ? 'active' : ''}`}
          style={{
            left: `${(box.x / imageWidth) * 100}%`,
            top: `${(box.y / imageHeight) * 100}%`,
            width: `${(box.width / imageWidth) * 100}%`,
            height: `${(box.height / imageHeight) * 100}%`,
          }}
          onClick={(e) => handleAyahClick(box, e)}
          role="button"
          tabIndex={0}
          aria-label={`الآية ${box.ayahNumber} من سورة رقم ${box.surahId}`}
        />
      ))}

      {/* Popover */}
      {popover && (
        <div
          ref={popoverRef}
          className="tafsir-popover"
          style={{
            position: 'fixed',
            left: `${popover.position.x}px`,
            top: `${popover.position.y}px`,
            transform: 'translate(-50%, -100%) translateY(-1rem)',
            zIndex: 100,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {popover.loading ? (
            <div className="text-center py-4">
              <div className="quran-spinner mx-auto mb-2"></div>
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <>
              {popover.ayah && (
                <div className="tafsir-ayah-text mb-3">
                  {popover.ayah.text_ar}
                </div>
              )}
              
              {popover.tafsir && popover.tafsir.length > 0 && (
                <div className="tafsir-content">
                  <h4 className="font-bold mb-2 text-sm">التفسير:</h4>
                  {popover.tafsir.map((t, index) => (
                    <div key={index} className="mb-2">
                      {t.source && (
                        <p className="text-xs opacity-75 mb-1">{t.source}</p>
                      )}
                      <p className="text-sm">{t.text_ar}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {(!popover.ayah && !popover.tafsir) && (
                <p className="text-sm opacity-75">
                  عذراً، لا تتوفر معلومات عن هذه الآية حالياً
                </p>
              )}
              
              <button
                onClick={handleClosePopover}
                className="btn btn-sm btn-ghost mt-3 w-full"
                aria-label="إغلاق"
              >
                إغلاق
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AyahOverlay;
