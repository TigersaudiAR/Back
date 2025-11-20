/**
 * AudioPlayer Component
 *
 * Audio playback for Quran recitation
 * Features:
 * - Play/pause/seek controls
 * - Repeat mode
 * - Ayah highlighting during playback
 * - Timestamp-based highlighting
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Volume2,
  VolumeX,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onHighlight?: (ayahNumber: number) => void;
  ayahTimestamps?: { ayahNumber: number; start: number; end: number }[];
  className?: string;
}

export default function AudioPlayer({
  audioUrl,
  onProgress,
  onHighlight,
  ayahTimestamps = [],
  className = "",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
    setLoading(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onProgress?.(time, duration);

      // Check if we need to highlight an ayah based on timestamp
      if (ayahTimestamps.length > 0) {
        const currentAyah = ayahTimestamps.find(
          (t) => time >= t.start && time < t.end,
        );
        if (currentAyah) {
          onHighlight?.(currentAyah.ayahNumber);
        }
      }
    }
  };

  const handleEnded = () => {
    if (repeat) {
      audioRef.current?.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handleError = () => {
    setLoading(false);
    console.error("Error loading audio");
  };

  // Playback controls
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration,
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0,
      );
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className={`bg-base-200 rounded-lg p-4 ${className}`} dir="rtl">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />

      {/* Progress bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="range range-primary range-xs w-full"
          disabled={!audioUrl || loading}
        />
        <div className="flex justify-between text-xs text-base-content text-opacity-70 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={toggleMute}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="range range-xs flex-1 max-w-24"
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={skipBackward}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={!audioUrl || loading}
            aria-label="تقديم 10 ثواني"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={togglePlay}
            className="btn btn-primary btn-circle"
            disabled={!audioUrl || loading}
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {loading ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>

          <button
            onClick={skipForward}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={!audioUrl || loading}
            aria-label="تأخير 10 ثواني"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Repeat toggle */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={toggleRepeat}
            className={`btn btn-ghost btn-sm btn-circle ${repeat ? "btn-active" : ""}`}
            aria-label="تكرار"
          >
            <Repeat size={18} className={repeat ? "text-primary" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
