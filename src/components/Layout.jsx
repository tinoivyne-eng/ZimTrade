import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className={isHome ? "flex-1" : "flex-1 max-w-6xl w-full mx-auto px-4 py-8"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}