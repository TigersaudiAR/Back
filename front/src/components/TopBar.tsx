import { BookMarked, Search } from "lucide-react";
import type { Surah } from "../types/quran";

interface Props {
  surah?: Surah;
  onToggleMode: () => void;
  onOpenSearch: () => void;
  onGoHome: () => void;
  role: string;
  currentPage?: number;
  juzNumber?: number;
  hizbNumber?: number;
}

function TopBar({ surah, onToggleMode, onOpenSearch, onGoHome, role, currentPage, juzNumber, hizbNumber }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-primary-dark/95 px-4 text-sm supports-[backdrop-filter]:backdrop-blur-md shadow-lg border-b border-primary-light/20 sm:px-6">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <BookMarked className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-accent">{surah?.name_ar ?? "اختر سورة"}</p>
            <div className="flex gap-3 text-[11px] text-gray-300">
              {surah?.revelation_place && (
                <span>
                  {surah.revelation_place === "Mecca" ? "مكية" : "مدنية"} • {surah.ayah_count} آية
                </span>
              )}
              {juzNumber && (
                <span className="text-accent/80">
                  الجزء {juzNumber}
                </span>
              )}
              {hizbNumber && (
                <span className="text-accent/80">
                  الحزب {hizbNumber}
                </span>
              )}
              {currentPage && (
                <span className="text-accent/80">
                  صفحة {currentPage}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <button className="btn btn-xs whitespace-nowrap" onClick={onToggleMode} aria-label="تبديل وضع العرض">
            تبديل العرض
          </button>
          <button className="btn btn-xs btn-outline gap-1 whitespace-nowrap" onClick={onOpenSearch} aria-label="فتح البحث">
            <Search className="h-3 w-3" /> بحث
          </button>
          <button className="btn btn-xs btn-outline btn-accent whitespace-nowrap" onClick={onGoHome} aria-label="العودة للصفحة الرئيسية">
            الرئيسية ({role})
          </button>
          <span className="order-4 w-full text-center text-[11px] text-gray-300 sm:order-none sm:w-auto sm:text-right">
            اضغط T للأدوات • الأسهم للتنقل
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
