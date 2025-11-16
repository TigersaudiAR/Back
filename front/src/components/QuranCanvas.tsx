import { useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { Ayah } from "../types/quran";

type Props = {
  surah?: Surah;
  ayat: Ayah[];
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah, rect: DOMRect | null) => void;
  onSwipe?: (direction: "next" | "prev") => void;
  fontSize?: number;
  surahName?: string;
  placeholder?: ReactNode;
};

export const BISMILLAH_TEXT = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

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

function QuranCanvas({ ayat, activeAyah, onSelectAyah, onSwipe, fontSize, surahName, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const meta = useMemo(() => {
    const first = ayat[0];
    return {
      page: first?.page,
      juz: first?.juz,
      hizb: first?.hizb
    };
  }, [ayat]);

  const textStyle = useMemo(() => {
    if (!fontSize) return undefined;
    const size = Math.max(18, Math.min(46, fontSize));
    const lineHeight = Math.round(size * 1.6);
    return { fontSize: `${size}px`, lineHeight: `${lineHeight}px` };
  }, [fontSize]);

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

const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>, ayah: Ayah) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    onSelectAyah?.(ayah, rect);
  }
};

  return (
    <div ref={containerRef} className="quran-view-scroll select-none">
      <main className="quran-view">
        <div className="quran-frame">
          {surahName && <h1 className="quran-surah-title">{surahName}</h1>}
          <div className="quran-text" style={textStyle}>
            {ayat.length > 0 ? (
              ayahGroups.map((group, lineIndex) => (
                <div key={lineIndex} className="quran-text-line">
                  {group.map((ayah) => {
                    const isActive = activeAyah === ayah.ayah_number;
                    return (
                      <span
                        key={`${ayah.surah_id}-${ayah.ayah_number}`}
                        className={`quran-ayah${isActive ? " is-active" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          const target = event.currentTarget;
                          const rect = target.getBoundingClientRect();
                          onSelectAyah?.(ayah, rect);
                        }}
                        onKeyDown={(event) => handleKeyDown(event, ayah)}
                      >
                        <span className="quran-ayah-text">{ayah.text_ar}</span>
                        <span className="quran-ayah-number">{ayah.ayah_number}</span>
                      </span>
                    );
                  })}
                </div>
}

export default QuranCanvas;
                {placeholder ?? "لا توجد آيات متاحة حالياً."}
              </div>
            )}
          </div>

          <footer className="border-t border-emerald-100 px-6 py-5 sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" className="btn btn-sm" onClick={handleScrollToTop}>
                بداية السورة
              </button>
              {onSwipe && (
                <>
                  <button type="button" className="btn btn-sm" onClick={() => onSwipe("prev")}>
                    السورة السابقة
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => onSwipe("next")}>
                    السورة التالية
                  </button>
                </>
              )}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default QuranCanvas;
