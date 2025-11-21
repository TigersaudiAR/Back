/**
 * AyahOverlay Component
 * Renders interactive bounding boxes over page images
 * Opens popovers with ayah text, tafsir, and audio controls
 */

import { useState } from "react";
import { getAyah, getTafsir } from "../../services/quranService";
import AudioPlayer from "./AudioPlayer";

interface AyahBoundingBox {
  surahId: number;
  ayahNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahOverlayProps {
  boundingBoxes: AyahBoundingBox[];
  containerWidth: number;
  containerHeight: number;
  onAyahClick?: (surahId: number, ayahNumber: number) => void;
}

export default function AyahOverlay({
  boundingBoxes,
  containerWidth,
  containerHeight,
  onAyahClick,
}: AyahOverlayProps) {
  const [selectedAyah, setSelectedAyah] = useState<{
    surahId: number;
    ayahNumber: number;
    text: string;
    tafsir?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const handleAyahClick = async (surahId: number, ayahNumber: number) => {
    onAyahClick?.(surahId, ayahNumber);
    
    setIsLoading(true);
    setShowPopover(true);

    try {
      // Fetch ayah text
      const ayahData = await getAyah(surahId, ayahNumber);
      
      // Fetch tafsir (optional, may fail)
      let tafsirText = "";
      try {
        const tafsirData = await getTafsir(surahId, ayahNumber);
        if (tafsirData && tafsirData.length > 0) {
          tafsirText = tafsirData[0].text_ar;
        }
      } catch (error) {
        console.warn("Tafsir not available:", error);
      }

      setSelectedAyah({
        surahId,
        ayahNumber,
        text: ayahData.text_ar,
        tafsir: tafsirText,
      });
    } catch (error) {
      console.error("Error fetching ayah data:", error);
      setShowPopover(false);
    } finally {
      setIsLoading(false);
    }
  };

  const closePopover = () => {
    setShowPopover(false);
    setSelectedAyah(null);
  };

  return (
    <>
      {/* Render bounding boxes */}
      {boundingBoxes.map((box, index) => (
        <div
          key={`${box.surahId}-${box.ayahNumber}-${index}`}
          className="ayah-overlay"
          style={{
            left: `${(box.x / containerWidth) * 100}%`,
            top: `${(box.y / containerHeight) * 100}%`,
            width: `${(box.width / containerWidth) * 100}%`,
            height: `${(box.height / containerHeight) * 100}%`,
          }}
          onClick={() => handleAyahClick(box.surahId, box.ayahNumber)}
          role="button"
          tabIndex={0}
          aria-label={`الآية ${box.ayahNumber} من سورة ${box.surahId}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleAyahClick(box.surahId, box.ayahNumber);
            }
          }}
        />
      ))}

      {/* Popover with ayah details */}
      {showPopover && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closePopover}
        >
          <div
            className="ayah-popover bg-base-100 rounded-lg shadow-xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : selectedAyah ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    سورة {selectedAyah.surahId} - آية {selectedAyah.ayahNumber}
                  </h3>
                  <button
                    onClick={closePopover}
                    className="btn btn-sm btn-circle btn-ghost"
                    aria-label="إغلاق"
                  >
                    ✕
                  </button>
                </div>

                {/* Ayah text */}
                <div className="ayah-popover-text">
                  {selectedAyah.text}
                </div>

                {/* Audio player */}
                <div className="my-4">
                  <AudioPlayer
                    audioUrl={`https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/${selectedAyah.surahId.toString().padStart(3, "0")}${selectedAyah.ayahNumber.toString().padStart(3, "0")}.mp3`}
                  />
                </div>

                {/* Tafsir */}
                {selectedAyah.tafsir && (
                  <div className="ayah-popover-tafsir">
                    <h4 className="font-semibold mb-2">التفسير:</h4>
                    <p>{selectedAyah.tafsir}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
