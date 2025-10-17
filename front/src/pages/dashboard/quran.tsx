import { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import api from "../../lib/api";
import type { Surah, Tafsir } from "../../types/quran";

function DashboardQuran() {
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [tafsirList, setTafsirList] = useState<Tafsir[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [surahResponse, tafsirResponse] = await Promise.all([
          api.get<{ surahs: Surah[] }>("/quran/index"),
          api.get<{ tafsir: Tafsir[] }>("/quran/tafsir")
        ]);
        if (cancelled) return;
        setSurahList(surahResponse.data.surahs);
        setTafsirList(tafsirResponse.data.tafsir);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل بيانات القرآن، يرجى المحاولة لاحقًا.");
        }
      }
    };
    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RoleGuard allow={["admin", "teacher"]} redirectTo="/">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة سور وآيات القرآن</h2>
          <p className="text-sm text-gray-300">راجع بيانات السور والتفسير المرفق، وأدر التلاوات المعتمدة.</p>
          {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
        </header>
        <AdminTable
          data={surahList}
          columns={[
            { key: "id", header: "رقم" },
            { key: "name_ar", header: "السورة" },
            { key: "revelation_place", header: "مكان النزول" },
            { key: "ayah_count", header: "عدد الآيات" }
          ]}
          actions={() => <button className="btn btn-xs">تفاصيل</button>}
        />
        <AdminTable
          data={tafsirList}
          columns={[
            { key: "surah_id", header: "السورة" },
            { key: "ayah_number", header: "الآية" },
            { key: "source", header: "المصدر" },
            { key: "text_ar", header: "النص" }
          ]}
          actions={() => <button className="btn btn-xs btn-outline">تحرير</button>}
        />
      </div>
    </RoleGuard>
  );
}

export default DashboardQuran;
