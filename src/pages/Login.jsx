import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate(redirectTo, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
      <p className="text-slate-500 mt-1 text-sm">Login to manage your adverts.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
          <Mail size={18} className="text-slate-400" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 outline-none bg-transparent"
            required
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
          <Lock size={18} className="text-slate-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 outline-none bg-transparent"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          disabled={loading}
          className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{" "}
        <Link to="/register" className="text-brand-700 font-semibold hover:underline">Create an account</Link>
      </p>
    </div>
  );
}