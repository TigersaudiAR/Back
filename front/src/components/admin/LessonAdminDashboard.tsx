import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: number;
  points: number;
  status: 'draft' | 'published' | 'archived';
  viewCount?: number;
  completionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function LessonAdminDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLessons();
  }, [searchQuery, categoryFilter, statusFilter, currentPage]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { query: searchQuery }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/lessons?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLessons(data.lessons || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    try {
      await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('فشل حذف الدرس');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'badge-warning',
      published: 'badge-success',
      archived: 'badge-neutral'
    };
    const labels = {
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف'
    };
    return <div className={`badge ${badges[status as keyof typeof badges]}`}>{labels[status as keyof typeof labels]}</div>;
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      aqidah: 'badge-primary',
      fiqh: 'badge-secondary',
      sirah: 'badge-accent',
      quran: 'badge-info'
    };
    const labels: Record<string, string> = {
      aqidah: 'عقيدة',
      fiqh: 'فقه',
      sirah: 'سيرة',
      quran: 'قرآن'
    };
    return <div className={`badge ${badges[category] || 'badge-neutral'}`}>{labels[category] || category}</div>;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">إدارة الدروس</h1>
        <button className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" />
          إضافة درس جديد
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">البحث</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="ابحث عن درس..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-square">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">التصنيف</span>
              </label>
              <select
                className="select select-bordered"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="aqidah">عقيدة</option>
                <option value="fiqh">فقه</option>
                <option value="sirah">سيرة</option>
                <option value="quran">قرآن</option>
                <option value="hadith">حديث</option>
                <option value="akhlaq">أخلاق</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">الحالة</span>
              </label>
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="card bg-base-100 shadow-xl overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>التصنيف</th>
                  <th>المستوى</th>
                  <th>المدة</th>
                  <th>النقاط</th>
                  <th>الحالة</th>
                  <th>المشاهدات</th>
                  <th>الإكمال</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <motion.tr
                    key={lesson.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div className="font-bold">{lesson.title}</div>
                      <div className="text-sm opacity-50">
                        {new Date(lesson.updatedAt).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td>{getCategoryBadge(lesson.category)}</td>
                    <td>
                      <div className="badge badge-outline">{lesson.level}</div>
                    </td>
                    <td>{lesson.duration} دقيقة</td>
                    <td>
                      <div className="badge badge-success">{lesson.points}</div>
                    </td>
                    <td>{getStatusBadge(lesson.status)}</td>
                    <td>{lesson.viewCount || 0}</td>
                    <td>{lesson.completionCount || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          title="حذف"
                          onClick={() => handleDelete(lesson.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>
                {/* Show first page */}
                {currentPage > 3 && (
                  <>
                    <button
                      className="join-item btn"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    {currentPage > 4 && <button className="join-item btn btn-disabled">...</button>}
                  </>
                )}
                {/* Show pages around current */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                  if (page < 1 || page > totalPages) return null;
                  if (currentPage <= 3 || currentPage >= totalPages - 2) {
                    return i < 5 ? (
                      <button
                        key={page}
                        className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ) : null;
                  }
                  return (
                    <button
                      key={page}
                      className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                {/* Show last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <button className="join-item btn btn-disabled">...</button>}
                    <button
                      className="join-item btn"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  className="join-item btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
