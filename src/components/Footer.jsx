import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import { APP_NAME } from "../config";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-white text-xl font-extrabold">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center">
              <Megaphone size={18} />
            </span>
            <span>
              {APP_NAME}<span className="text-accent-400">.</span>
            </span>
          </div>
          <p className="mt-3 text-sm">Everything Zimbabwe is selling, in one place.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browse" className="hover:text-white">Browse adverts</Link></li>
            <li><Link to="/post" className="hover:text-white">Post an advert</Link></li>
            <li><Link to="/saved" className="hover:text-white">Saved adverts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/my-adverts" className="hover:text-white">My adverts</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 text-center text-xs py-5">
        © {new Date().getFullYear()} {APP_NAME}. Made in Zimbabwe 🇿🇼
      </div>
    </footer>
  );
}