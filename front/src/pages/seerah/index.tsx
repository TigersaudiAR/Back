import { useEffect, useState } from "react";
import { Calendar, BookOpenText, Lightbulb, ExternalLink } from "lucide-react";
import api from "../../lib/api";

interface SeerahEvent {
  id: string;
  title: string;
  title_en?: string;
  period: string;
  summary: string;
  summary_en?: string;
  details: string[];
  lessons: string[];
  references: string[];
  related_topics: string[];
}

function SeerahPage() {
  const [events, setEvents] = useState<SeerahEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SeerahEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get<{ events: SeerahEvent[] }>("/islamic-learning/seerah");
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error loading seerah events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-gray-900 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="rounded-3xl bg-gradient-to-r from-accent/20 to-primary-light/20 border border-accent/30 p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <BookOpenText className="h-12 w-12 text-accent" />
            <div>
              <h1 className="text-4xl font-bold text-white">السيرة النبوية</h1>
              <p className="text-gray-300 mt-2">
                تعرف على حياة النبي محمد صلى الله عليه وسلم من خلال الأحداث المهمة
              </p>
            </div>
          </div>
        </header>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-300">جاري التحميل...</div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-8 top-0 bottom-0 w-1 bg-gradient-to-b from-accent/50 to-accent/10"></div>

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <div key={event.id} className="relative pr-20">
                  {/* Timeline dot */}
                  <div className="absolute right-5 top-4 w-7 h-7 rounded-full bg-accent border-4 border-primary-dark shadow-lg shadow-accent/50"></div>

                  {/* Event card */}
                  <div
                    onClick={() => setSelectedEvent(event)}
                    className="bg-primary-dark/60 border border-primary-light/40 rounded-2xl p-6 hover:border-accent/50 transition-all cursor-pointer shadow-lg hover:shadow-accent/20"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-accent mb-2">{event.title}</h3>
                        {event.title_en && (
                          <p className="text-sm text-gray-400 italic mb-2">{event.title_en}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{event.period}</span>
                        </div>
                      </div>
                      <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-4">{event.summary}</p>

                    <button className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-2">
                      <span>اقرأ المزيد</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-primary-dark border-2 border-accent/30 rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-accent mb-2">{selectedEvent.title}</h2>
                  {selectedEvent.title_en && (
                    <p className="text-lg text-gray-400 italic mb-3">{selectedEvent.title_en}</p>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-5 w-5" />
                    <span>{selectedEvent.period}</span>
                  </div>
                </div>

                <div className="border-t border-primary-light/30 pt-6">
                  <p className="text-gray-200 text-lg leading-relaxed">{selectedEvent.summary}</p>
                  {selectedEvent.summary_en && (
                    <p className="text-gray-400 mt-3 italic">{selectedEvent.summary_en}</p>
                  )}
                </div>

                {selectedEvent.details.length > 0 && (
                  <div className="border-t border-primary-light/30 pt-6">
                    <h3 className="text-xl font-semibold text-accent mb-4 flex items-center gap-2">
                      <BookOpenText className="h-5 w-5" />
                      <span>التفاصيل</span>
                    </h3>
                    <ul className="space-y-3">
                      {selectedEvent.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-accent mt-1">•</span>
                          <span className="text-gray-300 leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvent.lessons.length > 0 && (
                  <div className="border-t border-primary-light/30 pt-6">
                    <h3 className="text-xl font-semibold text-accent mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>الدروس المستفادة</span>
                    </h3>
                    <ul className="space-y-3">
                      {selectedEvent.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-yellow-400 mt-1">⭐</span>
                          <span className="text-gray-300 leading-relaxed">{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-primary-light/30 pt-6">
                  <h3 className="text-lg font-semibold text-accent mb-3">المراجع:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedEvent.references.map((ref, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => setSelectedEvent(null)} className="w-full btn btn-accent mt-6">
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

export default SeerahPage;
