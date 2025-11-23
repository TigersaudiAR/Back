import { useState } from "react";
import { X, Clock, Award, CheckCircle, PlayCircle, Volume2, FileText, Image as ImageIcon } from "lucide-react";
import type { Lesson, ContentBlock } from "../../types/lessons";

interface LessonDetailsProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  onSubmitQuiz: (answers: number[]) => Promise<any>;
}

function LessonDetails({ lesson, onClose, onComplete, onSubmitQuiz }: LessonDetailsProps) {
  const [currentSection, setCurrentSection] = useState<"content" | "quiz">("content");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleQuizSubmit = async () => {
    if (quizAnswers.length !== lesson.quiz?.length) {
      alert("يرجى الإجابة على جميع الأسئلة");
      return;
    }

    try {
      setSubmitting(true);
      const result = await onSubmitQuiz(quizAnswers);
      setQuizResult(result);
    } catch (error) {
      alert("حدث خطأ أثناء إرسال الاختبار");
    } finally {
      setSubmitting(false);
    }
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case "text":
        return (
          <div key={index} className="space-y-2">
            {block.title && <h3 className="text-xl font-bold text-accent">{block.title}</h3>}
            {block.body && <p className="text-gray-200 leading-relaxed whitespace-pre-line">{block.body}</p>}
          </div>
        );

      case "list":
        return (
          <div key={index} className="space-y-2">
            {block.title && <h3 className="text-xl font-bold text-accent">{block.title}</h3>}
            {block.items && (
              <ul className="list-disc list-inside space-y-2 text-gray-200">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            )}
          </div>
        );

      case "quote":
        return (
          <div key={index} className="border-r-4 border-accent bg-accent/10 p-4 rounded-lg">
            {block.text && <p className="text-gray-200 italic mb-2">{block.text}</p>}
            {block.source && <p className="text-sm text-gray-400">— {block.source}</p>}
          </div>
        );

      case "media":
        if (!block.media) return null;
        return (
          <div key={index} className="space-y-3">
            {block.media.title && <h3 className="text-xl font-bold text-accent">{block.media.title}</h3>}
            {block.media.description && <p className="text-gray-300 text-sm">{block.media.description}</p>}
            
            <div className="rounded-lg overflow-hidden bg-primary-dark/80 p-4">
              {block.media.type === "video" && (
                <div className="flex items-center gap-3 text-gray-300">
                  <PlayCircle className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-semibold">فيديو تعليمي</p>
                    {block.media.duration && (
                      <p className="text-sm text-gray-400">المدة: {Math.floor(block.media.duration / 60)} دقيقة</p>
                    )}
                  </div>
                </div>
              )}
              
              {block.media.type === "audio" && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Volume2 className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-semibold">تسجيل صوتي</p>
                    {block.media.duration && (
                      <p className="text-sm text-gray-400">المدة: {Math.floor(block.media.duration / 60)} دقيقة</p>
                    )}
                  </div>
                </div>
              )}
              
              {block.media.type === "image" && (
                <div className="flex items-center gap-3 text-gray-300">
                  <ImageIcon className="h-8 w-8 text-accent" />
                  <p className="font-semibold">صورة توضيحية</p>
                </div>
              )}
              
              {block.media.type === "document" && (
                <div className="flex items-center gap-3 text-gray-300">
                  <FileText className="h-8 w-8 text-accent" />
                  <p className="font-semibold">مستند للتحميل</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                ملاحظة: محتوى الوسائط متاح في النسخة الكاملة
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-primary-dark border-2 border-accent/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary-light/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-accent mb-2">{lesson.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration} دقيقة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{lesson.points} نقطة</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCurrentSection("content")}
              className={`btn btn-sm ${currentSection === "content" ? "btn-accent" : "btn-outline"}`}
            >
              المحتوى
            </button>
            {lesson.quiz && lesson.quiz.length > 0 && (
              <button
                onClick={() => setCurrentSection("quiz")}
                className={`btn btn-sm ${currentSection === "quiz" ? "btn-accent" : "btn-outline"}`}
              >
                الاختبار ({lesson.quiz.length})
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentSection === "content" ? (
            <>
              {/* Objectives */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-accent">أهداف الدرس</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-200">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Content Blocks */}
              {lesson.content.map((block, index) => renderContentBlock(block, index))}
            </>
          ) : (
            <>
              {quizResult ? (
                <div className="space-y-6">
                  {/* Quiz Results */}
                  <div className={`p-6 rounded-2xl ${quizResult.passed ? "bg-green-900/20 border-2 border-green-500/40" : "bg-red-900/20 border-2 border-red-500/40"}`}>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {quizResult.passed ? "✅ تهانينا! لقد نجحت" : "❌ للأسف، لم تنجح"}
                    </h3>
                    <p className="text-lg text-gray-200 mb-4">{quizResult.message}</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-primary-dark/60 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">النتيجة</p>
                        <p className="text-2xl font-bold text-accent">{quizResult.score}/{quizResult.maxScore}</p>
                      </div>
                      <div className="bg-primary-dark/60 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">النسبة</p>
                        <p className="text-2xl font-bold text-accent">{quizResult.percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                    {quizResult.bonusPoints > 0 && (
                      <div className="mt-4 p-3 bg-accent/20 rounded-lg text-center">
                        <p className="text-accent font-bold">حصلت على {quizResult.bonusPoints} نقطة إضافية!</p>
                      </div>
                    )}
                    {quizResult.certificate && (
                      <div className="mt-4 p-3 bg-yellow-500/20 border-2 border-yellow-500/40 rounded-lg text-center">
                        <p className="text-yellow-400 font-bold">🎓 حصلت على شهادة إتمام الدرس!</p>
                      </div>
                    )}
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-accent">التفاصيل</h3>
                    {quizResult.results.map((result: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${result.isCorrect ? "bg-green-900/20 border-green-500/40" : "bg-red-900/20 border-red-500/40"}`}>
                        <div className="flex items-start gap-2 mb-2">
                          {result.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                          )}
                          <p className="text-white font-semibold">{result.question}</p>
                        </div>
                        {!result.isCorrect && (
                          <p className="text-sm text-gray-300 mr-7 mb-2">
                            إجابتك: {lesson.quiz?.[index]?.options[result.userAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-400 mr-7">{result.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-gray-200">
                      هذا الاختبار يحتوي على {lesson.quiz?.length} أسئلة. يجب الحصول على 70% على الأقل للنجاح.
                    </p>
                  </div>

                  {lesson.quiz?.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 bg-primary-dark/60 rounded-lg border border-primary-light/30">
                      <p className="text-white font-semibold mb-4">
                        {qIndex + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                              quizAnswers[qIndex] === oIndex
                                ? "bg-accent/20 border-accent"
                                : "bg-primary-dark/40 border-primary-light/20 hover:border-accent/50"
                            }`}
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
                              className="radio radio-accent"
                            />
                            <span className="text-gray-200">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleQuizSubmit}
                    disabled={submitting || quizAnswers.length !== lesson.quiz?.length}
                    className="btn btn-accent w-full"
                  >
                    {submitting ? "جاري الإرسال..." : "إرسال الإجابات"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {currentSection === "content" && !quizResult && (
          <div className="p-6 border-t border-primary-light/30">
            <button onClick={onComplete} className="btn btn-accent w-full">
              <CheckCircle className="h-5 w-5" />
              إكمال الدرس
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonDetails;
