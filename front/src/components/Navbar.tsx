import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const routes = [
  { to: "/", label: "الرئيسية" },
  { to: "/quran", label: "القرآن" },
  { to: "/adhkar", label: "الأذكار" },
  { to: "/self-learn", label: "التعليم الذاتي" },
  { to: "/halaqat", label: "حلقات التحفيظ" },
  { to: "/hadith", label: "الأحاديث" },
  { to: "/dawah", label: "الدعوة والإرشاد" },
  { to: "/ask-scholars", label: "تواصل مع أهل العلم" }
];

function Navbar() {
  const { role, logout, user } = useAuthStore();

  return (
    <nav className="bg-primary-dark/80 backdrop-blur sticky top-0 z-30 shadow-lg border-b border-primary-light/40">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-accent">
          مصحف الهدى
        </Link>
        <div className="flex-1 flex flex-wrap gap-3 text-sm">
          {routes.map((route) => (
            <NavLink
              key={route.to}
              to={route.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition-all ${
                  isActive ? "bg-primary-light text-white" : "hover:bg-primary/40"
                }`
              }
            >
              {route.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {user ? <span>مرحبًا {user.name}</span> : <span>زائر ({role})</span>}
          {user ? (
            <button className="btn btn-xs btn-error" onClick={logout}>
              خروج
            </button>
          ) : (
            <Link className="btn btn-xs btn-accent" to="/settings">
              دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
