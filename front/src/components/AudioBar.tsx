import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Radio } from "lucide-react";
import type { Recitation } from "../types/quran";

interface AudioBarProps {
  recitations: Recitation[];
  onProgress?: (time: number) => void;
}

function AudioBar({ recitations, onProgress }: AudioBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const track = recitations[current];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onProgress?.(audio.currentTime);
    };
    const handleLoaded = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [onProgress, track?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.url]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [current]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.round((currentTime / duration) * 100));
  }, [currentTime, duration]);

  if (!track) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[min(90%,420px)] -translate-x-1/2 rounded-3xl border border-primary-light/40 bg-primary-dark/85 p-4 text-xs shadow-[0_18px_45px_rgba(4,20,16,0.45)] sm:left-auto sm:right-8 sm:translate-x-0">
      <audio ref={audioRef} src={track.url} preload="metadata" />
      <div className="flex items-center gap-3">
        <button className="btn btn-sm btn-accent" onClick={() => setIsPlaying((prev) => !prev)}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent">{track.reciter}</p>
          <p className="text-[11px] text-gray-300">تلاوة معتمدة مع تمييز تلقائي للآيات</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-dark/40">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        {recitations.map((rec, index) => (
          <button
            key={rec.url}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 transition ${
              index === current ? "border-accent/60 bg-accent/20 text-accent" : "border-primary-light/20 bg-primary-dark/60"
            }`}
            onClick={() => setCurrent(index)}
          >
            <Radio className="h-3 w-3" /> {rec.reciter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AudioBar;
