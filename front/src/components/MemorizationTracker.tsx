import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Track {
  id: string;
  name: string;
  name_en: string;
  description: string;
  level: string;
  total_surahs?: number;
  estimated_days: number;
  daily_commitment: string;
}

interface Achievement {
  id: string;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
}

interface Statistics {
  total_verses_memorized: number;
  total_surahs_memorized: number;
  total_quizzes_taken: number;
  total_quizzes_passed: number;
  average_quiz_score: number;
  perfect_quiz_count: number;
  streak_days?: number;
  total_points?: number;
  achievements_count?: number;
}

interface Progress {
  userId: string;
  memorized_verses: any[];
  memorized_surahs: any[];
  current_track: string | null;
  streak_days: number;
  total_points: number;
  achievements_unlocked: Achievement[];
  statistics: Statistics;
}

const MemorizationTracker: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracks' | 'progress' | 'achievements' | 'tips'>('tracks');
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const userId = 'demo-user'; // In production, get from auth context

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tracksRes, achievementsRes, progressRes, statsRes, tipsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/memorization/tracks`),
        axios.get(`${API_BASE}/api/memorization/achievements`),
        axios.get(`${API_BASE}/api/memorization/progress/${userId}`),
        axios.get(`${API_BASE}/api/memorization/statistics/${userId}`),
        axios.get(`${API_BASE}/api/memorization/tips`)
      ]);

      setTracks(tracksRes.data.tracks || []);
      setAchievements(achievementsRes.data.achievements || []);
      setProgress(progressRes.data);
      setStatistics(statsRes.data.statistics);
      setTips(tipsRes.data.tips || []);
    } catch (error) {
      console.error('Error loading memorization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTrack = async (track: Track) => {
    setSelectedTrack(track);
    try {
      await axios.post(
        `${API_BASE}/api/memorization/progress/${userId}`,
        { current_track: track.id },
        {
          headers: {
            Authorization: `Bearer demo-token` // In production, use real auth token
          }
        }
      );
      loadData();
    } catch (error) {
      console.error('Error selecting track:', error);
    }
  };

  const renderTrackCard = (track: Track) => (
    <div
      key={track.id}
      className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
        progress?.current_track === track.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => selectTrack(track)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className={`badge ${
            track.level === 'beginner' ? 'badge-success' :
            track.level === 'intermediate' ? 'badge-warning' :
            'badge-error'
          }`}>
            {track.level === 'beginner' ? 'مبتدئ' :
             track.level === 'intermediate' ? 'متوسط' : 'متقدم'}
          </div>
          {progress?.current_track === track.id && (
            <div className="badge badge-primary">المسار الحالي</div>
          )}
        </div>
        
        <h3 className="card-title text-xl mt-2">{track.name}</h3>
        <p className="text-sm text-gray-500">{track.name_en}</p>
        <p className="text-sm mt-2">{track.description}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">المدة المتوقعة:</span>
            <span>{track.estimated_days} يوم</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">الالتزام اليومي:</span>
            <span>{track.daily_commitment}</span>
          </div>
          {track.total_surahs && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">عدد السور:</span>
              <span>{track.total_surahs} سورة</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <span className="text-4xl">📖</span>
          </div>
          <div className="stat-title">آيات محفوظة</div>
          <div className="stat-value text-primary">{statistics.total_verses_memorized}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary">
            <span className="text-4xl">📚</span>
          </div>
          <div className="stat-title">سور محفوظة</div>
          <div className="stat-value text-secondary">{statistics.total_surahs_memorized}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-accent">
            <span className="text-4xl">🔥</span>
          </div>
          <div className="stat-title">أيام متواصلة</div>
          <div className="stat-value text-accent">{statistics.streak_days || 0}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <span className="text-4xl">⭐</span>
          </div>
          <div className="stat-title">النقاط الكلية</div>
          <div className="stat-value text-success">{statistics.total_points || 0}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <span className="text-4xl">📝</span>
          </div>
          <div className="stat-title">اختبارات مكتملة</div>
          <div className="stat-value text-info">{statistics.total_quizzes_taken}</div>
          <div className="stat-desc">نجح في {statistics.total_quizzes_passed}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <span className="text-4xl">💯</span>
          </div>
          <div className="stat-title">المعدل</div>
          <div className="stat-value text-warning">{statistics.average_quiz_score.toFixed(0)}%</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <span className="text-4xl">🏆</span>
          </div>
          <div className="stat-title">نتائج كاملة</div>
          <div className="stat-value text-error">{statistics.perfect_quiz_count}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <span className="text-4xl">🎖️</span>
          </div>
          <div className="stat-title">الإنجازات</div>
          <div className="stat-value text-primary">{statistics.achievements_count || 0}</div>
        </div>
      </div>
    );
  };

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement) => {
        const unlocked = progress?.achievements_unlocked?.some(a => a.id === achievement.id);
        
        return (
          <div
            key={achievement.id}
            className={`card shadow-lg ${
              unlocked ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800' : 'bg-base-100 opacity-50'
            }`}
          >
            <div className="card-body">
              <div className="text-6xl text-center mb-4">{achievement.icon}</div>
              <h3 className="card-title text-center justify-center">{achievement.name}</h3>
              <p className="text-sm text-center text-gray-500">{achievement.name_en}</p>
              <p className="text-sm text-center mt-2">{achievement.description}</p>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="badge badge-lg badge-warning">
                  {achievement.points} نقطة
                </div>
                {unlocked && (
                  <div className="badge badge-lg badge-success">✓ مفتوح</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTips = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tips.map((tip, index) => (
        <div key={index} className="alert alert-info shadow-lg">
          <div>
            <span className="text-2xl mr-3">💡</span>
            <span>{tip}</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">نظام الحفظ الذكي</h1>
        <p className="text-lg text-gray-600">تتبع تقدمك في حفظ القرآن الكريم</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8">
        <button
          className={`tab tab-lg ${activeTab === 'tracks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          المسارات
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'progress' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          التقدم
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'achievements' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          الإنجازات
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'tips' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          نصائح
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'tracks' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">اختر مسار الحفظ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map(renderTrackCard)}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">إحصائياتك</h2>
            {renderStatistics()}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">الإنجازات</h2>
            {renderAchievements()}
          </div>
        )}

        {activeTab === 'tips' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">نصائح للحفظ</h2>
            {renderTips()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemorizationTracker;
