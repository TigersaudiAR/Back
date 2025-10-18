import { useMemo, useState } from "react";
import modulesData from "../../data/self_learn_modules.json";
import lessonsData from "../../data/self_learn_lessons.json";
import LessonStages from "../../components/self-learn/LessonStages";
import LessonQuizzes from "../../components/self-learn/LessonQuizzes";
import type { LearningLesson, LearningMap, LearningModule } from "../../types/learning";

const modules = modulesData as LearningModule[];
const lessonsMap = lessonsData as LearningMap;

const resourceTypeLabels: Record<string, string> = {
  interactive: "تفاعلي",
  audio: "صوتي",
  video: "مرئي",
  document: "وثائقي",
  guide: "إرشادي"
};

function SelfLearnPage() {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id ?? "");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
    const firstLessons = lessonsMap[modules[0]?.id ?? ""] ?? [];
    return firstLessons[0]?.id ?? null;
  });
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [stageProgress, setStageProgress] = useState<Record<string, string[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});

  const moduleLessons = useMemo(() => lessonsMap[activeModuleId] ?? [], [activeModuleId]);
  const activeLesson = useMemo(
    () => moduleLessons.find((lesson) => lesson.id === activeLessonId) ?? moduleLessons[0] ?? null,
    [moduleLessons, activeLessonId]
  );

  const toggleStep = (lessonId: string, index: number) => {
    setCompletedSteps((prev) => {
      const current = new Set(prev[lessonId] ?? []);
      if (current.has(index)) {
        current.delete(index);
      } else {
        current.add(index);
      }
      return { ...prev, [lessonId]: Array.from(current).sort((a, b) => a - b) };
    });
  };

  const toggleStage = (lessonId: string, stageId: string) => {
    setStageProgress((prev) => {
      const current = new Set(prev[lessonId] ?? []);
      if (current.has(stageId)) {
        current.delete(stageId);
      } else {
        current.add(stageId);
      }
      return { ...prev, [lessonId]: Array.from(current) };
    });
  };

  const handleQuizAnswer = (lessonId: string, questionId: string, choiceId: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] ?? {}),
        [questionId]: choiceId
      }
    }));
  };

  const handleQuizReset = (lesson: LearningLesson, quizId: string) => {
    setQuizAnswers((prev) => {
      const lessonAnswers = { ...(prev[lesson.id] ?? {}) };
      const quiz = lesson.quizzes.find((item) => item.id === quizId);

      if (quiz) {
        quiz.questions.forEach((question) => {
          delete lessonAnswers[question.id];
        });
      }

      return { ...prev, [lesson.id]: lessonAnswers };
    });
  };

  const getLessonStats = (lesson: LearningLesson) => {
    const stepsTotal = lesson.steps.length;
    const stepsCompleted = completedSteps[lesson.id]?.length ?? 0;
    const stagesTotal = lesson.stages.length;
    const stagesCompleted = stageProgress[lesson.id]?.length ?? 0;
    const answers = quizAnswers[lesson.id] ?? {};

    let totalQuestions = 0;
    let correctAnswers = 0;
    lesson.quizzes.forEach((quiz) => {
      quiz.questions.forEach((question) => {
        totalQuestions += 1;
        if (answers[question.id] === question.correctChoiceId) {
          correctAnswers += 1;
        }
      });
    });

    const totalSegments = stepsTotal + stagesTotal + totalQuestions;
    const completedSegments = stepsCompleted + stagesCompleted + correctAnswers;
    const progress = totalSegments > 0 ? Math.round((completedSegments / totalSegments) * 100) : 0;

    return {
      stepsTotal,
      stepsCompleted,
      stagesTotal,
      stagesCompleted,
      totalQuestions,
      correctAnswers,
      progress
    };
  };

  const activeLessonStats = activeLesson ? getLessonStats(activeLesson) : null;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">التعليم الذاتي</h2>
        <p className="text-sm text-gray-300">
          مسارات مصممة لتعليم العربية والتجويد والحفظ بوسائل تفاعلية، مع تقييم صوتي وتذكيرات يومية.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`btn btn-sm ${module.id === activeModuleId ? "btn-accent" : "btn-outline"}`}
              onClick={() => {
                setActiveModuleId(module.id);
                const firstLesson = lessonsMap[module.id]?.[0];
                setActiveLessonId(firstLesson?.id ?? null);
              }}
              aria-pressed={module.id === activeModuleId}
            >
              {module.title}
            </button>
          ))}
        </div>
      </header>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)]">
        <div className="space-y-4">
          {moduleLessons.map((lesson) => {
            const stats = getLessonStats(lesson);
            return (
              <article
                key={lesson.id}
                className={`rounded-3xl border p-5 transition ${
                  lesson.id === activeLesson?.id
                    ? "border-accent/60 bg-primary-dark/70"
                    : "border-primary-light/30 bg-primary-dark/50 hover:border-accent/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-accent">{lesson.title}</h3>
                    <p className="text-xs text-gray-300">المدة التقديرية: {lesson.duration}</p>
                  </div>
                  <button className="btn btn-xs" onClick={() => setActiveLessonId(lesson.id)}>
                    {lesson.id === activeLesson?.id ? "متابعة" : "بدء الدرس"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-200">
                  <span className="badge badge-outline">التقدم: {stats.progress}%</span>
                  <span className="badge badge-outline">أهداف: {lesson.objectives.length}</span>
                  {stats.stagesTotal > 0 && (
                    <span className="badge badge-outline">
                      مراحل: {stats.stagesCompleted}/{stats.stagesTotal}
                    </span>
                  )}
                  {stats.totalQuestions > 0 && (
                    <span className="badge badge-outline">
                      اختبارات: {stats.correctAnswers}/{stats.totalQuestions}
                    </span>
                  )}
                </div>
                <ul className="mt-3 list-disc space-y-1 pr-5 text-xs text-gray-300">
                  {lesson.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <div className="space-y-5 rounded-3xl border border-primary-light/40 bg-primary-dark/50 p-6">
          {activeLesson && activeLessonStats ? (
            <>
              <div className="space-y-4 rounded-3xl border border-primary-light/20 bg-primary-dark/70 p-4 shadow-inner">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-accent">{activeLesson.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                      <span className="badge badge-outline">المدة: {activeLesson.duration}</span>
                      <span className="badge badge-outline">
                        أهداف الدرس: {activeLesson.objectives.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-100 sm:grid-cols-3">
                    <div className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-3 text-center">
                      <span className="block text-[0.7rem] text-primary-light/80">خطوات منجزة</span>
                      <span className="mt-1 block text-sm font-semibold text-accent">
                        {activeLessonStats.stepsCompleted}/{activeLessonStats.stepsTotal}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-3 text-center">
                      <span className="block text-[0.7rem] text-primary-light/80">مراحل متقدمة</span>
                      <span className="mt-1 block text-sm font-semibold text-accent">
                        {activeLessonStats.stagesCompleted}/{activeLessonStats.stagesTotal}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 p-3 text-center">
                      <span className="block text-[0.7rem] text-primary-light/80">إجابات صحيحة</span>
                      <span className="mt-1 block text-sm font-semibold text-accent">
                        {activeLessonStats.correctAnswers}/{activeLessonStats.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>نسبة الإنجاز الشاملة</span>
                    <span className="font-semibold text-accent">{activeLessonStats.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-primary-light/15">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-accent via-primary to-primary-light transition-all"
                      style={{ width: `${activeLessonStats.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-200">
                <h4 className="text-accent">خطوات الدرس</h4>
                <ul className="space-y-2">
                  {activeLesson.steps.map((step, index) => {
                    const completed = completedSteps[activeLesson.id]?.includes(index) ?? false;
                    return (
                      <li
                        key={step}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-xs transition ${
                          completed ? "border-accent/60 bg-accent/20 text-accent" : "border-primary-light/30 bg-primary-dark/70"
                        }`}
                        onClick={() => toggleStep(activeLesson.id, index)}
                      >
                        <span className="badge badge-outline">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <LessonStages
                stages={activeLesson.stages}
                completedStageIds={stageProgress[activeLesson.id] ?? []}
                onToggleStage={(stageId) => toggleStage(activeLesson.id, stageId)}
              />
              <LessonQuizzes
                quizzes={activeLesson.quizzes}
                answers={quizAnswers[activeLesson.id] ?? {}}
                onAnswer={(_, questionId, choiceId) => handleQuizAnswer(activeLesson.id, questionId, choiceId)}
                onResetQuiz={(quizId) => handleQuizReset(activeLesson, quizId)}
              />
              <div className="space-y-3 text-sm text-gray-200">
                <h4 className="text-accent">مصادر الدرس المدمجة</h4>
                <ul className="space-y-3 text-xs">
                  {activeLesson.resources.map((resource) => (
                    <li
                      key={resource.label}
                      className="rounded-2xl border border-primary-light/30 bg-primary-dark/70 p-3 shadow-inner"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-accent">
                        <span className="font-semibold">{resource.label}</span>
                        <span className="badge badge-outline">{resourceTypeLabels[resource.type] ?? resource.type}</span>
                      </div>
                      <p className="mt-2 text-[0.8rem] leading-6 text-gray-200">{resource.description}</p>
                      <ul className="mt-2 space-y-1 pr-4 text-[0.75rem] leading-5 text-gray-300 list-disc">
                        {resource.instructions.map((instruction) => (
                          <li key={instruction}>{instruction}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">اختر درسًا لعرض تفاصيله التفاعلية.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default SelfLearnPage;
