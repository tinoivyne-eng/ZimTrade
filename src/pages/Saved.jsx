import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../context/SavedContext";
import AdvertCard from "../components/AdvertCard";

export default function Saved() {
  const { user } = useAuth();
  const { isSaved } = useSaved();
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("saved_adverts")
      .select("created_at, adverts(*, categories(name), advert_images(url, position))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        // Adverts that were hidden or sold come back as null, so skip them
        setAdverts((data || []).map((r) => r.adverts).filter(Boolean));
        setLoading(false);
      });
  }, [user.id]);

  // Hide an advert from the list as soon as it is un-hearted
  const visible = adverts.filter((a) => isSaved(a.id));

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900">Saved adverts</h1>
      <p className="text-slate-500 mt-1">Adverts you've hearted, all in one place.</p>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : visible.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
          <Heart size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">Nothing saved yet</p>
          <Link to="/browse" className="mt-2 inline-block text-brand-700 font-semibold hover:underline">
            Browse adverts
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((a) => (
            <AdvertCard key={a.id} advert={a} />
          ))}
        </div>
      )}
    </div>
  );
}