import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpenCheck, Compass, GraduationCap, MessageCircle, ScrollText, Users2 } from "lucide-react";

const cards = [
  {
    title: "القرآن الكريم",
    description: "عرض ثابت يحاكي المصحف العثماني مع تلاوات عالية الدقة وخيارات بث خارجي.",
    to: "/quran/modern",
    icon: <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: "الأذكار والأدعية",
    description: "مجموعات كاملة للأذكار الصباحية والمسائية مع عدّاد مرئي وصوتي.",
    to: "/adhkar",
    icon: <Compass aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: "التعليم الذاتي",
    description: "مسارات تعليمية تفاعلية من الحروف حتى الإجازة مع تقييمات فورية.",
    to: "/self-learn",
    icon: <GraduationCap aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: "حلقات التحفيظ",
    description: "مجتمعات رقمية بإشراف معلمين مع بث مباشر للجلسات وشاشات الحضور.",
    to: "/halaqat",
    icon: <Users2 aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: "الأحاديث النبوية",
    description: "موسوعة حديثية موثقة مع شروح صوتية وإمكانية عرض على اللوحات الذكية.",
    to: "/hadith",
    icon: <ScrollText aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: "الاستشارات الشرعية",
    description: "تواصل سريع مع أهل العلم عبر استوديو مخصص للأسئلة والتوثيق.",
    to: "/ask-scholars",
    icon: <MessageCircle aria-hidden="true" className="h-6 w-6" />
  }
];

function HeroCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden bg-primary-dark/60 border border-primary-light/30 rounded-3xl p-6 shadow-xl backdrop-blur hover:-translate-y-1 hover:border-accent transition"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(46,148,110,0.25),_transparent_70%)]" />
          <div className="relative flex items-center gap-3 text-accent">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
              {card.icon}
            </span>
            <h3 className="text-lg font-bold">{card.title}</h3>
          </div>
          <p className="relative mt-3 text-xs sm:text-sm text-gray-200 leading-7">{card.description}</p>
          <Link className="relative mt-5 inline-flex items-center gap-2 btn btn-accent btn-sm" to={card.to}>
            ابدأ الآن
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default HeroCards;
