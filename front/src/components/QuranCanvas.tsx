import { useEffect, useMemo, useRef } from "react";
import type { Ayah } from "../types/quran";

type Props = {
  ayat: Ayah[];
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah) => void;
  onSwipe?: (direction: "next" | "prev") => void;
  fontSize?: number;
};

const chunkAyat = (items: Ayah[], size: number) => {
  const result: Ayah[][] = [];
  let buffer: Ayah[] = [];
  items.forEach((item) => {
    buffer.push(item);
    if (buffer.length === size) {
      result.push(buffer);
      buffer = [];
    }
  });
  if (buffer.length) {
    result.push(buffer);
  }
  return result;
};

function QuranCanvas({ ayat, activeAyah, onSelectAyah, onSwipe, fontSize }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const ayahGroups = useMemo(() => {
    if (ayat.length <= 9) return chunkAyat(ayat, 3);
    if (ayat.length <= 18) return chunkAyat(ayat, 4);
    return chunkAyat(ayat, 5);
  }, [ayat]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !onSwipe) return;

    const handlePointerDown = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointer.current) return;
      const diffX = event.clientX - pointer.current.x;
      if (Math.abs(diffX) > 80) {
        onSwipe(diffX < 0 ? "next" : "prev");
      }
      pointer.current = null;
    };

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
      className="relative h-full w-full select-none overflow-x-hidden overflow-y-auto"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.04]" />
      <div className="relative flex h-full w-full items-center justify-center px-3 pb-32 pt-20 sm:px-6">
        <div className="relative w-full max-w-[900px]">
          <div className="relative mx-auto min-h-[520px] rounded-[42px] border border-primary-light/30 bg-primary-dark/60 p-6 shadow-[0_20px_60px_rgba(6,30,24,0.45)]">
            <div className="pointer-events-none absolute inset-4 rounded-[34px] border border-primary-light/20" />
            <div
              className="relative mx-auto flex min-h-[480px] flex-col justify-center gap-6 rounded-[28px] bg-black/20 px-6 py-10 text-[clamp(18px,2.4vw,34px)] leading-[2.4] text-emerald-100 sm:px-12"
              style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
            >
              {ayahGroups.map((group, lineIndex) => (
                <p
                  key={lineIndex}
                  className="flex flex-nowrap items-center justify-evenly gap-4 whitespace-nowrap"
                >
                  {group.map((ayah) => (
                    <span
                      key={`${ayah.surah_id}-${ayah.ayah_number}`}
                      className={`inline-flex items-center gap-2 rounded-3xl px-4 py-1.5 transition ${
                        activeAyah === ayah.ayah_number
                          ? "bg-accent/30 text-accent"
                          : "hover:bg-primary-light/20"
                      }`}
                      onClick={() => onSelectAyah?.(ayah)}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/30 text-[12px] text-accent">
                        {ayah.ayah_number}
                      </span>
                      <span style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{ayah.text_ar}</span>
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuranCanvas;
