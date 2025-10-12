import { Link } from "react-router-dom";
import SurahNavigator from "../../components/SurahNavigator";
import surahList from "../../data/surah_index.json";

function QuranIndexPage() {
  return (
    <div className="w-full h-full pt-20 px-6 text-gray-100 space-y-6">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <h2 className="text-3xl font-bold text-accent">القرآن الكريم</h2>
        <p className="text-sm text-gray-300">
          اختر وضع القراءة الذي يناسبك: العرض الحديث بدون حواف، أو العرض التقليدي المخصص للطباعة.
        </p>
        <div className="flex justify-center gap-4">
          <Link className="btn btn-accent" to="modern">
            الوضع الحديث
          </Link>
          <Link className="btn btn-outline" to="classic">
            الوضع التقليدي
          </Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-accent mb-4">الفهرس السريع</h3>
        <SurahNavigator
          surahList={surahList}
          onSelect={(id) => window.open(`/quran/modern?surah=${id}`, "_self")}
        />
      </div>
    </div>
  );
}

export default QuranIndexPage;
