import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  course_id: string;
  title: string;
  title_en: string;
  category: string;
  level: string;
  description: string;
  total_lessons: number;
  estimated_hours: number;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  title_en: string;
  duration_minutes: number;
  content: {
    introduction: string;
    main_points: string[];
    references: string[];
  };
  quiz?: any;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  correct_answer: number;
}

const LessonPlayer: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const userId = 'demo-user';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/lessons/courses`);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setShowQuiz(false);
    
    try {
      const response = await axios.get(`${API_BASE}/api/lessons/courses/${course.course_id}/lessons`);
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowQuiz(false);
    setQuizResult(null);
    setQuizAnswers([]);
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setQuizResult(null);
    setQuizAnswers(new Array(selectedLesson?.quiz?.questions?.length || 0).fill(-1));
  };

  const submitQuiz = async () => {
    if (!selectedLesson || !selectedCourse) return;
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/lessons/courses/${selectedCourse.course_id}/lessons/${selectedLesson.id}/quiz/submit`,
        {
          userId,
          answers: quizAnswers
        },
        {
          headers: {
            Authorization: `Bearer demo-token`
          }
        }
      );
      
      setQuizResult(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const renderCourseCard = (course: Course) => (
    <div
      key={course.course_id}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => selectCourse(course)}
    >
      <div className="card-body">
        <div className={`badge ${
          course.category === 'aqeedah' ? 'badge-primary' :
          course.category === 'fiqh' ? 'badge-secondary' :
          'badge-accent'
        }`}>
          {course.category === 'aqeedah' ? 'عقيدة' :
           course.category === 'fiqh' ? 'فقه' : 'سيرة'}
        </div>
        
        <h3 className="card-title text-xl">{course.title}</h3>
        <p className="text-sm text-gray-500">{course.title_en}</p>
        <p className="text-sm mt-2">{course.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="badge badge-outline">{course.total_lessons} درس</div>
          <div className="badge badge-outline">{course.estimated_hours} ساعة</div>
          <div className="badge badge-outline">{course.level}</div>
        </div>
      </div>
    </div>
  );

  const renderLessonList = () => (
    <div className="space-y-2">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className={`card bg-base-100 shadow hover:shadow-md transition cursor-pointer ${
            selectedLesson?.id === lesson.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => selectLesson(lesson)}
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-4">
              <div className="badge badge-lg">{lesson.number}</div>
              <div className="flex-1">
                <h4 className="font-semibold">{lesson.title}</h4>
                <p className="text-xs text-gray-500">{lesson.duration_minutes} دقيقة</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    return (
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-2">{selectedLesson.title}</h2>
            <p className="text-gray-500 mb-4">{selectedLesson.title_en}</p>
            
            <div className="divider"></div>
            
            <div>
              <h3 className="font-bold text-lg mb-2">المقدمة:</h3>
              <p className="text-base leading-relaxed">{selectedLesson.content.introduction}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">النقاط الرئيسية:</h3>
              <ul className="list-disc list-inside space-y-2">
                {selectedLesson.content.main_points.map((point, idx) => (
                  <li key={idx} className="text-base leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>

            {selectedLesson.content.references && selectedLesson.content.references.length > 0 && (
              <div className="mt-4 bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">المراجع:</h3>
                <div className="space-y-2">
                  {selectedLesson.content.references.map((ref, idx) => (
                    <p key={idx} className="text-base leading-loose text-right">{ref}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="card-actions justify-end mt-6">
              {selectedLesson.quiz && !showQuiz && !quizResult && (
                <button onClick={startQuiz} className="btn btn-primary">
                  بدء الاختبار
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!selectedLesson?.quiz || !showQuiz) return null;

    const questions: QuizQuestion[] = selectedLesson.quiz.questions;

    return (
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">اختبار الدرس</h2>
          
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="border-b pb-4">
                <h3 className="font-semibold mb-3">
                  {qIdx + 1}. {q.question}
                </h3>
                
                <div className="space-y-2">
                  {q.options.map((option, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <input
                        type="radio"
                        name={`question-${qIdx}`}
                        value={oIdx}
                        checked={quizAnswers[qIdx] === oIdx}
                        onChange={() => {
                          const newAnswers = [...quizAnswers];
                          newAnswers[qIdx] = oIdx;
                          setQuizAnswers(newAnswers);
                        }}
                        className="radio radio-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              onClick={submitQuiz}
              className="btn btn-primary"
              disabled={quizAnswers.some(a => a === -1)}
            >
              إرسال الإجابات
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizResult = () => {
    if (!quizResult) return null;

    return (
      <div className={`alert ${quizResult.passed ? 'alert-success' : 'alert-warning'} mt-6`}>
        <div>
          <h3 className="font-bold text-lg">{quizResult.message}</h3>
          <p>النتيجة: {quizResult.score.toFixed(0)}%</p>
          <p>النقاط المكتسبة: {quizResult.points_earned}</p>
        </div>
      </div>
    );
  };

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
        <h1 className="text-4xl font-bold mb-2">منصة التعليم الإسلامي</h1>
        <p className="text-lg text-gray-600">تعلم العقيدة والفقه والسيرة النبوية</p>
      </div>

      {!selectedCourse && (
        <div>
          <h2 className="text-2xl font-bold mb-6">الدورات المتاحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(renderCourseCard)}
          </div>
        </div>
      )}

      {selectedCourse && (
        <div>
          <button
            onClick={() => {
              setSelectedCourse(null);
              setSelectedLesson(null);
              setShowQuiz(false);
            }}
            className="btn btn-ghost mb-4"
          >
            ← العودة للدورات
          </button>

          <h2 className="text-3xl font-bold mb-6">{selectedCourse.title}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold mb-4">الدروس</h3>
              {renderLessonList()}
            </div>
            
            <div className="lg:col-span-2">
              {renderLessonContent()}
              {renderQuiz()}
              {renderQuizResult()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
