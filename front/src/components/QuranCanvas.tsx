import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Ayah, Surah } from "../types/quran";
import "../styles/quran.css";

type Props = {
  surah?: Surah;
  ayat: Ayah[];
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah, rect: DOMRect | null) => void;
  onSwipe?: (direction: "next" | "prev") => void;
  fontSize?: number;
};

const BISMILLAH_TEXT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
const FONT_STACK = '"UthmanicHafs", "Scheherazade New", "Amiri", "Lateef", serif';

function QuranCanvas({ surah, ayat, activeAyah, onSelectAyah, onSwipe, fontSize }: Props) {
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

  const shouldRenderBismillah = useMemo(() => {
    if (!surah || surah.id === 9) return false;
    if (!surah.bismillah_pre || ayat.length === 0) return false;
    const firstAyah = ayat[0];
    const firstAyahText = firstAyah?.text_ar?.replace(/\s+/g, "");
    const normalizedBismillah = BISMILLAH_TEXT.replace(/\s+/g, "");
    return firstAyahText !== normalizedBismillah;
  }, [surah, ayat]);

  const baseFontSize = fontSize ?? 32;
  const verseLineStyle = useMemo(
    () => ({
      fontSize: `${baseFontSize}px`,
      lineHeight: baseFontSize >= 36 ? 2 : 2.2,
      fontFamily: FONT_STACK,
      whiteSpace: "pre-wrap" as const,
      textAlign: "justify" as const,
      wordSpacing: baseFontSize >= 36 ? "0.45rem" : "0.35rem",
      direction: "rtl" as const
    }),
    [baseFontSize]
  );

  const bismillahStyle = useMemo(() => ({
    fontSize: `${Math.min(baseFontSize + 4, baseFontSize * 1.15)}px`,
    lineHeight: 2.4,
    fontFamily: FONT_STACK
  }), [baseFontSize]);

  const handleScrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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
    <div ref={containerRef} className="relative h-full w-full overflow-y-auto px-4 pb-24 pt-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div
          className="relative overflow-hidden rounded-[36px] border border-emerald-900/15 bg-white/95 text-emerald-900 shadow-[0_24px_70px_rgba(15,64,50,0.12)]"
          lang="ar"
          role="document"
        >
          <header className="quran-manuscript__body border-b border-emerald-100 pb-6 pt-6 sm:px-10 sm:pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-emerald-700/80">
                <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                  {meta.juz && <span>جزء {meta.juz}</span>}
                  {meta.hizb && <span>حزب {meta.hizb}</span>}
                  {meta.page && <span>صفحة {meta.page}</span>}
                </div>
                {surah?.revelation_place && (
                  <p className="mt-1 text-xs text-emerald-700/60">
                    {surah.revelation_place === "Mecca" ? "سورة مكية" : "سورة مدنية"} • عدد الآيات: {surah.ayah_count}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-900">{surah?.name_ar ?? ""}</p>
                {surah?.id && (
                  <p className="text-xs text-emerald-700/70">رقم السورة: {surah.id}</p>
                )}
              </div>
            </div>
          </header>

          <div className="quran-manuscript quran-manuscript__body">
            {shouldRenderBismillah && (
              <p className="quran-bismillah" style={bismillahStyle}>
                {BISMILLAH_TEXT}
              </p>
            )}
            <div>
              {ayat.map((ayah) => {
                const isActive = activeAyah === ayah.ayah_number;
                const ayahId = `ayah-${ayah.surah_id}-${ayah.ayah_number}`;
                const srId = `${ayahId}-sr`;
                return (
                  <div key={`${ayah.surah_id}-${ayah.ayah_number}`} className="quran-ayah" data-ayah-id={ayah.ayah_number}>
                    <button
                      type="button"
                      aria-labelledby={`${ayahId}-text ${srId}`}
                      className={`quran-ayah__button ${isActive ? "is-active" : ""}`}
                      onClick={(event) => {
                        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                        onSelectAyah?.(ayah, rect ?? null);
                      }}
                    >
                      <span
                        id={`${ayahId}-text`}
                        className="quran-ayah__text font-mushaf text-emerald-900"
                        style={verseLineStyle}
                      >
                        {ayah.text_ar}
                      </span>
                      <span className="quran-ayah__number" aria-hidden="true">
                        ﴿{ayah.ayah_number}﴾
                      </span>
                      <span id={srId} className="sr-only">
                        تحديد الآية رقم {ayah.ayah_number}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
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
      </div>
    </div>
  );
}

export default QuranCanvas;
