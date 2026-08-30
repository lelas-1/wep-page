import { Quote } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const testimonials = [
  {
    ar: "الباقة كانت أجمل من الصور، ووصلت بالوقت المحدد تماماً.",
    en: "The bouquet was even more beautiful than the photos, and arrived right on time.",
    name: "سارة",
  },
  {
    ar: "طلبت كيكة عيد ميلاد وكانت لمسة رائعة تناسب المناسبة تماماً.",
    en: "I ordered a birthday cake and it was a wonderful touch, perfectly suited to the occasion.",
    name: "أحمد",
  },
  {
    ar: "تعامل راقي وسرعة بالرد على واتساب، أنصح فيهم.",
    en: "Professional service and quick WhatsApp replies — highly recommend.",
    name: "لينا",
  },
];

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24" style={{ background: "var(--color-muted)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("آراء عملائنا", "What Our Customers Say")}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)]"
            >
              <Quote size={22} style={{ color: "var(--color-primary-light)" }} />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                {t(item.ar, item.en)}
              </p>
              <p className="mt-4 text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                {t(item.name, item.name)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
