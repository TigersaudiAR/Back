import type { Surah } from "../types/quran";

interface Props {
  surah?: Surah;
  onToggleMode: () => void;
  onOpenSearch: () => void;
}

function TopBar({ surah, onToggleMode, onOpenSearch }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-6 bg-primary-dark/70 backdrop-blur z-30 text-sm">
      <div className="flex items-center gap-3">
        <span className="text-accent font-semibold">{surah?.name_ar ?? "اختر سورة"}</span>
        {surah?.revelation_place && (
          <span className="badge badge-outline badge-sm">
            {surah.revelation_place === "Mecca" ? "مكية" : "مدنية"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-xs" onClick={onToggleMode}>
          تبديل العرض
        </button>
        <button className="btn btn-xs btn-outline" onClick={onOpenSearch}>
          بحث
        </button>
      </div>
    </header>
  );
}

export default TopBar;
