import QuranPageViewer from "../../components/QuranPageViewer";

/**
 * Full-page image-based Quran viewer
 * Displays Quran pages with interactive verse highlighting
 */
function QuranPageViewPage() {
  // Get initial page from URL params if available
  const searchParams = new URLSearchParams(window.location.search);
  const initialPage = Number(searchParams.get("page")) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">
            القرآن الكريم - عرض الصفحات
          </h1>
          <p className="text-gray-400">
            عرض تفاعلي لصفحات المصحف الشريف (604 صفحة)
          </p>
        </header>
        
        <QuranPageViewer initialPage={initialPage} />
      </div>
    </div>
  );
}

export default QuranPageViewPage;
