import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import type { Role } from "../types/user";

interface RoleGuardProps {
  children: React.ReactNode;
  allow: Role | Role[];
  redirectTo?: string;
}

function RoleGuard({ children, allow, redirectTo = "/" }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);
  const allowed = Array.isArray(allow) ? allow.includes(role) : role === allow;

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;
