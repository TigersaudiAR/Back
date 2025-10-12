import ChatInvite from "../../components/ChatInvite";
import faqs from "../../data/faq_scholars.json";

function AskScholarsPage() {
  return (
    <div className="space-y-6">
      <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-accent">تواصل مع أهل العلم</h2>
        <p className="text-sm text-gray-300">
          أرسل سؤالك مباشرة، وسيستقبله المشرفون مع بيانات التواصل، كما يمكنك الاطلاع على الأسئلة الشائعة.
        </p>
      </header>
      <ChatInvite faqs={faqs} />
    </div>
  );
}

export default AskScholarsPage;
