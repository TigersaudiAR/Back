import { useMemo } from "react";
import type { FC } from "react";

interface PrayerTimesProps {
  times: Record<string, string>;
  note?: string;
}

const PrayerTimes: FC<PrayerTimesProps> = ({ times, note }) => {
  const entries = useMemo(() => Object.entries(times), [times]);

  const nextPrayer = useMemo(() => {
    const now = new Date();
    const upcoming = entries
      .map(([name, time]) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes ?? 0, 0, 0);
        return { name, time, date };
      })
      .find(({ date }) => date > now);
    if (upcoming) return upcoming;
    if (!entries.length) return null;
    const [fallbackName, fallbackTime] = entries[0];
    return { name: fallbackName, time: fallbackTime, date: new Date() };
  }, [entries]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(48,140,108,0.18),_transparent_75%)]" />
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-accent">مواقيت اليوم</h3>
        <div className="flex flex-col items-end gap-1 text-xs text-gray-300">
          {note && <span>{note}</span>}
          {nextPrayer && (
            <div className="flex items-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
              <span>الصلاة القادمة:</span>
              <strong className="text-sm">{nextPrayer.name}</strong>
              <span>{nextPrayer.time}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {entries.map(([name, time]) => {
          const isNext = nextPrayer?.name === name;
          return (
            <div
              key={name}
              className={`rounded-2xl border px-4 py-3 transition shadow-inner ${
                isNext
                  ? "border-accent/70 bg-accent/20 text-accent"
                  : "border-primary-light/20 bg-primary-dark/70"
              }`}
            >
              <p className="font-semibold">{name}</p>
              <p className="text-gray-100 text-sm">{time}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PrayerTimes;
