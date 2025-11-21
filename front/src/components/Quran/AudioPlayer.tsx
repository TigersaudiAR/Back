/**
 * Audio Player Component for Quran Recitation
 * مشغّل الصوت للتلاوة القرآنية
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat } from 'lucide-react';

export interface AudioPlayerProps {
  /** URL of the audio file */
  audioUrl: string;
  /** Called when playback position changes */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Called when playback starts */
  onPlay?: () => void;
  /** Called when playback pauses */
  onPause?: () => void;
  /** Called when playback ends */
  onEnded?: () => void;
  /** Display name for the audio (e.g., "سورة الفاتحة - ماهر المعيقلي") */
  displayName?: string;
  /** Auto play on mount */
  autoPlay?: boolean;
  /** Show repeat button */
  showRepeat?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  displayName,
  autoPlay = false,
  showRepeat = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime, audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else if (onEnded) {
        onEnded();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onEnded, onPlay, onPause, isRepeating]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audio.currentTime = percentage * duration;
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quran-audio-player" dir="rtl">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        autoPlay={autoPlay}
      />

      {displayName && (
        <div className="text-sm text-gray-300 flex-shrink-0 hidden md:block">
          {displayName}
        </div>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={skipBackward}
          className="audio-control-btn"
          aria-label="الرجوع 10 ثوان"
          title="الرجوع 10 ثوان"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={togglePlayPause}
          className="audio-control-btn"
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={skipForward}
          className="audio-control-btn"
          aria-label="التقديم 10 ثوان"
          title="التقديم 10 ثوان"
        >
          <SkipForward size={16} />
        </button>

        {showRepeat && (
          <button
            onClick={toggleRepeat}
            className={`audio-control-btn ${isRepeating ? 'bg-primary' : ''}`}
            aria-label="تكرار"
            title="تكرار"
          >
            <Repeat size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-400 flex-shrink-0 w-12 text-center">
          {formatTime(currentTime)}
        </span>

        <div
          className="audio-seek-bar flex-1"
          onClick={handleSeek}
          role="slider"
          aria-label="موضع التلاوة"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          tabIndex={0}
        >
          <div
            className="audio-seek-progress"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        <span className="text-xs text-gray-400 flex-shrink-0 w-12 text-center">
          {formatTime(duration)}
        </span>
      </div>

      <button
        onClick={toggleMute}
        className="audio-control-btn flex-shrink-0"
        aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
        title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};

export default AudioPlayer;
