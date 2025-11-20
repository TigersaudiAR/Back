import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Square, Repeat } from 'lucide-react';
import type { Recitation, AyahTiming } from '../../types/quran';

interface AudioPlayerProps {
  recitations: Recitation[];
  onHighlight?: (ayahNumber: number | null) => void;
  autoPlay?: boolean;
}

/**
 * AudioPlayer Component
 * Plays Quran recitations with ayah highlighting based on timestamps
 */
export default function AudioPlayer({
  recitations,
  onHighlight,
  autoPlay = false,
}: AudioPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [selectedRecitation, setSelectedRecitation] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const highlightIntervalRef = useRef<number | null>(null);

  const currentRecitation = recitations[selectedRecitation];
  const timings = currentRecitation?.timings || [];

  // Update highlighted ayah based on current time
  const updateHighlight = useCallback(() => {
    if (!onHighlight || !timings.length) return;

    const currentTiming = timings.find(
      (timing) => currentTime >= timing.start && currentTime <= timing.end
    );

    onHighlight(currentTiming?.ayah_number || null);
  }, [currentTime, timings, onHighlight]);

  useEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle stop
  const handleStop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    if (onHighlight) {
      onHighlight(null);
    }
  }, [onHighlight]);

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        if (onHighlight) {
          onHighlight(null);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat, onHighlight]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, selectedRecitation]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!recitations.length) {
    return null;
  }

  return (
    <div className="audio-player p-4" dir="rtl">
      <audio
        ref={audioRef}
        src={currentRecitation?.url}
        preload="metadata"
      />

      <div className="max-w-4xl mx-auto space-y-3">
        {/* Reciter Selection */}
        {recitations.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-300">القارئ:</label>
            <select
              value={selectedRecitation}
              onChange={(e) => setSelectedRecitation(parseInt(e.target.value, 10))}
              className="select select-sm bg-primary-dark/60 border-primary-light/30"
            >
              {recitations.map((rec, index) => (
                <option key={index} value={index}>
                  {rec.reciter}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 min-w-[2.5rem]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 range range-sm range-accent"
            aria-label="Seek audio"
          />
          <span className="text-xs text-gray-400 min-w-[2.5rem]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setRepeat(!repeat)}
            className={`btn btn-sm btn-circle ${repeat ? 'btn-accent' : 'btn-ghost'}`}
            aria-label={t('quranReader.repeat')}
            title={t('quranReader.repeat')}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="btn btn-accent btn-circle"
            aria-label={isPlaying ? t('quranReader.pause') : t('quranReader.play')}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label={t('quranReader.stop')}
            title={t('quranReader.stop')}
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
