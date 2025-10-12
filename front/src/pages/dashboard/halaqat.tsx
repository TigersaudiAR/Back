import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import type { Halaqah } from "../../types/halaqat";

const halaqat: Halaqah[] = [
  {
    id: "h1",
    title: "حلقة النور",
    level: "kids",
    teacher: "الشيخ عبد الرحمن",
    schedule: "الأحد والثلاثاء",
    members: 18,
    seats: 25,
    language: "العربية"
  }
];

function DashboardHalaqat() {
  return (
    <RoleGuard allow={["admin", "teacher"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة حلقات التحفيظ</h2>
          <p className="text-sm text-gray-300">
            أضف حلقات جديدة وحدد المدرسين والمقاعد المتاحة وتابع المتقدمين.
          </p>
        </header>
        <AdminTable
          data={halaqat}
          columns={[
            { key: "title", header: "اسم الحلقة" },
            { key: "teacher", header: "المعلم" },
            { key: "schedule", header: "الموعد" },
            { key: "members", header: "المشتركين" },
            { key: "seats", header: "المقاعد" }
          ]}
          actions={() => (
            <div className="flex gap-2">
              <button className="btn btn-xs btn-outline">تعديل</button>
              <button className="btn btn-xs btn-error">حذف</button>
            </div>
          )}
        />
      </div>
    </RoleGuard>
  );
}

export default DashboardHalaqat;
