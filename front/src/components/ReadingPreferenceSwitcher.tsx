import clsx from "clsx";
import { BookOpenText, ScrollText } from "lucide-react";

type ViewMode = "reading" | "translation";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  translationSource?: string;
  translationLoading?: boolean;
}

function ReadingPreferenceSwitcher({ mode, onChange, translationSource, translationLoading }: Props) {
  const activeIndex = mode === "translation" ? 0 : 1;

  return (
    <div className="relative z-20 mx-auto mt-24 w-full max-w-xl px-6">
      <div className="relative flex h-14 items-center rounded-full border border-primary-light/40 bg-primary-dark/70 p-1 text-sm shadow-[0_14px_40px_rgba(6,30,24,0.35)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 w-1/2 rounded-full bg-accent/20 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        <button
          type="button"
          className={clsx(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 font-semibold transition",
            mode === "translation" ? "text-accent" : "text-gray-300 hover:text-gray-100"
          )}
          onClick={() => onChange("translation")}
          aria-pressed={mode === "translation"}
        >
          <BookOpenText className="h-5 w-5" />
          <span>الترجمة</span>
          {translationLoading && mode === "translation" && (
            <span className="text-[10px] text-accent/70">جاري التحميل...</span>
          )}
        </button>
        <button
          type="button"
          className={clsx(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 font-semibold transition",
            mode === "reading" ? "text-accent" : "text-gray-300 hover:text-gray-100"
          )}
          onClick={() => onChange("reading")}
          aria-pressed={mode === "reading"}
        >
          <ScrollText className="h-5 w-5" />
          <span>القراءة</span>
        </button>
      </div>
      {mode === "translation" && (
        <div className="mt-2 text-center text-[11px] text-gray-300">
          {translationLoading && !translationSource ? (
            <span>جاري تحميل الترجمة المختارة...</span>
          ) : translationSource ? (
            <span>
              الترجمة المعروضة: <span className="text-emerald-200">{translationSource}</span>
            </span>
          ) : (
            <span>يمكنك عرض الترجمة العربية واللغات الأخرى من خلال هذا الوضع.</span>
          )}
        </div>
      )}
    </div>
  );
}

export default ReadingPreferenceSwitcher;
