import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Plus, Heart, User, Megaphone, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "../config";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-semibold transition ${
    isActive ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:text-brand-700 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!profile?.is_admin;

  const handleLogout = async () => {
    await signOut();
    close();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center text-white">
            <Megaphone size={20} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            {APP_NAME}<span className="text-accent-500">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/browse" className={linkClass}>Browse</NavLink>
          <NavLink to="/my-adverts" className={linkClass}>My Adverts</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              <span className="flex items-center gap-1"><ShieldCheck size={16} /> Admin</span>
            </NavLink>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/saved" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Saved">
            <Heart size={20} />
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {profile?.full_name?.split(" ")[0] || "Account"}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <User size={18} /> Login
            </Link>
          )}

          <Link
            to="/post"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 shadow-sm"
          >
            <Plus size={18} /> Post Advert
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-1">
          <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
          <NavLink to="/browse" className={linkClass} onClick={close}>Browse</NavLink>
          <NavLink to="/saved" className={linkClass} onClick={close}>Saved</NavLink>
          <NavLink to="/my-adverts" className={linkClass} onClick={close}>My Adverts</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkClass} onClick={close}>Admin</NavLink>}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={close}>Login</NavLink>
          )}

          <Link
            to="/post"
            onClick={close}
            className="mt-2 px-4 py-2.5 bg-brand-700 text-white text-center text-sm font-semibold rounded-lg"
          >
            Post an Advert
          </Link>
        </div>
      )}
    </header>
  );
}