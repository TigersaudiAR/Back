import { useMemo, useState } from "react";
import HadithCard from "../../components/HadithCard";
import data from "../../data/hadith_samples.json";
import type { Hadith } from "../../types/hadith";

const hadithList = data as Hadith[];

function HadithPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return hadithList;
    return hadithList.filter((hadith) =>
      hadith.text_ar.includes(query) || hadith.topic?.includes(query)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg space-y-3">
        <h2 className="text-2xl font-bold text-accent">الأحاديث النبوية</h2>
        <p className="text-sm text-gray-300">
          جميع الأحاديث من مصادر معتمدة مثل مجمع الملك فهد لطباعة المصحف الشريف.
        </p>
        <input
          className="input input-bordered w-full max-w-lg"
          placeholder="ابحث عن موضوع أو كلمة"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((hadith) => (
          <HadithCard key={hadith.id} hadith={hadith} />
        ))}
      </div>
    </div>
  );
}

export default HadithPage;
