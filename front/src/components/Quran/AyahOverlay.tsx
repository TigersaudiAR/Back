/**
 * AyahOverlay Component
 * Displays bounding boxes over Quran page images and shows popover with ayah details
 */
import { useState, useEffect, useRef } from 'react';
import type { Ayah, Tafsir } from '../../types/quran';

interface BoundingBox {
  ayah_number: number;
  surah_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahOverlayProps {
  boundingBoxes: BoundingBox[];
  ayat: Ayah[];
  tafsirMap?: Map<string, Tafsir>;
  imageWidth: number;
  imageHeight: number;
  onAyahSelect?: (ayah: Ayah) => void;
}

export default function AyahOverlay({
  boundingBoxes,
  ayat,
  tafsirMap,
  imageWidth,
  imageHeight,
  onAyahSelect
}: AyahOverlayProps) {
  const [activeAyahKey, setActiveAyahKey] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeAyah = activeAyahKey
    ? ayat.find(a => `${a.surah_id}-${a.ayah_number}` === activeAyahKey)
    : undefined;

  const activeTafsir = activeAyahKey && tafsirMap
    ? tafsirMap.get(activeAyahKey)
    : undefined;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActiveAyahKey(null);
        setPopoverPosition(null);
      }
    };

    if (activeAyahKey) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeAyahKey]);

  const handleBoxClick = (box: BoundingBox, event: React.MouseEvent) => {
    const ayahKey = `${box.surah_id}-${box.ayah_number}`;
    const ayah = ayat.find(a => `${a.surah_id}-${a.ayah_number}` === ayahKey);

    if (ayah) {
      setActiveAyahKey(ayahKey);
      
      // Calculate popover position
      const rect = event.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = rect.left + rect.width / 2;
      let top = rect.bottom + 10;

      // Adjust if popover would go off screen
      if (left + 200 > viewportWidth) {
        left = viewportWidth - 210;
      }
      if (left < 10) {
        left = 10;
      }
      if (top + 300 > viewportHeight) {
        top = rect.top - 310;
      }

      setPopoverPosition({ top, left });
      onAyahSelect?.(ayah);
    }
  };

  const handleClosePopover = () => {
    setActiveAyahKey(null);
    setPopoverPosition(null);
  };

  return (
    <>
      {/* Render bounding boxes */}
      {boundingBoxes.map((box, index) => {
        const ayahKey = `${box.surah_id}-${box.ayah_number}`;
        const isActive = ayahKey === activeAyahKey;

        return (
          <div
            key={`${ayahKey}-${index}`}
            className={`ayah-overlay ${isActive ? 'ayah-overlay-active' : ''}`}
            style={{
              left: `${(box.x / imageWidth) * 100}%`,
              top: `${(box.y / imageHeight) * 100}%`,
              width: `${(box.width / imageWidth) * 100}%`,
              height: `${(box.height / imageHeight) * 100}%`
            }}
            onClick={(e) => handleBoxClick(box, e)}
            role="button"
            tabIndex={0}
            aria-label={`الآية ${box.ayah_number} من سورة ${box.surah_id}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBoxClick(box, e as unknown as React.MouseEvent);
              }
            }}
          />
        );
      })}

      {/* Popover */}
      {activeAyah && popoverPosition && (
        <div
          ref={popoverRef}
          className="ayah-popover"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`
          }}
          role="dialog"
          aria-label="تفاصيل الآية"
        >
          <button
            onClick={handleClosePopover}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-200"
            aria-label="إغلاق"
          >
            ✕
          </button>

          <div className="ayah-popover-text">
            {activeAyah.text_ar}
            <span className="ayah-number mr-2">
              {activeAyah.ayah_number}
            </span>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            سورة {activeAyah.surah_id} - آية {activeAyah.ayah_number}
          </div>

          {activeTafsir && (
            <div className="ayah-popover-tafsir">
              <div className="text-xs font-semibold mb-1">التفسير:</div>
              <div>{activeTafsir.text_ar}</div>
            </div>
          )}

          {/* Audio controls - placeholder for future implementation */}
          <div className="audio-controls">
            <button className="audio-btn" disabled title="قريباً">
              🔊 تشغيل
            </button>
            <button className="audio-btn" disabled title="قريباً">
              📖 التفسير الكامل
            </button>
          </div>
        </div>
      )}
    </>
  );
}
