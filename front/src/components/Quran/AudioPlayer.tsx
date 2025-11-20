import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  ayahInfo?: {
    surah: number;
    ayah: number;
  };
  onPlayStateChange?: (isPlaying: boolean) => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

/**
 * Audio Player Component for Quran Recitation
 * Features:
 * - Play/Pause controls
 * - Seek bar with progress
 * - Volume control
 * - Aria labels for accessibility
 */
function AudioPlayer({
  audioUrl,
  ayahInfo,
  onPlayStateChange,
  onProgress,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset player when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setLoading(true);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      alert('فشل تشغيل الصوت');
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;

    setCurrentTime(current);
    
    if (onProgress) {
      onProgress(current, total);
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  // Handle play event
  const handlePlay = () => {
    setIsPlaying(true);
    setLoading(false);
    
    if (onPlayStateChange) {
      onPlayStateChange(true);
    }
  };

  // Handle pause event
  const handlePause = () => {
    setIsPlaying(false);
    setLoading(false);
    
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="btn btn-circle btn-primary"
          disabled={loading}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {loading ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          {ayahInfo && (
            <div className="text-xs text-gray-600 mb-1">
              سورة {ayahInfo.surah} - آية {ayahInfo.ayah}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="range range-xs range-primary flex-1"
              aria-label="التقدم في التلاوة"
            />
            
            <span className="text-xs text-gray-600 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="btn btn-sm btn-ghost btn-circle"
            aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="range range-xs w-20 hidden sm:inline-block"
            aria-label="مستوى الصوت"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
