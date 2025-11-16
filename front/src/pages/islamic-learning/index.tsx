import { useEffect, useState } from "react";
import { BookOpen, Heart, Users, Star } from "lucide-react";
import api from "../../lib/api";

interface IslamContent {
  id: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
  category: string;
  references: string[];
  related_topics: string[];
}

function IslamicLearningPage() {
  const [content, setContent] = useState<IslamContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedContent, setSelectedContent] = useState<IslamContent | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.get<{ items: IslamContent[] }>("/islamic-learning/what-is-islam");
      setContent(response.data.items);
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "الكل", icon: BookOpen },
    { id: "basics", name: "أساسيات الإسلام", icon: Star },
    { id: "faith", name: "الإيمان", icon: Heart },
    { id: "prophet", name: "النبي محمد", icon: Users },
    { id: "quran", name: "القرآن الكريم", icon: BookOpen }
  ];

  const filteredContent = selectedCategory === "all" 
    ? content 
    : content.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-gray-900 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="rounded-3xl bg-gradient-to-r from-accent/20 to-primary-light/20 border border-accent/30 p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-12 w-12 text-accent" />
            <div>
              <h1 className="text-4xl font-bold text-white">تعلم الإسلام</h1>
              <p className="text-gray-300 mt-2">تعرف على الإسلام من خلال مصادره الأصلية: القرآن والسنة</p>
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                selectedCategory === cat.id
                  ? "bg-accent border-accent text-white shadow-lg shadow-accent/30"
                  : "bg-primary-dark/50 border-primary-light/30 text-gray-300 hover:border-accent/50"
              }`}
            >
              <cat.icon className="h-8 w-8" />
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-300">جاري التحميل...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedContent(item)}
                className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6 hover:border-accent/50 transition-all cursor-pointer shadow-lg hover:shadow-accent/20"
              >
                <h3 className="text-xl font-bold text-accent mb-3">{item.question}</h3>
                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                  {item.answer.substring(0, 150)}...
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.references.slice(0, 2).map((ref, idx) => (
                    <span key={idx} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                      {ref.substring(0, 30)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedContent && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedContent(null)}
          >
            <div 
              className="bg-primary-dark border-2 border-accent/30 rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-accent">{selectedContent.question}</h2>
                {selectedContent.question_en && (
                  <p className="text-lg text-gray-400 italic">{selectedContent.question_en}</p>
                )}
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-line">
                    {selectedContent.answer}
                  </p>
                  {selectedContent.answer_en && (
                    <p className="text-gray-400 leading-relaxed mt-4 italic">
                      {selectedContent.answer_en}
                    </p>
                  )}
                </div>

                <div className="border-t border-primary-light/30 pt-6">
                  <h3 className="text-lg font-semibold text-accent mb-3">المراجع:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedContent.references.map((ref, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">{ref}</li>
                    ))}
                  </ul>
                </div>

                {selectedContent.related_topics.length > 0 && (
                  <div className="border-t border-primary-light/30 pt-6">
                    <h3 className="text-lg font-semibold text-accent mb-3">مواضيع ذات صلة:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.related_topics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => {
                            const related = content.find(c => c.id === topic);
                            if (related) setSelectedContent(related);
                          }}
                          className="text-xs bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-full transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedContent(null)}
                  className="w-full btn btn-accent mt-6"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IslamicLearningPage;
