import { useEffect, useMemo, useState } from "react";
import { Navigation2, RefreshCcw } from "lucide-react";
import api from "../lib/api";

interface PrayerResponse {
  times: Record<string, string>;
  qiblaBearing: number;
  city?: string;
}

function QiblaWidget() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [city, setCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (lat: number, lng: number) => {
    try {
      const response = await api.get<PrayerResponse>("/prayers", {
        params: { lat, lng }
      });
      setBearing(response.data.qiblaBearing);
      setTimes(response.data.times);
      setCity(response.data.city ?? null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("تعذر جلب المواقيت، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("الرجاء تمكين الموقع لحساب القبلة");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchData(position.coords.latitude, position.coords.longitude).catch(() => setLoading(false));
      },
      () => {
        setError("تعذر تحديد الموقع");
        setLoading(false);
      }
    );
  }, []);

  const qiblaText = useMemo(() => {
    if (bearing === null) return "";
    const degree = bearing.toFixed(1);
    if (bearing > 337.5 || bearing <= 22.5) return `الشمال (${degree}°)`;
    if (bearing <= 67.5) return `الشمال الشرقي (${degree}°)`;
    if (bearing <= 112.5) return `الشرق (${degree}°)`;
    if (bearing <= 157.5) return `الجنوب الشرقي (${degree}°)`;
    if (bearing <= 202.5) return `الجنوب (${degree}°)`;
    if (bearing <= 247.5) return `الجنوب الغربي (${degree}°)`;
    if (bearing <= 292.5) return `الغرب (${degree}°)`;
    return `الشمال الغربي (${degree}°)`;
  }, [bearing]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(32,120,90,0.2),_transparent_70%)]" />
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-accent">اتجاه القبلة</h3>
        <button
          type="button"
          className="btn btn-xs btn-outline gap-2"
          onClick={() => {
            setLoading(true);
            if (!navigator.geolocation) {
              setError("الرجاء تمكين الموقع لحساب القبلة");
              setLoading(false);
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (position) => {
                fetchData(position.coords.latitude, position.coords.longitude).catch(() => setLoading(false));
              },
              () => {
                setError("تعذر تحديد الموقع");
                setLoading(false);
              }
            );
          }}
        >
          <RefreshCcw className="h-3 w-3" /> تحديث
        </button>
      </div>
      {loading ? (
        <p className="mt-4 text-xs text-gray-300">جاري تحديد موقعك بدقة...</p>
      ) : (
        <>
          {city && <p className="mt-2 text-xs text-gray-300">الموقع الحالي: {city}</p>}
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          {bearing !== null && (
            <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-primary-light/30 bg-primary-dark/70 p-4">
              <div className="flex items-center gap-3 text-accent">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10">
                  <Navigation2 className="h-6 w-6" />
                </span>
                <div className="text-sm">
                  <p className="font-semibold">اتجاه القبلة نحو {qiblaText}</p>
                  <p className="text-xs text-gray-300">قم بمحاذاة هاتفك أو الشاشة حتى يتطابق المؤشر.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-100">
                {Object.entries(times).map(([name, value]) => (
                  <div key={name} className="rounded-2xl border border-primary-light/20 bg-primary-dark/60 px-3 py-2">
                    <p className="font-semibold">{name}</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QiblaWidget;
