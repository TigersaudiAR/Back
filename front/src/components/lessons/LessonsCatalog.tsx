import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award,
  ChevronLeft,
  Grid,
  List
} from 'lucide-react';
import { lessonsService, Lesson } from '../../services/lessonsService';
import { Link } from 'react-router-dom';

export default function LessonsCatalog() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLessons();
  }, [selectedCategory, selectedLevel, searchTerm]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {
        isPublished: 'true'
      };

      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedLevel !== 'all') params.level = selectedLevel;
      if (searchTerm) params.search = searchTerm;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');

      const response = await lessonsService.getLessons(params);
      setLessons(response.lessons);
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'جميع التصنيفات', icon: '📚' },
    { value: 'aqidah', label: 'العقيدة', icon: '🕌' },
    { value: 'fiqh', label: 'الفقه', icon: '⚖️' },
    { value: 'sirah', label: 'السيرة', icon: '📖' },
    { value: 'tafsir', label: 'التفسير', icon: '📜' },
    { value: 'hadith', label: 'الحديث', icon: '💬' },
    { value: 'akhlaq', label: 'الأخلاق', icon: '💎' },
    { value: 'tajweed', label: 'التجويد', icon: '🎵' }
  ];

  const levelOptions = [
    { value: 'all', label: 'جميع المستويات', color: 'badge-ghost' },
    { value: 'beginner', label: 'مبتدئ', color: 'badge-success' },
    { value: 'intermediate', label: 'متوسط', color: 'badge-warning' },
    { value: 'advanced', label: 'متقدم', color: 'badge-error' }
  ];

  const getLevelBadgeClass = (level: string) => {
    const levelOption = levelOptions.find(l => l.value === level);
    return levelOption?.color || 'badge-ghost';
  };

  const getCategoryLabel = (category: string) => {
    const categoryOption = categoryOptions.find(c => c.value === category);
    return categoryOption?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    const categoryOption = categoryOptions.find(c => c.value === category);
    return categoryOption?.icon || '📚';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">مكتبة الدروس التعليمية</h1>
        <p className="text-lg text-gray-600">
          استكشف مجموعة واسعة من الدروس الإسلامية التفاعلية
        </p>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <span className="bg-base-300">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="ابحث عن درس..."
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levelOptions.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {lessons.length} درس متاح
            </div>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-500">لا توجد دروس متاحة</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/lessons/${lesson.id}`}>
                <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'card-side' : ''
                }`}>
                  {lesson.thumbnail && (
                    <figure className={viewMode === 'list' ? 'w-48' : ''}>
                      <img 
                        src={lesson.thumbnail} 
                        alt={lesson.title}
                        className="w-full h-48 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="card-title flex-1">{lesson.title}</h2>
                      <span className="text-2xl">{getCategoryIcon(lesson.category)}</span>
                    </div>
                    
                    {lesson.title_en && (
                      <p className="text-sm text-gray-500 italic">{lesson.title_en}</p>
                    )}
                    
                    <p className="text-sm line-clamp-2">{lesson.description}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`badge ${getLevelBadgeClass(lesson.level)}`}>
                        {levelOptions.find(l => l.value === lesson.level)?.label}
                      </span>
                      <span className="badge badge-outline">
                        {getCategoryLabel(lesson.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{lesson.duration} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award size={16} />
                        <span>{lesson.points} نقطة</span>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-primary btn-sm gap-2">
                        ابدأ الدرس
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category Statistics */}
      {!loading && Object.keys(categories).length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">الدروس حسب التصنيف</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categoryOptions.slice(1).map((cat) => (
              <motion.div
                key={cat.value}
                whileHover={{ scale: 1.05 }}
                className={`card bg-base-100 shadow cursor-pointer ${
                  selectedCategory === cat.value ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                <div className="card-body items-center text-center p-4">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-bold text-sm">{cat.label}</p>
                  <p className="text-2xl font-bold text-primary">
                    {categories[cat.value] || 0}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
