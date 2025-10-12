import type { Hadith } from "../types/hadith";

interface Props {
  hadith: Hadith;
}

function HadithCard({ hadith }: Props) {
  return (
    <article className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-5 shadow-lg space-y-3">
      <header className="flex items-center justify-between text-xs text-gray-400">
        <span className="badge badge-outline">{hadith.source}</span>
        {hadith.number && <span>رقم {hadith.number}</span>}
      </header>
      <p className="text-sm leading-7 text-gray-100">{hadith.text_ar}</p>
      {hadith.topic && <span className="badge badge-accent badge-sm">{hadith.topic}</span>}
    </article>
  );
}

export default HadithCard;
