import type { Hadith } from "../types/hadith";

interface Props {
  hadith: Hadith;
}

function HadithCard({ hadith }: Props) {
  const topics = Array.isArray(hadith.topic)
    ? hadith.topic
    : hadith.topic
    ? [hadith.topic]
    : [];

  return (
    <article className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-5 shadow-lg space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <div className="space-y-1">
          {hadith.title && <h3 className="text-sm font-semibold text-accent">{hadith.title}</h3>}
          {hadith.narrator && <p className="text-[11px] text-gray-300">راوي الحديث: {hadith.narrator}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-outline">{hadith.source}</span>
          {hadith.number && <span className="badge badge-outline">رقم {hadith.number}</span>}
          {hadith.grade && <span className="badge badge-outline">{hadith.grade}</span>}
        </div>
      </header>
      <p className="text-sm leading-7 text-gray-100">{hadith.text_ar}</p>
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span key={topic} className="badge badge-accent badge-sm">
              {topic}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default HadithCard;
