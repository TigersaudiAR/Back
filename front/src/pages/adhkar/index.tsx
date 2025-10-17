import { useEffect, useMemo, useState } from "react";
import TasbihSmart from "../../components/TasbihSmart";
import type { DhikrSet } from "../../types/adhkar";
import api from "../../lib/api";

const resolveLabel = (set: DhikrSet) => {
  const normalized = set.name.toLowerCase();
  const labels: Record<string, string> = {
    morning: "أذكار الصباح",
    evening: "أذكار المساء",
    "after-prayer": "بعد الصلاة",
    sleep: "قبل النوم",
    waking: "عند الاستيقاظ",
    home: "المنزل والمواضع",
    travel: "السفر",
    relief: "الكرب والهم",
    illness: "الشفاء والرقية"
  };
  return set.title ?? labels[normalized] ?? set.name;
};

const detectSet = (adhkarSets: DhikrSet[]): DhikrSet | null => {
  if (!adhkarSets.length) return null;
  const hour = new Date().getHours();
  const findByName = (substring: string) =>
    adhkarSets.find((set) => set.name.toLowerCase().includes(substring));

  if (hour >= 4 && hour < 12) {
    return findByName("morning") ?? adhkarSets[0];
  }
  if (hour >= 16 || hour < 4) {
    return findByName("evening") ?? adhkarSets[0];
  }
  return findByName("after") ?? findByName("home") ?? adhkarSets[0];
};

function AdhkarPage() {
  const [adhkarSets, setAdhkarSets] = useState<DhikrSet[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await api.get<{ all: DhikrSet[]; set: DhikrSet }>("/adhkar");
        if (cancelled) return;
        setAdhkarSets(response.data.all);
        setCurrentSetId(response.data.set.id);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل الأذكار، سيتم عرض النسخة المخزنة إن وجدت.");
          const cache = localStorage.getItem("adhkar-cache");
          if (cache) {
            const parsed = JSON.parse(cache) as DhikrSet[];
            setAdhkarSets(parsed);
            setCurrentSetId(detectSet(parsed)?.id ?? null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (adhkarSets.length) {
      localStorage.setItem("adhkar-cache", JSON.stringify(adhkarSets));
      if (!currentSetId) {
        setCurrentSetId(detectSet(adhkarSets)?.id ?? adhkarSets[0].id);
      }
    }
  }, [adhkarSets, currentSetId]);

  const currentSet = useMemo(() => {
    if (!adhkarSets.length) return null;
    const match = adhkarSets.find((set) => set.id === currentSetId);
    return match ?? detectSet(adhkarSets);
  }, [adhkarSets, currentSetId]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">الأذكار والأدعية</h2>
        <p className="text-sm text-gray-300">
          تتغير الأذكار حسب الوقت تلقائيًا، ويمكنك تشغيل المسبحة الذكية للنقر أو بالصوت أو بالإيقاع.
        </p>
        {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {adhkarSets.map((set) => (
            <button
              key={set.id}
              className={`btn btn-sm ${set.id === currentSet?.id ? "btn-accent" : "btn-outline"}`}
              onClick={() => setCurrentSetId(set.id)}
            >
              {resolveLabel(set)}
            </button>
          ))}
        </div>
      </header>
      {loading && <p className="text-center text-sm text-gray-400">جاري تحميل الأذكار...</p>}
      {!loading && currentSet && (
        <section className="space-y-4">
          {currentSet.description && (
            <p className="text-xs text-gray-300">{currentSet.description}</p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {currentSet.items.map((item) => (
              <TasbihSmart key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdhkarPage;
