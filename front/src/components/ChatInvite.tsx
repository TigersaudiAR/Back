import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import api from "../lib/api";

interface ChatInviteProps {
  faqs: { question: string; answer: string }[];
}

function ChatInvite({ faqs }: ChatInviteProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const sendQuestion = async () => {
    setStatus("جاري الإرسال...");
    try {
      await api.post("/scholars/ask", {
        name,
        contact,
        question
      });
      setStatus("تم استلام سؤالك وسيتم التواصل قريبًا");
      setName("");
      setContact("");
      setQuestion("");
    } catch (error) {
      console.error(error);
      setStatus("تعذر الإرسال، حاول مرة أخرى");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-[0_24px_60px_rgba(6,40,32,0.35)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(42,120,95,0.22),_transparent_70%)]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-accent">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
              <MessageSquareText className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold">تواصل فوري مع أهل العلم</h3>
              <p className="text-xs text-gray-300">
                أرسل سؤالك مع إمكانية المتابعة عبر البريد أو الهاتف، وتابع الردود داخل لوحة التحكم والبث المباشر.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <label className="form-control">
              <span className="label-text">الاسم</span>
              <input className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text">البريد أو الجوال (اختياري)</span>
              <input className="input input-bordered" value={contact} onChange={(e) => setContact(e.target.value)} />
            </label>
          </div>
          <label className="form-control text-sm">
            <span className="label-text">سؤالك بالتفصيل</span>
            <textarea
              className="textarea textarea-bordered min-h-[140px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <button className="btn btn-accent gap-2" onClick={sendQuestion} disabled={!question}>
            <Send className="h-4 w-4" /> إرسال السؤال
          </button>
          {status && <p className="text-xs text-gray-300">{status}</p>}
        </div>
        <div className="flex-1 rounded-3xl border border-primary-light/30 bg-primary-dark/70 p-5">
          <h4 className="text-accent font-semibold mb-4">أبرز الأسئلة الشائعة</h4>
          <div className="space-y-3 text-xs leading-6 text-gray-200">
            {faqs.length === 0 && <p className="text-gray-400">لا تتوفر أسئلة شائعة حاليًا.</p>}
            {faqs.map((faq, index) => {
              const expanded = expandedIndex === index;
              return (
                <button
                  key={faq.question}
                  type="button"
                  className={`w-full text-right rounded-2xl border px-4 py-3 transition ${
                    expanded ? "border-accent/40 bg-accent/10 text-accent" : "border-primary-light/20 bg-primary-dark/60"
                  }`}
                  onClick={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                >
                  <p className="font-semibold">{faq.question}</p>
                  {expanded && <p className="mt-2 text-xs text-gray-100">{faq.answer}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChatInvite;
