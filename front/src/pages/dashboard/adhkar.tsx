import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import adhkarSets from "../../data/adhkar_sets.json";

function DashboardAdhkar() {
  const items = adhkarSets.flatMap((set) =>
    set.items.map((item) => ({
      ...item,
      setName: set.name
    }))
  );

  return (
    <RoleGuard allow={["admin", "teacher", "lecturer"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة الأذكار</h2>
          <p className="text-sm text-gray-300">عدّل النصوص، واضبط التكرار، وأضف تذكيرات مخصصة للمستخدمين.</p>
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
