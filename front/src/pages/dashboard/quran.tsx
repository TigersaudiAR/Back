import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import surahList from "../../data/surah_index.json";
import tafsirData from "../../data/tafsir_samples.json";

function DashboardQuran() {
  return (
    <RoleGuard allow={["admin", "teacher"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة سور وآيات القرآن</h2>
          <p className="text-sm text-gray-300">
            راجع بيانات السور والتفسير المرفق، وأدر التلاوات المعتمدة.
          </p>
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
          data={tafsirData}
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
