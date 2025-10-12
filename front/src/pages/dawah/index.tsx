import { useState } from "react";
import api from "../../lib/api";

interface AnswerResponse {
  answer: string;
  refs: string[];
}

function DawahPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [refs, setRefs] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const ask = async () => {
    setStatus("جاري البحث في المصادر المعتمدة...");
    try {
      const response = await api.post<AnswerResponse>("/dawah/ask", { question });
      setAnswer(response.data.answer);
      setRefs(response.data.refs);
      setStatus(null);
    } catch (error) {
      console.error(error);
      setStatus("تعذر الحصول على إجابة الآن");
    }
  };

  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg space-y-3">
        <h2 className="text-2xl font-bold text-accent">الدعوة والإرشاد</h2>
        <p className="text-sm text-gray-300">
          اطرح أي سؤال عن الإسلام بأي لغة، وسيتم الإجابة اعتمادًا على القرآن الكريم والسنة النبوية.
        </p>
        <textarea
          className="textarea textarea-bordered w-full min-h-[120px]"
          placeholder="اكتب سؤالك هنا"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="btn btn-accent" onClick={ask} disabled={!question}>
          أرسل السؤال
        </button>
        {status && <p className="text-xs text-gray-300">{status}</p>}
      </header>
      {answer && (
        <section className="bg-primary-dark/50 border border-primary-light/30 rounded-3xl p-6 space-y-3">
          <h3 className="text-lg font-semibold text-accent">الإجابة</h3>
          <p className="text-sm text-gray-200 leading-7 whitespace-pre-line">{answer}</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>المراجع:</p>
            <ul className="list-disc pr-5 space-y-1">
              {refs.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default DawahPage;
