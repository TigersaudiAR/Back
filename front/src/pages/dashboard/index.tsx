import { Link } from "react-router-dom";
import RoleGuard from "../../components/RoleGuard";

const sections = [
  { to: "/dashboard/content", title: "إدارة الواجهة" },
  { to: "/dashboard/quran", title: "إدارة القرآن" },
  { to: "/dashboard/adhkar", title: "إدارة الأذكار" },
  { to: "/dashboard/halaqat", title: "إدارة الحلقات" },
  { to: "/dashboard/hadith", title: "إدارة الأحاديث" },
  { to: "/dashboard/users", title: "المستخدمون" }
];

function DashboardIndex() {
  return (
    <RoleGuard allow={["admin", "teacher", "lecturer"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">لوحة التحكم</h2>
          <p className="text-sm text-gray-300">
            إدارة المحتوى والمستخدمين والحلقات من مكان واحد وفق الصلاحيات الممنوحة.
          </p>
        </header>
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="bg-primary-dark/50 border border-primary-light/30 rounded-3xl p-6 shadow-lg hover:border-accent transition"
            >
              <h3 className="text-lg font-semibold text-accent">{section.title}</h3>
              <p className="text-xs text-gray-300 mt-2">عرض وتحرير البيانات الخاصة بالقسم.</p>
            </Link>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}

export default DashboardIndex;
