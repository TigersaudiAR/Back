import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { BookOpenCheck, LogOut, Menu, MessageCircleQuestion, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-primary-dark/85 supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40 shadow-2xl border-b border-primary-light/40">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-accent">
          <BookOpenCheck className="h-6 w-6" />
          <span>مصحف الهدى</span>
        </Link>
        <button
          className="lg:hidden btn btn-sm btn-ghost border border-primary-light/40"
          type="button"
          aria-label="القائمة"
          onClick={handleToggle}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="hidden lg:flex flex-1 items-center justify-end gap-2 text-sm">
          {routes.map((route) => (
            <NavLink
              key={route.to}
              to={route.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all border ${
                  isActive
                    ? "bg-accent border-accent text-primary-dark"
                    : "border-transparent hover:border-primary-light/60 hover:bg-primary/40"
                }`
              }
            >
              {route.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3 text-xs">
          {user ? (
            <span className="flex items-center gap-1 text-gray-200">
              <MessageCircleQuestion className="h-4 w-4" /> مرحبًا {user.name}
            </span>
          ) : (
            <span className="text-gray-200">زائر ({role})</span>
          )}
          {user ? (
            <button className="btn btn-xs btn-error gap-1" onClick={logout}>
              <LogOut className="h-3 w-3" /> خروج
            </button>
          ) : (
            <Link className="btn btn-xs btn-accent" to="/settings">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-primary-light/30 bg-primary-dark/95">
          <div className="container mx-auto px-4 py-4 space-y-4 text-sm">
            <div className="flex flex-col gap-2">
              {routes.map((route) => (
                <NavLink
                  key={route.to}
                  to={route.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-2xl border transition ${
                      isActive
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-primary-light/20 hover:border-accent/40"
                    }`
                  }
                  onClick={closeMenu}
                >
                  {route.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-200">
              {user ? <span>مرحبًا {user.name}</span> : <span>زائر ({role})</span>}
              {user ? (
                <button className="btn btn-xs btn-error gap-1" onClick={() => { logout(); closeMenu(); }}>
                  <LogOut className="h-3 w-3" /> خروج
                </button>
              ) : (
                <Link className="btn btn-xs btn-accent" to="/settings" onClick={closeMenu}>
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
