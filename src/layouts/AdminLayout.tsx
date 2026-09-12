import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/sidebar/Sidebar";
import Topbar from "../components/admin/topbar/Topbar";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { AdminSearchProvider } from "../context/AdminSearchContext";

const titles: Record<string, { ar: string; en: string }> = {
  "/admin": { ar: "لوحة التحكم", en: "Dashboard" },
  "/admin/products": { ar: "المنتجات", en: "Products" },
  "/admin/products/new": { ar: "إضافة منتج", en: "Add Product" },
  "/admin/categories": { ar: "الأقسام", en: "Categories" },
  "/admin/orders": { ar: "الطلبات", en: "Orders" },
  "/admin/customers": { ar: "العملاء", en: "Customers" },
  "/admin/settings": { ar: "الإعدادات", en: "Settings" },
};

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const { session, loading } = useAuth();

  const matchedKey = Object.keys(titles)
    .sort((a, b) => b.length - a.length)
    .find((key) => location.pathname === key || location.pathname.startsWith(key + "/"));
  const title = matchedKey ? t(titles[matchedKey].ar, titles[matchedKey].en) : t("لوحة التحكم", "Dashboard");

  // RLS is the real security boundary here (see CLAUDE.md) — the session
  // check only decides whether to redirect to /admin/login, it never needs
  // to gate rendering the page itself. Blocking the whole layout (and thus
  // every child route's own data-fetching effect) behind this check turned
  // "check session" then "fetch dashboard data" into a sequential waterfall
  // instead of letting them run in parallel, which is what made the admin
  // feel slow to load. Supabase's client already restores any existing
  // session from localStorage synchronously at creation time, so real
  // requests carry the correct auth header regardless of whether this
  // React-level check has resolved yet.
  if (!loading && !session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <AdminSearchProvider>
      <div className="min-h-screen flex" style={{ background: "var(--color-background)", color: "var(--color-text)" }}>
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar title={title} onMenuClick={() => setDrawerOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}
