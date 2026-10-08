import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MessageCircle, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
      <Icon size={18} className="text-slate-400" />
      <input {...props} className="w-full py-3 outline-none bg-transparent" />
    </div>
  );
}

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", whatsapp: "", password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await signUp(form);
    setLoading(false);

    if (error) return setError(error.message);

    // With email confirmation on, there is no session until the link is clicked
    if (!data.session) setCheckEmail(true);
    else navigate("/");
  };

  if (checkEmail) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <MailCheck size={48} className="mx-auto text-brand-600" />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Check your email</h1>
        <p className="mt-2 text-slate-500 text-sm">
          We sent a confirmation link to <span className="font-semibold">{form.email}</span>. Click
          it to activate your account, then log in. Check your spam folder if you can't find it.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
      <p className="text-slate-500 mt-1 text-sm">Free forever. Start posting in a minute.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field icon={User} name="fullName" placeholder="Full name" value={form.fullName} onChange={update} required />
        <Field icon={Mail} type="email" name="email" placeholder="Email address" value={form.email} onChange={update} required />
        <Field icon={Phone} type="tel" name="phone" placeholder="Phone (e.g. 0771234567)" value={form.phone} onChange={update} required />
        <Field icon={MessageCircle} type="tel" name="whatsapp" placeholder="WhatsApp number (optional)" value={form.whatsapp} onChange={update} />
        <Field icon={Lock} type="password" name="password" placeholder="Password (min 6 characters)" value={form.password} onChange={update} required />

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          disabled={loading}
          className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-xs text-slate-400 text-center">
          By registering you agree to our{" "}
          <Link to="/terms" className="text-brand-700 hover:underline">Terms of Use</Link> and{" "}
          <Link to="/privacy" className="text-brand-700 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-700 font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}