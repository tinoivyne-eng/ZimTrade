import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../data/cities";

const inputClass =
  "w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 bg-white";

function Label({ children, hint }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {hint && <span className="ml-2 font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export default function EditAdvert() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("id")
      .then(({ data }) => setCategories(data || []));

    supabase
      .from("adverts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setNotFound(true);
        setForm({
          title: data.title || "",
          categoryId: String(data.category_id),
          price: data.price ?? "",
          currency: data.currency || "USD",
          city: data.city || "",
          condition: data.condition || "",
          description: data.description || "",
          status: data.status,
        });
      });
  }, [id, user.id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error } = await supabase
      .from("adverts")
      .update({
        title: form.title.trim(),
        category_id: Number(form.categoryId),
        price: form.price === "" ? null : Number(form.price),
        currency: form.currency,
        city: form.city,
        condition: form.condition || null,
        description: form.description.trim(),
        status: form.status,
      })
      .eq("id", id);

    setSaving(false);
    if (error) setError(error.message);
    else navigate("/my-adverts");
  };

  if (notFound) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900">Advert not found</h1>
        <p className="text-slate-500 mt-1">It doesn't exist or isn't yours to edit.</p>
        <Link to="/my-adverts" className="mt-4 inline-block text-brand-700 font-semibold hover:underline">
          Back to my adverts
        </Link>
      </div>
    );
  }

  if (!form) return <p className="text-center py-20 text-slate-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/my-adverts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 mb-4">
        <ArrowLeft size={16} /> Back to my adverts
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900">Edit advert</h1>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <Label>Title</Label>
          <input name="title" value={form.title} onChange={update} maxLength={100} className={inputClass} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <select name="categoryId" value={form.categoryId} onChange={update} className={inputClass} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>City</Label>
            <select name="city" value={form.city} onChange={update} className={inputClass} required>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label hint="leave empty if negotiable">Price</Label>
            <div className="flex gap-2">
              <select name="currency" value={form.currency} onChange={update} className={`${inputClass} !w-28`}>
                <option value="USD">USD</option>
                <option value="ZWG">ZWG</option>
              </select>
              <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={update} className={inputClass} />
            </div>
          </div>
          <div>
            <Label>Condition</Label>
            <select name="condition" value={form.condition} onChange={update} className={inputClass}>
              <option value="">Not applicable</option>
              <option value="New">New</option>
              <option value="Used - Like new">Used - Like new</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea name="description" value={form.description} onChange={update} rows={6} className={inputClass} required />
        </div>

        <div>
          <Label>Status</Label>
          <select name="status" value={form.status} onChange={update} className={inputClass}>
            <option value="active">Active (visible to everyone)</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          disabled={saving}
          className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          {saving ? (<><Loader2 size={18} className="animate-spin" /> Saving...</>) : "Save changes"}
        </button>
      </form>
    </div>
  );
}