import type { Surah } from "../types/quran";

interface Props {
  surahList: Surah[];
  onSelect: (surahId: number) => void;
}

function SurahNavigator({ surahList, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {surahList.map((surah) => (
        <button
          key={surah.id}
          className="btn btn-ghost btn-sm border border-primary-light/40 rounded-2xl"
          onClick={() => onSelect(surah.id)}
        >
          {surah.name_ar}
        </button>
      ))}
    </div>
  );
}

export default SurahNavigator;
