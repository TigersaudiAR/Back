import React, { useState, useEffect } from 'react';

interface HajjStage {
  id: string;
  order: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  requirements: string[];
  dua: string;
  location: string;
  time: string;
  nusuk_link: string;
}

interface UmrahStage {
  id: string;
  order: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  requirements: string[];
  dua: string;
  location: string;
  nusuk_link: string;
}

interface Prohibition {
  id: string;
  category: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  applies_to: string;
  severity: string;
}

export const NisukSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hajj' | 'umrah' | 'prohibitions'>('hajj');
  const [hajjStages, setHajjStages] = useState<HajjStage[]>([]);
  const [umrahStages, setUmrahStages] = useState<UmrahStage[]>([]);
  const [prohibitions, setProhibitions] = useState<Prohibition[]>([]);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hajjRes, umrahRes, prohibRes] = await Promise.all([
        fetch('/api/nisuk/hajj'),
        fetch('/api/nisuk/umrah'),
        fetch('/api/nisuk/prohibitions')
      ]);

      const hajjData = await hajjRes.json();
      const umrahData = await umrahRes.json();
      const prohibData = await prohibRes.json();

      setHajjStages(hajjData.stages || []);
      setUmrahStages(umrahData.stages || []);
      setProhibitions(prohibData.prohibitions || []);
    } catch (error) {
      console.error('Failed to load Nisuk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHajjStages = () => (
    <div className="space-y-4">
      {hajjStages.map((stage, index) => (
        <div
          key={stage.id}
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
            selectedStage === index ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <div
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedStage(selectedStage === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  {stage.order}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{stage.name_ar}</h3>
                  <p className="text-sm text-gray-600">{stage.name_en}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{stage.time}</span>
            </div>
          </div>

          {selectedStage === index && (
            <div className="p-6 bg-gray-50 border-t">
              <p className="text-gray-700 mb-4 leading-relaxed">{stage.description_ar}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">المتطلبات:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {stage.requirements.map((req, i) => (
                    <li key={i} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">الدعاء:</h4>
                <p className="text-emerald-900 text-lg font-arabic">{stage.dua}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📍 {stage.location}</span>
                <a
                  href={stage.nusuk_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  رابط نسك →
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderUmrahStages = () => (
    <div className="space-y-4">
      {umrahStages.map((stage, index) => (
        <div
          key={stage.id}
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
            selectedStage === index ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedStage(selectedStage === index ? null : index)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {stage.order}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{stage.name_ar}</h3>
                <p className="text-sm text-gray-600">{stage.name_en}</p>
              </div>
            </div>
          </div>

          {selectedStage === index && (
            <div className="p-6 bg-gray-50 border-t">
              <p className="text-gray-700 mb-4 leading-relaxed">{stage.description_ar}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">المتطلبات:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {stage.requirements.map((req, i) => (
                    <li key={i} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">الدعاء:</h4>
                <p className="text-blue-900 text-lg font-arabic">{stage.dua}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📍 {stage.location}</span>
                <a
                  href={stage.nusuk_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  رابط نسك →
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderProhibitions = () => {
    const groupedByCategory = prohibitions.reduce((acc, prohibition) => {
      if (!acc[prohibition.category]) {
        acc[prohibition.category] = [];
      }
      acc[prohibition.category].push(prohibition);
      return acc;
    }, {} as Record<string, Prohibition[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">
              {category === 'clothing' && '🧥 الملابس'}
              {category === 'grooming' && '💈 النظافة والتجميل'}
              {category === 'marriage' && '💍 الزواج'}
              {category === 'intimacy' && '❤️ العلاقة الزوجية'}
              {category === 'hunting' && '🦌 الصيد'}
              {category === 'behavior' && '🤝 السلوك'}
            </h3>
            <div className="space-y-3">
              {items.map((prohibition) => (
                <div key={prohibition.id} className="border-r-4 border-red-500 pr-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{prohibition.name_ar}</h4>
                      <p className="text-sm text-gray-600 mt-1">{prohibition.description_ar}</p>
                    </div>
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        prohibition.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        prohibition.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {prohibition.applies_to === 'men' && 'رجال'}
                        {prohibition.applies_to === 'women' && 'نساء'}
                        {prohibition.applies_to === 'both' && 'الجميع'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل دليل نسك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">دليل نسك الشامل</h1>
        <p className="text-gray-600">دليلك الكامل للحج والعمرة بالتعاون مع منصة نسك الرسمية</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => { setActiveTab('hajj'); setSelectedStage(null); }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'hajj'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          الحج ({hajjStages.length} مرحلة)
        </button>
        <button
          onClick={() => { setActiveTab('umrah'); setSelectedStage(null); }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'umrah'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          العمرة ({umrahStages.length} مرحلة)
        </button>
        <button
          onClick={() => { setActiveTab('prohibitions'); setSelectedStage(null); }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'prohibitions'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          محظورات الإحرام ({prohibitions.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'hajj' && renderHajjStages()}
        {activeTab === 'umrah' && renderUmrahStages()}
        {activeTab === 'prohibitions' && renderProhibitions()}
      </div>
    </div>
  );
};

export default NisukSection;
