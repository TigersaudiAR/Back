import { useState } from "react";
import api from "../lib/api";

interface ChatInviteProps {
  faqs: { question: string; answer: string }[];
}

function ChatInvite({ faqs }: ChatInviteProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
    <section className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-xl space-y-4">
      <h3 className="text-lg font-bold text-accent">تواصل فوري مع أهل العلم</h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <label className="form-control">
            <span className="label-text">الاسم</span>
            <input className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">البريد أو الجوال (اختياري)</span>
            <input className="input input-bordered" value={contact} onChange={(e) => setContact(e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">سؤالك</span>
            <textarea
              className="textarea textarea-bordered min-h-[120px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <button className="btn btn-accent" onClick={sendQuestion} disabled={!question}>
            إرسال
          </button>
          {status && <p className="text-xs text-gray-300">{status}</p>}
        </div>
        <div className="bg-primary-dark/50 border border-primary-light/30 rounded-2xl p-4 space-y-3">
          <h4 className="text-accent font-semibold">أبرز الأسئلة الشائعة</h4>
          <ul className="space-y-3 text-xs leading-6 text-gray-200">
            {faqs.map((faq) => (
              <li key={faq.question}>
                <p className="font-semibold">{faq.question}</p>
                <p>{faq.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ChatInvite;
