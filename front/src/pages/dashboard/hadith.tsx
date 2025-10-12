import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import hadithList from "../../data/hadith_samples.json";

function DashboardHadith() {
  return (
    <RoleGuard allow={["admin", "lecturer"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة الأحاديث</h2>
          <p className="text-sm text-gray-300">
            راجع النصوص المعتمدة ومصادرها، وحدث التصنيفات بحسب الموضوعات.
          </p>
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
