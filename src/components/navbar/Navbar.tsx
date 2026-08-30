import { useEffect, useRef, useState } from "react";
import { Menu, X, Sun, Moon, Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { key: "home", ar: "الرئيسية", en: "Home", href: "#home" },
  { key: "shop", ar: "المتجر", en: "Shop", href: "#shop" },
  { key: "categories", ar: "الأقسام", en: "Categories", href: "#categories" },
  { key: "about", ar: "من نحن", en: "About", href: "#about" },
  { key: "contact", ar: "تواصل", en: "Contact", href: "#contact" },
];

const SCROLL_THRESHOLD = 80; // px scrolled before hide/show behavior engages

export default function Navbar() {
  const { t, toggleLang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hide-on-scroll-down / reveal-on-scroll-up, via rAF + passive listener.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastScrollY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 12);

      if (!reduceMotion) {
        if (y > SCROLL_THRESHOLD && y > lastScrollY.current) {
          setHidden(true); // scrolling down past threshold
        } else if (y < lastScrollY.current) {
          setHidden(false); // scrolling up
        }
      }
      lastScrollY.current = y;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section highlighting.
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the mobile drawer whenever the viewport grows back to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => setOpen(false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[transform,background-color,box-shadow] duration-300 ease-out motion-safe:animate-[navDropIn_0.6s_ease] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-[var(--color-surface)]/90 backdrop-blur-md shadow-[var(--shadow-card)] border-b border-[var(--color-border)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="#home" className="flex items-center gap-2 shrink-0">
          <img src="/images/logo.jfif" alt="Ward & Fall" className="h-12 w-12 rounded-full object-cover" />
          <span
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("ورد وفل", "Ward & Fall")}
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l, i) => {
            const isActive = activeSection === l.key;
            return (
              <li
                key={l.key}
                className="motion-safe:animate-[navLinkIn_0.5s_ease_backwards]"
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <a
                  href={l.href}
                  className="relative text-sm font-medium py-1 transition-colors hover:-translate-y-0.5 inline-block transition-transform"
                  style={{ color: isActive ? "var(--color-primary)" : "var(--color-text)", opacity: isActive ? 1 : 0.8 }}
                >
                  {t(l.ar, l.en)}
                  <span
                    className="absolute -bottom-0.5 start-0 h-[1.5px] rounded-full transition-all duration-300"
                    style={{
                      background: "var(--color-primary)",
                      width: isActive ? "100%" : "0%",
                    }}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleLang}
            aria-label={t("تغيير اللغة", "Switch language")}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors"
          >
            <Languages size={16} />
            {t("EN", "AR")}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={t("تبديل الوضع الليلي", "Toggle dark mode")}
            className="p-2 rounded-[var(--radius-card)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href="#shop"
            className="px-5 py-2.5 rounded-[var(--radius-card)] text-sm font-medium text-[var(--color-background)] bg-[var(--color-primary)] hover:bg-[var(--color-heading)] transition-colors"
          >
            {t("تسوقي الآن", "Shop Flowers")}
          </a>
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("القائمة", "Menu")}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div
        className={`lg:hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-out grid ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium"
                style={{ color: activeSection === l.key ? "var(--color-primary)" : "var(--color-text)" }}
              >
                {t(l.ar, l.en)}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
              <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)]">
                <Languages size={16} /> {t("EN", "AR")}
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-[var(--radius-card)] border border-[var(--color-border)]">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
