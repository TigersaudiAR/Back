import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Ayah, Tafsir } from '../../types/quran';

interface AyahBoundingBox {
  ayahNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahOverlayProps {
  ayah: Ayah;
  boundingBox?: AyahBoundingBox;
  onSelect?: (ayah: Ayah) => void;
  tafsir?: Tafsir;
  active?: boolean;
}

/**
 * AyahOverlay Component
 * Displays clickable overlay on page image for individual ayahs
 * Shows popover with ayah text and tafsir when clicked
 */
export default function AyahOverlay({
  ayah,
  boundingBox,
  onSelect,
  tafsir,
  active = false,
}: AyahOverlayProps) {
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);

  const handleClick = () => {
    setShowPopover(!showPopover);
    if (onSelect) {
      onSelect(ayah);
    }
  };

  if (!boundingBox) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    left: `${boundingBox.x}%`,
    top: `${boundingBox.y}%`,
    width: `${boundingBox.width}%`,
    height: `${boundingBox.height}%`,
  };

  return (
    <>
      <div
        className={`ayah-overlay ${active ? 'active' : ''}`}
        style={overlayStyle}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`${t('quranReader.ayahText')} ${ayah.ayah_number}`}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      />

      {showPopover && (
        <div
          className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-md"
          style={{
            left: `${boundingBox.x}%`,
            top: `${boundingBox.y + boundingBox.height}%`,
            marginTop: '0.5rem',
          }}
        >
          <div className="space-y-3">
            {/* Ayah Number */}
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-accent">
                {t('quranReader.ayahText')} {ayah.ayah_number}
              </h3>
              <button
                onClick={() => setShowPopover(false)}
                className="btn btn-ghost btn-xs"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>

            {/* Ayah Text */}
            <div className="quran-text text-right" dir="rtl">
              {ayah.text_ar}
            </div>

            {/* Tafsir */}
            {tafsir && (
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">{t('quranReader.tafsir')}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-right" dir="rtl">
                  {tafsir.text_ar}
                </p>
                {tafsir.source && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    المصدر: {tafsir.source}
                  </p>
                )}
              </div>
            )}

            {!tafsir && (
              <p className="text-xs text-gray-500 text-center">
                {t('quranReader.noTafsir')}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * AyahOverlayContainer Component
 * Manages multiple ayah overlays on a page
 */
interface AyahOverlayContainerProps {
  ayat: Ayah[];
  boundingBoxes?: AyahBoundingBox[];
  tafsirMap?: Map<string, Tafsir>;
  onSelectAyah?: (ayah: Ayah) => void;
  activeAyah?: number;
}

export function AyahOverlayContainer({
  ayat,
  boundingBoxes = [],
  tafsirMap,
  onSelectAyah,
  activeAyah,
}: AyahOverlayContainerProps) {
  if (!boundingBoxes.length) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {ayat.map((ayah) => {
          const bbox = boundingBoxes.find(
            (box) => box.ayahNumber === ayah.ayah_number
          );
          
          if (!bbox) return null;

          const tafsirKey = `${ayah.surah_id}-${ayah.ayah_number}`;
          const tafsir = tafsirMap?.get(tafsirKey);

          return (
            <AyahOverlay
              key={`${ayah.surah_id}-${ayah.ayah_number}`}
              ayah={ayah}
              boundingBox={bbox}
              tafsir={tafsir}
              onSelect={onSelectAyah}
              active={ayah.ayah_number === activeAyah}
            />
          );
        })}
      </div>
    </div>
  );
}
