import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin, Clock, Eye, Phone, MessageCircle, Share2, ChevronLeft,
  ChevronRight, ImageOff, Tag, ShieldCheck, ArrowLeft, User,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatPrice, timeAgo, toWhatsAppNumber } from "../lib/format";
import { APP_NAME } from "../config";
import ReportButton from "../components/ReportButton";

export default function AdvertDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [advert, setAdvert] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setCurrent(0);

    async function load() {
      const { data, error } = await supabase
        .from("adverts")
        .select("*, categories(name), advert_images(url, position)")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      data.advert_images = [...(data.advert_images || [])].sort(
        (a, b) => a.position - b.position
      );
      setAdvert(data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, whatsapp, city, created_at")
        .eq("id", data.user_id)
        .maybeSingle();

      if (cancelled) return;
      setSeller(profile);
      setLoading(false);

      // Count the view
      supabase
        .rpc("increment_views", { advert_uuid: id })
        .then(({ error }) => {
          if (error) console.error("View count failed:", error.message);
        });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grid lg:grid-cols-3 gap-8 animate-pulse">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl" />
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <ImageOff size={48} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Advert not found</h1>
        <p className="text-slate-500 mt-1">It may have been removed or marked as sold.</p>
        <Link to="/browse" className="mt-6 inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline">
          <ArrowLeft size={18} /> Back to browse
        </Link>
      </div>
    );
  }

  const images = advert.advert_images;
  const phone = seller?.phone || "";
  const whatsapp = toWhatsAppNumber(seller?.whatsapp || seller?.phone);
  const isOwner = user?.id === advert.user_id;

  const waMessage = encodeURIComponent(
    `Hi, I saw your advert "${advert.title}" on ${APP_NAME}. Is it still available?`
  );

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: advert.title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 mb-4">
        <ArrowLeft size={16} /> Back to browse
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: gallery + details */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            {images.length > 0 ? (
              <img src={images[current].url} alt={advert.title} className="w-full h-full object-contain bg-slate-900/5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageOff size={56} />
              </div>
            )}

            {advert.featured && (
              <span className="absolute top-4 left-4 bg-accent-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                Featured
              </span>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} />
                </button>
                <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {current + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setCurrent(i)}
                  className={`shrink-0 h-16 w-20 rounded-lg overflow-hidden border-2 transition ${
                    i === current ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
              {advert.categories?.name}
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {advert.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin size={16} />{advert.city}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} />{timeAgo(advert.created_at)}</span>
              <span className="flex items-center gap-1.5"><Eye size={16} />{advert.views} views</span>
              {advert.condition && (
                <span className="flex items-center gap-1.5"><Tag size={16} />{advert.condition}</span>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900">Description</h2>
            <p className="mt-3 text-slate-600 whitespace-pre-line leading-relaxed">
              {advert.description}
            </p>
          </div>
        </div>

        {/* RIGHT: price + seller */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">Price</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatPrice(advert.price, advert.currency)}
            </p>

            <div className="mt-5 space-y-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition"
                >
                  <Phone size={18} /> Call seller
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${waMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold rounded-xl transition"
                >
                  <MessageCircle size={18} /> WhatsApp seller
                </a>
              )}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-300 hover:border-brand-600 hover:text-brand-700 font-semibold rounded-xl transition"
              >
                <Share2 size={18} /> {copied ? "Link copied!" : "Share"}
              </button>
            </div>
          </div>

          <Link
            to={`/seller/${advert.user_id}`}
            className="block bg-white border border-slate-200 hover:border-brand-600 rounded-2xl p-6 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                <User size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{seller?.full_name || "Seller"}</p>
                {seller?.created_at && (
                  <p className="text-xs text-slate-500">
                    Member since {new Date(seller.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-700">View all adverts by this seller</p>
          </Link>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-bold">
              <ShieldCheck size={18} /> Stay safe
            </p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Meet in a public place</li>
              <li>Inspect the item before you pay</li>
              <li>Never pay in advance for something you haven't seen</li>
            </ul>
          </div>

          {!isOwner && <ReportButton advertId={advert.id} />}
        </aside>
      </div>
    </div>
  );
}