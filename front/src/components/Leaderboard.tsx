import type { LeaderboardEntry } from "../types/halaqat";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

function Leaderboard({ entries }: LeaderboardProps) {
  const top10 = entries.slice(0, 10);

  return (
    <section className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-accent">أفضل المتصدرين</h3>
        <span className="badge badge-accent">أكثر من {entries.length} مشارك</span>
      </div>
      <div className="grid gap-3">
        {top10.map((entry) => (
          <div
            key={entry.user_id}
            className="flex items-center justify-between bg-primary-dark/80 border border-primary-light/30 rounded-2xl px-4 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl text-accent font-bold">{entry.rank}</span>
              <div>
                <p className="font-semibold">{entry.display_name}</p>
                <p className="text-xs text-gray-300">{entry.points} نقطة</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge badge-outline">سلسلة حفظ متواصلة</span>
              <span className="badge">{entry.points / 10} ختمات مصغرة</span>
            </div>
          </div>
        ))}
      </div>
      {entries.length > 10 && (
        <details className="bg-primary-dark/50 border border-primary-light/30 rounded-2xl p-4">
          <summary className="cursor-pointer text-sm text-accent">
            عرض أفضل 100
          </summary>
          <ul className="mt-3 space-y-2 text-xs text-gray-200 max-h-72 overflow-y-auto">
            {entries.slice(10, 100).map((entry) => (
              <li key={entry.user_id} className="flex justify-between">
                <span>
                  #{entry.rank} - {entry.display_name}
                </span>
                <span>{entry.points} نقطة</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export default Leaderboard;
