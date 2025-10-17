import { motion, AnimatePresence } from "framer-motion";
import type { Surah } from "../types/quran";

interface ToolbarProps {
  visible: boolean;
  surahList: Surah[];
  currentSurah?: Surah;
  onToggleMode: () => void;
  onSelectSurah: (surahId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFontChange: (delta: number) => void;
  onToggleAudio: () => void;
  onShowTafsir: () => void;
  onResetFont?: () => void;
}

function HiddenToolbar({
  visible,
  surahList,
  currentSurah,
  onToggleMode,
  onSelectSurah,
  onPrev,
  onNext,
  onFontChange,
  onToggleAudio,
  onShowTafsir,
  onResetFont
}: ToolbarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 18 }}
          className="fixed bottom-0 inset-x-0 z-40"
        >
          <div className="mx-auto max-w-5xl rounded-t-3xl bg-primary-dark/90 backdrop-blur border border-primary-light/40 shadow-2xl p-4 flex flex-wrap gap-3 items-center justify-center text-sm">
            <button className="btn btn-sm" onClick={onPrev}>
              السورة السابقة
            </button>
            <button className="btn btn-sm" onClick={onNext}>
              السورة التالية
            </button>
            <label className="form-control w-48">
              <div className="label">
                <span className="label-text text-xs">انتقال سريع</span>
              </div>
              <select
                className="select select-sm"
                value={currentSurah?.id || ""}
                onChange={(event) => onSelectSurah(Number(event.target.value))}
              >
                <option value="" disabled>
                  اختر سورة
                </option>
                {surahList.map((surah) => (
                  <option key={surah.id} value={surah.id}>
                    {surah.name_ar}
                  </option>
                ))}
              </select>
            </label>
            <div className="join">
              <button className="btn btn-sm join-item" onClick={() => onFontChange(-2)}>
                حجم -
              </button>
              <button className="btn btn-sm join-item" onClick={() => onFontChange(2)}>
                حجم +
              </button>
            </div>
            {onResetFont && (
              <button className="btn btn-sm" onClick={onResetFont}>
                إعادة الضبط
              </button>
            )}
            <button className="btn btn-sm" onClick={onToggleAudio}>
              تشغيل / إيقاف التلاوة
            </button>
            <button className="btn btn-sm btn-accent" onClick={onShowTafsir}>
              إظهار التفسير
            </button>
            <button className="btn btn-sm btn-outline" onClick={onToggleMode}>
              تبديل العرض
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HiddenToolbar;
