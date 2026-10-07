import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <p className="text-center py-20 text-slate-500">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // The profile loads a moment after the user does
  if (!profile) return <p className="text-center py-20 text-slate-500">Loading...</p>;

  if (!profile.is_admin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900">Admins only</h1>
        <p className="text-slate-500 mt-1">You don't have access to this page.</p>
      </div>
    );
  }

  return <Outlet />;
}