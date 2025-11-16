import { memo, useCallback, useMemo } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import clsx from "clsx";
import type { Ayah } from "../types/quran";
import { buildAyahAudioUrl } from "../utils/quran";
import { formatVerseNumber } from "../utils/arabicNumbers";

type AyahProps = {
  ayah: Ayah;
  variant?: "classic" | "interactive";
  active?: boolean;
  fontSize?: number;
  onSelect?: (ayah: Ayah, rect: DOMRect | null) => void;
  showAudioButton?: boolean;
  className?: string;
  reciterId?: string;
};

const Ayah = memo(function Ayah({
  ayah,
  variant = "classic",
  active = false,
  fontSize,
  onSelect,
  showAudioButton = true,
  className,
  reciterId
}: AyahProps) {
  const audioUrl = useMemo(
    () => buildAyahAudioUrl(ayah.surah_id, ayah.ayah_number, reciterId),
    [ayah.ayah_number, ayah.surah_id, reciterId]
  );

  const handlePlayAudio = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const player = new Audio(audioUrl);
      player.play().catch(() => undefined);
    },
    [audioUrl]
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (variant !== "interactive" || !onSelect) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      onSelect(ayah, rect ?? null);
    },
    [variant, onSelect, ayah]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (variant !== "interactive" || !onSelect) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        onSelect(ayah, rect ?? null);
      }
    },
    [variant, onSelect, ayah]
  );

  const textStyle = fontSize ? { fontSize: `${fontSize}px` } : undefined;

  if (variant === "interactive") {
    return (
      <div
        role="button"
        tabIndex={0}
        data-ayah-id={ayah.ayah_number}
        dir="rtl"
        lang="ar"
        className={clsx(
          "ayah-container ayah-container--interactive w-full gap-4 bg-transparent text-right",
          active && "ayah-container--active",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-pressed={active}
      >
        <div className="flex w-full items-start justify-between gap-4">
          <span className="ayah-number" aria-hidden="true">
            {formatVerseNumber(ayah.ayah_number)}
          </span>
          <span className="ayah-text quran-text flex-1" style={textStyle}>
            {ayah.text_ar}
          </span>
        </div>
        {showAudioButton && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePlayAudio}
              aria-label={`تشغيل التلاوة للآية ${ayah.ayah_number}`}
              className="rounded-full border border-emerald-300/60 bg-emerald-50/80 px-4 py-1 text-sm text-emerald-700 shadow-sm"
            >
              🔊
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={clsx("ayah-container", className)} dir="rtl" lang="ar">
      <span className="ayah-number" aria-hidden="true">
        {formatVerseNumber(ayah.ayah_number)}
      </span>
      <span className="ayah-text quran-text" style={textStyle}>
        {ayah.text_ar}
      </span>
      {showAudioButton && (
        <button
          type="button"
          onClick={handlePlayAudio}
          aria-label={`تشغيل التلاوة للآية ${ayah.ayah_number}`}
        >
          🔊
        </button>
      )}
    </div>
  );
});

export default Ayah;
