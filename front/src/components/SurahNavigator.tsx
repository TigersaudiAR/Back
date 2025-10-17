import type { Surah } from "../types/quran";

interface Props {
  surahList: Surah[];
  onSelect: (surahId: number) => void;
}

function SurahNavigator({ surahList, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 overflow-y-auto pr-1">
      {surahList.map((surah) => (
        <button
          key={surah.id}
          className="rounded-2xl border border-primary-light/30 bg-primary-dark/70 px-3 py-2 text-xs font-medium text-gray-100 transition hover:border-accent/60 hover:bg-accent/10 hover:text-accent"
          onClick={() => onSelect(surah.id)}
        >
          <span className="block text-[11px] text-gray-400">{surah.id}</span>
          {surah.name_ar}
        </button>
      ))}
    </div>
  );
}

export default SurahNavigator;
