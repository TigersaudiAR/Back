import Leaderboard from "../../components/Leaderboard";
import type { Halaqah, LeaderboardEntry } from "../../types/halaqat";

const halaqat: Halaqah[] = [
  {
    id: "h1",
    title: "حلقة النور للناشئة",
    level: "kids",
    teacher: "الشيخ عبد الرحمن",
    schedule: "الأحد والثلاثاء 5 مساءً",
    members: 18,
    seats: 25,
    language: "العربية"
  },
  {
    id: "h2",
    title: "حلقة التجويد المتقدم",
    level: "advanced",
    teacher: "الشيخ عبد العزيز",
    schedule: "الاثنين والخميس 7 مساءً",
    members: 12,
    seats: 15,
    language: "العربية"
  }
];

const leaderboardEntries: LeaderboardEntry[] = Array.from({ length: 40 }).map((_, index) => ({
  user_id: `user-${index + 1}`,
  display_name: `متسابق ${index + 1}`,
  points: 1000 - index * 12,
  rank: index + 1
}));

function HalaqatPage() {
  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg space-y-3">
        <h2 className="text-2xl font-bold text-accent">حلقات التحفيظ</h2>
        <p className="text-sm text-gray-300">
          انضم إلى الحلقات المناسبة لمستواك ولغتك، وتابع ترتيبك في لوحة الصدارة المحدثة.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        {halaqat.map((halaqah) => (
          <article key={halaqah.id} className="bg-primary-dark/50 border border-primary-light/30 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-accent">{halaqah.title}</h3>
              <span className="badge badge-outline">{halaqah.level}</span>
            </div>
            <p className="text-sm text-gray-200">{halaqah.schedule}</p>
            <p className="text-xs text-gray-400">المدرس: {halaqah.teacher}</p>
            <p className="text-xs text-gray-400">اللغة: {halaqah.language}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="badge badge-accent">{halaqah.members}/{halaqah.seats} مقعد</span>
              <button className="btn btn-sm btn-outline">انضمام</button>
            </div>
          </article>
        ))}
      </div>
      <Leaderboard entries={leaderboardEntries} />
    </div>
  );
}

export default HalaqatPage;
