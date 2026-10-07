import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ImagePlus, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../data/cities";
import { prepareImage, isHeic } from "../lib/images";

const MAX_IMAGES = 5;

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
  const [existing, setExisting] = useState([]); // images already saved: { id, url, position }
  const [removedIds, setRemovedIds] = useState([]); // existing image ids to delete on save
  const [newFiles, setNewFiles] = useState([]); // [{ file, preview }]
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("id")
      .then(({ data }) => setCategories(data || []));

    supabase
      .from("adverts")
      .select("*, advert_images(id, url, position)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setNotFound(true);
        setExisting(
          [...(data.advert_images || [])].sort((a, b) => a.position - b.position)
        );
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

  const keptExisting = existing.filter((img) => !removedIds.includes(img.id));
  const totalPhotos = keptExisting.length + newFiles.length;

  const handleFiles = async (e) => {
    setError("");
    const picked = Array.from(e.target.files);
    e.target.value = "";

    const room = MAX_IMAGES - totalPhotos;
    if (picked.length > room) setError(`You can have up to ${MAX_IMAGES} photos.`);

    setProcessing(true);
    const valid = [];

    for (const file of picked.slice(0, Math.max(room, 0))) {
      if (!file.type.startsWith("image/") && !isHeic(file)) {
        setError("Only image files are allowed.");
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError(`${file.name} is too large (25MB max).`);
        continue;
      }
      try {
        const processed = await prepareImage(file);
        valid.push({ file: processed, preview: URL.createObjectURL(processed) });
      } catch {
        setError(`Could not read ${file.name}. Try a different photo.`);
      }
    }

    setNewFiles((prev) => [...prev, ...valid]);
    setProcessing(false);
  };

  const removeExisting = (imgId) => setRemovedIds([...removedIds, imgId]);

  const removeNew = (index) => {
    URL.revokeObjectURL(newFiles[index].preview);
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (totalPhotos === 0) return setError("Please keep at least one photo.");

    setSaving(true);

    try {
      // 1. Update the text details
      const { error: updateError } = await supabase
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

      if (updateError) throw updateError;

      // 2. Upload new photos (before deleting anything, so a failure loses nothing)
      if (newFiles.length > 0) {
        const lastPosition = existing.reduce((max, img) => Math.max(max, img.position), -1);
        const rows = [];

        for (let i = 0; i < newFiles.length; i++) {
          const { file } = newFiles[i];
          const ext = file.name.split(".").pop().toLowerCase();
          const path = `${user.id}/${id}-${Date.now()}-${i}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("advert-images")
            .upload(path, file);
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("advert-images").getPublicUrl(path);
          rows.push({ advert_id: id, url: urlData.publicUrl, position: lastPosition + 1 + i });
        }

        const { error: insertError } = await supabase.from("advert_images").insert(rows);
        if (insertError) throw insertError;
      }

      // 3. Delete removed photos (files first, then the database rows)
      if (removedIds.length > 0) {
        const removed = existing.filter((img) => removedIds.includes(img.id));
        const paths = removed
          .map((img) => img.url.split("/advert-images/")[1])
          .filter(Boolean)
          .map(decodeURIComponent);

        if (paths.length > 0) await supabase.storage.from("advert-images").remove(paths);

        const { error: deleteError } = await supabase
          .from("advert_images")
          .delete()
          .in("id", removedIds);
        if (deleteError) throw deleteError;
      }

      navigate("/my-adverts");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
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
        {/* Photos */}
        <div>
          <Label hint={`up to ${MAX_IMAGES} photos, any size`}>Photos</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {keptExisting.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExisting(img.id)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-red-600"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {newFiles.map((f, i) => (
              <div key={f.preview} className="relative aspect-square rounded-xl overflow-hidden border-2 border-brand-500">
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-brand-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  New
                </span>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-red-600"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {totalPhotos < MAX_IMAGES && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-600 hover:bg-brand-50 cursor-pointer flex flex-col items-center justify-center text-slate-500 text-xs gap-1 transition">
                <ImagePlus size={24} />
                {processing ? "Processing..." : "Add photo"}
                <input type="file" accept="image/*,.heic,.heif" multiple onChange={handleFiles} className="hidden" />
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">Photos are only changed when you click Save changes.</p>
        </div>

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
          disabled={saving || processing}
          className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          {saving ? (<><Loader2 size={18} className="animate-spin" /> Saving...</>) : "Save changes"}
        </button>
      </form>
    </div>
  );
}