import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";

const contentBlocks = [
  { id: "hero", title: "الواجهة الرئيسية", description: "نص الترحيب والبطاقات الرئيسية" },
  { id: "quran-highlight", title: "إبراز القرآن", description: "النص التعريفي في صفحة القرآن" }
];

function DashboardContent() {
  return (
    <RoleGuard allow={["admin", "lecturer"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة محتوى الواجهة</h2>
          <p className="text-sm text-gray-300">تحكم في النصوص والأقسام الظاهرة في الصفحة الرئيسية.</p>
        </header>
        <AdminTable
          data={contentBlocks}
          columns={[
            { key: "title", header: "العنوان" },
            { key: "description", header: "الوصف" }
          ]}
          actions={() => <button className="btn btn-xs btn-outline">تعديل</button>}
        />
      </div>
    </RoleGuard>
  );
}

export default DashboardContent;
