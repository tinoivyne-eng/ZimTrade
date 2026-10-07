import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Flag, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const REASONS = [
  "Scam or fraud",
  "Prohibited item",
  "Wrong category",
  "Already sold",
  "Offensive content",
  "Other",
];

export default function ReportButton({ advertId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return setError("Please choose a reason.");

    setSubmitting(true);
    setError("");

    const { error } = await supabase.from("reports").insert({
      advert_id: advertId,
      reporter_id: user.id,
      reason,
      details: details.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") setError("You have already reported this advert.");
      else setError(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:text-red-600 transition"
      >
        <Flag size={16} /> Report this advert
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="mx-auto text-brand-600" />
                <h2 className="mt-3 text-xl font-bold text-slate-900">Thank you</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your report was sent. Our team will review this advert.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-5 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Report this advert</h2>
                  <button type="button" onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-700" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 cursor-pointer text-sm ${
                        reason === r ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Add more details (optional)"
                  className="mt-4 w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm"
                />

                {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button
                  disabled={submitting}
                  className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {submitting ? (<><Loader2 size={18} className="animate-spin" /> Sending...</>) : "Submit report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}