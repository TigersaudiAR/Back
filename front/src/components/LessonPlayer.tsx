import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Lesson {
  id: string;
  category: string;
  title: string;
  title_en: string;
  level: string;
  duration: number;
  description: string;
  objectives: string[];
  content: Array<{
    type: string;
    title?: string;
    body?: string;
    items?: string[];
    text?: string;
    source?: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
  points: number;
}

export default function LessonPlayer() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'aqidah' | 'fiqh' | 'sirah'>('all');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = activeCategory === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === activeCategory);

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      const response = await fetch(`/api/lessons/${selectedLesson.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      alert(data.message);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedLesson) return;

    try {
      const response = await fetch(`/api/lessons/${selectedLesson.id}/quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: quizAnswers })
      });
      const data = await response.json();
      setQuizResult(data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const renderCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      aqidah: 'badge-primary',
      fiqh: 'badge-secondary',
      sirah: 'badge-accent'
    };
    const labels: Record<string, string> = {
      aqidah: 'عقيدة',
      fiqh: 'فقه',
      sirah: 'سيرة'
    };
    return <div className={`badge ${badges[category] || 'badge-neutral'}`}>{labels[category] || category}</div>;
  };

  const renderLessonCard = (lesson: Lesson) => (
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
      onClick={() => {
        setSelectedLesson(lesson);
        setShowQuiz(false);
        setQuizAnswers([]);
        setQuizResult(null);
      }}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg">{lesson.title}</h3>
          {renderCategoryBadge(lesson.category)}
        </div>
        <p className="text-sm text-base-content/70 line-clamp-2">{lesson.description}</p>
        <div className="flex gap-2 mt-2">
          <div className="badge badge-outline">{lesson.duration} دقيقة</div>
          <div className="badge badge-outline">{lesson.level}</div>
          <div className="badge badge-success">{lesson.points} نقطة</div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = (content: any, idx: number) => {
    if (content.type === 'text') {
      return (
        <div key={idx} className="mb-4">
          {content.title && <h3 className="font-bold text-xl mb-2">{content.title}</h3>}
          <p className="text-base-content/80">{content.body}</p>
        </div>
      );
    } else if (content.type === 'list') {
      return (
        <div key={idx} className="mb-4">
          {content.title && <h3 className="font-bold text-xl mb-2">{content.title}</h3>}
          <ul className="list-disc list-inside space-y-2">
            {content.items.map((item: string, i: number) => (
              <li key={i} className="text-base-content/80">{item}</li>
            ))}
          </ul>
        </div>
      );
    } else if (content.type === 'quote') {
      return (
        <div key={idx} className="alert alert-info mb-4">
          <div>
            <p className="font-arabic text-lg">{content.text}</p>
            {content.source && <p className="text-sm mt-2 opacity-70">— {content.source}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {!selectedLesson ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">منصة التعليم الإسلامي</h1>
            <p className="text-lg text-base-content/70">تعلم أساسيات الدين من العقيدة والفقه والسيرة</p>
          </div>

          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <button
              className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory('all')}
            >
              الكل
            </button>
            <button
              className={`btn ${activeCategory === 'aqidah' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory('aqidah')}
            >
              العقيدة
            </button>
            <button
              className={`btn ${activeCategory === 'fiqh' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory('fiqh')}
            >
              الفقه
            </button>
            <button
              className={`btn ${activeCategory === 'sirah' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory('sirah')}
            >
              السيرة
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map(renderLessonCard)}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button className="btn btn-ghost mb-4" onClick={() => setSelectedLesson(null)}>
            ← العودة للدروس
          </button>

          {!showQuiz ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-3xl mb-4">{selectedLesson.title}</h2>
                
                <div className="flex gap-2 mb-4">
                  {renderCategoryBadge(selectedLesson.category)}
                  <div className="badge badge-outline">{selectedLesson.duration} دقيقة</div>
                  <div className="badge badge-success">{selectedLesson.points} نقطة</div>
                </div>

                <p className="text-lg text-base-content/80 mb-6">{selectedLesson.description}</p>

                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-2">أهداف الدرس:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedLesson.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="divider"></div>

                <div className="space-y-6">
                  {selectedLesson.content.map(renderContent)}
                </div>

                <div className="card-actions justify-end mt-6">
                  <button className="btn btn-primary btn-lg" onClick={handleCompleteLesson}>
                    إتمام الدرس والانتقال للاختبار
                  </button>
                </div>
              </div>
            </div>
          ) : !quizResult ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-3xl mb-6">اختبار: {selectedLesson.title}</h2>

                {selectedLesson.quiz.map((question, qIdx) => (
                  <div key={qIdx} className="mb-6 p-4 bg-base-200 rounded-lg">
                    <p className="font-bold text-lg mb-3">{qIdx + 1}. {question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 cursor-pointer hover:bg-base-300 p-2 rounded">
                          <input
                            type="radio"
                            name={`question-${qIdx}`}
                            className="radio radio-primary"
                            onChange={() => {
                              const newAnswers = [...quizAnswers];
                              newAnswers[qIdx] = oIdx;
                              setQuizAnswers(newAnswers);
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="card-actions justify-end">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmitQuiz}
                    disabled={quizAnswers.length !== selectedLesson.quiz.length}
                  >
                    تسليم الاختبار
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-3xl mb-6">نتيجة الاختبار</h2>

                <div className={`alert ${quizResult.passed ? 'alert-success' : 'alert-error'} mb-6`}>
                  <div>
                    <h3 className="font-bold text-xl">{quizResult.message}</h3>
                    <p className="text-lg">النتيجة: {quizResult.score} من {quizResult.maxScore} ({quizResult.percentage.toFixed(0)}%)</p>
                  </div>
                </div>

                {quizResult.certificate && (
                  <div className="alert alert-info mb-6">
                    <div>
                      <h3 className="font-bold">🎉 تهانينا!</h3>
                      <p>حصلت على شهادة إتمام الدرس بدرجة {quizResult.percentage}%</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {quizResult.results.map((result: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-success/20' : 'bg-error/20'}`}>
                      <p className="font-bold">{idx + 1}. {result.question}</p>
                      {!result.isCorrect && (
                        <p className="text-sm mt-2">
                          <span className="text-error">إجابتك: {selectedLesson.quiz[idx].options[result.userAnswer]}</span>
                          <br />
                          <span className="text-success">الإجابة الصحيحة: {selectedLesson.quiz[idx].options[result.correctAnswer]}</span>
                        </p>
                      )}
                      <p className="text-sm mt-2 opacity-70">{result.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="card-actions justify-center mt-6">
                  <button className="btn btn-primary" onClick={() => setSelectedLesson(null)}>
                    العودة للدروس
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
