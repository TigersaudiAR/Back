import { useState } from "react";

const modules = [
  {
    id: "arabic-basics",
    title: "أساسيات اللغة العربية",
    description: "دروس تفاعلية للقراءة والكتابة مع تمارين صوتية للناطقين بغير العربية.",
    lessons: 12,
    badges: ["حروف", "حركات", "كلمات"]
  },
  {
    id: "tajweed",
    title: "التجويد للمبتدئين",
    description: "تطبيق أحكام التجويد مع أمثلة مسموعة ومقارنات للتصحيح الآلي.",
    lessons: 10,
    badges: ["غنة", "مدود", "مخارج"]
  },
  {
    id: "hifz",
    title: "مسار الحفظ الذكي",
    description: "نظام متابعة يومي مع تسجيل صوتي وتحليل للأخطاء وتذكيرات يومية.",
    lessons: 20,
    badges: ["خطة أسبوعية", "تحفيز", "تقييم"]
  }
];

function SelfLearnPage() {
  const [active, setActive] = useState("arabic-basics");

  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">التعليم الذاتي</h2>
        <p className="text-sm text-gray-300">
          مسارات مصممة لتعليم العربية والتجويد والحفظ بوسائل تفاعلية، مع تقييم صوتي وتذكيرات يومية.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`btn btn-sm ${module.id === active ? "btn-accent" : "btn-outline"}`}
              onClick={() => setActive(module.id)}
            >
              {module.title}
            </button>
          ))}
        </div>
      </header>
      <section className="grid md:grid-cols-2 gap-6">
        {modules
          .filter((module) => module.id === active)
          .map((module) => (
            <article key={module.id} className="bg-primary-dark/50 border border-primary-light/30 rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-accent">{module.title}</h3>
              <p className="text-sm text-gray-200">{module.description}</p>
              <p className="text-xs text-gray-400">عدد الدروس: {module.lessons}</p>
              <div className="flex flex-wrap gap-2">
                {module.badges.map((badge) => (
                  <span key={badge} className="badge badge-accent badge-outline">
                    {badge}
                  </span>
                ))}
              </div>
              <button className="btn btn-accent btn-sm">بدء المسار</button>
            </article>
          ))}
      </section>
      <section className="bg-primary-dark/50 border border-primary-light/30 rounded-3xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-accent">التنبيهات اليومية</h3>
        <p className="text-sm text-gray-300">
          فعل الإشعارات في متصفحك لتصلك مهام الحفظ والتجويد اليومية في الوقت الأنسب.
        </p>
      </section>
    </div>
  );
}

export default SelfLearnPage;
