import { useEffect, useState } from "react";
import api from "../lib/api";

interface PrayerResponse {
  times: Record<string, string>;
  qiblaBearing: number;
}

function QiblaWidget() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("الرجاء تمكين الموقع لحساب القبلة");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await api.get<PrayerResponse>("/prayers", {
            params: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
          setBearing(response.data.qiblaBearing);
          setTimes(response.data.times);
        } catch (err) {
          console.error(err);
          setError("تعذر جلب المواقيت");
        }
      },
      () => setError("تعذر تحديد الموقع")
    );
  }, []);

  return (
    <div className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-accent">اتجاه القبلة ومواقيت الصلاة</h3>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {bearing !== null && (
        <div className="flex items-center gap-3 text-sm">
          <span>اتجاه القبلة التقريبي:</span>
          <span className="badge badge-accent">{bearing.toFixed(2)}°</span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {Object.entries(times).map(([key, value]) => (
          <div key={key} className="bg-primary-dark/70 border border-primary-light/30 rounded-2xl px-3 py-2">
            <p className="font-semibold">{key}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QiblaWidget;
