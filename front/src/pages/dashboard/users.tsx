import { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import RoleGuard from "../../components/RoleGuard";
import api from "../../lib/api";
import type { User } from "../../types/user";

function DashboardUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api
      .get<{ users: User[] }>("/users")
      .then((response) => setUsers(response.data.users))
      .catch(() => setUsers([]));
  }, []);

  return (
    <RoleGuard allow={["admin"]} redirectTo="/">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-accent">إدارة المستخدمين</h2>
          <p className="text-sm text-gray-300">أضف المستخدمين وحدد الأدوار والصلاحيات المختلفة.</p>
        </header>
        <AdminTable
          data={users}
          columns={[
            { key: "name", header: "الاسم" },
            { key: "email", header: "البريد" },
            { key: "role", header: "الدور" }
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

export default DashboardUsers;
