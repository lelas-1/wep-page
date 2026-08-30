import { MessageCircle, Share2, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { createWhatsAppGeneralLink } from "../../utils/whatsapp";

export default function Contact() {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();

  const cards = [
    {
      icon: MessageCircle,
      title: t("واتساب", "WhatsApp"),
      desc: t("للطلب والاستفسار السريع", "For orders and quick questions"),
      href: settings ? createWhatsAppGeneralLink(lang, settings.whatsappNumber) : null,
      external: true,
    },
    {
      icon: Share2,
      title: t("فيسبوك", "Facebook"),
      desc: t("تابعي آخر التنسيقات", "Follow our latest arrangements"),
      href: settings?.facebookUrl || null,
      external: true,
    },
    {
      icon: Clock,
      title: t("ساعات العمل", "Opening Hours"),
      desc: t("يومياً 9 صباحاً – 9 مساءً", "Daily 9 AM – 9 PM"),
      href: null,
      external: false,
    },
    {
      icon: MapPin,
      title: t("الموقع", "Location"),
      desc: settings?.address || t("سيتم تحديد العنوان لاحقاً", "Address to be added"),
      href: null,
      external: false,
    },
  ];

  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("تواصلي معنا", "Get in Touch")}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((c) => {
            const Content = (
              <>
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "var(--color-lavender-light)" }}
                >
                  <c.icon size={20} style={{ color: "var(--color-primary)" }} />
                </span>
                <span className="font-semibold text-sm mb-1" style={{ color: "var(--color-ink)" }}>
                  {c.title}
                </span>
                <span className="text-xs opacity-70" style={{ color: "var(--color-ink)" }}>
                  {c.desc}
                </span>
              </>
            );
            return c.href ? (
              <a
                key={c.title}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="flex flex-col p-5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
              >
                {Content}
              </a>
            ) : (
              <div
                key={c.title}
                className="flex flex-col p-5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)]"
              >
                {Content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
