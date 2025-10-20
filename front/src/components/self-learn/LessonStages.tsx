import { useMemo } from "react";
import { CheckCircle2, Sparkles, Target } from "lucide-react";
import clsx from "clsx";
import type { LessonStage } from "../../types/learning";

type LessonStagesProps = {
  stages: LessonStage[];
  completedStageIds: string[];
  onToggleStage: (stageId: string) => void;
};

const typeBadges = [
  "bg-gradient-to-l from-accent/80 via-primary/70 to-primary-light/60",
  "bg-gradient-to-l from-primary/80 via-primary-light/70 to-accent/60",
  "bg-gradient-to-l from-emerald-500/70 via-emerald-400/60 to-accent/60"
];

function LessonStages({ stages, completedStageIds, onToggleStage }: LessonStagesProps) {
  const completedSet = useMemo(() => new Set(completedStageIds), [completedStageIds]);

  if (!stages.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-5 shadow-inner">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-accent">
          <Sparkles className="h-5 w-5" aria-hidden />
          <h4 className="text-base font-semibold">مراحل التقدم الذكي</h4>
        </div>
        <span className="badge badge-outline badge-accent text-xs">
          {completedSet.size} / {stages.length} مرحلة مكتملة
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const completed = completedSet.has(stage.id);
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => onToggleStage(stage.id)}
                className={clsx(
                  "w-full rounded-2xl border p-4 text-right transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                  completed
                    ? "border-accent/60 bg-accent/15 text-accent"
                    : "border-primary-light/25 bg-primary-dark/70 hover:border-accent/40 hover:bg-primary-dark/60"
                )}
                aria-pressed={completed}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={clsx(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs text-primary-dark shadow-md",
                        typeBadges[index % typeBadges.length]
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>{stage.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {completed ? (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> تم الإنجاز
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-primary-light/80">
                        <Target className="h-4 w-4" aria-hidden /> جاهزة للتجربة
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-6 text-gray-200">{stage.description}</p>
                <div className="mt-3 grid gap-2 text-[0.7rem] text-gray-300 sm:grid-cols-2">
                  <div className="rounded-xl border border-primary-light/20 bg-primary-dark/60 p-2">
                    <span className="block text-[0.65rem] text-primary-light/80">نصيحة سريعة</span>
                    <p className="mt-1 leading-5 text-gray-100">{stage.tip}</p>
                  </div>
                  <div className="rounded-xl border border-primary-light/20 bg-primary-dark/60 p-2">
                    <span className="block text-[0.65rem] text-primary-light/80">تحدي المرحلة</span>
                    <p className="mt-1 leading-5 text-gray-100">{stage.challenge}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default LessonStages;
