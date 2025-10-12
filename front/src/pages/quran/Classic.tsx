import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ayatData from "../../data/sample_ayahs.json";
import surahList from "../../data/surah_index.json";
import type { Ayah } from "../../types/quran";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function QuranClassicPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const currentSurahId = Number(query.get("surah")) || 1;

  const ayat: Ayah[] = useMemo(
    () => ayatData.filter((ayah) => ayah.surah_id === currentSurahId),
    [currentSurahId]
  );

  return (
    <div className="min-h-screen bg-white text-black p-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center border-b border-gray-300 pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{surahList.find((s) => s.id === currentSurahId)?.name_ar}</h1>
            <p className="text-sm text-gray-600">نسخة قابلة للطباعة</p>
          </div>
          <button
            className="px-4 py-2 border border-gray-600 rounded"
            onClick={() => window.print()}
          >
            طباعة
          </button>
        </header>
        <article className="prose prose-lg rtl:text-right">
          {ayat.map((ayah) => (
            <p key={ayah.ayah_number} className="leading-loose text-2xl">
              <span className="ml-2 text-sm align-top border border-gray-400 rounded-full px-2 py-1">
                {ayah.ayah_number}
              </span>
              {ayah.text_ar}
            </p>
          ))}
        </article>
        <div className="flex justify-between mt-10">
          <button
            className="px-4 py-2 border border-gray-400 rounded"
            onClick={() => navigate(`/quran/modern?surah=${currentSurahId}`)}
          >
            العودة للوضع الحديث
          </button>
          <button className="px-4 py-2 border border-gray-400 rounded" onClick={() => navigate("/quran")}>عودة للفهرس</button>
        </div>
      </div>
    </div>
  );
}

export default QuranClassicPage;
