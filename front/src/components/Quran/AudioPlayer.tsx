/**
 * AudioPlayer Component
 * Audio playback with play/pause/seek/repeat and highlight callbacks
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title = 'تلاوة القرآن الكريم',
  onProgress,
  onEnded,
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);
    audio.src = audioUrl;
    audio.load();

    if (autoPlay) {
      audio.play().catch(console.error);
    }
  }, [audioUrl, autoPlay]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onProgress?.(audio.currentTime, audio.duration);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        onEnded?.();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => setLoading(false);
    const handleWaiting = () => setLoading(true);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, [isRepeat, onProgress, onEnded]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleSkipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }, []);

  const handleSkipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = value;
    setVolume(value);
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(!isRepeat);
  }, [isRepeat]);

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quran-audio-player">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="container mx-auto">
        <div className="flex flex-col gap-3">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-base-content/90">{title}</h3>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-base-content/70 min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="range range-xs range-primary flex-1"
              disabled={loading}
              aria-label="موضع التشغيل"
            />
            <span className="text-xs text-base-content/70 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="quran-audio-controls">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="btn btn-ghost btn-sm quran-button"
                aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="range range-xs w-20 hidden sm:block"
                aria-label="مستوى الصوت"
              />
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipBackward}
                className="btn btn-ghost btn-sm quran-button"
                disabled={loading}
                aria-label="رجوع 10 ثوان"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="btn btn-primary btn-circle quran-button"
                disabled={loading}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {loading ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
              </button>

              <button
                onClick={handleSkipForward}
                className="btn btn-ghost btn-sm quran-button"
                disabled={loading}
                aria-label="تقديم 10 ثوان"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`btn btn-ghost btn-sm quran-button ${isRepeat ? 'btn-active' : ''}`}
              aria-label="إعادة"
              aria-pressed={isRepeat}
            >
              <Repeat size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
