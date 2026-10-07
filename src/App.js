import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SavedProvider } from "./context/SavedContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import AdvertDetails from "./pages/AdvertDetails";
import SellerProfile from "./pages/SellerProfile";
import PostAdvert from "./pages/PostAdvert";
import EditAdvert from "./pages/EditAdvert";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyAdverts from "./pages/MyAdverts";
import Saved from "./pages/Saved";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/adverts/:id" element={<AdvertDetails />} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Logged-in only */}
              <Route element={<ProtectedRoute />}>
                <Route path="/post" element={<PostAdvert />} />
                <Route path="/edit/:id" element={<EditAdvert />} />
                <Route path="/my-adverts" element={<MyAdverts />} />
                <Route path="/saved" element={<Saved />} />
              </Route>

              {/* Admins only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SavedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;