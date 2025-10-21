import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Ayah } from "../../types/quran";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { BISMILLAH_TEXT } from "../../components/QuranCanvas";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function QuranClassicPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const initialId = Number(query.get("surah")) || 1;
  const [currentSurahId, setCurrentSurahId] = useState(initialId);
  const { surahs } = useSurahIndex();
  const { data, loading, error, refresh } = useQuranSurah(currentSurahId);

  useEffect(() => {
    if (initialId !== currentSurahId) {
      setCurrentSurahId(initialId);
    }
  }, [initialId, currentSurahId]);

  const surahExists = surahs.some((item) => item.id === currentSurahId);

  useEffect(() => {
    if (surahs.length && !surahExists) {
      setCurrentSurahId(surahs[0].id);
    }
  }, [surahs, surahExists]);

  const ayat: Ayah[] = data?.ayat ?? [];
  const surah = data?.surah;

  const shouldRenderBismillah =
    Boolean(surah?.bismillah_pre) &&
    ayat.length > 0 &&
    ayat[0]?.text_ar?.replace(/\s+/g, "") !== BISMILLAH_TEXT.replace(/\s+/g, "");

  return (
    <div className="min-h-screen bg-white text-black p-10" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-2xl font-bold">{surah?.name_ar ?? "قيد التحميل"}</h1>
            <p className="text-sm text-gray-600">
              نسخة قابلة للطباعة مع الحفاظ على ترتيب المصحف العثماني.
            </p>
          </div>
          <button className="rounded border border-gray-600 px-4 py-2" onClick={() => window.print()}>
            طباعة
          </button>
        </header>
        {data?.message && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-100/30 px-4 py-2 text-center text-xs text-amber-700">
            {data.message}
          </div>
        )}
        {loading && <p className="text-center text-sm text-gray-500">جاري تحميل السورة...</p>}
        {!loading && error && (
          <div className="text-center text-sm text-red-500">
            <p>{error}</p>
            <button className="btn btn-sm mt-3" onClick={() => refresh(currentSurahId).catch(() => undefined)}>
              إعادة المحاولة
            </button>
          </div>
        )}
        {!loading && !error && ayat.length > 0 && (
          <article className="prose prose-lg rtl:text-right">
            {shouldRenderBismillah && (
              <p className="text-2xl leading-loose text-center">{BISMILLAH_TEXT}</p>
            )}
            {ayat.map((ayah) => (
              <p key={ayah.ayah_number} className="text-2xl leading-loose">
                <span className="align-top rounded-full border border-gray-400 px-2 py-1 text-sm">{ayah.ayah_number}</span>
                {ayah.text_ar}
              </p>
            ))}
          </article>
        )}
        <div className="mt-10 flex flex-wrap justify-between gap-3">
          <button
            className="rounded border border-gray-400 px-4 py-2"
            onClick={() => navigate(`/quran/modern?surah=${currentSurahId}`)}
          >
            العودة للوضع الحديث
          </button>
          <button className="rounded border border-gray-400 px-4 py-2" onClick={() => navigate("/quran")}>
            عودة للفهرس
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuranClassicPage;
