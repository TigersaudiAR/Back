import HeroCards from "../components/HeroCards";
import QiblaWidget from "../components/QiblaWidget";
import PrayerTimes from "../components/PrayerTimes";
import ChatInvite from "../components/ChatInvite";
import faqs from "../data/faq_scholars.json";

const defaultTimes = {
  الفجر: "04:32",
  الشروق: "05:58",
  الظهر: "12:14",
  العصر: "15:45",
  المغرب: "18:29",
  العشاء: "19:55"
};

function HomePage() {
  return (
    <div className="space-y-8">
      <section className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-bold text-accent">منصة مصحف الهدى التعليمية</h1>
        <p className="mt-4 text-sm text-gray-200">
          جميع خدمات القرآن الكريم، الأذكار، حلقات التحفيظ، التعلم الذاتي، والأحاديث الصحيحة في تجربة واحدة أنيقة.
        </p>
      </section>
      <HeroCards />
      <div className="grid lg:grid-cols-2 gap-6">
        <QiblaWidget />
        <PrayerTimes times={defaultTimes} />
      </div>
      <ChatInvite faqs={faqs} />
    </div>
  );
}

export default HomePage;
