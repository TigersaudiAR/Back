import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";

function QuranLayout() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  useEffect(() => {
    document.body.classList.add("overflow-hidden", "quran-page");
    return () => {
      document.body.classList.remove("overflow-hidden", "quran-page");
    };
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-white">
      <Outlet />
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 text-xs">
        <button onClick={() => navigate("/")} className="btn btn-sm btn-outline btn-accent">
          رجوع للرئيسية ({role})
        </button>
        <span className="hidden sm:block rounded-full border border-primary-light/40 bg-primary-dark/70 px-3 py-1 text-[11px] text-gray-200">
          اضغط على حرف T لإظهار الأدوات أو الأسهم للتنقل بين السور
        </span>
      </div>
    </div>
  );
}

export default QuranLayout;
