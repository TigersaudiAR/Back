/**
 * AudioPlayer Component
 * Audio playback with play/pause/seek/repeat and highlight callbacks using timestamps
 */
import { useState, useRef, useEffect } from 'react';
import type { AyahTiming } from '../../types/quran';

interface AudioPlayerProps {
  audioUrl: string;
  timings?: AyahTiming[];
  onAyahHighlight?: (ayahNumber: number) => void;
  reciterName?: string;
}

export default function AudioPlayer({
  audioUrl,
  timings = [],
  onAyahHighlight,
  reciterName = 'القارئ'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<number>();

  // Update current time and highlight ayah
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressInterval.current = window.setInterval(() => {
        if (audioRef.current) {
          const time = audioRef.current.currentTime;
          setCurrentTime(time);

          // Find current ayah based on timing
          if (timings.length > 0 && onAyahHighlight) {
            const currentAyah = timings.find(
              t => time >= t.start && time <= t.end
            );
            if (currentAyah) {
              onAyahHighlight(currentAyah.ayah_number);
            }
          }
        }
      }, 100);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [isPlaying, timings, onAyahHighlight]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error('Error playing audio:', err);
          setError('فشل تشغيل الصوت');
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-controls bg-base-200 rounded-lg p-3 mt-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          className="audio-btn"
          onClick={handlePlayPause}
          disabled={isLoading}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : isPlaying ? (
            '⏸️'
          ) : (
            '▶️'
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="range range-xs range-primary"
            disabled={!duration}
            aria-label="شريط التقدم"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Repeat Button */}
        <button
          className={`audio-btn ${repeat ? 'bg-primary/20' : ''}`}
          onClick={() => setRepeat(!repeat)}
          aria-label={repeat ? 'إلغاء التكرار' : 'تكرار'}
          title={repeat ? 'إلغاء التكرار' : 'تكرار'}
        >
          🔁
        </button>

        {/* Reciter Name */}
        {reciterName && (
          <div className="text-xs text-gray-400 hidden sm:block">
            {reciterName}
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-error mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
