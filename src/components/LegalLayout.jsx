import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 mb-4">
        <ArrowLeft size={16} /> Back to home
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-1">Last updated: {updated}</p>
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}