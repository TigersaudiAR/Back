import { useEffect, useMemo, useState } from "react";
import modulesData from "../../data/self_learn_modules.json";
import lessonsData from "../../data/self_learn_lessons.json";
import LessonStages from "../../components/self-learn/LessonStages";
import LessonQuizzes from "../../components/self-learn/LessonQuizzes";
import type {
  LearningLesson,
  LearningMap,
  LearningModule,
  LearningResource,
  LessonQuiz,
  LessonQuizQuestion,
  LessonStage
} from "../../types/learning";

type UnknownRecord = Record<string, unknown>;

const moduleLevels: ReadonlyArray<LearningModule["level"]> = ["beginner", "intermediate", "advanced"];
const resourceTypes: ReadonlyArray<LearningResource["type"]> = [
  "audio",
  "video",
  "document",
  "interactive",
  "guide"
];
const quizTypes: ReadonlyArray<LessonQuiz["type"]> = ["checkpoint", "final"];

const logDataIssue = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- surfaced only during development for data validation
    console.warn("[SelfLearn]", ...args);
  }
};

const ensureString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const ensureStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => ensureString(item)).filter((item) => item.length > 0) : [];

const ensureResource = (value: unknown): LearningResource | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UnknownRecord;
  const label = ensureString(record.label);
  if (!label) {
    return null;
  }

  const typeValue = ensureString(record.type);
  const type = resourceTypes.includes(typeValue as LearningResource["type"]) ? (typeValue as LearningResource["type"]) : "guide";

  return {
    label,
    type,
    description: ensureString(record.description),
    instructions: ensureStringArray(record.instructions)
  };
};

const ensureStage = (value: unknown): LessonStage | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UnknownRecord;
  const id = ensureString(record.id);
  const title = ensureString(record.title);
  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    description: ensureString(record.description),
    tip: ensureString(record.tip),
    challenge: ensureString(record.challenge)
  };
};

const ensureQuizQuestion = (value: unknown): LessonQuizQuestion | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UnknownRecord;
  const id = ensureString(record.id);
  const prompt = ensureString(record.prompt);
  if (!id || !prompt) {
    return null;
  }

  const choices = Array.isArray(record.choices)
    ? record.choices
        .map((choice) => {
          if (!choice || typeof choice !== "object") {
            return null;
          }

          const choiceRecord = choice as UnknownRecord;
          const choiceId = ensureString(choiceRecord.id);
          const label = ensureString(choiceRecord.label);
          if (!choiceId || !label) {
            return null;
          }

          const hint = ensureString(choiceRecord.hint);

          return hint ? { id: choiceId, label, hint } : { id: choiceId, label };
        })
        .filter((choice): choice is LessonQuizQuestion["choices"][number] => Boolean(choice))
    : [];

  if (!choices.length) {
    return null;
  }

  const correctChoiceIdCandidate = ensureString(record.correctChoiceId);
  const correctChoiceId = choices.some((choice) => choice.id === correctChoiceIdCandidate)
    ? correctChoiceIdCandidate
    : choices[0].id;

  return {
    id,
    prompt,
    choices,
    correctChoiceId,
    explanation: ensureString(record.explanation)
  };
};

const ensureQuiz = (value: unknown): LessonQuiz | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UnknownRecord;
  const id = ensureString(record.id);
  const title = ensureString(record.title);
  if (!id || !title) {
    return null;
  }

  const typeValue = ensureString(record.type);
  const type = quizTypes.includes(typeValue as LessonQuiz["type"]) ? (typeValue as LessonQuiz["type"]) : "checkpoint";

  const questions = Array.isArray(record.questions)
    ? record.questions
        .map((question) => ensureQuizQuestion(question))
        .filter((question): question is LessonQuizQuestion => Boolean(question))
    : [];

  return {
    id,
    type,
    title,
    description: ensureString(record.description),
    questions
  };
};

const ensureLesson = (value: unknown): LearningLesson | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UnknownRecord;
  const id = ensureString(record.id);
  const title = ensureString(record.title);
  if (!id || !title) {
    return null;
  }

  const resources = Array.isArray(record.resources)
    ? record.resources
        .map((resource) => ensureResource(resource))
        .filter((resource): resource is LearningResource => Boolean(resource))
    : [];

  const stages = Array.isArray(record.stages)
    ? record.stages.map((stage) => ensureStage(stage)).filter((stage): stage is LessonStage => Boolean(stage))
    : [];

  const quizzes = Array.isArray(record.quizzes)
    ? record.quizzes.map((quiz) => ensureQuiz(quiz)).filter((quiz): quiz is LessonQuiz => Boolean(quiz))
    : [];

  return {
    id,
    title,
    duration: ensureString(record.duration),
    objectives: ensureStringArray(record.objectives),
    steps: ensureStringArray(record.steps),
    resources,
    stages,
    quizzes
  };
};

