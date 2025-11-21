/**
 * AyahOverlay Component for Interactive Verse Highlighting
 * طبقة تفاعلية لإبراز الآيات على صفحة المصحف
 */

import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { getAyahById, getTafsir, getAyahAudioUrl } from '../../services/quranService';
import AudioPlayer from './AudioPlayer';
import type { Ayah, Tafsir } from '../../types/quran';

export interface VerseBox {
  surah_id: number;
  ayah_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ayah_id?: number;
}

export interface AyahOverlayProps {
  /** Page number */
  pageNumber: number;
  /** Verse bounding boxes */
  verses: VerseBox[];
  /** Image width for coordinate scaling */
  imageWidth: number;
  /** Image height for coordinate scaling */
  imageHeight: number;
  /** Show the overlay */
  visible: boolean;
  /** Called when overlay is closed */
  onClose?: () => void;
}

const AyahOverlay: React.FC<AyahOverlayProps> = ({
  pageNumber,
  verses,
  imageWidth,
  imageHeight,
  visible,
  onClose,
}) => {
  const [selectedVerse, setSelectedVerse] = useState<VerseBox | null>(null);
  const [ayahText, setAyahText] = useState<string>('');
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [showAudio, setShowAudio] = useState(false);

  // Load ayah text and tafsir when a verse is selected
  useEffect(() => {
    if (!selectedVerse) {
      setAyahText('');
      setTafsirText('');
      setError(null);
      return;
    }

    const loadVerseData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load ayah text
        if (selectedVerse.ayah_id) {
          const ayah = await getAyahById(selectedVerse.ayah_id);
          setAyahText(ayah.text_ar || 'النص غير متوفر');
        } else {
          setAyahText('النص غير متوفر');
        }

        // Load tafsir
        try {
          const tafsirData = await getTafsir(
            selectedVerse.surah_id,
            selectedVerse.ayah_number
          );
          
          if (tafsirData && tafsirData.length > 0) {
            setTafsirText(tafsirData[0].text_ar || 'التفسير غير متوفر');
          } else {
            setTafsirText('التفسير غير متوفر حالياً');
          }
        } catch (tafsirError) {
          console.warn('Tafsir not available:', tafsirError);
          setTafsirText('التفسير غير متوفر حالياً');
        }
      } catch (err) {
        console.error('Error loading verse data:', err);
        setError('فشل تحميل بيانات الآية');
      } finally {
        setLoading(false);
      }
    };

    loadVerseData();
  }, [selectedVerse]);

  const handleVerseClick = (verse: VerseBox, event: React.MouseEvent<SVGRectElement>) => {
    event.stopPropagation();
    setSelectedVerse(verse);
    setShowAudio(false);

    // Calculate popover position
    const rect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = 500;
    const popoverHeight = 300;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    let top = rect.bottom + 10;

    // Adjust if popover would go off screen
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    if (top + popoverHeight > window.innerHeight) {
      top = rect.top - popoverHeight - 10;
    }

    setPopoverPosition({ top, left });
  };

  const handleClosePopover = () => {
    setSelectedVerse(null);
    setShowAudio(false);
  };

  const handleOverlayClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const getAudioUrl = () => {
    if (!selectedVerse) return '';
    return getAyahAudioUrl(selectedVerse.surah_id, selectedVerse.ayah_number);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="quran-page-overlay interactive"
      onClick={handleOverlayClick}
    >
      {/* SVG overlay for verse bounding boxes */}
      <svg
        width={imageWidth}
        height={imageHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'auto',
        }}
      >
        {verses.map((verse, index) => (
          <rect
            key={`${verse.surah_id}-${verse.ayah_number}-${index}`}
            x={verse.x}
            y={verse.y}
            width={verse.width}
            height={verse.height}
            fill="rgba(16, 185, 129, 0.1)"
            stroke="#10b981"
            strokeWidth="2"
            rx="4"
            className="cursor-pointer hover:fill-[rgba(16,185,129,0.2)] transition-all"
            onClick={(e) => handleVerseClick(verse, e)}
            role="button"
            aria-label={`سورة ${verse.surah_id} آية ${verse.ayah_number}`}
          />
        ))}
      </svg>

      {/* Popover for selected verse */}
      {selectedVerse && (
        <div
          className="ayah-popover"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClosePopover}
            className="absolute top-2 left-2 p-1 rounded-full hover:bg-white/10"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          {/* Verse header */}
          <div className="text-sm text-gray-400 mb-2">
            سورة {selectedVerse.surah_id} - آية {selectedVerse.ayah_number}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-4 text-gray-400">
              جاري التحميل...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-4 text-red-400">
              {error}
            </div>
          )}

          {/* Ayah text */}
          {!loading && !error && ayahText && (
            <div className="ayah-popover-text">
              {ayahText}
            </div>
          )}

          {/* Tafsir */}
          {!loading && !error && tafsirText && (
            <div>
              <div className="text-xs text-gray-400 mb-1">التفسير:</div>
              <div className="ayah-popover-tafsir">
                {tafsirText}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="ayah-popover-controls">
            <button
              onClick={() => setShowAudio(!showAudio)}
              className="btn btn-sm btn-primary gap-2"
              aria-label="تشغيل التلاوة"
            >
              <Play size={14} />
              {showAudio ? 'إخفاء المشغل' : 'تشغيل التلاوة'}
            </button>
          </div>

          {/* Audio player */}
          {showAudio && (
            <div className="mt-3">
              <AudioPlayer
                audioUrl={getAudioUrl()}
                displayName={`آية ${selectedVerse.ayah_number}`}
                autoPlay={true}
                showRepeat={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AyahOverlay;
