import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  Target,
  CheckCircle,
  Trophy,
  Calendar
} from 'lucide-react';
import { lessonsService } from '../../services/lessonsService';

export default function UserProgressDashboard() {
  const [progress, setProgress] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    loadCertificates();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await lessonsService.getUserProgress();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const data = await lessonsService.getCertificates();
      setCertificates(data.certificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-info">
          <span>يجب تسجيل الدخول لعرض التقدم</span>
        </div>
      </div>
    );
  }

  const { analytics } = progress;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">تقدمي في الدروس</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">معدل الإتمام</p>
                <p className="text-4xl font-bold">{analytics.completionRate.toFixed(0)}%</p>
              </div>
              <TrendingUp size={48} className="opacity-50" />
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${analytics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-success to-success-focus text-success-content shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">الدروس المكتملة</p>
                <p className="text-4xl font-bold">{analytics.completedLessons}</p>
                <p className="text-sm opacity-80">من {analytics.totalLessons}</p>
              </div>
              <CheckCircle size={48} className="opacity-50" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-warning to-warning-focus text-warning-content shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">إجمالي النقاط</p>
                <p className="text-4xl font-bold">{analytics.totalPoints}</p>
              </div>
              <Award size={48} className="opacity-50" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-info to-info-focus text-info-content shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">الشهادات</p>
                <p className="text-4xl font-bold">{analytics.certificates}</p>
              </div>
              <Trophy size={48} className="opacity-50" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress by Category */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">التقدم حسب التصنيف</h2>
          <div className="space-y-4">
            {Object.entries(analytics.progressByCategory).map(([category, count]) => {
              const categoryLabels: Record<string, string> = {
                aqidah: 'العقيدة',
                fiqh: 'الفقه',
                sirah: 'السيرة',
                tafsir: 'التفسير',
                hadith: 'الحديث',
                akhlaq: 'الأخلاق',
                tajweed: 'التجويد'
              };

              const categoryIcons: Record<string, string> = {
                aqidah: '🕌',
                fiqh: '⚖️',
                sirah: '📖',
                tafsir: '📜',
                hadith: '💬',
                akhlaq: '💎',
                tajweed: '🎵'
              };

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[category]}</span>
                      <span className="font-semibold">{categoryLabels[category]}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count} درس</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={count}
                    max={analytics.totalLessons}
                  ></progress>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">أداء الاختبارات</h2>
            <div className="stats bg-base-200 mt-4">
              <div className="stat">
                <div className="stat-title">الاختبارات المكتملة</div>
                <div className="stat-value text-primary">{analytics.quizzesTaken}</div>
              </div>
            </div>
            <div className="stats bg-base-200 mt-2">
              <div className="stat">
                <div className="stat-title">متوسط الدرجات</div>
                <div className="stat-value text-secondary">{analytics.averageQuizScore}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">الإنجازات</h2>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <BookOpen className="text-primary" size={24} />
                <div>
                  <p className="font-semibold">متعلم نشط</p>
                  <p className="text-sm text-gray-500">
                    أكملت {analytics.completedLessons} درس
                  </p>
                </div>
              </div>

              {analytics.averageQuizScore >= 80 && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Target className="text-success" size={24} />
                  <div>
                    <p className="font-semibold">أداء متميز</p>
                    <p className="text-sm text-gray-500">
                      متوسط درجات {analytics.averageQuizScore}%
                    </p>
                  </div>
                </div>
              )}

              {analytics.certificates > 0 && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Trophy className="text-warning" size={24} />
                  <div>
                    <p className="font-semibold">جامع الشهادات</p>
                    <p className="text-sm text-gray-500">
                      حصلت على {analytics.certificates} شهادة
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">شهاداتي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.lessonId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="card bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg"
                >
                  <div className="card-body">
                    <Trophy size={32} className="mb-2" />
                    <h3 className="font-bold">{cert.lessonTitle}</h3>
                    <p className="text-sm opacity-90">{cert.category}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Calendar size={14} />
                      <span>{new Date(cert.date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="badge badge-ghost mt-2">
                      {cert.score}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
