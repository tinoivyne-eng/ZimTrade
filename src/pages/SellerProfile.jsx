import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { User, MapPin, CalendarDays, ArrowLeft, SearchX } from "lucide-react";
import { supabase } from "../lib/supabase";
import AdvertCard from "../components/AdvertCard";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    async function load() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, city, created_at")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (!profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setSeller(profile);

      const { data } = await supabase
        .from("adverts")
        .select("*, categories(name), advert_images(url, position)")
        .eq("user_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setAdverts(data || []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-center py-20 text-slate-500">Loading...</p>;

  if (notFound) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900">Seller not found</h1>
        <Link to="/browse" className="mt-4 inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline">
          <ArrowLeft size={18} /> Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 mb-4">
        <ArrowLeft size={16} /> Back to browse
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          <User size={30} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{seller.full_name || "Seller"}</h1>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
            {seller.city && (
              <span className="flex items-center gap-1.5"><MapPin size={15} />{seller.city}</span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} />
              Member since{" "}
              {new Date(seller.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold text-slate-900">
        Adverts by {seller.full_name?.split(" ")[0] || "this seller"} ({adverts.length})
      </h2>

      {adverts.length === 0 ? (
        <div className="mt-4 text-center py-14 bg-white border border-dashed border-slate-300 rounded-2xl">
          <SearchX size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No active adverts</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adverts.map((a) => (
            <AdvertCard key={a.id} advert={a} />
          ))}
        </div>
      )}
    </div>
  );
}