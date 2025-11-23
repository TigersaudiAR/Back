import { Award, BookOpen, Trophy, TrendingUp, Clock } from "lucide-react";
import type { UserProgress, Lesson, LessonCategory } from "../../types/lessons";

interface ProgressDashboardProps {
  progress: UserProgress | null;
  lessons: Lesson[];
  categories: LessonCategory[];
}

function ProgressDashboard({ progress, lessons, categories }: ProgressDashboardProps) {
  if (!progress) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">لم تبدأ أي دروس بعد</p>
      </div>
    );
  }

  const completionRate = progress.stats
    ? (progress.stats.completedCount / progress.stats.totalLessons) * 100
    : 0;

  const completedByCategory = categories.map((cat) => {
    const categoryLessons = lessons.filter((l) => l.category === cat.id);
    const completed = categoryLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
    return {
      category: cat.name,
      total: categoryLessons.length,
      completed,
      percentage: categoryLessons.length > 0 ? (completed / categoryLessons.length) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span className="text-3xl font-bold text-blue-400">{progress.stats?.completedCount || 0}</span>
          </div>
          <p className="text-sm text-gray-300">دروس مكتملة</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-8 w-8 text-green-400" />
            <span className="text-3xl font-bold text-green-400">{progress.totalPoints}</span>
          </div>
          <p className="text-sm text-gray-300">مجموع النقاط</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-purple-400" />
            <span className="text-3xl font-bold text-purple-400">{progress.certificates.length}</span>
          </div>
          <p className="text-sm text-gray-300">الشهادات</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-400">
              {progress.stats?.averageScore.toFixed(0) || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-300">معدل النجاح</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-accent mb-4">نسبة الإنجاز الشاملة</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>{progress.stats?.completedCount || 0} من {progress.stats?.totalLessons || 0} دروس</span>
            <span className="font-bold text-accent">{completionRate.toFixed(1)}%</span>
          </div>
          <div className="h-4 rounded-full bg-primary-light/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-accent via-primary to-primary-light transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress by Category */}
      <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-accent mb-4">التقدم حسب التصنيف</h3>
        <div className="space-y-4">
          {completedByCategory.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>{cat.category}</span>
                <span>
                  {cat.completed}/{cat.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-primary-light/15 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {progress.inProgressLessons.length > 0 && (
        <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-accent mb-4">الدروس قيد التقدم</h3>
          <div className="space-y-3">
            {progress.inProgressLessons.slice(0, 5).map((lessonId) => {
              const lesson = lessons.find((l) => l.id === lessonId);
              if (!lesson) return null;
              return (
                <div
                  key={lessonId}
                  className="flex items-center justify-between p-3 bg-primary-dark/40 rounded-lg border border-primary-light/20"
                >
                  <div>
                    <p className="text-white font-semibold">{lesson.title}</p>
                    <p className="text-xs text-gray-400">{lesson.duration} دقيقة</p>
                  </div>
                  <Clock className="h-5 w-5 text-accent" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
