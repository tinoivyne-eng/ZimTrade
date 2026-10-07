import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../data/cities";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

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

export default function PostAdvert() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    price: "",
    currency: "USD",
    city: "",
    condition: "",
    description: "",
  });
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("id")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Clean up preview URLs when leaving the page
  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    setError("");
    const picked = Array.from(e.target.files);
    const valid = [];

    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`${file.name} is larger than ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    const combined = [...files, ...valid];
    if (combined.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} photos.`);
    }
    setFiles(combined.slice(0, MAX_IMAGES));
    e.target.value = "";
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.categoryId) return setError("Please choose a category.");
    if (!form.city) return setError("Please choose a city.");
    if (files.length === 0) return setError("Please add at least one photo.");

    setSubmitting(true);

    try {
      // 1. Create the advert
      const { data: advert, error: advertError } = await supabase
        .from("adverts")
        .insert({
          user_id: user.id,
          category_id: Number(form.categoryId),
          title: form.title.trim(),
          description: form.description.trim(),
          price: form.price === "" ? null : Number(form.price),
          currency: form.currency,
          city: form.city,
          condition: form.condition || null,
        })
        .select()
        .single();

      if (advertError) throw advertError;

      // 2. Upload images to storage
      const imageRows = [];
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];
        const ext = file.name.split(".").pop().toLowerCase();
        const path = `${user.id}/${advert.id}-${i}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("advert-images")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("advert-images")
          .getPublicUrl(path);

        imageRows.push({
          advert_id: advert.id,
          url: urlData.publicUrl,
          position: i,
        });
      }

      // 3. Save image records
      const { error: imagesError } = await supabase
        .from("advert_images")
        .insert(imageRows);

      if (imagesError) throw imagesError;

      navigate(`/adverts/${advert.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900">Post an advert</h1>
      <p className="text-slate-500 mt-1">Fill in the details and reach buyers across Zimbabwe.</p>

      <form onSubmit={handleSubmit} className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        {/* Photos */}
        <div>
          <Label hint={`up to ${MAX_IMAGES}, max ${MAX_SIZE_MB}MB each`}>Photos</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {files.map((f, i) => (
              <div key={f.preview} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-red-600"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {files.length < MAX_IMAGES && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-600 hover:bg-brand-50 cursor-pointer flex flex-col items-center justify-center text-slate-500 text-xs gap-1 transition">
                <ImagePlus size={24} />
                Add photo
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label>Title</Label>
          <input
            name="title"
            value={form.title}
            onChange={update}
            placeholder="e.g. HP EliteBook 840 G8, 16GB RAM"
            maxLength={100}
            className={inputClass}
            required
          />
        </div>

        {/* Category + City */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <select name="categoryId" value={form.categoryId} onChange={update} className={inputClass} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>City</Label>
            <select name="city" value={form.city} onChange={update} className={inputClass} required>
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price + Currency + Condition */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label hint="leave empty if negotiable">Price</Label>
            <div className="flex gap-2">
              <select name="currency" value={form.currency} onChange={update} className={`${inputClass} !w-28`}>
                <option value="USD">USD</option>
                <option value="ZWG">ZWG</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={update}
                placeholder="0.00"
                className={inputClass}
              />
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

        {/* Description */}
        <div>
          <Label>Description</Label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={6}
            placeholder="Describe what you're selling: features, size, reason for selling, etc."
            className={inputClass}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          disabled={submitting}
          className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Publishing...
            </>
          ) : (
            "Publish advert"
          )}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Buyers will contact you using the phone and WhatsApp numbers on your profile.
        </p>
      </form>
    </div>
  );
}