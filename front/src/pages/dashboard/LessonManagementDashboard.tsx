import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  BookOpen,
  TrendingUp,
  Users,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { lessonsService, Lesson } from '../../services/lessonsService';
import { useAuthStore } from '../../store/auth';

export default function LessonManagementDashboard() {
  const { role } = useAuthStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadLessons();
    if (role === 'admin' || role === 'teacher') {
      loadStats();
    }
  }, [filterCategory, filterLevel, searchTerm]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {
        isPublished: 'all'
      };
      
      if (filterCategory !== 'all') params.category = filterCategory;
      if (filterLevel !== 'all') params.level = filterLevel;
      if (searchTerm) params.search = searchTerm;

      const response = await lessonsService.getLessons(params);
      setLessons(response.lessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await lessonsService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    
    try {
      await lessonsService.deleteLesson(id);
      loadLessons();
      loadStats();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('حدث خطأ أثناء حذف الدرس');
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      await lessonsService.updateLesson(lesson.id, {
        isPublished: !lesson.isPublished
      });
      loadLessons();
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('حدث خطأ أثناء تحديث الدرس');
    }
  };

  const categories = [
    { value: 'all', label: 'جميع التصنيفات' },
    { value: 'aqidah', label: 'العقيدة' },
    { value: 'fiqh', label: 'الفقه' },
    { value: 'sirah', label: 'السيرة' },
    { value: 'tafsir', label: 'التفسير' },
    { value: 'hadith', label: 'الحديث' },
    { value: 'akhlaq', label: 'الأخلاق' },
    { value: 'tajweed', label: 'التجويد' }
  ];

  const levels = [
    { value: 'all', label: 'جميع المستويات' },
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  if (!['admin', 'teacher'].includes(role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <span>هذه الصفحة متاحة للمدرسين والمشرفين فقط</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-primary text-primary-content"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">إجمالي الدروس</p>
                  <p className="text-3xl font-bold">{stats.totalLessons}</p>
                </div>
                <BookOpen size={40} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-success text-success-content"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">الطلاب النشطون</p>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users size={40} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-info text-info-content"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">معدل الإتمام</p>
                  <p className="text-3xl font-bold">{stats.averageCompletionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp size={40} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-warning text-warning-content"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">الشهادات الممنوحة</p>
                  <p className="text-3xl font-bold">{stats.totalCertificatesIssued}</p>
                </div>
                <Award size={40} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">إدارة الدروس</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus size={20} />
          إضافة درس جديد
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <span className="bg-base-300">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="البحث في الدروس..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">لا توجد دروس</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>التصنيف</th>
                    <th>المستوى</th>
                    <th>المدة</th>
                    <th>النقاط</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>
                        <div className="font-bold">{lesson.title}</div>
                        {lesson.title_en && (
                          <div className="text-sm opacity-50">{lesson.title_en}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {categories.find(c => c.value === lesson.category)?.label}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {levels.find(l => l.value === lesson.level)?.label}
                        </span>
                      </td>
                      <td>{lesson.duration} دقيقة</td>
                      <td>{lesson.points}</td>
                      <td>
                        <button
                          onClick={() => handleTogglePublish(lesson)}
                          className={`btn btn-sm gap-2 ${
                            lesson.isPublished ? 'btn-success' : 'btn-ghost'
                          }`}
                        >
                          {lesson.isPublished ? (
                            <>
                              <Eye size={16} />
                              منشور
                            </>
                          ) : (
                            <>
                              <EyeOff size={16} />
                              مسودة
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingLesson(lesson)}
                            className="btn btn-sm btn-info gap-2"
                          >
                            <Edit size={16} />
                            تعديل
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => handleDelete(lesson.id)}
                              className="btn btn-sm btn-error gap-2"
                            >
                              <Trash2 size={16} />
                              حذف
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal - To be implemented */}
      {(showCreateModal || editingLesson) && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </h3>
            <p className="text-center py-4">
              سيتم إضافة نموذج إنشاء/تعديل الدرس هنا
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingLesson(null);
                }}
                className="btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
