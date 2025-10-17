import { BookMarked, Search } from "lucide-react";
import type { Surah } from "../types/quran";

interface Props {
  surah?: Surah;
  onToggleMode: () => void;
  onOpenSearch: () => void;
}

function TopBar({ surah, onToggleMode, onOpenSearch }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 h-16 flex items-center justify-between px-6 bg-primary-dark/70 supports-[backdrop-filter]:backdrop-blur z-30 text-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <BookMarked className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-accent">{surah?.name_ar ?? "اختر سورة"}</p>
          {surah?.revelation_place && (
            <p className="text-[11px] text-gray-300">
              {surah.revelation_place === "Mecca" ? "سورة مكية" : "سورة مدنية"} • عدد الآيات: {surah.ayah_count}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-xs" onClick={onToggleMode}>
          تبديل العرض
        </button>
        <button className="btn btn-xs btn-outline gap-1" onClick={onOpenSearch}>
          <Search className="h-3 w-3" /> بحث
        </button>
      </div>
    </header>
  );
}

export default TopBar;
