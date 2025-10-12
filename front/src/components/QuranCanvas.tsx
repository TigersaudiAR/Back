import { useEffect, useMemo, useRef } from "react";
import type { Ayah } from "../types/quran";

type Props = {
  ayat: Ayah[];
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah) => void;
  onSwipe?: (direction: "next" | "prev") => void;
};

function QuranCanvas({ ayat, activeAyah, onSelectAyah, onSwipe }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const ayahGroups = useMemo(() => {
    const lines: Ayah[][] = [];
    let current: Ayah[] = [];
    ayat.forEach((ayah, index) => {
      current.push(ayah);
      if (current.length === 3 || index === ayat.length - 1) {
        lines.push(current);
        current = [];
      }
    });
    return lines;
  }, [ayat]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !onSwipe) return;

    function handlePointerDown(event: PointerEvent) {
      pointer.current = { x: event.clientX, y: event.clientY };
    }

    function handlePointerUp(event: PointerEvent) {
      if (!pointer.current) return;
      const diffX = event.clientX - pointer.current.x;
      if (Math.abs(diffX) > 80) {
        onSwipe(diffX < 0 ? "next" : "prev");
      }
      pointer.current = null;
    }

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointerup", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onSwipe]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto p-10 font-serif text-2xl leading-relaxed select-none"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {ayahGroups.map((group, lineIndex) => (
          <p key={lineIndex} className="flex flex-wrap gap-x-3 gap-y-4 justify-center">
            {group.map((ayah) => (
              <span
                key={`${ayah.surah_id}-${ayah.ayah_number}`}
                className={`transition-all cursor-pointer rounded-2xl px-3 py-1 ${
                  activeAyah === ayah.ayah_number
                    ? "bg-accent/30 text-accent"
                    : "hover:bg-primary-light/30"
                }`}
                onClick={() => onSelectAyah?.(ayah)}
              >
                <span className="text-sm align-text-top text-accent/80">
                  {ayah.ayah_number}
                </span>
                <span className="mx-2">{ayah.text_ar}</span>
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

export default QuranCanvas;
