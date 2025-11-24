import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Bell } from 'lucide-react';

interface UserStats {
  totalLessonsCompleted: number;
  totalPoints: number;
  totalTimeSpent: number;
  streak: number;
  categoryProgress: Record<string, {
    completed: number;
    total: number;
    percentage: number;
  }>;
  achievements: string[];
  certificates: string[];
  averageQuizScore: number;
  perfectScores: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
}

interface Certificate {
  id: string;
  lessonTitle: string;
  category: string;
  score: number;
  issuedAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function UserLessonDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const statsRes = await fetch('/api/lessons/progress/me', { headers });
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      const achievRes = await fetch('/api/lessons/achievements/me', { headers });
      const achievData = await achievRes.json();
      setAchievements(achievData.achievements || []);

      const certRes = await fetch('/api/lessons/certificates/me', { headers });
      const certData = await certRes.json();
      setCertificates(certData.certificates || []);

      const notifRes = await fetch('/api/lessons/notifications/me?unread=true', { headers });
      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    };
    return colors[rarity] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">لوحة تقدمك</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat bg-base-100 shadow-xl rounded-lg"
        >
          <div className="stat-figure text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">الدروس المكتملة</div>
          <div className="stat-value text-primary">{stats?.totalLessonsCompleted || 0}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat bg-base-100 shadow-xl rounded-lg"
        >
          <div className="stat-figure text-secondary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">إجمالي النقاط</div>
          <div className="stat-value text-secondary">{stats?.totalPoints || 0}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat bg-base-100 shadow-xl rounded-lg"
        >
          <div className="stat-figure text-accent">
            <Award className="w-8 h-8" />
          </div>
          <div className="stat-title">الإنجازات</div>
          <div className="stat-value text-accent">{achievements.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat bg-base-100 shadow-xl rounded-lg"
        >
          <div className="stat-figure">
            🔥
          </div>
          <div className="stat-title">أيام التعلم المتواصلة</div>
          <div className="stat-value">{stats?.streak || 0}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">التقدم حسب التصنيف</h2>
            <div className="space-y-4">
              {stats?.categoryProgress && Object.entries(stats.categoryProgress).map(([category, progress]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{category}</span>
                    <span className="text-sm">{progress.completed} / {progress.total}</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={progress.percentage}
                    max="100"
                  ></progress>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات
              {notifications.length > 0 && (
                <div className="badge badge-primary">{notifications.length}</div>
              )}
            </h2>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-base-content/70">لا توجد إشعارات جديدة</p>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="alert alert-info">
                    <div>
                      <h3 className="font-bold">{notif.title}</h3>
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs opacity-70">
                        {new Date(notif.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-base-100 shadow-xl mb-8"
        >
          <div className="card-body">
            <h2 className="card-title">الإنجازات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="card bg-base-200">
                  <div className="card-body items-center text-center">
                    <div className={`text-6xl ${getRarityColor(achievement.rarity)}`}>
                      {achievement.icon}
                    </div>
                    <h3 className="card-title text-lg">{achievement.name}</h3>
                    <p className="text-sm opacity-70">{achievement.description}</p>
                    <div className="badge badge-success">{achievement.points} نقطة</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
