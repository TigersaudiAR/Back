import { useEffect, useRef, useState } from "react";
import type { Recitation } from "../types/quran";

interface AudioBarProps {
  recitations: Recitation[];
  onProgress?: (time: number) => void;
}

function AudioBar({ recitations, onProgress }: AudioBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const track = recitations[current];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function handleTimeUpdate() {
      onProgress?.(audio.currentTime);
    }
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.url]);

  if (!track) return null;

  return (
    <div className="fixed bottom-20 right-8 bg-primary-dark/80 border border-primary-light/40 rounded-2xl p-4 shadow-xl">
      <audio ref={audioRef} src={track.url} preload="none" />
      <div className="flex items-center gap-3 text-sm">
        <button
          className="btn btn-sm"
          onClick={() => setIsPlaying((prev) => !prev)}
        >
          {isPlaying ? "إيقاف" : "تشغيل"}
        </button>
        <div>
          <p className="font-semibold text-accent">{track.reciter}</p>
          <p className="text-xs text-gray-300">رابط تجريبي للتلاوة</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {recitations.map((rec, index) => (
          <button
            key={rec.url}
            className={`badge badge-outline ${index === current ? "badge-accent" : ""}`}
            onClick={() => setCurrent(index)}
          >
            {rec.reciter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AudioBar;
