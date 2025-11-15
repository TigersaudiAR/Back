import React, { useState, useEffect } from 'react';

interface MemorizationRecord {
  surah_id: number;
  ayah_number: number;
  status: 'memorizing' | 'memorized' | 'reviewing' | 'mastered';
  last_reviewed?: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface MemorizationStats {
  total_ayat: number;
  memorizing: number;
  memorized: number;
  reviewing: number;
  mastered: number;
  surahs: number;
}

export const MemorizationTracker: React.FC = () => {
  const [stats, setStats] = useState<MemorizationStats | null>(null);
  const [records, setRecords] = useState<MemorizationRecord[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<MemorizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingSurah, setAddingSurah] = useState(false);
  const [newSurahId, setNewSurahId] = useState('');
  const [newAyahNumber, setNewAyahNumber] = useState('');

  useEffect(() => {
    loadProgress();
    loadReviewSchedule();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/memorization/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to load progress');
      
      const data = await res.json();
      setStats(data.stats);
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/memorization/review-schedule', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setReviewSchedule(data.needs_review || []);
      }
    } catch (err) {
      console.error('Failed to load review schedule:', err);
    }
  };

  const addAyah = async () => {
    if (!newSurahId || !newAyahNumber) {
      alert('يرجى إدخال رقم السورة والآية');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/memorization/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          surah_id: parseInt(newSurahId),
          ayah_number: parseInt(newAyahNumber)
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      setNewSurahId('');
      setNewAyahNumber('');
      setAddingSurah(false);
      loadProgress();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل إضافة الآية');
    }
  };

  const updateStatus = async (surahId: number, ayahNumber: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/memorization/update/${surahId}/${ayahNumber}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        loadProgress();
        loadReviewSchedule();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteAyah = async (surahId: number, ayahNumber: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الآية؟')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/memorization/delete/${surahId}/${ayahNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        loadProgress();
      }
    } catch (err) {
      console.error('Failed to delete ayah:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'memorizing': return 'bg-yellow-100 text-yellow-800';
      case 'memorized': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-purple-100 text-purple-800';
      case 'mastered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'memorizing': return 'جاري الحفظ';
      case 'memorized': return 'محفوظة';
      case 'reviewing': return 'مراجعة';
      case 'mastered': return 'متقنة';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الحفظ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">متتبع الحفظ الذكي</h1>
        <p className="text-gray-600">تتبع تقدمك في حفظ القرآن الكريم مع نظام المراجعة الذكية</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-emerald-600">{stats.total_ayat}</div>
            <div className="text-sm text-gray-600">مجموع الآيات</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-yellow-600">{stats.memorizing}</div>
            <div className="text-sm text-gray-600">جاري الحفظ</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.memorized}</div>
            <div className="text-sm text-gray-600">محفوظة</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-purple-600">{stats.reviewing}</div>
            <div className="text-sm text-gray-600">مراجعة</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-green-600">{stats.mastered}</div>
            <div className="text-sm text-gray-600">متقنة</div>
          </div>
        </div>
      )}

      {/* Review Schedule */}
      {reviewSchedule.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-800 mb-2">
            📅 لديك {reviewSchedule.length} آية تحتاج للمراجعة اليوم
          </h3>
          <div className="space-y-2">
            {reviewSchedule.slice(0, 5).map((record) => (
              <div key={`${record.surah_id}-${record.ayah_number}`} className="text-sm text-orange-700">
                سورة {record.surah_id} - آية {record.ayah_number}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Ayah */}
      <div className="mb-6">
        {!addingSurah ? (
          <button
            onClick={() => setAddingSurah(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + إضافة آية جديدة
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-4">إضافة آية جديدة للحفظ</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="رقم السورة (1-114)"
                value={newSurahId}
                onChange={(e) => setNewSurahId(e.target.value)}
                min="1"
                max="114"
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="رقم الآية"
                value={newAyahNumber}
                onChange={(e) => setNewAyahNumber(e.target.value)}
                min="1"
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAyah}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                إضافة
              </button>
              <button
                onClick={() => {
                  setAddingSurah(false);
                  setNewSurahId('');
                  setNewAyahNumber('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-bold text-gray-800">قائمة الآيات ({records.length})</h3>
        </div>
        <div className="divide-y">
          {records.map((record) => (
            <div
              key={`${record.surah_id}-${record.ayah_number}`}
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    سورة {record.surah_id} - آية {record.ayah_number}
                  </div>
                  <div className="text-sm text-gray-500">
                    عدد المراجعات: {record.review_count}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={record.status}
                    onChange={(e) => updateStatus(record.surah_id, record.ayah_number, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}
                  >
                    <option value="memorizing">جاري الحفظ</option>
                    <option value="memorized">محفوظة</option>
                    <option value="reviewing">مراجعة</option>
                    <option value="mastered">متقنة</option>
                  </select>
                  
                  <button
                    onClick={() => deleteAyah(record.surah_id, record.ayah_number)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {records.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              لم تضف أي آيات للحفظ بعد. ابدأ بإضافة آية جديدة!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorizationTracker;
