/**
 * AyahOverlay Component
 * Transparent overlay with bounding boxes positioned on top of page image
 * Shows popover with ayah text, tafsir, and audio controls on tap
 */

import React, { useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export interface AyahBoundingBox {
  ayahNumber: number;
  surahId: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AyahData {
  text: string;
  tafsir?: string;
  audioUrl?: string;
}

interface AyahOverlayProps {
  boundingBoxes: AyahBoundingBox[];
  imageWidth: number;
  imageHeight: number;
  onAyahClick: (surahId: number, ayahNumber: number) => void;
  activeAyah?: number;
  ayahData?: AyahData;
}

const AyahOverlay: React.FC<AyahOverlayProps> = ({
  boundingBoxes,
  imageWidth,
  imageHeight,
  onAyahClick,
  activeAyah,
  ayahData,
}) => {
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const handleAyahClick = useCallback((box: AyahBoundingBox, event: React.MouseEvent) => {
    onAyahClick(box.surahId, box.ayahNumber);
    
    // Position popover near the clicked box
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    });
  }, [onAyahClick]);

  const closePopover = useCallback(() => {
    setPopoverPosition(null);
    setIsPlaying(false);
    setAudioProgress(0);
  }, []);

  const handlePlayPause = useCallback(() => {
    // TODO: Integrate with AudioPlayer component
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleRepeat = useCallback(() => {
    // TODO: Integrate with AudioPlayer component
    setAudioProgress(0);
    setIsPlaying(true);
  }, []);

  // Calculate percentage-based positioning for responsive overlay
  const getBoxStyle = (box: AyahBoundingBox): React.CSSProperties => {
    return {
      left: `${(box.x / imageWidth) * 100}%`,
      top: `${(box.y / imageHeight) * 100}%`,
      width: `${(box.width / imageWidth) * 100}%`,
      height: `${(box.height / imageHeight) * 100}%`,
    };
  };

  return (
    <>
      <div className="ayah-overlay">
        {boundingBoxes.map((box, index) => (
          <button
            key={`${box.surahId}-${box.ayahNumber}-${index}`}
            className={`ayah-box ${activeAyah === box.ayahNumber ? 'active' : ''}`}
            style={getBoxStyle(box)}
            onClick={(e) => handleAyahClick(box, e)}
            aria-label={`الآية ${box.ayahNumber} من سورة ${box.surahId}`}
          />
        ))}
      </div>

      {/* Popover for Ayah Details */}
      {popoverPosition && ayahData && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={closePopover}
            aria-label="إغلاق"
          />
          
          {/* Popover */}
          <div
            className="tafsir-popover fixed z-50 max-h-[70vh] overflow-y-auto"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={closePopover}
              className="absolute top-2 left-2 text-gray-400 hover:text-white"
              aria-label="إغلاق"
            >
              ✕
            </button>

            {/* Ayah Text */}
            <div className="mb-4 mt-2">
              <h3 className="text-sm text-gray-400 mb-2">نص الآية:</h3>
              <p className="text-lg font-arabic leading-relaxed" style={{ fontFamily: 'UthmanicHafs, Amiri, serif' }}>
                {ayahData.text}
              </p>
            </div>

            {/* Tafsir */}
            {ayahData.tafsir && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-2">التفسير:</h3>
                <p className="tafsir-text">
                  {ayahData.tafsir}
                </p>
              </div>
            )}

            {/* Audio Controls */}
            {ayahData.audioUrl && (
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm text-gray-400 mb-3">التلاوة:</h3>
                <div className="audio-controls">
                  <button
                    onClick={handlePlayPause}
                    className="audio-button"
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <div className="audio-progress flex-1">
                    <div 
                      className="audio-progress-bar" 
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={handleRepeat}
                    className="audio-button"
                    aria-label="إعادة"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* TODO Notice if no tafsir or audio */}
            {!ayahData.tafsir && !ayahData.audioUrl && (
              <div className="text-center text-gray-400 text-sm py-2">
                <p>التفسير والتلاوة قريباً إن شاء الله</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AyahOverlay;
