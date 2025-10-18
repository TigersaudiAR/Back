import { useMemo, useState } from "react";
import modulesData from "../../data/self_learn_modules.json";
import lessonsData from "../../data/self_learn_lessons.json";
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

  const lessonProgress = (lesson: LearningLesson) => {
    const completed = completedSteps[lesson.id]?.length ?? 0;
    return Math.round((completed / lesson.steps.length) * 100);
  };

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
            >
              {module.title}
            </button>
          ))}
        </div>
      </header>
      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4">
          {moduleLessons.map((lesson) => (
            <article
              key={lesson.id}
              className={`rounded-3xl border p-5 transition ${
                lesson.id === activeLesson?.id
                  ? "border-accent/60 bg-primary-dark/70"
                  : "border-primary-light/30 bg-primary-dark/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-accent">{lesson.title}</h3>
                  <p className="text-xs text-gray-300">المدة التقديرية: {lesson.duration}</p>
                </div>
                <button className="btn btn-xs" onClick={() => setActiveLessonId(lesson.id)}>
                  {lesson.id === activeLesson?.id ? "متابعة" : "بدء الدرس"}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-200">
                <span className="badge badge-outline">التقدم: {lessonProgress(lesson)}%</span>
                <span className="badge badge-outline">أهداف: {lesson.objectives.length}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pr-5 text-xs text-gray-300">
                {lesson.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="space-y-4 rounded-3xl border border-primary-light/40 bg-primary-dark/50 p-6">
          {activeLesson ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent">{activeLesson.title}</h3>
                <span className="badge badge-accent badge-outline">{activeLesson.duration}</span>
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
                      <ul className="mt-2 space-y-1 text-[0.75rem] leading-5 text-gray-300 list-disc pr-4">
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
