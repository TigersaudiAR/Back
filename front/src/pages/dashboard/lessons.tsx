import { useEffect, useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, TrendingUp } from "lucide-react";
import api from "../../lib/api";
import type { Lesson, LessonCategory } from "../../types/lessons";

function DashboardLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<LessonCategory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { status: "all" };
      if (selectedCategory !== "all") params.category = selectedCategory;

      const [lessonsRes, statsRes] = await Promise.all([
        api.get("/lessons", { params }),
        api.get("/lessons/admin/statistics").catch(() => ({ data: null }))
      ]);

      setLessons(lessonsRes.data.lessons || []);
      setCategories(lessonsRes.data.categories || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      loadData();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("حدث خطأ أثناء حذف الدرس");
    }
  };

  const handleStatusChange = async (lessonId: string, newStatus: string) => {
    try {
      await api.put(`/lessons/${lessonId}`, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating lesson status:", error);
      alert("حدث خطأ أثناء تحديث حالة الدرس");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة الدروس</h1>
            <p className="text-sm text-gray-400">إضافة وتعديل وحذف الدروس التعليمية</p>
          </div>
        </div>
        <button className="btn btn-accent btn-sm">
          <Plus className="h-4 w-4" />
          <span>إضافة درس جديد</span>
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">إجمالي الدروس</span>
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalLessons}</p>
          </div>

          <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">إجمالي المستخدمين</span>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>

          <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">إجمالي الإكمالات</span>
              <Eye className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCompletions}</p>
          </div>

          <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">معدل الإكمال</span>
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.averageCompletionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`btn btn-sm ${selectedCategory === "all" ? "btn-accent" : "btn-outline"}`}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-sm ${selectedCategory === cat.id ? "btn-accent" : "btn-outline"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lessons Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg text-accent"></div>
        </div>
      ) : (
        <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-primary-dark/80">
                <tr className="text-right">
                  <th className="text-gray-300">العنوان</th>
                  <th className="text-gray-300">التصنيف</th>
                  <th className="text-gray-300">المستوى</th>
                  <th className="text-gray-300">الحالة</th>
                  <th className="text-gray-300">النقاط</th>
                  <th className="text-gray-300">المشاهدات</th>
                  <th className="text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const category = categories.find((c) => c.id === lesson.category);
                  return (
                    <tr key={lesson.id} className="hover:bg-primary-dark/40">
                      <td className="text-white">{lesson.title}</td>
                      <td>
                        <span className="badge badge-outline">{category?.name || lesson.category}</span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            lesson.level === "beginner"
                              ? "badge-success"
                              : lesson.level === "intermediate"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {lesson.level === "beginner"
                            ? "مبتدئ"
                            : lesson.level === "intermediate"
                            ? "متوسط"
                            : "متقدم"}
                        </span>
                      </td>
                      <td>
                        <select
                          value={lesson.status}
                          onChange={(e) => handleStatusChange(lesson.id, e.target.value)}
                          className="select select-sm bg-primary-dark border-primary-light/40 text-white"
                        >
                          <option value="draft">مسودة</option>
                          <option value="published">منشور</option>
                          <option value="archived">مؤرشف</option>
                        </select>
                      </td>
                      <td className="text-accent">{lesson.points}</td>
                      <td className="text-gray-400">{lesson.viewCount || 0}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => window.open(`/lessons?id=${lesson.id}`, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="btn btn-xs btn-ghost text-warning">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost text-error"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Statistics */}
      {stats && stats.categoryStats && (
        <div className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-accent mb-4">إحصائيات التصنيفات</h3>
          <div className="space-y-3">
            {stats.categoryStats.map((catStat: any) => (
              <div key={catStat.category}>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>{catStat.category}</span>
                  <span>
                    {catStat.lessonsCount} دروس · {catStat.completions} إكمال
                  </span>
                </div>
                <div className="h-2 rounded-full bg-primary-light/15 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{
                      width: `${
                        catStat.lessonsCount > 0
                          ? (catStat.completions / (catStat.lessonsCount * (stats.totalUsers || 1))) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLessons;
