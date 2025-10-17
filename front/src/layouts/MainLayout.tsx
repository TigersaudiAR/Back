import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(20,80,62,0.45),_#040b0a_65%)] text-base-content">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border border-primary-light/20 bg-primary-dark/40 p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-lg">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
