import { useEffect, useState } from "react";
import { BookOpen, Clock, Award, Search, Filter, Trophy, Bell } from "lucide-react";
import type { Lesson, LessonCategory, UserProgress, LessonNotification } from "../../types/lessons";
import api from "../../lib/api";
import LessonCard from "../../components/lessons/LessonCard";
import LessonDetails from "../../components/lessons/LessonDetails";
import ProgressDashboard from "../../components/lessons/ProgressDashboard";
import NotificationPanel from "../../components/lessons/NotificationPanel";

function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<LessonCategory[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [notifications, setNotifications] = useState<LessonNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [view, setView] = useState<"lessons" | "progress">("lessons");

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedLevel, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedLevel !== "all") params.level = selectedLevel;
      if (searchQuery) params.search = searchQuery;

      const [lessonsRes, progressRes, notificationsRes] = await Promise.all([
        api.get("/lessons", { params }),
        api.get("/lessons/progress/me").catch(() => ({ data: { progress: null } })),
        api.get("/lessons/notifications/me").catch(() => ({ data: { notifications: [] } }))
      ]);

      setLessons(lessonsRes.data.lessons || []);
      setCategories(lessonsRes.data.categories || []);
      setUserProgress(progressRes.data.progress);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = async (lessonId: string) => {
    try {
      await api.post(`/lessons/${lessonId}/start`);
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
      }
    } catch (error) {
      console.error("Error starting lesson:", error);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      await api.post(`/lessons/${lessonId}/complete`, {
        timeSpent: 0
      });
      loadData();
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const handleSubmitQuiz = async (lessonId: string, answers: number[]) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/quiz`, { answers });
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await api.put(`/lessons/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-gray-900 p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-gradient-to-r from-accent/20 to-primary-light/20 border border-accent/30 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-accent" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">الدروس التعليمية</h1>
                <p className="text-gray-300 mt-2">تعلم العلوم الإسلامية بطريقة تفاعلية وممتعة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView(view === "lessons" ? "progress" : "lessons")}
                className={`btn btn-sm ${view === "progress" ? "btn-accent" : "btn-outline"}`}
              >
                {view === "lessons" ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    <span>تقدمي</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>الدروس</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-sm btn-outline relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkRead={markNotificationRead}
          />
        )}

        {view === "progress" ? (
          <ProgressDashboard
            progress={userProgress}
            lessons={lessons}
            categories={categories}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن الدروس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-12 bg-primary-dark/60 border-primary-light/40 text-white placeholder-gray-400"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Categories */}
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
                    className={`btn btn-sm ${
                      selectedCategory === cat.id ? "btn-accent" : "btn-outline"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="select select-bordered select-sm bg-primary-dark/60 border-primary-light/40 text-white"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>
            </div>

            {/* Lessons Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading loading-spinner loading-lg text-accent"></div>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد دروس متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => {
                  const isCompleted = userProgress?.completedLessons.includes(lesson.id);
                  const isInProgress = userProgress?.inProgressLessons.includes(lesson.id);
                  
                  return (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isCompleted={isCompleted}
                      isInProgress={isInProgress}
                      onStart={() => handleStartLesson(lesson.id)}
                      onView={() => setSelectedLesson(lesson)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Lesson Details Modal */}
        {selectedLesson && (
          <LessonDetails
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onComplete={() => handleCompleteLesson(selectedLesson.id)}
            onSubmitQuiz={(answers) => handleSubmitQuiz(selectedLesson.id, answers)}
          />
        )}
      </div>
    </div>
  );
}

export default LessonsPage;
