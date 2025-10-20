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
  const verseLineStyle = useMemo(() => ({
    fontSize: `${baseFontSize}px`,
    lineHeight: baseFontSize >= 36 ? 2 : 2.2,
    fontFamily: FONT_STACK
  }), [baseFontSize]);

  const bismillahStyle = useMemo(() => ({
    fontSize: `${Math.min(baseFontSize + 4, baseFontSize * 1.15)}px`,
    lineHeight: 2.4,
    fontFamily: FONT_STACK
  }), [baseFontSize]);

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

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-y-auto px-4 pb-24 pt-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-[36px] border border-emerald-900/15 bg-white/95 text-emerald-900 shadow-[0_24px_70px_rgba(15,64,50,0.12)]">
          <header className="border-b border-emerald-100 px-6 py-6 sm:px-10">
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

          <div className="px-6 py-10 sm:px-12">
            {shouldRenderBismillah && (
              <p className="mb-10 text-center text-emerald-900" style={bismillahStyle}>
                {BISMILLAH_TEXT}
              </p>
            )}
            <div className="flex flex-col gap-6 text-right">
              {ayat.map((ayah) => {
                const isActive = activeAyah === ayah.ayah_number;
                return (
                  <button
                    key={`${ayah.surah_id}-${ayah.ayah_number}`}
                    type="button"
                    data-ayah-id={ayah.ayah_number}
                    className={`group flex w-full justify-end rounded-[30px] border border-transparent bg-transparent px-4 py-4 text-right transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isActive ? "border-emerald-300 bg-emerald-50 shadow-inner" : "hover:border-emerald-200 hover:bg-emerald-50/60"
                    }`}
                    onClick={(event) => {
                      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                      onSelectAyah?.(ayah, rect ?? null);
                    }}
                  >
                    <span className="flex-1 text-center text-emerald-900" style={verseLineStyle}>
                      <span className="font-mushaf inline-block whitespace-normal">
                        {ayah.text_ar}
                        <span className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400 bg-white text-base font-semibold text-emerald-700">
                          {ayah.ayah_number}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="border-t border-emerald-100 px-6 py-5 sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" className="btn btn-sm" onClick={scrollToTop}>
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
