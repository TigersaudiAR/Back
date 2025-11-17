import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Radio } from "lucide-react";
import type { AyahTiming, Recitation } from "../types/quran";

export interface AudioProgressPayload {
  ayahNumber?: number;
  currentTime: number;
  reciterId: string;
  recitation: Recitation;
}

interface AudioBarProps {
  recitations: Recitation[];
  onProgress?: (payload: AudioProgressPayload) => void;
  variant?: "floating" | "embedded";
  className?: string;
}

const findAyahAtTime = (timings: AyahTiming[] | undefined, time: number): number | undefined => {
  if (!timings?.length) return undefined;
  for (let index = 0; index < timings.length; index += 1) {
    const segment = timings[index];
    const next = timings[index + 1];
    if (time >= segment.start && (time < segment.end || (!next && time <= segment.end + 0.25))) {
      return segment.ayah_number;
    }
    if (next && time >= segment.end && time < next.start) {
      return next.ayah_number;
    }
  }
  const last = timings[timings.length - 1];
  if (time >= last.start) {
    return last.ayah_number;
  }
  return timings[0]?.ayah_number;
};

function AudioBar({ recitations, onProgress, variant = "floating", className }: AudioBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const lastReportedAyah = useRef<number | undefined>(undefined);

  const track = recitations[current];
  const sortedTimings = useMemo(() => {
    if (!track?.timings?.length) return undefined;
    return [...track.timings].sort((a, b) => a.start - b.start);
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      const ayahNumber = findAyahAtTime(sortedTimings, time);
      const shouldNotify = sortedTimings
        ? lastReportedAyah.current !== ayahNumber || typeof ayahNumber === "undefined"
        : true;
      if (shouldNotify) {
        lastReportedAyah.current = ayahNumber;
        onProgress?.({
          ayahNumber,
          currentTime: time,
          reciterId: track.reciter_id,
          recitation: track
        });
      }
    };
    const handleLoaded = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      lastReportedAyah.current = undefined;
      handleTimeUpdate();
    };
    const handleSeeked = () => {
      lastReportedAyah.current = undefined;
      handleTimeUpdate();
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("seeked", handleSeeked);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("seeked", handleSeeked);
    };
  }, [onProgress, sortedTimings, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // update source when track changes
    if (audio.src !== track.url) {
      audio.src = track.url;
      // reset timing info
      setCurrentTime(0);
      setDuration(0);
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }

    // advance to next track when current ends
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrent((c: number) => (c + 1 < recitations.length ? c + 1 : 0));
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isPlaying, track?.url, recitations.length]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    lastReportedAyah.current = undefined;
  }, [current]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.round((currentTime / duration) * 100));
  }, [currentTime, duration]);

  if (!track) return null;

  const containerBase =
    variant === "floating"
      ? "rounded-3xl border border-primary-light/40 bg-primary-dark/85 p-4 text-xs shadow-[0_18px_45px_rgba(4,20,16,0.45)]"
      : "rounded-2xl border border-primary-light/15 bg-primary-dark/60 p-4 text-xs";
  const floatingLayout =
    "fixed bottom-6 left-1/2 z-40 w-[min(90%,420px)] -translate-x-1/2 sm:left-auto sm:right-8 sm:translate-x-0";
  const embeddedLayout = "w-full";
  const layoutClass = variant === "floating" ? floatingLayout : embeddedLayout;
  const containerClass = [containerBase, layoutClass, className].filter(Boolean).join(" ");

  return (
    <div className={containerClass}>
      <audio ref={audioRef} src={track.url} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-accent"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? "إيقاف التلاوة مؤقتًا" : "تشغيل التلاوة"}
        >
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
            type="button"
            className={`flex items-center gap-1 rounded-full border px-3 py-1 transition ${
              index === current ? "border-accent/60 bg-accent/20 text-accent" : "border-primary-light/20 bg-primary-dark/60"
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`اختيار تلاوة ${rec.reciter}`}
          >
            <Radio className="h-3 w-3" /> {rec.reciter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AudioBar;
