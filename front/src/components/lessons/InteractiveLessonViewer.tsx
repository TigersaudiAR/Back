import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  BookOpen,
  Clock,
  Award,
  Play,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { lessonsService, Lesson, LessonContent } from '../../services/lessonsService';
import { useLessonsStore } from '../../store/lessons';

interface InteractiveLessonViewerProps {
  lessonId: string;
  onComplete?: () => void;
}

export default function InteractiveLessonViewer({ lessonId, onComplete }: InteractiveLessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const { setCurrentLesson } = useLessonsStore();

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const data = await lessonsService.getLessonById(lessonId);
      setLesson(data);
      setCurrentLesson(data);
      setQuizAnswers(new Array(data.quiz?.length || 0).fill(-1));
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (lesson && currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    
    try {
      setIsCompleting(true);
      const result = await lessonsService.completeLesson(lesson.id);
      alert(`${result.message}\n+${result.points} نقطة`);
      if (onComplete) onComplete();
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('يجب تسجيل الدخول لحفظ التقدم');
      } else {
        console.error('Error completing lesson:', error);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || !lesson.quiz) return;

    if (quizAnswers.includes(-1)) {
      alert('يرجى الإجابة على جميع الأسئلة');
      return;
    }

    try {
      const result = await lessonsService.submitQuiz(lesson.id, quizAnswers);
      setQuizResult(result);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('يجب تسجيل الدخول للمشاركة في الاختبار');
      } else {
        console.error('Error submitting quiz:', error);
      }
    }
  };

  const renderContent = (content: LessonContent) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none">
            {content.title && <h3 className="text-2xl font-bold mb-4">{content.title}</h3>}
            <p className="text-lg leading-relaxed whitespace-pre-line">{content.body}</p>
          </div>
        );

      case 'list':
        return (
          <div>
            {content.title && <h3 className="text-2xl font-bold mb-4">{content.title}</h3>}
            <ul className="space-y-3">
              {content.items?.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="text-success flex-shrink-0 mt-1" size={20} />
                  <span className="text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        );

      case 'quote':
        return (
          <div className="card bg-primary/10 border-r-4 border-primary">
            <div className="card-body">
              <blockquote className="text-xl italic">
                "{content.text}"
              </blockquote>
              {content.source && (
                <p className="text-sm text-gray-600 mt-2">— {content.source}</p>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="text-center">
            {content.title && <h3 className="text-2xl font-bold mb-4">{content.title}</h3>}
            {content.url ? (
              <img 
                src={content.url} 
                alt={content.title || 'درس'}
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
              />
            ) : (
              <div className="bg-base-200 rounded-lg p-12 flex flex-col items-center gap-4">
                <ImageIcon size={64} className="text-base-content/30" />
                <p className="text-base-content/50">لم يتم إضافة صورة</p>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div>
            {content.title && <h3 className="text-2xl font-bold mb-4">{content.title}</h3>}
            {content.url ? (
              <div className="aspect-video">
                <video 
                  controls 
                  className="w-full h-full rounded-lg shadow-lg"
                  poster={content.thumbnail}
                >
                  <source src={content.url} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-base-200 rounded-lg flex flex-col items-center justify-center gap-4">
                <Play size={64} className="text-base-content/30" />
                <p className="text-base-content/50">لم يتم إضافة فيديو</p>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div>
            {content.title && <h3 className="text-2xl font-bold mb-4">{content.title}</h3>}
            {content.url ? (
              <audio controls className="w-full">
                <source src={content.url} type="audio/mpeg" />
                متصفحك لا يدعم تشغيل الصوت
              </audio>
            ) : (
              <div className="bg-base-200 rounded-lg p-8 text-center">
                <p className="text-base-content/50">لم يتم إضافة ملف صوتي</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>الدرس غير موجود</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Lesson Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-6"
        >
          <div className="card-body">
            <h1 className="text-3xl md:text-4xl font-bold">{lesson.title}</h1>
            {lesson.title_en && (
              <p className="text-lg opacity-90">{lesson.title_en}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <BookOpen size={20} />
                <span>المستوى: {lesson.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{lesson.duration} دقيقة</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={20} />
                <span>{lesson.points} نقطة</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>التقدم</span>
            <span>
              {showQuiz 
                ? 'الاختبار'
                : `${currentContentIndex + 1} / ${lesson.content.length}`
              }
            </span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={showQuiz ? 100 : ((currentContentIndex + 1) / lesson.content.length) * 100}
            max="100"
          ></progress>
        </div>

        {/* Content or Quiz */}
        <AnimatePresence mode="wait">
          {!showQuiz ? (
            <motion.div
              key={currentContentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card bg-base-100 shadow-xl mb-6"
            >
              <div className="card-body">
                {renderContent(lesson.content[currentContentIndex])}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-base-100 shadow-xl mb-6"
            >
              <div className="card-body">
                {!quizResult ? (
                  <>
                    <h2 className="text-2xl font-bold mb-6">اختبار الدرس</h2>
                    {lesson.quiz?.map((question, qIdx) => (
                      <div key={qIdx} className="mb-6">
                        <p className="font-bold mb-3">{qIdx + 1}. {question.question}</p>
                        <div className="space-y-2">
                          {question.options.map((option, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${qIdx}`}
                                className="radio radio-primary"
                                checked={quizAnswers[qIdx] === oIdx}
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
                    <button onClick={handleSubmitQuiz} className="btn btn-primary">
                      إرسال الإجابات
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">
                      {quizResult.passed ? '🎉 ممتاز!' : '📚 حاول مرة أخرى'}
                    </h2>
                    <p className="text-xl mb-4">{quizResult.message}</p>
                    <div className="stats shadow mb-6">
                      <div className="stat">
                        <div className="stat-title">النتيجة</div>
                        <div className="stat-value">{quizResult.percentage.toFixed(0)}%</div>
                        <div className="stat-desc">{quizResult.score} / {quizResult.maxScore}</div>
                      </div>
                    </div>
                    {quizResult.certificate && (
                      <div className="alert alert-success mb-4">
                        <Award size={24} />
                        <span>تهانينا! حصلت على شهادة إتمام الدرس</span>
                      </div>
                    )}
                    <button onClick={handleCompleteLesson} className="btn btn-primary" disabled={isCompleting}>
                      {isCompleting ? 'جاري الحفظ...' : 'إتمام الدرس'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!showQuiz && !quizResult && (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentContentIndex === 0}
              className="btn btn-outline gap-2"
            >
              <ChevronRight size={20} />
              السابق
            </button>
            <button
              onClick={handleNext}
              className="btn btn-primary gap-2"
            >
              {currentContentIndex === lesson.content.length - 1 ? 'بدء الاختبار' : 'التالي'}
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
