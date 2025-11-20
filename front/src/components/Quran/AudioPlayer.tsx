/**
 * AudioPlayer Component - Audio playback controls for Quran recitation
 * Supports play/pause/seek/repeat with timeupdate callback for highlighting
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  className?: string;
  surahName?: string;
  ayahNumber?: number;
}

export default function AudioPlayer({
  audioUrl,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  className = '',
  surahName,
  ayahNumber
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      if (autoPlay) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [audioUrl, autoPlay]);

  // Handle time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime, audio.duration || 0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        setIsPlaying(true);
      } else if (onEnded) {
        onEnded();
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
  }, [onTimeUpdate, onEnded, isRepeat]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [isPlaying]);

  // Seek to position
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Repeat toggle
  const toggleRepeat = useCallback(() => {
    setIsRepeat(!isRepeat);
  }, [isRepeat]);

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    if (!isFinite(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className={`bg-base-200 rounded-lg shadow-lg p-4 ${className}`} dir="rtl">
      <audio ref={audioRef} preload="metadata" />

      {/* Track info */}
      {(surahName || ayahNumber) && (
        <div className="mb-3 text-center">
          <p className="text-sm font-semibold text-base-content">
            {surahName} {ayahNumber ? `- آية ${ayahNumber}` : ''}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="range range-primary range-xs w-full"
          aria-label="موضع التشغيل"
        />
        <div className="flex justify-between text-xs text-base-content/70 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Repeat button */}
        <button
          onClick={toggleRepeat}
          className={`btn btn-ghost btn-sm btn-circle ${isRepeat ? 'text-primary' : 'text-base-content/50'}`}
          aria-label={isRepeat ? 'إيقاف التكرار' : 'تفعيل التكرار'}
          title={isRepeat ? 'إيقاف التكرار' : 'تفعيل التكرار'}
        >
          <RotateCcw size={20} />
        </button>

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="btn btn-primary btn-circle"
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="range range-primary range-xs w-20"
            aria-label="مستوى الصوت"
          />
        </div>
      </div>
    </div>
  );
}
