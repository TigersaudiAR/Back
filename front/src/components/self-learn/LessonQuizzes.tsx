import { useMemo } from "react";
import { CheckCircle2, HelpCircle, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import clsx from "clsx";
import type { LessonQuiz } from "../../types/learning";

type LessonQuizzesProps = {
  quizzes: LessonQuiz[];
  answers: Record<string, string>;
  onAnswer: (quizId: string, questionId: string, choiceId: string) => void;
  onResetQuiz: (quizId: string) => void;
};

const quizTypeLabels: Record<LessonQuiz["type"], string> = {
  checkpoint: "اختبار مرحلي",
  final: "الاختبار النهائي"
};

const quizBadgeStyles: Record<LessonQuiz["type"], string> = {
  checkpoint: "badge badge-info badge-outline text-xs",
  final: "badge badge-warning badge-outline text-xs"
};

function LessonQuizzes({ quizzes, answers, onAnswer, onResetQuiz }: LessonQuizzesProps) {
  const quizzesWithStats = useMemo(
    () =>
      quizzes.map((quiz) => {
        const totalQuestions = quiz.questions.length;
        const answeredCorrect = quiz.questions.filter(
          (question) => answers[question.id] && answers[question.id] === question.correctChoiceId
        ).length;
        const answeredCount = quiz.questions.filter((question) => Boolean(answers[question.id])).length;
        const completion = totalQuestions > 0 ? Math.round((answeredCorrect / totalQuestions) * 100) : 0;

        return {
          quiz,
          totalQuestions,
          answeredCorrect,
          answeredCount,
          completion
        };
      }),
    [answers, quizzes]
  );

  if (!quizzes.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-5 shadow-inner">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-accent">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          <h4 className="text-base font-semibold">اختبارات التتبع الذكي</h4>
        </div>
        <p className="text-xs text-gray-300">
          راجع إجاباتك فورًا واحصل على تفسير ذكي لكل سؤال.
        </p>
      </div>
      <div className="mt-4 space-y-5">
        {quizzesWithStats.map(({ quiz, totalQuestions, answeredCorrect, answeredCount, completion }) => (
          <article
            key={quiz.id}
            className="rounded-3xl border border-primary-light/20 bg-primary-dark/70 p-4 shadow-lg"
          >
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={quizBadgeStyles[quiz.type]}>{quizTypeLabels[quiz.type]}</span>
                  <h5 className="text-sm font-semibold text-accent">{quiz.title}</h5>
                </div>
                <p className="text-xs leading-6 text-gray-300">{quiz.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-200">
                <span>
                  نتيجة: {answeredCorrect}/{totalQuestions}
                </span>
                <span>
                  مكتمل: {answeredCount}/{totalQuestions}
                </span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-primary-light/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-accent via-primary to-primary-light transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                {answeredCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1 text-accent"
                    onClick={() => onResetQuiz(quiz.id)}
                  >
                    <RefreshCcw className="h-3 w-3" aria-hidden /> إعادة التقييم
                  </button>
                )}
              </div>
            </header>
            <div className="mt-4 space-y-4">
              {quiz.questions.map((question) => {
                const selectedChoice = answers[question.id];
                const isCorrect = selectedChoice === question.correctChoiceId;

                return (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-4"
                  >
                    <p className="text-sm font-medium text-accent">{question.prompt}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {question.choices.map((choice) => {
                        const isSelected = selectedChoice === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            className={clsx(
                              "rounded-xl border px-3 py-2 text-right text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                              isSelected
                                ? isCorrect && choice.id === question.correctChoiceId
                                  ? "border-accent bg-accent/20 text-accent"
                                  : "border-red-400/60 bg-red-500/10 text-red-200"
                                : "border-primary-light/20 bg-primary-dark/70 text-gray-200 hover:border-accent/40"
                            )}
                            onClick={() => onAnswer(quiz.id, question.id, choice.id)}
                            title={choice.hint}
                          >
                            <span className="block font-semibold">{choice.label}</span>
                            {choice.hint && !isSelected && (
                              <span className="mt-1 block text-[0.65rem] text-primary-light/70">اضغط للاطلاع على التلميح</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedChoice && (
                      <div
                        className={clsx(
                          "mt-3 flex flex-col gap-2 rounded-xl border px-3 py-2 text-xs",
                          isCorrect
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : "border-red-400/40 bg-red-500/10 text-red-200"
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                          ) : (
                            <XCircle className="h-4 w-4" aria-hidden />
                          )}
                          {isCorrect ? "إجابة صحيحة" : "إجابة غير دقيقة"}
                        </div>
                        <p className="leading-6 text-gray-100">{question.explanation}</p>
                        {!isCorrect && question.choices.some((choice) => choice.id === selectedChoice && choice.hint) && (
                          <p className="flex items-center gap-2 text-[0.7rem] text-primary-light/80">
                            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                            {question.choices.find((choice) => choice.id === selectedChoice)?.hint}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LessonQuizzes;
