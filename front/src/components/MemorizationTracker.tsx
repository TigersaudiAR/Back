import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MemorizationStats {
  totalVerses: number;
  totalPages: number;
  totalJuz: number;
  currentStreak: number;
  longestStreak: number;
  perfectTests: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge: string;
  points: number;
}

interface Verse {
  surahId: number;
  ayahNumber: number;
  memorizedAt: string;
  reviewCount: number;
  lastReviewAt: string;
}

export default function MemorizationTracker() {
  const [statistics, setStatistics] = useState<MemorizationStats>({
    totalVerses: 0,
    totalPages: 0,
    totalJuz: 0,
    currentStreak: 0,
    longestStreak: 0,
    perfectTests: 0
  });
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [locked, setLocked] = useState<Achievement[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements' | 'review'>('progress');

  useEffect(() => {
    fetchProgress();
    fetchAchievements();
    fetchReviewSchedule();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/memorization/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStatistics(data.statistics || {
        totalVerses: 0,
        totalPages: 0,
        totalJuz: 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectTests: 0
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/memorization/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUnlocked(data.unlocked || []);
      setLocked(data.locked || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewSchedule = async () => {
    try {
      const response = await fetch('/api/memorization/schedule', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setReviewSchedule(data.schedule || []);
    } catch (error) {
      console.error('Error fetching review schedule:', error);
    }
  };

  const renderStatCard = (title: string, value: number, icon: string) => (
    <div className="stat bg-base-200 rounded-lg">
      <div className="stat-figure text-4xl">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value text-primary">{value}</div>
    </div>
  );

  const renderAchievement = (achievement: Achievement, isUnlocked: boolean) => (
    <motion.div
      key={achievement.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card shadow-xl ${isUnlocked ? 'bg-gradient-to-br from-primary to-secondary text-primary-content' : 'bg-base-200 opacity-60'}`}
    >
      <div className="card-body items-center text-center">
        <div className="text-6xl mb-2">{achievement.badge}</div>
        <h3 className="card-title text-lg">{achievement.name}</h3>
        <p className="text-sm">{achievement.description}</p>
        <div className="badge badge-lg mt-2">{achievement.points} نقطة</div>
        {!isUnlocked && (
          <div className="text-xs mt-2 opacity-70">🔒 غير محقق</div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">متابعة الحفظ</h1>
        <p className="text-lg text-base-content/70">تابع تقدمك في حفظ القرآن الكريم</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8">
        <a
          className={`tab tab-lg ${activeTab === 'progress' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          التقدم
        </a>
        <a
          className={`tab tab-lg ${activeTab === 'achievements' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          الإنجازات
        </a>
        <a
          className={`tab tab-lg ${activeTab === 'review' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          جدول المراجعة
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                {renderStatCard('عدد الآيات', statistics.totalVerses, '📖')}
                {renderStatCard('عدد الصفحات', statistics.totalPages, '📄')}
                {renderStatCard('عدد الأجزاء', statistics.totalJuz, '📚')}
              </div>

              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                {renderStatCard('السلسلة الحالية', statistics.currentStreak, '🔥')}
                {renderStatCard('أطول سلسلة', statistics.longestStreak, '⭐')}
                {renderStatCard('اختبارات مثالية', statistics.perfectTests, '💯')}
              </div>

              <div className="alert alert-info shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">نصيحة اليوم</h3>
                    <div className="text-xs">راجع ما حفظته بالأمس مرتين، وما حفظته الأسبوع الماضي مرة واحدة</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {unlocked.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الإنجازات المحققة ✨</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlocked.map(achievement => renderAchievement(achievement, true))}
                  </div>
                </div>
              )}

              {locked.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الإنجازات القادمة 🎯</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locked.map(achievement => renderAchievement(achievement, false))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              {reviewSchedule.length > 0 ? (
                <>
                  <div className="alert alert-warning shadow-lg">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>لديك {reviewSchedule.length} آية تحتاج للمراجعة اليوم</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>رقم السورة</th>
                          <th>رقم الآية</th>
                          <th>تاريخ الحفظ</th>
                          <th>عدد المراجعات</th>
                          <th>آخر مراجعة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewSchedule.map((verse, idx) => (
                          <tr key={idx}>
                            <td>{verse.surahId}</td>
                            <td>{verse.ayahNumber}</td>
                            <td>{new Date(verse.memorizedAt).toLocaleDateString('ar')}</td>
                            <td>{verse.reviewCount}</td>
                            <td>{new Date(verse.lastReviewAt).toLocaleDateString('ar')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="alert alert-success shadow-lg">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>أحسنت! لا توجد آيات تحتاج للمراجعة اليوم</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
