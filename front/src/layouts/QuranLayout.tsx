import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function QuranLayout() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full bg-[radial-gradient(circle_at_top,_rgba(18,70,54,0.65),_#020605_70%)] text-white">
      <Outlet />
    </div>
  );
}

export default QuranLayout;
