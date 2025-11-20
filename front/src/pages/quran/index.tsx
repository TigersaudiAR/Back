import { Link } from "react-router-dom";
import { MonitorPlay, ScrollText, BookOpen } from "lucide-react";
import SurahNavigator from "../../components/SurahNavigator";
import { useSurahIndex } from "../../hooks/useQuranContent";

function QuranIndexPage() {
  const { surahs, loading, error, refresh, fromCache } = useSurahIndex();

  return (
    <div className="flex h-full w-full flex-col gap-8 px-4 pt-24 text-gray-100 sm:px-10">
      <section className="mx-auto max-w-4xl rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-8 text-center shadow-[0_20px_60px_rgba(6,30,24,0.35)]">
        <h2 className="text-3xl font-bold text-accent">مكتبة المصحف الرقمي</h2>
        <p className="mt-3 text-sm leading-7 text-gray-300">
          عرض حديث يحافظ على ثبات الآيات مع أدوات بث خارجي وشريط أدوات مخفي، بالإضافة إلى نسخة تقليدية مطابقة للمصحف العثماني قابلة للطباعة والاستخدام في قاعات التحفيظ.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-accent gap-2" to="modern">
            <MonitorPlay className="h-4 w-4" /> وضع العرض الحديث
          </Link>
          <Link className="btn btn-outline gap-2" to="classic">
            <ScrollText className="h-4 w-4" /> وضع المصحف التقليدي
          </Link>
          <Link className="btn btn-outline gap-2" to="page-view">
            <BookOpen className="h-4 w-4" /> عرض الصفحات التفاعلي
          </Link>
          <Link className="btn btn-outline gap-2" to="reader">
            <BookOpen className="h-4 w-4" /> قارئ القرآن الحديث
          </Link>
        </div>
        {fromCache && (
          <p className="mt-4 text-xs text-amber-300">يتم عرض الفهرس من النسخة المخزنة، وسيجري تحديثه تلقائيًا عند توفر الاتصال.</p>
        )}
      </section>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-accent">الفهرس السريع</h3>
          <div className="flex items-center gap-3 text-xs text-gray-300">
            {loading && <span>جاري تحميل السور...</span>}
            {error && (
              <button className="btn btn-xs btn-outline" onClick={() => refresh().catch(() => undefined)}>
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex-1 overflow-hidden">
          {surahs.length > 0 ? (
            <SurahNavigator
              surahList={surahs}
              onSelect={(id) => {
                const params = new URLSearchParams();
                params.set("surah", String(id));
                const info = surahs.find((item) => item.id === id);
                if (info?.slug) {
                  params.set("slug", info.slug);
                }
                window.open(`/quran/modern?${params.toString()}`, "_self");
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              لا تتوفر بيانات للعرض حاليًا
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default QuranIndexPage;
