import { useEffect, useState } from "react";
import { CalendarDays, GraduationCap, LayoutDashboard, MapPin, Users2 } from "lucide-react";
import HeroCards from "../components/HeroCards";
import QiblaWidget from "../components/QiblaWidget";
import PrayerTimes from "../components/PrayerTimes";
import ChatInvite from "../components/ChatInvite";
import api from "../lib/api";

const livePrograms = [
  {
    title: "حلقة تحفيظ مباشرة",
    description: "متابعة أسبوعية مع إحصاءات الحفظ ومشاركة الشاشة على البث الخارجي للمسجد.",
    icon: <Users2 className="h-5 w-5" />
  },
  {
    title: "يوم علمي",
    description: "جلسات علمية مع بث مرئي وعرض الشرائح داخل التطبيق وخارجه دون تأثير على النسخة الحالية.",
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    title: "مسار التجويد المتقدم",
    description: "دروس متدرجة مع تقييم صوتي فوري وملفات جاهزة للطباعة والاستخدام في الفصول.",
    icon: <GraduationCap className="h-5 w-5" />
  }
];

const platformHighlights = [
  {
    title: "لوحة متابعة متكاملة",
    description: "إحصاءات فورية للحلقات والمشرفين مع دعم تام للشاشات الواسعة وقاعات العرض التعليمية.",
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: "تكامل مع المواقع الجغرافية",
    description: "عرض القبلة والمواقيت الدقيقة لأي مدينة مع بث مباشر على شاشات المساجد.",
    icon: <MapPin className="h-5 w-5" />
  }
];

const defaultTimes = {
  الفجر: "04:32",
  الشروق: "05:58",
  الظهر: "12:14",
  العصر: "15:45",
  المغرب: "18:29",
  العشاء: "19:55"
};

function HomePage() {
  const [times, setTimes] = useState(defaultTimes);
  const [timesNote, setTimesNote] = useState<string | undefined>();
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqError, setFaqError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTimes = async (params: Record<string, string | number>) => {
      try {
        const response = await api.get<{ times: Record<string, string>; fallback?: boolean; city?: string }>("/prayers", {
          params
        });
        if (cancelled) return;
        setTimes(response.data.times);
        setTimesNote(
          response.data.fallback
            ? "يتم عرض أوقات تقريبية، قم بتمكين الموقع للحصول على مواقيت محدثة."
            : response.data.city
            ? `الموقع: ${response.data.city}`
            : undefined
        );
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setTimes(defaultTimes);
          setTimesNote("تعذر تحديث المواقيت، يتم عرض التوقيت الافتراضي لمكة المكرمة.");
        }
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadTimes({ lat: position.coords.latitude, lng: position.coords.longitude }).catch(() => undefined);
        },
        () => loadTimes({ city: "Mecca", country: "Saudi Arabia" }).catch(() => undefined),
        { timeout: 5000 }
      );
    } else {
      loadTimes({ city: "Mecca", country: "Saudi Arabia" }).catch(() => undefined);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ faqs: { question: string; answer: string }[] }>("/scholars/faq")
      .then((response) => {
        if (!cancelled) {
          setFaqs(response.data.faqs);
          setFaqError(null);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setFaqError("تعذر تحميل الأسئلة الشائعة، سيتم إعادة المحاولة لاحقًا.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-primary-light/30 bg-gradient-to-l from-primary-dark/40 via-primary-dark/80 to-black p-10 text-center shadow-[0_24px_65px_rgba(6,40,32,0.4)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(32,120,90,0.35),_transparent_60%)]" />
        <h1 className="text-3xl font-bold text-accent sm:text-4xl">منصة مصحف الهدى التعليمية</h1>
        <p className="mt-4 max-w-3xl mx-auto text-sm leading-relaxed text-gray-200 sm:text-base">
          تجربة رقمية شاملة تجمع بين عرض المصحف بثبات تام لكل شاشة، حلقات تحفيظ متفاعلة، أذكار وأدعية مصنفة، ودروس علمية يمكن بثها مباشرة إلى الشاشات الخارجية دون التأثير على استقرار التطبيق في المنصات الحالية.
        </p>
      </section>
      <HeroCards />
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="grid gap-6 xl:col-span-2 md:grid-cols-2">
          <QiblaWidget />
          <PrayerTimes times={times} note={timesNote} />
        </div>
        <div className="space-y-4 rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6">
          <h3 className="text-lg font-bold text-accent">برامج مباشرة محدثة</h3>
          <p className="text-xs text-gray-300">
            جدول متجدد يشمل الحلقات المرئية والدورات الأسبوعية، مع إمكانية ضبط التوقيت بحسب منطقتك وربط الشاشة مباشرة.
          </p>
          <ul className="space-y-4 text-sm">
            {livePrograms.map((program) => (
              <li key={program.title} className="rounded-2xl border border-primary-light/30 bg-primary-dark/70 p-4 shadow-inner">
                <div className="flex items-center gap-3 text-accent">
                  {program.icon}
                  <h4 className="font-semibold">{program.title}</h4>
                </div>
                <p className="mt-2 text-xs leading-6 text-gray-200">{program.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {platformHighlights.map((highlight) => (
          <div key={highlight.title} className="rounded-3xl border border-primary-light/30 bg-primary-dark/60 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-accent">
              {highlight.icon}
              <h3 className="text-lg font-semibold">{highlight.title}</h3>
            </div>
            <p className="mt-3 text-xs leading-7 text-gray-200 sm:text-sm">{highlight.description}</p>
          </div>
        ))}
      </section>
      <ChatInvite faqs={faqs} />
      {faqError && <p className="text-xs text-red-300">{faqError}</p>}
    </div>
  );
}

export default HomePage;
