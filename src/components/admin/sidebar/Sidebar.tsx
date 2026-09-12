import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  Settings,
  Store,
  LogOut,
  X,
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { authService } from "../../../services/authService";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, ar: "الرئيسية", en: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, ar: "المنتجات", en: "Products" },
  { to: "/admin/categories", icon: FolderTree, ar: "الأقسام", en: "Categories" },
  { to: "/admin/orders", icon: ClipboardList, ar: "الطلبات", en: "Orders" },
  { to: "/admin/customers", icon: Users, ar: "العملاء", en: "Customers" },
  { to: "/admin/settings", icon: Settings, ar: "الإعدادات", en: "Settings" },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.signOut();
    navigate("/admin/login");
  };

  const content = (
    <>
      <div className="flex items-center justify-between px-5 h-20 border-b border-[var(--color-border)]">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/logo.jfif" alt="Ward & Fall" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t("ورد وفل", "Ward & Fall")}
          </span>
        </a>
        <button onClick={onClose} className="lg:hidden p-1" aria-label={t("إغلاق", "Close")}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-medium transition-colors ${
                isActive ? "" : "hover:bg-[var(--color-muted)]"
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? "var(--color-primary)" : "transparent",
              color: isActive ? "var(--color-on-primary)" : "var(--color-text)",
            })}
          >
            <item.icon size={18} />
            {t(item.ar, item.en)}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--color-border)] flex flex-col gap-1">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-medium hover:bg-[var(--color-muted)] transition-colors"
        >
          <Store size={18} />
          {t("عرض المتجر", "View Storefront")}
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-medium hover:bg-[var(--color-muted)] transition-colors text-start"
        >
          <LogOut size={18} />
          {t("تسجيل الخروج", "Logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-e border-[var(--color-border)]"
        style={{ background: "var(--color-surface)" }}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside
            className="relative flex flex-col w-72 max-w-[85vw] h-full"
            style={{ background: "var(--color-surface)" }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
