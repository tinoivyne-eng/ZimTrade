import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MapPin, Pencil, Trash2, CheckCircle2, RotateCcw, ImageOff, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatPrice, timeAgo } from "../lib/format";

const statusStyle = {
  active: "bg-green-100 text-green-700",
  sold: "bg-slate-200 text-slate-700",
  hidden: "bg-amber-100 text-amber-800",
};

export default function MyAdverts() {
  const { user } = useAuth();
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    supabase
      .from("adverts")
      .select("*, categories(name), advert_images(url, position)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setAdverts(data || []);
        setLoading(false);
      });
  }, [user.id]);

  const changeStatus = async (advert, status) => {
    setBusyId(advert.id);
    setError("");
    const { error } = await supabase.from("adverts").update({ status }).eq("id", advert.id);
    if (error) setError(error.message);
    else setAdverts((list) => list.map((a) => (a.id === advert.id ? { ...a, status } : a)));
    setBusyId(null);
  };

  const handleDelete = async (advert) => {
    if (!window.confirm(`Delete "${advert.title}"? This cannot be undone.`)) return;
    setBusyId(advert.id);
    setError("");

    // Remove the photo files from storage first
    const paths = (advert.advert_images || [])
      .map((img) => img.url.split("/advert-images/")[1])
      .filter(Boolean)
      .map(decodeURIComponent);

    if (paths.length > 0) {
      await supabase.storage.from("advert-images").remove(paths);
    }

    const { error } = await supabase.from("adverts").delete().eq("id", advert.id);
    if (error) setError(error.message);
    else setAdverts((list) => list.filter((a) => a.id !== advert.id));
    setBusyId(null);
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My adverts</h1>
          <p className="text-slate-500 mt-1">Manage everything you've posted.</p>
        </div>
        <Link
          to="/post"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl"
        >
          <Plus size={18} /> New advert
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : adverts.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
          <p className="font-semibold text-slate-700">You haven't posted anything yet</p>
          <Link to="/post" className="mt-2 inline-block text-brand-700 font-semibold hover:underline">
            Post your first advert
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {adverts.map((a) => {
            const cover = [...(a.advert_images || [])].sort((x, y) => x.position - y.position)[0]?.url;
            const busy = busyId === a.id;

            return (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
              >
                <Link to={`/adverts/${a.id}`} className="shrink-0 w-full sm:w-40 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                  {cover ? (
                    <img src={cover} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageOff size={28} />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">{a.categories?.name}</p>
                      <Link to={`/adverts/${a.id}`} className="block font-bold text-slate-900 truncate hover:text-brand-700">
                        {a.title}
                      </Link>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[a.status]}`}>
                      {a.status}
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">{formatPrice(a.price, a.currency)}</p>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{a.city}</span>
                    <span className="flex items-center gap-1"><Eye size={14} />{a.views} views</span>
                    <span>Posted {timeAgo(a.created_at)}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/edit/${a.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:border-brand-600 hover:text-brand-700"
                    >
                      <Pencil size={15} /> Edit
                    </Link>

                    {a.status === "active" ? (
                      <button
                        disabled={busy}
                        onClick={() => changeStatus(a, "sold")}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} /> Mark as sold
                      </button>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => changeStatus(a, "active")}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
                      >
                        <RotateCcw size={15} /> Reactivate
                      </button>
                    )}

                    <button
                      disabled={busy}
                      onClick={() => handleDelete(a)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}