import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Stage {
  id: string;
  stage: number;
  title: string;
  title_en: string;
  description: string;
  details: string[];
  supplications: string[];
  location: string;
  time: string;
  importance: string;
  notes?: string[];
}

interface Prohibition {
  id: string;
  number: number;
  title: string;
  title_en: string;
  description: string;
  details: string[];
  ruling: string;
  expiation: string;
  evidence: string;
}

type NusukType = 'hajj' | 'umrah' | 'prohibitions';

const NisukSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NusukType>('hajj');
  const [hajjStages, setHajjStages] = useState<Stage[]>([]);
  const [umrahStages, setUmrahStages] = useState<Stage[]>([]);
  const [prohibitions, setProhibitions] = useState<Prohibition[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedProhibition, setSelectedProhibition] = useState<Prohibition | null>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hajjRes, umrahRes, prohibitionsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/nisuk/hajj`),
        axios.get(`${API_BASE}/api/nisuk/umrah`),
        axios.get(`${API_BASE}/api/nisuk/prohibitions`)
      ]);

      setHajjStages(hajjRes.data.stages || []);
      setUmrahStages(umrahRes.data.stages || []);
      setProhibitions(prohibitionsRes.data.prohibitions || []);
    } catch (error) {
      console.error('Error loading Nusuk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStageCard = (stage: Stage) => (
    <div
      key={stage.id}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedStage(stage);
        setSelectedProhibition(null);
      }}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="badge badge-primary badge-lg">{stage.stage}</div>
          <div className={`badge ${
            stage.importance === 'ركن' ? 'badge-error' :
            stage.importance === 'واجب' ? 'badge-warning' :
            'badge-info'
          }`}>
            {stage.importance}
          </div>
        </div>
        <h3 className="card-title text-xl mt-2">{stage.title}</h3>
        <p className="text-sm text-gray-500">{stage.title_en}</p>
        <p className="text-sm mt-2">{stage.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="badge badge-outline">📍 {stage.location}</div>
          <div className="badge badge-outline">⏰ {stage.time}</div>
        </div>
      </div>
    </div>
  );

  const renderProhibitionCard = (prohibition: Prohibition) => (
    <div
      key={prohibition.id}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedProhibition(prohibition);
        setSelectedStage(null);
      }}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="badge badge-secondary badge-lg">{prohibition.number}</div>
          <div className={`badge ${
            prohibition.ruling === 'محظور' ? 'badge-error' :
            prohibition.ruling === 'مكروه' ? 'badge-warning' :
            'badge-info'
          }`}>
            {prohibition.ruling}
          </div>
        </div>
        <h3 className="card-title text-lg mt-2">{prohibition.title}</h3>
        <p className="text-sm text-gray-500">{prohibition.title_en}</p>
        <p className="text-sm mt-2">{prohibition.description}</p>
      </div>
    </div>
  );

  const renderStageDetails = (stage: Stage) => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <button
          onClick={() => setSelectedStage(null)}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="badge badge-primary badge-lg">المرحلة {stage.stage}</div>
          <div className={`badge ${
            stage.importance === 'ركن' ? 'badge-error' :
            stage.importance === 'واجب' ? 'badge-warning' :
            'badge-info'
          } badge-lg`}>
            {stage.importance}
          </div>
        </div>

        <h2 className="card-title text-2xl mb-2">{stage.title}</h2>
        <p className="text-gray-500 mb-4">{stage.title_en}</p>
        
        <div className="divider"></div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">الوصف:</h3>
            <p className="text-base leading-relaxed">{stage.description}</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">التفاصيل:</h3>
            <ul className="list-disc list-inside space-y-2">
              {stage.details.map((detail, idx) => (
                <li key={idx} className="text-base leading-relaxed">{detail}</li>
              ))}
            </ul>
          </div>

          {stage.supplications && stage.supplications.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">الأدعية والأذكار:</h3>
              <div className="space-y-3">
                {stage.supplications.map((dua, idx) => (
                  <p key={idx} className="text-lg leading-loose text-right font-arabic">
                    {dua}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📍 المكان:</h4>
              <p>{stage.location}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⏰ الوقت:</h4>
              <p>{stage.time}</p>
            </div>
          </div>

          {stage.notes && stage.notes.length > 0 && (
            <div className="alert alert-info">
              <div>
                <h4 className="font-semibold mb-2">ملاحظات:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {stage.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProhibitionDetails = (prohibition: Prohibition) => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <button
          onClick={() => setSelectedProhibition(null)}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="badge badge-secondary badge-lg">المحظور {prohibition.number}</div>
          <div className={`badge ${
            prohibition.ruling === 'محظور' ? 'badge-error' :
            prohibition.ruling === 'مكروه' ? 'badge-warning' :
            'badge-info'
          } badge-lg`}>
            {prohibition.ruling}
          </div>
        </div>

        <h2 className="card-title text-2xl mb-2">{prohibition.title}</h2>
        <p className="text-gray-500 mb-4">{prohibition.title_en}</p>
        
        <div className="divider"></div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">الوصف:</h3>
            <p className="text-base leading-relaxed">{prohibition.description}</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">التفاصيل:</h3>
            <ul className="list-disc list-inside space-y-2">
              {prohibition.details.map((detail, idx) => (
                <li key={idx} className="text-base leading-relaxed">{detail}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">الكفارة:</h3>
            <p className="text-base">{prohibition.expiation}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">الدليل:</h3>
            <p className="text-base leading-relaxed text-right font-arabic">{prohibition.evidence}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">مناسك الحج والعمرة</h1>
        <p className="text-lg text-gray-600">دليل شامل لمناسك الحج والعمرة ومحظورات الإحرام</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8">
        <button
          className={`tab tab-lg ${activeTab === 'hajj' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('hajj');
            setSelectedStage(null);
            setSelectedProhibition(null);
          }}
        >
          الحج ({hajjStages.length} مرحلة)
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'umrah' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('umrah');
            setSelectedStage(null);
            setSelectedProhibition(null);
          }}
        >
          العمرة ({umrahStages.length} مرحلة)
        </button>
        <button
          className={`tab tab-lg ${activeTab === 'prohibitions' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('prohibitions');
            setSelectedStage(null);
            setSelectedProhibition(null);
          }}
        >
          محظورات الإحرام ({prohibitions.length} محظور)
        </button>
      </div>

      {/* Content */}
      <div className="mb-8">
        {selectedStage && renderStageDetails(selectedStage)}
        {selectedProhibition && renderProhibitionDetails(selectedProhibition)}
        
        {!selectedStage && !selectedProhibition && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'hajj' && hajjStages.map(renderStageCard)}
            {activeTab === 'umrah' && umrahStages.map(renderStageCard)}
            {activeTab === 'prohibitions' && prohibitions.map(renderProhibitionCard)}
          </div>
        )}
      </div>

      {/* External Link */}
      <div className="text-center mt-12">
        <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-2xl justify-center">منصة نسك الرسمية</h3>
            <p className="text-lg">للحجز والتسجيل في الحج والعمرة</p>
            <div className="card-actions justify-center mt-4">
              <a
                href="https://www.nusuk.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg bg-white text-green-600 hover:bg-gray-100"
              >
                زيارة منصة نسك ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NisukSection;
