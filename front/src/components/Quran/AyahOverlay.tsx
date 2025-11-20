/**
 * AyahOverlay Component
 *
 * Displays bounding boxes over Quran page images for each ayah
 * Shows popover with ayah text, tafsir, and audio controls when clicked
 *
 * Note: Bounding box data from API required - placeholder structure shown
 */

import { useState, useEffect } from "react";
import { Volume2, BookOpen } from "lucide-react";
import type { Ayah, Tafsir, AyahBoundingBox } from "../../types/quran";

interface AyahOverlayProps {
  pageNumber: number; // Used for cache key or future functionality
  ayahBoxes: AyahBoundingBox[];
  onAyahClick?: (ayahId: string | number) => void;
  className?: string;
}

export default function AyahOverlay({
  // pageNumber is kept for future use (e.g., caching, analytics)
  ayahBoxes,
  onAyahClick,
  className = "",
}: AyahOverlayProps) {
  const [selectedAyah, setSelectedAyah] = useState<string | number | null>(
    null,
  );
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleBoxClick = (box: AyahBoundingBox, event: React.MouseEvent) => {
    event.stopPropagation();

    // Calculate popover position
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    setSelectedAyah(box.ayahId);
    onAyahClick?.(box.ayahId);
  };

  const handleClosePopover = () => {
    setSelectedAyah(null);
    setPopoverPosition(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bounding boxes overlay */}
      {ayahBoxes.map((box, index) => (
        <button
          key={`${box.ayahId}-${index}`}
          className="absolute border-2 border-transparent hover:border-primary hover:bg-primary hover:bg-opacity-10 transition-all cursor-pointer"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
          }}
          onClick={(e) => handleBoxClick(box, e)}
          aria-label={`سورة ${box.surahNumber} آية ${box.ayahNumber}`}
        />
      ))}

      {/* Popover for selected ayah */}
      {selectedAyah && popoverPosition && (
        <AyahPopover
          ayahId={selectedAyah}
          position={popoverPosition}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}

/**
 * AyahPopover - Shows ayah details in a popover
 */
interface AyahPopoverProps {
  ayahId: string | number;
  position: { top: number; left: number };
  onClose: () => void;
}

function AyahPopover({ ayahId, position, onClose }: AyahPopoverProps) {
  const [loading, setLoading] = useState(true);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [tafsir] = useState<Tafsir[]>([]); // Will be populated when tafsir is fetched
  const [showTafsir, setShowTafsir] = useState(false);

  // TODO: Fetch ayah and tafsir data using quranService
  // This is a placeholder implementation
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAyah({
        surah_id: 1,
        ayah_number: 1,
        text_ar: "نص الآية من API",
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [ayahId]);

  const handlePlayAudio = () => {
    // TODO: Implement audio playback
    console.log("Play audio for ayah:", ayahId);
  };

  const handleToggleTafsir = () => {
    setShowTafsir(!showTafsir);
    if (!showTafsir && tafsir.length === 0) {
      // TODO: Fetch tafsir from API
      console.log("Fetch tafsir for ayah:", ayahId);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className="fixed z-50 bg-base-100 rounded-lg shadow-xl p-4 max-w-md"
        style={{
          top: position.top,
          left: position.left,
          transform: "translate(-50%, 10px)",
        }}
        dir="rtl"
      >
        {/* Close button */}
        <button
          className="absolute top-2 left-2 btn btn-sm btn-circle btn-ghost"
          onClick={onClose}
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ayah text */}
            {ayah && (
              <div className="text-right">
                <p className="text-2xl leading-relaxed font-['UthmanicHafs'] quran-manuscript__body">
                  {ayah.text_ar || "قريباً - سيتم جلب النص من API الرسمي"}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-sm btn-ghost gap-2"
                onClick={handlePlayAudio}
                aria-label="تشغيل التلاوة"
              >
                <Volume2 size={16} />
                <span>استماع</span>
              </button>
              <button
                className="btn btn-sm btn-ghost gap-2"
                onClick={handleToggleTafsir}
                aria-label="عرض التفسير"
              >
                <BookOpen size={16} />
                <span>{showTafsir ? "إخفاء التفسير" : "التفسير"}</span>
              </button>
            </div>

            {/* Tafsir section */}
            {showTafsir && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h3 className="font-bold mb-2">التفسير</h3>
                {tafsir.length > 0 ? (
                  <div className="space-y-2">
                    {tafsir.map((t, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        {t.text_ar}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content text-opacity-70">
                    قريباً - سيتم جلب التفسير من API الرسمي
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
