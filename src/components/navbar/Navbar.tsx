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


const SCROLLED_BG =
  "bg-[var(--color-surface)]/90 backdrop-blur-md shadow-[var(--shadow-card)] border-b border-[var(--color-border)]";
const TRANSPARENT_BG = "bg-transparent border-b border-transparent";

export default function Navbar() {
  const { t, toggleLang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);

  // Scroll position drives the background/shadow on every animation frame —
  // far too frequent for React state (it was re-rendering the whole navbar
  // on every scroll pixel, which caused jank). Mutated directly on the DOM
  // via a ref instead — React never re-renders for it.
  const headerRef = useRef<HTMLElement>(null);
  const wasScrolled = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 650);
    return () => window.clearTimeout(id);
  }, []);

  // Navbar stays fixed and visible at all times — only its background
  // fades in once the page is scrolled, never hides/slides away.
  useEffect(() => {
    const applyScrolledClass = (scrolled: boolean) => {
      const el = headerRef.current;
      if (!el || scrolled === wasScrolled.current) return;
      wasScrolled.current = scrolled;
      el.classList.remove(...(scrolled ? TRANSPARENT_BG : SCROLLED_BG).split(" "));
      el.classList.add(...(scrolled ? SCROLLED_BG : TRANSPARENT_BG).split(" "));
    };

    const update = () => {
      applyScrolledClass(window.scrollY > 12);
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

  // Active-section highlighting — changes rarely (on section crossing,
  // not per scroll pixel), so React state here is cheap and appropriate.
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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => setOpen(false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 ${TRANSPARENT_BG} ${
        mounted ? "" : "motion-safe:animate-[navDropIn_0.6s_cubic-bezier(0.16,1,0.3,1)]"
      }`}
      style={{
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="#home" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/logo.jfif"
            alt="Ward & Fall"
            className="h-12 w-12 rounded-full object-cover motion-safe:animate-[logoIn_0.7s_cubic-bezier(0.34,1.56,0.64,1)_backwards]"
          />
          <span
            className="text-xl font-semibold motion-safe:animate-[logoTextIn_0.6s_ease_0.15s_backwards]"
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
                  className="relative text-sm font-medium py-1 inline-block transition-[color,transform] duration-200 hover:-translate-y-0.5"
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
