import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Building2, Car, Briefcase, Smartphone,
  ShoppingBag, Wrench, CalendarDays, UserPlus, ImagePlus, MessageCircle, ArrowRight,
} from "lucide-react";
import AdvertCard from "../components/AdvertCard";
import { supabase } from "../lib/supabase";
import { CITIES } from "../data/cities";

const categories = [
  { name: "Property", icon: Building2, color: "bg-blue-100 text-blue-700" },
  { name: "Vehicles", icon: Car, color: "bg-red-100 text-red-700" },
  { name: "Jobs", icon: Briefcase, color: "bg-purple-100 text-purple-700" },
  { name: "Electronics", icon: Smartphone, color: "bg-cyan-100 text-cyan-700" },
  { name: "Products", icon: ShoppingBag, color: "bg-pink-100 text-pink-700" },
  { name: "Services", icon: Wrench, color: "bg-orange-100 text-orange-700" },
  { name: "Events", icon: CalendarDays, color: "bg-yellow-100 text-yellow-700" },
];

const steps = [
  { icon: UserPlus, title: "Create an account", text: "Sign up free in under a minute." },
  { icon: ImagePlus, title: "Post your advert", text: "Add photos, a price and your details." },
  { icon: MessageCircle, title: "Get contacted", text: "Buyers call or WhatsApp you directly." },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [latest, setLatest] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    supabase
      .from("adverts")
      .select("*, categories(name), advert_images(url, position)")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setLatest(data || []);
        setLoadingLatest(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium backdrop-blur">
            🇿🇼 Zimbabwe's advertising marketplace
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Buy. Sell. <span className="text-accent-400">Discover.</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Cars, homes, jobs, gadgets and more, from sellers across Zimbabwe.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={20} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full py-3 outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 px-3 md:border-l">
              <MapPin size={20} className="text-slate-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="py-3 outline-none bg-transparent text-slate-700 w-full"
              >
                <option value="">All Zimbabwe</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button className="px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition">
              Search
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-8 md:gap-16 text-white">
            {[["Free", "To post"], [CITIES.length - 1 + "+", "Cities"], ["Direct", "Call & WhatsApp"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl md:text-3xl font-extrabold">{n}</p>
                <p className="text-sm text-white/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* CATEGORIES */}
        <section className="py-14">
          <h2 className="text-2xl font-bold text-slate-900">Browse by category</h2>
          <p className="text-slate-500 mt-1">Find exactly what you need.</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(({ name, icon: Icon, color }) => (
              <Link
                key={name}
                to={`/browse?category=${name}`}
                className="group bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition duration-300"
              >
                <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition`}>
                  <Icon size={26} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* LATEST ADVERTS */}
        <section className="pb-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Latest adverts</h2>
              <p className="text-slate-500 mt-1">Freshly posted around Zimbabwe.</p>
            </div>
            <Link to="/browse" className="hidden sm:flex items-center gap-1 text-brand-700 font-semibold hover:gap-2 transition-all">
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {loadingLatest ? (
            <p className="mt-6 text-slate-500">Loading adverts...</p>
          ) : latest.length === 0 ? (
            <div className="mt-6 text-center py-12 bg-white border border-dashed border-slate-300 rounded-2xl">
              <p className="font-semibold text-slate-700">No adverts yet</p>
              <Link to="/post" className="mt-2 inline-block text-brand-700 font-semibold hover:underline">
                Be the first to post one
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.map((a) => (
                <AdvertCard key={a.id} advert={a} />
              ))}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="pb-14">
          <h2 className="text-2xl font-bold text-slate-900 text-center">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Icon size={26} />
                </div>
                <p className="mt-4 text-xs font-bold text-accent-500 uppercase tracking-widest">Step {i + 1}</p>
                <h3 className="mt-1 font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-14">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-brand-900 p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Got something to sell?</h2>
            <p className="mt-3 text-white/70">Post your first advert for free and reach buyers across Zimbabwe.</p>
            <Link
              to="/post"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-accent-400 hover:bg-accent-500 text-slate-900 font-bold rounded-xl transition"
            >
              Post an Advert <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}