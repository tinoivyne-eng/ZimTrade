import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2, Star, EyeOff, CheckCircle2, ShieldCheck, Megaphone, Users, Eye, Flag,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatPrice, timeAgo } from "../lib/format";

const statusStyle = {
  active: "bg-green-100 text-green-700",
  sold: "bg-slate-200 text-slate-700",
  hidden: "bg-amber-100 text-amber-800",
};

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("adverts");
  const [adverts, setAdverts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      supabase
        .from("adverts")
        .select("*, categories(name), advert_images(url, position)")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
    ]).then(([a, u, r]) => {
      if (a.error) setError(a.error.message);
      else setAdverts(a.data || []);
      if (u.error) setError(u.error.message);
      else setUsers(u.data || []);
      if (r.error) setError(r.error.message);
      else setReports(r.data || []);
      setLoading(false);
    });
  }, []);

  // Lookups (no database embeds needed)
  const profileById = {};
  users.forEach((u) => {
    profileById[u.id] = u;
  });
  const advertById = {};
  adverts.forEach((a) => {
    advertById[a.id] = a;
  });

  const patchAdvert = async (advert, changes) => {
    setBusyId(advert.id);
    setError("");
    const { error } = await supabase.from("adverts").update(changes).eq("id", advert.id);
    if (error) setError(error.message);
    else setAdverts((list) => list.map((a) => (a.id === advert.id ? { ...a, ...changes } : a)));
    setBusyId(null);
  };

  const deleteAdvert = async (advert) => {
    if (!window.confirm(`Delete "${advert.title}" permanently?`)) return;
    setBusyId(advert.id);
    setError("");

    const paths = (advert.advert_images || [])
      .map((img) => img.url.split("/advert-images/")[1])
      .filter(Boolean)
      .map(decodeURIComponent);
    if (paths.length > 0) await supabase.storage.from("advert-images").remove(paths);

    const { error } = await supabase.from("adverts").delete().eq("id", advert.id);
    if (error) setError(error.message);
    else {
      setAdverts((list) => list.filter((a) => a.id !== advert.id));
      // Reports for a deleted advert are removed by the database automatically
      setReports((list) => list.filter((r) => r.advert_id !== advert.id));
    }
    setBusyId(null);
  };

  const setReportStatus = async (report, status) => {
    setBusyId(report.id);
    setError("");
    const { error } = await supabase.from("reports").update({ status }).eq("id", report.id);
    if (error) setError(error.message);
    else setReports((list) => list.map((r) => (r.id === report.id ? { ...r, status } : r)));
    setBusyId(null);
  };

  const deleteReport = async (report) => {
    setBusyId(report.id);
    setError("");
    const { error } = await supabase.from("reports").delete().eq("id", report.id);
    if (error) setError(error.message);
    else setReports((list) => list.filter((r) => r.id !== report.id));
    setBusyId(null);
  };

  const shown = adverts.filter((a) => filter === "all" || a.status === filter);
  const totalViews = adverts.reduce((sum, a) => sum + (a.views || 0), 0);
  const openReports = reports.filter((r) => r.status === "open").length;

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
        <ShieldCheck className="text-brand-700" /> Admin dashboard
      </h1>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Megaphone} label="Total adverts" value={adverts.length} />
        <Stat icon={CheckCircle2} label="Active" value={adverts.filter((a) => a.status === "active").length} />
        <Stat icon={Users} label="Users" value={users.length} />
        <Stat icon={Eye} label="Total views" value={totalViews.toLocaleString()} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="mt-8 flex gap-2 border-b border-slate-200">
        {["adverts", "reports", "users"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px flex items-center gap-2 ${
              tab === t ? "border-brand-700 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
            {t === "reports" && openReports > 0 && (
              <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                {openReports}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "adverts" && (
        <div className="mt-4">
          <div className="flex gap-2 mb-4">
            {["all", "active", "sold", "hidden"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${
                  filter === f ? "bg-brand-700 text-white border-brand-700" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Advert</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((a) => {
                  const cover = [...(a.advert_images || [])].sort((x, y) => x.position - y.position)[0]?.url;
                  const busy = busyId === a.id;
                  const seller = profileById[a.user_id];
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-3">
                        <Link to={`/adverts/${a.id}`} className="flex items-center gap-3 min-w-[220px] hover:text-brand-700">
                          <div className="h-12 w-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[220px]">{a.title}</p>
                            <p className="text-xs text-slate-500">{a.categories?.name} · {a.city}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p>{seller?.full_name || "-"}</p>
                        <p className="text-xs text-slate-500">{seller?.phone}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatPrice(a.price, a.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{timeAgo(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            disabled={busy}
                            title={a.featured ? "Remove featured" : "Make featured"}
                            onClick={() => patchAdvert(a, { featured: !a.featured })}
                            className={`p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 ${a.featured ? "text-accent-500" : "text-slate-400"}`}
                          >
                            <Star size={18} fill={a.featured ? "currentColor" : "none"} />
                          </button>
                          {a.status === "active" ? (
                            <button
                              disabled={busy}
                              title="Hide advert"
                              onClick={() => patchAdvert(a, { status: "hidden" })}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <EyeOff size={18} />
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              title="Make active"
                              onClick={() => patchAdvert(a, { status: "active" })}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button
                            disabled={busy}
                            title="Delete"
                            onClick={() => deleteAdvert(a)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {shown.length === 0 && <p className="text-center py-10 text-slate-500">No adverts here.</p>}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-14">
              <Flag size={36} className="mx-auto text-slate-300" />
              <p className="mt-2 text-slate-500">No reports yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Advert</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Reported by</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => {
                  const advert = advertById[r.advert_id];
                  const reporter = profileById[r.reporter_id];
                  const busy = busyId === r.id;
                  return (
                    <tr key={r.id} className={r.status === "resolved" ? "opacity-60" : ""}>
                      <td className="px-4 py-3 min-w-[200px]">
                        {advert ? (
                          <Link to={`/adverts/${advert.id}`} className="font-semibold hover:text-brand-700">
                            {advert.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Deleted advert</span>
                        )}
                        <p className="text-xs text-slate-500">
                          {advert && `${advert.status} · by ${profileById[advert.user_id]?.full_name || "-"}`}
                        </p>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <p className="font-semibold">{r.reason}</p>
                        {r.details && <p className="text-xs text-slate-500">{r.details}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{reporter?.full_name || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                            r.status === "open" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{timeAgo(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {advert && advert.status === "active" && (
                            <button
                              disabled={busy}
                              title="Hide the reported advert"
                              onClick={() => patchAdvert(advert, { status: "hidden" })}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <EyeOff size={18} />
                            </button>
                          )}
                          {r.status === "open" ? (
                            <button
                              disabled={busy}
                              title="Mark as resolved"
                              onClick={() => setReportStatus(r, "resolved")}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              title="Reopen"
                              onClick={() => setReportStatus(r, "open")}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <Flag size={18} />
                            </button>
                          )}
                          <button
                            disabled={busy}
                            title="Dismiss report"
                            onClick={() => deleteReport(r)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Adverts</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-semibold">
                    <Link to={`/seller/${u.id}`} className="hover:text-brand-700">
                      {u.full_name || "-"}
                    </Link>
                    {u.is_admin && (
                      <span className="ml-2 text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.phone || "-"}</td>
                  <td className="px-4 py-3">{u.whatsapp || "-"}</td>
                  <td className="px-4 py-3">{adverts.filter((a) => a.user_id === u.id).length}</td>
                  <td className="px-4 py-3 text-slate-500">{timeAgo(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}