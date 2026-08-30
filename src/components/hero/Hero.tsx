import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { createWhatsAppGeneralLink } from "../../utils/whatsapp";

export default function Hero() {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();

  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-[100svh] flex items-center"
      style={{
        background:
          "radial-gradient(ellipse at top, var(--color-lavender-light) 0%, var(--color-background) 60%)",
      }}
    >
      {/* soft decorative wash, purely visual */}
      <div
        aria-hidden
        className="absolute -top-24 -end-24 w-96 h-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--color-lavender)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -start-16 w-80 h-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-blush)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div className="text-center lg:text-start animate-[fadeInUp_0.7s_ease]">
          <p
            className="text-sm tracking-[0.2em] uppercase mb-4 font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            {t("ورد وفل", "Ward & Fall")}
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("حيث لكل زهرة حكاية", "Where every flower tells a story")}
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-md mx-auto lg:mx-0" style={{ color: "var(--color-ink)" }}>
            {t(
              "اكتشفي باقات وتنسيقات زهور صُممت لكل مناسبة، مع كيكات وهدايا تُكمل اللحظة.",
              "Discover bouquets and floral arrangements created for every moment — with cakes and gifts to complete it."
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href="#shop"
              className="px-7 py-3.5 rounded-[var(--radius-card)] font-medium text-[var(--color-background)] transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--color-primary)" }}
            >
              {t("تسوقي الآن", "Shop Flowers")}
            </a>
            <a
              href={settings ? createWhatsAppGeneralLink(lang, settings.whatsappNumber) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-[var(--radius-card)] font-medium transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--color-gold)", color: "var(--color-ink)" }}
            >
              {t("اطلبي عبر واتساب", "Order on WhatsApp")}
            </a>
          </div>
        </div>

        <div className="relative animate-[fadeIn_0.9s_ease]">
          <div
            className="rounded-2xl overflow-hidden shadow-[var(--shadow-card)] aspect-[4/5] max-w-md mx-auto"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <img
              src="/images/hero-storefront.jpg"
              alt={t("واجهة محل ورد وفل", "Ward & Fall storefront")}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
