import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, X, Loader2, SearchX } from "lucide-react";
import { supabase } from "../lib/supabase";
import AdvertCard from "../components/AdvertCard";
import { CITIES } from "../data/cities";

const PAGE_SIZE = 12;

const inputClass =
  "w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 bg-white text-sm";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const sort = searchParams.get("sort") || "newest";

  // Local form state (applied when the user presses Search)
  const [qInput, setQInput] = useState(q);
  const [minInput, setMinInput] = useState(min);
  const [maxInput, setMaxInput] = useState(max);

  const [categories, setCategories] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  // Keep inputs in sync when the URL changes (e.g. from the home page)
  useEffect(() => {
    setQInput(q);
    setMinInput(min);
    setMaxInput(max);
  }, [q, min, max]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("id")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const fetchPage = async (page) => {
    let query = supabase
      .from("adverts")
      .select("*, categories!inner(name), advert_images(url, position)")
      .eq("status", "active");

    if (category) query = query.eq("categories.name", category);
    if (city) query = query.eq("city", city);
    if (min) query = query.gte("price", Number(min));
    if (max) query = query.lte("price", Number(max));

    if (q) {
      const safe = q.replace(/[,()%]/g, " ").trim();
      if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }

    // Featured adverts always come first, then the chosen sort
    query = query.order("featured", { ascending: false });

    if (sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false });
    else if (sort === "price_desc") query = query.order("price", { ascending: false, nullsFirst: false });
    else query = query.order("created_at", { ascending: false });

    const from = page * PAGE_SIZE;
    return query.range(from, from + PAGE_SIZE - 1);
  };

  // Reload from page 1 whenever the filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchPage(0).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setAdverts([]);
        setHasMore(false);
      } else {
        setAdverts(data);
        setHasMore(data.length === PAGE_SIZE);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const loadMore = async () => {
    setLoadingMore(true);
    const page = Math.ceil(adverts.length / PAGE_SIZE);
    const { data, error } = await fetchPage(page);
    if (error) setError(error.message);
    else {
      setAdverts((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const values = { q: qInput.trim(), min: minInput, max: maxInput };
    Object.entries(values).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = q || category || city || min || max;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900">Browse adverts</h1>
      <p className="text-slate-500 mt-1">Search and filter adverts from all over Zimbabwe.</p>

      {/* Search + filters */}
      <form
        onSubmit={applyFilters}
        className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid gap-3 md:grid-cols-12"
      >
        <div className="md:col-span-4 flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
          <Search size={18} className="text-slate-400" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search adverts..."
            className="w-full py-2.5 outline-none text-sm bg-transparent"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <MapPin size={18} className="text-slate-400 shrink-0" />
          <select value={city} onChange={(e) => setParam("city", e.target.value)} className={inputClass}>
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Min $"
            className={inputClass}
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            min="0"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Max $"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <select value={sort} onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)} className={inputClass}>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <button className="md:col-span-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl transition">
          Go
        </button>
      </form>

      {/* Category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setParam("category", "")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition ${
            !category
              ? "bg-brand-700 text-white border-brand-700"
              : "bg-white text-slate-600 border-slate-200 hover:border-brand-600"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setParam("category", c.name)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition ${
              category === c.name
                ? "bg-brand-700 text-white border-brand-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-600"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Result info */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <p>
          {loading ? "Searching..." : `${adverts.length}${hasMore ? "+" : ""} advert${adverts.length === 1 ? "" : "s"} found`}
        </p>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-red-600 font-semibold hover:underline">
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {/* Results */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-3 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : adverts.length === 0 ? (
        <div className="mt-10 text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
          <SearchX size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No adverts found</p>
          <p className="text-sm text-slate-500">Try different keywords or clear your filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adverts.map((a) => (
              <AdvertCard key={a.id} advert={a} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white border border-slate-300 hover:border-brand-600 hover:text-brand-700 font-semibold rounded-xl transition disabled:opacity-60 inline-flex items-center gap-2"
              >
                {loadingMore && <Loader2 size={18} className="animate-spin" />}
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}