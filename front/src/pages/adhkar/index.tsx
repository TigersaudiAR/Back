import { useMemo, useState } from "react";
import sets from "../../data/adhkar_sets.json";
import TasbihSmart from "../../components/TasbihSmart";
import type { DhikrSet } from "../../types/adhkar";

function detectSet(adhkarSets: DhikrSet[]): DhikrSet {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return adhkarSets.find((set) => set.name === "morning") ?? adhkarSets[0];
  }
  if (hour >= 16 || hour < 4) {
    return adhkarSets.find((set) => set.name === "evening") ?? adhkarSets[0];
  }
  return adhkarSets[0];
}

function AdhkarPage() {
  const adhkarSets = sets as DhikrSet[];
  const [currentSetId, setCurrentSetId] = useState(() => detectSet(adhkarSets).id);

  const currentSet = useMemo(
    () => adhkarSets.find((set) => set.id === currentSetId) ?? adhkarSets[0],
    [adhkarSets, currentSetId]
  );

  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">الأذكار والأدعية</h2>
        <p className="text-sm text-gray-300">
          تتغير الأذكار حسب الوقت تلقائيًا، ويمكنك تشغيل المسبحة الذكية للنقر أو بالصوت أو بالإيقاع.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {adhkarSets.map((set) => (
            <button
              key={set.id}
              className={`btn btn-sm ${set.id === currentSetId ? "btn-accent" : "btn-outline"}`}
              onClick={() => setCurrentSetId(set.id)}
            >
              {set.name === "morning"
                ? "أذكار الصباح"
                : set.name === "evening"
                ? "أذكار المساء"
                : set.name === "after_prayer"
                ? "بعد الصلاة"
                : "أخرى"}
            </button>
          ))}
        </div>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        {currentSet.items.map((item) => (
          <TasbihSmart key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default AdhkarPage;
