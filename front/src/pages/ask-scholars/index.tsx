import { useEffect, useState } from "react";
import ChatInvite from "../../components/ChatInvite";
import api from "../../lib/api";

function AskScholarsPage() {
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ faqs: { question: string; answer: string }[] }>("/scholars/faq")
      .then((response) => {
        if (!cancelled) {
          setFaqs(response.data.faqs);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل الأسئلة الشائعة، يرجى المحاولة لاحقًا.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">تواصل مع أهل العلم</h2>
        <p className="text-sm text-gray-300">
          أرسل سؤالك مباشرة، وسيستقبله المشرفون مع بيانات التواصل، كما يمكنك الاطلاع على الأسئلة الشائعة.
        </p>
        {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
      </header>
      <ChatInvite faqs={faqs} />
    </div>
  );
}

export default AskScholarsPage;
