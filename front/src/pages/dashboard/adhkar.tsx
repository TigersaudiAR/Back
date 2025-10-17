import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import api from "../../lib/api";
import type { DhikrSet } from "../../types/adhkar";

function DashboardAdhkar() {
  const [adhkarSets, setAdhkarSets] = useState<DhikrSet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ all: DhikrSet[] }>("/adhkar")
      .then((response) => {
        if (!cancelled) {
          setAdhkarSets(response.data.all);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل بيانات الأذكار.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () =>
      adhkarSets.flatMap((set) =>
        set.items.map((item) => ({
          ...item,
          setName: set.name
        }))
      ),
    [adhkarSets]
  );

  return (
    <RoleGuard allow={["admin", "teacher", "lecturer"]} redirectTo="/">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة الأذكار</h2>
          <p className="text-sm text-gray-300">عدّل النصوص، واضبط التكرار، وأضف تذكيرات مخصصة للمستخدمين.</p>
          {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
        </header>
        <AdminTable
          data={items}
          columns={[
            { key: "title", header: "الذكر" },
            { key: "setName", header: "التصنيف" },
            { key: "count", header: "العدد" }
          ]}
          actions={() => <button className="btn btn-xs btn-outline">تحرير</button>}
        />
      </div>
    </RoleGuard>
  );
}

export default DashboardAdhkar;
