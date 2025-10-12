import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";

function QuranLayout() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-primary-dark to-black text-white">
      <Outlet />
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 right-4 z-50 btn btn-sm btn-outline btn-accent"
      >
        رجوع للرئيسية ({role})
      </button>
    </div>
  );
}

export default QuranLayout;