const parseModules = (data: unknown): LearningModule[] => {
  if (!Array.isArray(data)) {
    logDataIssue("قائمة الوحدات غير صالحة");
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as UnknownRecord;
      const id = ensureString(record.id);
      const title = ensureString(record.title);
      if (!id || !title) {
        logDataIssue("تم تجاهل وحدة تعليمية بدون معرف أو عنوان", item);
        return null;
      }

      const levelCandidate = ensureString(record.level);
      const level = moduleLevels.includes(levelCandidate as LearningModule["level"])
        ? (levelCandidate as LearningModule["level"])
        : "beginner";

      return {
        id,
        title,
        description: ensureString(record.description),
        level,
        badges: ensureStringArray(record.badges)
      } satisfies LearningModule;
    })
    .filter((module): module is LearningModule => Boolean(module));
};

const parseLessons = (data: unknown): LearningMap => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    logDataIssue("خريطة الدروس غير صالحة");
    return {};
  }

  const entries = Object.entries(data as Record<string, unknown>);
  return entries.reduce<LearningMap>((acc, [moduleId, lessons]) => {
    if (!Array.isArray(lessons)) {
      logDataIssue("تم تجاهل دروس غير صالحة للوحدة", moduleId);
      return acc;
    }

    const parsedLessons = lessons
      .map((lesson) => ensureLesson(lesson))
      .filter((lesson): lesson is LearningLesson => Boolean(lesson));

    if (parsedLessons.length) {
      acc[moduleId] = parsedLessons;
    }

    return acc;
  }, {});
};

const arraysShallowEqual = <T,>(first: T[], second: T[]) =>
  first.length === second.length && first.every((value, index) => Object.is(value, second[index]));

const sanitizeStepProgress = (
  progress: Record<string, number[]>,
  lookup: Map<string, LearningLesson>
): Record<string, number[]> => {
  let changed = false;
  const nextEntries: Array<[string, number[]]> = [];

  Object.entries(progress).forEach(([lessonId, indexes]) => {
    const lesson = lookup.get(lessonId);
    if (!lesson) {
      changed = true;
      return;
    }

    const filtered = indexes.filter(
      (value) => Number.isInteger(value) && value >= 0 && value < lesson.steps.length
    );

    if (filtered.length !== indexes.length || !arraysShallowEqual(filtered, indexes)) {
      changed = true;
    }

    if (filtered.length) {
      nextEntries.push([lessonId, filtered]);
    } else if (indexes.length) {
      changed = true;
    }
  });

  if (!changed && nextEntries.length === Object.keys(progress).length) {
    return progress;
  }

  return Object.fromEntries(nextEntries);
};

const sanitizeStageProgress = (
  progress: Record<string, string[]>,
  lookup: Map<string, LearningLesson>
): Record<string, string[]> => {
  let changed = false;
  const nextEntries: Array<[string, string[]]> = [];

  Object.entries(progress).forEach(([lessonId, stageIds]) => {
    const lesson = lookup.get(lessonId);
    if (!lesson) {
      changed = true;
      return;
    }

    const stageOrder = new Map(lesson.stages.map((stage, index) => [stage.id, index] as const));
    const filtered = stageIds.filter((stageId) => stageOrder.has(stageId));
    const sorted = filtered.slice().sort((firstId, secondId) => {
      const firstOrder = stageOrder.get(firstId);
      const secondOrder = stageOrder.get(secondId);
      if (firstOrder === undefined && secondOrder === undefined) {
        return firstId.localeCompare(secondId);
      }
      if (firstOrder === undefined) {
        return 1;
      }
      if (secondOrder === undefined) {
        return -1;
      }
      return firstOrder - secondOrder;
    });

    if (filtered.length !== stageIds.length || !arraysShallowEqual(sorted, stageIds)) {
      changed = true;
    }

    if (sorted.length) {
      nextEntries.push([lessonId, sorted]);
    } else if (stageIds.length) {
      changed = true;
    }
  });

  if (!changed && nextEntries.length === Object.keys(progress).length) {
    return progress;
  }

  return Object.fromEntries(nextEntries);
};

const sanitizeQuizAnswers = (
  answers: Record<string, Record<string, string>>,
  lookup: Map<string, LearningLesson>
): Record<string, Record<string, string>> => {
  let changed = false;
  const next: Record<string, Record<string, string>> = {};

  Object.entries(answers).forEach(([lessonId, lessonAnswers]) => {
    const lesson = lookup.get(lessonId);
    if (!lesson) {
      changed = true;
      return;
    }

    const validQuestionChoices = new Map<string, Set<string>>();
    lesson.quizzes.forEach((quiz) => {
      quiz.questions.forEach((question) => {
        validQuestionChoices.set(
          question.id,
          new Set(question.choices.map((choice) => choice.id))
        );
      });
    });

    const filtered: Record<string, string> = {};
    Object.entries(lessonAnswers).forEach(([questionId, choiceId]) => {
      const choices = validQuestionChoices.get(questionId);
      if (choices?.has(choiceId)) {
        filtered[questionId] = choiceId;
      } else {
        changed = true;
      }
    });

    const previousKeys = Object.keys(lessonAnswers);
    const nextKeys = Object.keys(filtered);
    if (
      !changed &&
      (previousKeys.length !== nextKeys.length ||
        nextKeys.some((key) => lessonAnswers[key] !== filtered[key]))
    ) {
      changed = true;
    }

    if (nextKeys.length) {
      next[lessonId] = filtered;
    } else if (previousKeys.length) {
      changed = true;
    }
  });

  if (!changed && Object.keys(answers).length === Object.keys(next).length) {
    return answers;
  }

  return next;
};

