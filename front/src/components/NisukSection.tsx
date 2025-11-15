import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NisukStep {
  id: string;
  step: number;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  details: string[];
  rulings: string[];
  dua: string;
  order: number;
}

interface Prohibition {
  id: string;
  title: string;
  title_en: string;
  description: string;
  ruling: string;
  penalty: string;
  exceptions?: string[];
  evidence: string;
}

export default function NisukSection() {
  const [activeTab, setActiveTab] = useState<'hajj' | 'umrah' | 'prohibitions'>('hajj');
  const [hajjSteps, setHajjSteps] = useState<NisukStep[]>([]);
  const [umrahSteps, setUmrahSteps] = useState<NisukStep[]>([]);
  const [prohibitions, setProhibitions] = useState<Prohibition[]>([]);
  const [selectedStep, setSelectedStep] = useState<NisukStep | null>(null);
  const [selectedProhibition, setSelectedProhibition] = useState<Prohibition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'hajj') {
          const response = await fetch('/api/nisuk/hajj');
          const data = await response.json();
          setHajjSteps(data.steps || []);
        } else if (activeTab === 'umrah') {
          const response = await fetch('/api/nisuk/umrah');
          const data = await response.json();
          setUmrahSteps(data.steps || []);
        } else {
          const response = await fetch('/api/nisuk/prohibitions');
          const data = await response.json();
          setProhibitions(data.prohibitions || []);
        }
      } catch (error) {
        console.error('Error fetching nisuk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderStepCard = (step: NisukStep) => (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
      onClick={() => setSelectedStep(step)}
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div className="badge badge-primary badge-lg">{step.step}</div>
          <h3 className="card-title text-lg">{step.title}</h3>
        </div>
        <p className="text-sm text-base-content/70 line-clamp-2">{step.description}</p>
        <div className="card-actions justify-end mt-2">
          <button className="btn btn-sm btn-ghost">عرض التفاصيل</button>
        </div>
      </div>
    </motion.div>
  );

  const renderProhibitionCard = (prohibition: Prohibition) => (
    <motion.div
      key={prohibition.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
      onClick={() => setSelectedProhibition(prohibition)}
    >
      <div className="card-body">
        <h3 className="card-title text-lg">{prohibition.title}</h3>
        <p className="text-sm text-base-content/70 line-clamp-2">{prohibition.description}</p>
        <div className="badge badge-warning mt-2">{prohibition.ruling}</div>
        <div className="card-actions justify-end mt-2">
          <button className="btn btn-sm btn-ghost">عرض التفاصيل</button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">مناسك الحج والعمرة</h1>
        <p className="text-lg text-base-content/70">دليلك الشامل لأداء مناسك الحج والعمرة</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8">
        <a
          className={`tab tab-lg ${activeTab === 'hajj' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('hajj')}
        >
          مناسك الحج
        </a>
        <a
          className={`tab tab-lg ${activeTab === 'umrah' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('umrah')}
        >
          مناسك العمرة
        </a>
        <a
          className={`tab tab-lg ${activeTab === 'prohibitions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('prohibitions')}
        >
          محظورات الإحرام
        </a>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'hajj' && hajjSteps.map(renderStepCard)}
          {activeTab === 'umrah' && umrahSteps.map(renderStepCard)}
          {activeTab === 'prohibitions' && prohibitions.map(renderProhibitionCard)}
        </div>
      )}

      {/* Step Detail Modal */}
      {selectedStep && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-sm btn-circle absolute left-2 top-2"
              onClick={() => setSelectedStep(null)}
            >
              ✕
            </button>
            <h3 className="font-bold text-2xl mb-4">{selectedStep.title}</h3>
            <p className="text-base-content/80 mb-4">{selectedStep.description}</p>
            
            {selectedStep.details && selectedStep.details.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">التفاصيل:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {selectedStep.details.map((detail, idx) => (
                    <li key={idx} className="text-sm">{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedStep.rulings && selectedStep.rulings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">الأحكام:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {selectedStep.rulings.map((ruling, idx) => (
                    <li key={idx} className="text-sm">{ruling}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedStep.dua && (
              <div className="alert alert-info">
                <div>
                  <h4 className="font-semibold">الدعاء المأثور:</h4>
                  <p className="text-lg mt-2 font-arabic">{selectedStep.dua}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prohibition Detail Modal */}
      {selectedProhibition && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-sm btn-circle absolute left-2 top-2"
              onClick={() => setSelectedProhibition(null)}
            >
              ✕
            </button>
            <h3 className="font-bold text-2xl mb-4">{selectedProhibition.title}</h3>
            <p className="text-base-content/80 mb-4">{selectedProhibition.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="alert alert-warning">
                <div>
                  <h4 className="font-semibold">الحكم:</h4>
                  <p>{selectedProhibition.ruling}</p>
                </div>
              </div>
              <div className="alert alert-error">
                <div>
                  <h4 className="font-semibold">الكفارة:</h4>
                  <p>{selectedProhibition.penalty}</p>
                </div>
              </div>
            </div>

            {selectedProhibition.exceptions && selectedProhibition.exceptions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">الاستثناءات:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {selectedProhibition.exceptions.map((exception, idx) => (
                    <li key={idx} className="text-sm">{exception}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="alert alert-info">
              <div>
                <h4 className="font-semibold">الدليل:</h4>
                <p className="text-sm mt-2">{selectedProhibition.evidence}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
