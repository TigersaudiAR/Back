import { Link } from "react-router-dom";
import { MonitorPlay, ScrollText } from "lucide-react";
import SurahNavigator from "../../components/SurahNavigator";
import surahList from "../../data/surah_index.json";

function QuranIndexPage() {
  return (
    <div className="flex h-full w-full flex-col gap-8 px-4 pt-24 text-gray-100 sm:px-10">
      <section className="mx-auto max-w-4xl rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-8 text-center shadow-[0_20px_60px_rgba(6,30,24,0.35)]">
        <h2 className="text-3xl font-bold text-accent">مكتبة المصحف الرقمي</h2>
        <p className="mt-3 text-sm text-gray-300 leading-7">
          عرض حديث يحافظ على ثبات الآيات مع أدوات بث خارجي وشريط أدوات مخفي، بالإضافة إلى نسخة تقليدية مطابقة للمصحف
          العثماني قابلة للطباعة والاستخدام في قاعات التحفيظ.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-accent gap-2" to="modern">
            <MonitorPlay className="h-4 w-4" /> وضع العرض الحديث
          </Link>
          <Link className="btn btn-outline gap-2" to="classic">
            <ScrollText className="h-4 w-4" /> وضع المصحف التقليدي
          </Link>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-accent">الفهرس السريع</h3>
          <p className="text-xs text-gray-300">اضغط على اسم السورة للانتقال مباشرة مع الحفاظ على إعدادات العرض الحالية.</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <SurahNavigator
            surahList={surahList}
            onSelect={(id) => window.open(`/quran/modern?surah=${id}`, "_self")}
          />
        </div>
      </section>
    </div>
  );
}

export default QuranIndexPage;
