import type { FC } from "react";

interface PrayerTimesProps {
  times: Record<string, string>;
}

const PrayerTimes: FC<PrayerTimesProps> = ({ times }) => {
  return (
    <section className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6">
      <h3 className="text-lg font-bold text-accent mb-4">مواقيت اليوم</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {Object.entries(times).map(([name, time]) => (
          <div key={name} className="bg-primary-dark/80 border border-primary-light/20 rounded-2xl px-3 py-2">
            <p className="font-semibold">{name}</p>
            <p className="text-gray-200">{time}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PrayerTimes;
