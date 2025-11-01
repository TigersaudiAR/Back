import { BookMarked, Search } from "lucide-react";
import type { Surah } from "../types/quran";

interface Props {
  surah?: Surah;
  onToggleMode: () => void;
  onOpenSearch: () => void;
  onGoHome: () => void;
  role: string;
}

function TopBar({ surah, onToggleMode, onOpenSearch, onGoHome, role }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-primary-dark/70 px-4 text-sm supports-[backdrop-filter]:backdrop-blur sm:px-6">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <BookMarked className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-accent">{surah?.name_ar ?? "اختر سورة"}</p>
            {surah?.revelation_place && (
              <p className="text-[11px] text-gray-300">
                {surah.revelation_place === "Mecca" ? "سورة مكية" : "سورة مدنية"} • عدد الآيات: {surah.ayah_count}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <button className="btn btn-xs whitespace-nowrap" onClick={onToggleMode}>
            تبديل العرض
          </button>
          <button className="btn btn-xs btn-outline gap-1 whitespace-nowrap" onClick={onOpenSearch}>
            <Search className="h-3 w-3" /> بحث
          </button>
          <button className="btn btn-xs btn-outline btn-accent whitespace-nowrap" onClick={onGoHome}>
            رجوع للرئيسية ({role})
          </button>
          <span className="order-4 w-full text-center text-[11px] text-gray-300 sm:order-none sm:w-auto sm:text-right">
            اضغط على حرف T لإظهار الأدوات أو الأسهم للتنقل بين السور
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
