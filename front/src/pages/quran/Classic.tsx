import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Ayah } from "../../types/quran";
import { useQuranSurah, useSurahIndex } from "../../hooks/useQuranContent";
import { BISMILLAH_TEXT } from "../../components/QuranCanvas";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function QuranClassicPage() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const surahParam = query.get("surah");
  const slugParam = query.get("slug") ?? undefined;
  const parsedSurahId = surahParam ? Number(surahParam) : NaN;
  const hasValidSurahParam = !Number.isNaN(parsedSurahId) && parsedSurahId > 0;
  const initialId = hasValidSurahParam ? parsedSurahId : 1;
  const [currentSurahId, setCurrentSurahId] = useState(initialId);
  const { surahs } = useSurahIndex();

  useEffect(() => {
    if (hasValidSurahParam && !Number.isNaN(parsedSurahId) && parsedSurahId !== currentSurahId) {
      setCurrentSurahId(parsedSurahId);
    }
  }, [hasValidSurahParam, parsedSurahId, currentSurahId]);

  useEffect(() => {
    if (hasValidSurahParam || !slugParam || !surahs.length) {
      return;
    }
    const match = findSurahBySlug(surahs, slugParam);
    if (match && match.id !== currentSurahId) {
      setCurrentSurahId(match.id);
    }
  }, [hasValidSurahParam, slugParam, surahs, currentSurahId]);

  const surahExists = surahs.some((item) => item.id === currentSurahId);

  useEffect(() => {
    if (surahs.length && !surahExists) {
      setCurrentSurahId(surahs[0].id);
    }
  }, [surahs, surahExists]);

  const buildQueryForSurah = useCallback(
    (id: number) => {
      const params = new URLSearchParams();
      params.set("surah", String(id));
      const info = surahs.find((item) => item.id === id);
      if (info?.slug) {
        params.set("slug", info.slug);
      }
      return `?${params.toString()}`;
    },
    [surahs]
  );

  useEffect(() => {
    if (!surahs.length) {
      return;
    }
    const expected = buildQueryForSurah(currentSurahId);
    if (expected !== location.search) {
      navigate(expected, { replace: true });
    }
  }, [surahs, currentSurahId, buildQueryForSurah, location.search, navigate]);

  const { data, loading, error, refresh } = useQuranSurah(currentSurahId);

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
              <Ayah key={ayah.ayah_number} ayah={ayah} variant="classic" className="classic-ayah" />
            ))}
          </article>
        )}
        <div className="mt-10 flex flex-wrap justify-between gap-3">
          <button
            className="rounded border border-gray-400 px-4 py-2"
            onClick={() => navigate(`/quran/modern${buildQueryForSurah(currentSurahId)}`)}
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
