import { Menu, Search, Sun, Moon, Bell, Languages } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { useTheme } from "../../../context/ThemeContext";
import { useAdminSearch } from "../../../context/AdminSearchContext";

export default function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { t, toggleLang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { query, setQuery, placeholder } = useAdminSearch();

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-[var(--color-border)]"
      style={{ background: "var(--color-surface)" }}
    >
      <button onClick={onMenuClick} className="lg:hidden p-2 -ms-2" aria-label={t("القائمة", "Menu")}>
        <Menu size={20} />
      </button>

      <h1 className="text-base sm:text-lg font-semibold shrink-0" style={{ color: "var(--color-heading)" }}>
        {title}
      </h1>

      {placeholder && (
        <div className="hidden md:flex items-center flex-1 max-w-sm ms-4">
          <div className="relative w-full">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3" style={{ color: "var(--color-text-secondary)" }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full ps-9 pe-3 py-2 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 ms-auto">
        <button
          onClick={toggleLang}
          aria-label={t("تغيير اللغة", "Switch language")}
          className="p-2 rounded-[var(--radius-card)] hover:bg-[var(--color-muted)] transition-colors"
        >
          <Languages size={18} />
        </button>
        <button
          onClick={toggleTheme}
          aria-label={t("تبديل الوضع الليلي", "Toggle dark mode")}
          className="p-2 rounded-[var(--radius-card)] hover:bg-[var(--color-muted)] transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          aria-label={t("الإشعارات", "Notifications")}
          className="p-2 rounded-[var(--radius-card)] hover:bg-[var(--color-muted)] transition-colors relative"
        >
          <Bell size={18} />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ms-1"
          style={{ background: "var(--color-primary)", color: "var(--color-background)" }}
        >
          A
        </div>
      </div>
    </header>
  );
}