const resourceTypeLabels: Record<LearningResource["type"], string> = {
  interactive: "تفاعلي",
  audio: "صوتي",
  video: "مرئي",
  document: "وثائقي",
  guide: "إرشادي"
};

function SelfLearnPage() {
  const modules = useMemo(() => parseModules(modulesData), []);
  const lessonsMap = useMemo(() => parseLessons(lessonsData), []);
  const lessonLookup = useMemo(() => {
    const map = new Map<string, LearningLesson>();
    Object.values(lessonsMap).forEach((lessonList) => {
      lessonList.forEach((lesson) => {
        map.set(lesson.id, lesson);
      });
    });
    return map;
  }, [lessonsMap]);

  const [activeModuleId, setActiveModuleId] = useState(() => modules[0]?.id ?? "");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
    const initialModuleId = modules[0]?.id;
    if (!initialModuleId) {
      return null;
    }
    const firstLessons = lessonsMap[initialModuleId] ?? [];
    return firstLessons[0]?.id ?? null;
  });
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [stageProgress, setStageProgress] = useState<Record<string, string[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});

  const moduleLessons = useMemo(() => lessonsMap[activeModuleId] ?? [], [lessonsMap, activeModuleId]);
  const activeLesson = useMemo(
    () => moduleLessons.find((lesson) => lesson.id === activeLessonId) ?? moduleLessons[0] ?? null,
    [moduleLessons, activeLessonId]
  );

  useEffect(() => {
    if (!modules.length) {
      if (activeModuleId !== "") {
        setActiveModuleId("");
      }
      return;
    }

    const exists = modules.some((module) => module.id === activeModuleId);
    if (!exists) {
      setActiveModuleId(modules[0].id);
    }
  }, [modules, activeModuleId]);

  useEffect(() => {
    if (!moduleLessons.length) {
      if (activeLessonId !== null) {
        setActiveLessonId(null);
      }
      return;
    }

    const exists = moduleLessons.some((lesson) => lesson.id === activeLessonId);
    if (!exists) {
      setActiveLessonId(moduleLessons[0].id);
    }
  }, [moduleLessons, activeLessonId]);

  useEffect(() => {
    setCompletedSteps((prev) => sanitizeStepProgress(prev, lessonLookup));
    setStageProgress((prev) => sanitizeStageProgress(prev, lessonLookup));
    setQuizAnswers((prev) => sanitizeQuizAnswers(prev, lessonLookup));
  }, [lessonLookup]);

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

      const lesson = lessonLookup.get(lessonId);
      if (lesson) {
        const stageOrder = new Map(lesson.stages.map((stage, index) => [stage.id, index] as const));
        const sorted = Array.from(current).sort((firstId, secondId) => {
          const firstOrder = stageOrder.get(firstId);
          const secondOrder = stageOrder.get(secondId);
          if (firstOrder === undefined && secondOrder === undefined) {
            return firstId.localeCompare(secondId);
          }
          if (firstOrder === undefined) {
            return 1;
          }
          if (secondOrder === undefined) {
            return -1;
          }
          return firstOrder - secondOrder;
        });

        return { ...prev, [lessonId]: sorted };
      }

      return { ...prev, [lessonId]: Array.from(current) };
    });
  };

  const handleQuizAnswer = (lessonId: string, questionId: string, choiceId: string) => {
    setQuizAnswers((prev) => {
      if (prev[lessonId]?.[questionId] === choiceId) {
        return prev;
      }

      return {
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] ?? {}),
          [questionId]: choiceId
        }
      };
    });
  };

  const handleQuizReset = (lessonId: string, quizId: string) => {
    const lesson = lessonLookup.get(lessonId);
    if (!lesson) {
      return;
    }

    setQuizAnswers((prev) => {
      const lessonAnswers = { ...(prev[lessonId] ?? {}) };
      const quiz = lesson.quizzes.find((item) => item.id === quizId);

      if (!quiz) {
        return prev;
      }

      let updated = false;
      quiz.questions.forEach((question) => {
        if (question.id in lessonAnswers) {
          delete lessonAnswers[question.id];
          updated = true;
        }
      });

      if (!updated) {
        return prev;
      }

      return { ...prev, [lessonId]: lessonAnswers };
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

  if (!modules.length) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-accent">التعليم الذاتي</h2>
          <p className="mt-2 text-sm text-gray-300">
            لم يتم تحميل أي مسارات تعليمية حالياً. يرجى التحقق من البيانات أو المحاولة لاحقًا.
          </p>
        </header>
      </div>
    );
  }

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
          {moduleLessons.length ? (
            moduleLessons.map((lesson) => {
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
            })
          ) : (
            <div className="rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-6 text-center text-sm text-gray-300">
              لا توجد دروس متاحة حالياً لهذه الوحدة.
            </div>
          )}
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
                onResetQuiz={(quizId) => handleQuizReset(activeLesson.id, quizId)}
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
