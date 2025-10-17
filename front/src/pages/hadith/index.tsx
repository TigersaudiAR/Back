import { useEffect, useMemo, useState } from "react";
import HadithCard from "../../components/HadithCard";
import api from "../../lib/api";
import type { Hadith } from "../../types/hadith";

function HadithPage() {
  const [query, setQuery] = useState("");
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await api.get<{ hadith: Hadith[] }>("/hadith");
        if (cancelled) return;
        setHadithList(response.data.hadith);
        setError(null);
        localStorage.setItem("hadith-cache", JSON.stringify(response.data.hadith));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل الأحاديث، سيتم عرض النسخة المخزنة إن وجدت.");
          const cache = localStorage.getItem("hadith-cache");
          if (cache) {
            setHadithList(JSON.parse(cache) as Hadith[]);
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

  const filtered = useMemo(() => {
    if (!query) return hadithList;
    return hadithList.filter(
      (hadith) =>
        hadith.text_ar.includes(query) ||
        (Array.isArray(hadith.topic)
          ? hadith.topic.some((topic) => topic.includes(query))
          : hadith.topic?.includes(query) ?? false) ||
        (hadith.title?.includes(query) ?? false) ||
        (hadith.narrator?.includes(query) ?? false) ||
        (hadith.source?.includes(query) ?? false)
    );
  }, [hadithList, query]);

  return (
    <div className="space-y-6">
      <header className="space-y-3 rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">الأحاديث النبوية</h2>
        <p className="text-sm text-gray-300">جميع الأحاديث من مصادر معتمدة مثل كتب الصحيحين وشروح العلماء المتخصصين.</p>
        <input
          className="input input-bordered w-full max-w-lg"
          placeholder="ابحث عن موضوع أو كلمة"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {error && <p className="text-xs text-amber-300">{error}</p>}
      </header>
      {loading && <p className="text-center text-sm text-gray-400">جاري تحميل الأحاديث...</p>}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((hadith) => (
            <HadithCard key={hadith.id} hadith={hadith} />
          ))}
          {!filtered.length && (
            <p className="col-span-full text-center text-sm text-gray-400">
              لم يتم العثور على نتائج مطابقة.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HadithPage;
