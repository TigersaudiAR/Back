import { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import api from "../../lib/api";
import type { Hadith } from "../../types/hadith";

function DashboardHadith() {
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ hadith: Hadith[] }>("/hadith")
      .then((response) => {
        if (!cancelled) {
          setHadithList(response.data.hadith);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("تعذر تحميل بيانات الأحاديث.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RoleGuard allow={["admin", "lecturer"]} redirectTo="/">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <header className="rounded-3xl border border-primary-light/40 bg-primary-dark/60 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة الأحاديث</h2>
          <p className="text-sm text-gray-300">راجع النصوص المعتمدة ومصادرها، وحدث التصنيفات بحسب الموضوعات.</p>
          {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
        </header>
        <AdminTable
          data={hadithList}
          columns={[
            { key: "source", header: "المصدر" },
            { key: "number", header: "الرقم" },
            { key: "topic", header: "الموضوع" }
          ]}
          actions={() => <button className="btn btn-xs">تحرير</button>}
        />
      </div>
    </RoleGuard>
  );
}

export default DashboardHadith;
