import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Clock, ImageOff } from "lucide-react";
import { formatPrice, timeAgo } from "../lib/format";
import { useSaved } from "../context/SavedContext";

export default function AdvertCard({ advert }) {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(advert.id);

  const images = [...(advert.advert_images || [])].sort((a, b) => a.position - b.position);
  const cover = images[0]?.url;

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await toggleSave(advert.id);
    if (!ok) navigate("/login", { state: { from: "/browse" } });
  };

  return (
    <Link
      to={`/adverts/${advert.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={advert.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff size={36} />
          </div>
        )}

        {advert.featured && (
          <span className="absolute top-3 left-3 bg-accent-400 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}

        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition ${
            saved ? "text-red-500" : "text-slate-600 hover:text-red-500"
          }`}
          aria-label={saved ? "Remove from saved" : "Save advert"}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>

        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-sm font-bold px-3 py-1 rounded-lg">
          {formatPrice(advert.price, advert.currency)}
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
          {advert.categories?.name}
        </p>
        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 leading-snug">{advert.title}</h3>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={14} />{advert.city}</span>
          <span className="flex items-center gap-1"><Clock size={14} />{timeAgo(advert.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}