import { useEffect, useMemo, useRef } from "react";
import type { Ayah, Surah } from "../types/quran";

type Props = {
  surah?: Surah;
  ayat: Ayah[];
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah, rect: DOMRect | null) => void;
  onSwipe?: (direction: "next" | "prev") => void;
  fontSize?: number;
};

const BISMILLAH_TEXT = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

function QuranCanvas({ surah, ayat, activeAyah, onSelectAyah, onSwipe, fontSize }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const shouldRenderBismillah = useMemo(() => {
    if (!surah || surah.id === 9) return false;
    if (!surah.bismillah_pre || ayat.length === 0) return false;
    const firstAyah = ayat[0];
    const firstAyahText = firstAyah?.text_ar?.replace(/\s+/g, "");
    const normalizedBismillah = BISMILLAH_TEXT.replace(/\s+/g, "");
    return firstAyahText !== normalizedBismillah;
  }, [surah, ayat]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !onSwipe) return;

    const handlePointerDown = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointer.current) return;
      const diffX = event.clientX - pointer.current.x;
      const diffY = event.clientY - pointer.current.y;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
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
    <div ref={containerRef} className="relative h-full w-full select-none overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.05]" />
      <div className="relative flex h-full w-full flex-col items-center overflow-y-auto px-3 pb-36 pt-8 sm:px-6">
        <div className="relative w-full max-w-4xl">
          <div className="relative mx-auto rounded-[40px] border border-primary-light/20 bg-primary-dark/70 p-4 shadow-[0_24px_60px_rgba(6,26,22,0.55)] sm:p-8">
            <div className="pointer-events-none absolute inset-4 rounded-[30px] border border-primary-light/15" />
            <div
              className="relative rounded-[26px] bg-black/25 px-4 py-10 text-[clamp(20px,5vw,34px)] leading-[2.7] text-emerald-50 sm:px-10"
              style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
            >
              {shouldRenderBismillah && (
                <p className="mb-6 text-center text-[clamp(22px,6vw,36px)] font-semibold text-amber-200">
                  {BISMILLAH_TEXT}
                </p>
              )}
              <div className="flex flex-col gap-6 text-right">
                {ayat.map((ayah) => (
                  <button
                    key={`${ayah.surah_id}-${ayah.ayah_number}`}
                    type="button"
                    data-ayah-id={ayah.ayah_number}
                    className={`w-full rounded-3xl px-4 py-3 transition duration-150 focus:outline-none focus:ring-2 focus:ring-accent/60 ${
                      activeAyah === ayah.ayah_number ? "bg-accent/15 text-accent" : "hover:bg-primary-light/10"
                    }`}
                    onClick={(event) => {
                      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectAyah?.(ayah, rect ?? null);
                    }}
                  >
                    <span style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>
                      {ayah.text_ar}
                      <span className="mx-2 text-[0.6em] text-amber-300">﴿{ayah.ayah_number}﴾</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuranCanvas;
