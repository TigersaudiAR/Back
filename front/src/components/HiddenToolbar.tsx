import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, BookMarked, ChevronDown, ChevronUp, RefreshCcw, Search } from "lucide-react";
import AudioBar, { type AudioProgressPayload } from "./AudioBar";
import type { Recitation, Surah } from "../types/quran";

interface ToolbarProps {
  open: boolean;
  surahList: Surah[];
  currentSurah?: Surah;
  recitations: Recitation[];
  onToggle: () => void;
  onToggleMode: () => void;
  onSelectSurah: (surahId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFontChange: (delta: number) => void;
  onShowTafsir: () => void;
  onResetFont?: () => void;
  onAudioProgress?: (payload: AudioProgressPayload) => void;
  shouldFocusSearch?: boolean;
  onSearchFocusHandled?: () => void;
}

function HiddenToolbar({
  open,
  surahList,
  currentSurah,
  recitations,
  onToggle,
  onToggleMode,
  onSelectSurah,
  onPrev,
  onNext,
  onFontChange,
  onShowTafsir,
  onResetFont,
  onAudioProgress,
  shouldFocusSearch,
  onSearchFocusHandled
}: ToolbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      return;
    }
    if (shouldFocusSearch) {
      const timeout = setTimeout(() => {
        searchRef.current?.focus();
        onSearchFocusHandled?.();
      }, 120);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open, shouldFocusSearch, onSearchFocusHandled]);

  const filteredSurahs = useMemo(() => {
    if (!searchTerm.trim()) return surahList;
    const term = searchTerm.trim();
    return surahList.filter((surah) => {
      const arabicMatch = surah.name_ar.includes(term);
      const englishMatch = surah.name_en?.toLowerCase().includes(term.toLowerCase());
      const transliterationMatch = surah.slug?.toLowerCase().includes(term.toLowerCase());
      return arabicMatch || englishMatch || transliterationMatch;
    });
  }, [searchTerm, surahList]);

  return (
    <>
      <motion.button
        type="button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/90 text-primary-dark shadow-[0_16px_35px_rgba(8,40,28,0.55)] sm:right-8"
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label={open ? "إخفاء شريط الأدوات" : "إظهار شريط الأدوات"}
      >
        {open ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40"
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: 360 }}
              transition={{ type: "spring", damping: 20, stiffness: 180 }}
            >
              <div className="mx-auto w-full max-w-3xl rounded-t-[30px] border border-primary-light/30 bg-primary-dark/95 px-5 pb-6 pt-4 text-sm shadow-[0_-22px_55px_rgba(6,26,22,0.65)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
                      <BookMarked className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-accent">{currentSurah?.name_ar ?? "اختر سورة"}</p>
                      {currentSurah && (
                        <p className="text-[11px] text-gray-300">
                          {currentSurah.revelation_place === "Mecca" ? "سورة مكية" : "سورة مدنية"} • عدد الآيات: {currentSurah.ayah_count}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-xs" onClick={onToggleMode}>
                    تبديل العرض
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-4">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-accent" />
                      <input
                        ref={searchRef}
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="ابحث عن سورة بالاسم أو الرقم"
                        aria-label="بحث عن سورة بالاسم أو الرقم"
                        className="input input-sm flex-1 bg-primary-dark/60 text-right"
                      />
                    </div>
                    <div className="mt-3 max-h-40 overflow-y-auto pr-1 text-right">
                      {filteredSurahs.map((surah) => (
                        <button
                          key={surah.id}
                          type="button"
                          onClick={() => onSelectSurah(surah.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition ${
                            currentSurah?.id === surah.id
                              ? "bg-accent/20 text-accent"
                              : "hover:bg-primary-light/10"
                          }`}
                        >
                          <span>{surah.name_ar}</span>
                          <span className="text-[11px] text-gray-300">{surah.id}</span>
                        </button>
                      ))}
                      {!filteredSurahs.length && (
                        <p className="py-6 text-center text-xs text-gray-400">لم يتم العثور على نتائج</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-gray-300">الانتقال بين السور</p>
                      <div className="flex gap-2">
                        <button className="btn btn-sm flex-1" onClick={onPrev}>
                          السورة السابقة
                        </button>
                        <button className="btn btn-sm flex-1" onClick={onNext}>
                          السورة التالية
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-gray-300">حجم الخط</p>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-sm flex-1" onClick={() => onFontChange(-2)}>
                          <ArrowDownToLine className="h-4 w-4" /> تصغير
                        </button>
                        <button className="btn btn-sm flex-1" onClick={() => onFontChange(2)}>
                          <ArrowUpRight className="h-4 w-4" /> تكبير
                        </button>
                      </div>
                      {onResetFont && (
                        <button className="btn btn-xs btn-ghost self-start gap-1" onClick={onResetFont}>
                          <RefreshCcw className="h-3 w-3" /> إعادة الضبط
                        </button>
                      )}
                    </div>
                  </div>

                  {recitations.length > 0 && (
                    <div className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-4">
                      <p className="mb-3 text-xs text-gray-300">التلاوات المتاحة</p>
                      <AudioBar
                        recitations={recitations}
                        onProgress={onAudioProgress}
                        variant="embedded"
                        className="border-none bg-transparent p-0 shadow-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary-light/20 bg-primary-dark/60 px-4 py-3">
                    <p className="text-xs text-gray-300">خيارات إضافية</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-sm" onClick={onShowTafsir}>
                        إظهار التفسير
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={onToggleMode}>
                        وضع العرض الكلاسيكي
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default HiddenToolbar;
