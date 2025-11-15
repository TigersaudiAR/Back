import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function QuranLayout() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "quran-page");
    return () => {
      document.body.classList.remove("overflow-hidden", "quran-page");
    };
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-white">
      <Outlet />
    </div>
  );
}

export default QuranLayout;
