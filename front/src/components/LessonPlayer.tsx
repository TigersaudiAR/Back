import React, { useState, useEffect } from 'react';

interface Quiz {
  question_ar: string;
  question_en: string;
  options: string[];
  correct_answer: number;
  explanation_ar?: string;
}

interface Lesson {
  id: string;
  category: string;
  level: string;
  order: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  content: {
    sections: Array<{
      title_ar: string;
      title_en: string;
      text_ar: string;
      text_en: string;
    }>;
  };
  quiz: Quiz[];
  points: number;
  duration_minutes: number;
}

export const LessonPlayer: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ category?: string; level?: string }>({});

  useEffect(() => {
    loadLessons();
  }, [filter]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.level) params.append('level', filter.level);

      const res = await fetch(`/api/lessons?${params.toString()}`);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowQuiz(false);
    setQuizResults(null);
    setQuizAnswers(new Array(lesson.quiz.length).fill(-1));
  };

  const submitQuiz = async () => {
    if (!selectedLesson) return;

    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: quizAnswers })
      });

      const results = await res.json();
      setQuizResults(results);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      case 'kids': return 'أطفال';
      default: return level;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'aqeedah': return 'العقيدة';
      case 'fiqh': return 'الفقه';
      case 'seerah': return 'السيرة';
      case 'akhlaq': return 'الأخلاق';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الدروس...</p>
        </div>
      </div>
    );
  }

  if (selectedLesson && !showQuiz && !quizResults) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => setSelectedLesson(null)}
          className="mb-4 text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          ← العودة للدروس
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-emerald-600 text-white">
            <h1 className="text-3xl font-bold mb-2">{selectedLesson.title_ar}</h1>
            <p className="text-emerald-100">{selectedLesson.description_ar}</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span>⏱️ {selectedLesson.duration_minutes} دقيقة</span>
              <span>🏆 {selectedLesson.points} نقطة</span>
              <span className={`px-3 py-1 rounded-full ${getLevelColor(selectedLesson.level)}`}>
                {getLevelLabel(selectedLesson.level)}
              </span>
            </div>
          </div>

          <div className="p-6">
            {selectedLesson.content.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {section.title_ar}
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {section.text_ar}
                </p>
              </div>
            ))}

            {selectedLesson.quiz.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg"
                >
                  📝 ابدأ الاختبار ({selectedLesson.quiz.length} أسئلة)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLesson && showQuiz && !quizResults) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            اختبار: {selectedLesson.title_ar}
          </h2>

          {selectedLesson.quiz.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                {qIndex + 1}. {question.question_ar}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={quizAnswers[qIndex] === oIndex}
                      onChange={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[qIndex] = oIndex;
                        setQuizAnswers(newAnswers);
                      }}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={submitQuiz}
              disabled={quizAnswers.some(a => a === -1)}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              إرسال الإجابات
            </button>
            <button
              onClick={() => setShowQuiz(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizResults) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className={`text-center mb-6 p-6 rounded-lg ${
            quizResults.passed ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="text-6xl mb-4">
              {quizResults.passed ? '🎉' : '📚'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {quizResults.passed ? 'مبروك! نجحت في الاختبار' : 'حاول مرة أخرى'}
            </h2>
            <div className="text-2xl font-bold mb-2">
              النتيجة: {quizResults.score}%
            </div>
            <div className="text-lg text-gray-600">
              {quizResults.correct} من {quizResults.total} إجابات صحيحة
            </div>
            {quizResults.passed && (
              <div className="mt-4 text-lg font-semibold text-green-700">
                🏆 حصلت على {quizResults.points_earned} نقطة
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {quizResults.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="font-semibold mb-2">
                  {index + 1}. {result.question}
                </div>
                <div className="text-sm text-gray-600">
                  {result.is_correct ? (
                    <span className="text-green-700">✓ إجابة صحيحة</span>
                  ) : (
                    <span className="text-red-700">✗ إجابة خاطئة</span>
                  )}
                </div>
                {result.explanation && (
                  <div className="mt-2 text-sm text-gray-700">
                    💡 {result.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setQuizResults(null);
              }}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              العودة للدروس
            </button>
            {!quizResults.passed && (
              <button
                onClick={() => {
                  setShowQuiz(true);
                  setQuizResults(null);
                  setQuizAnswers(new Array(selectedLesson?.quiz.length || 0).fill(-1));
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">دروس العلوم الإسلامية</h1>
        <p className="text-gray-600">تعلم العقيدة والفقه والسيرة مع اختبارات تفاعلية</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter.category || ''}
          onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">جميع الفئات</option>
          <option value="aqeedah">العقيدة</option>
          <option value="fiqh">الفقه</option>
          <option value="seerah">السيرة</option>
        </select>

        <select
          value={filter.level || ''}
          onChange={(e) => setFilter({ ...filter, level: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">جميع المستويات</option>
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدم</option>
        </select>
      </div>

      {/* Lessons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => startLesson(lesson)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(lesson.level)}`}>
                  {getLevelLabel(lesson.level)}
                </span>
                <span className="text-xs text-gray-500">
                  {getCategoryLabel(lesson.category)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {lesson.title_ar}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {lesson.description_ar}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⏱️ {lesson.duration_minutes} دقيقة</span>
                <span>🏆 {lesson.points} نقطة</span>
                <span>📝 {lesson.quiz.length} أسئلة</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          لا توجد دروس متاحة بالفلاتر المحددة
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
