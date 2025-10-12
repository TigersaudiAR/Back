import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cards = [
  {
    title: "القرآن الكريم",
    description: "قراءة مريحة مع شريط أدوات مخفي وتفاسير فورية.",
    to: "/quran/modern"
  },
  {
    title: "الأذكار والأدعية",
    description: "مسبحة ذكية تتفاعل مع الصوت والنقر وأوقات اليوم.",
    to: "/adhkar"
  },
  {
    title: "التعليم الذاتي",
    description: "مراحل لتعلم العربية والتجويد مع تقييم صوتي.",
    to: "/self-learn"
  },
  {
    title: "حلقات التحفيظ",
    description: "انضم للحلقات وتابع المتصدرين لحفظ القرآن.",
    to: "/halaqat"
  }
];

function HeroCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-primary-dark/60 border border-primary-light/30 rounded-3xl p-6 shadow-xl backdrop-blur hover:-translate-y-1 hover:border-accent transition"
        >
          <h3 className="text-lg font-bold text-accent mb-2">{card.title}</h3>
          <p className="text-sm text-gray-200 mb-4">{card.description}</p>
          <Link className="btn btn-accent btn-sm" to={card.to}>
            ابدأ الآن
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default HeroCards;
