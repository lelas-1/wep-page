import { useLanguage } from "../../context/LanguageContext";

export default function About() {
  const { t, lang } = useLanguage();

  return (
    <section id="about" className="py-16 sm:py-24" style={{ background: "var(--color-lavender-light)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-card)] aspect-[4/3] order-2 lg:order-1">
          <img
            src={lang === "ar" ? "/images/about-logo-ar.jpg" : "/images/about-logo-en.jpg"}
            alt={t("ورد وفل للزهر", "Ward & Fall for Flowers")}
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="order-1 lg:order-2 text-center lg:text-start">
          <h2
            className="text-3xl sm:text-4xl mb-5"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("عن ورد وفل", "About Ward & Fall")}
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-ink)" }}>
            {t(
              "نؤمن أن كل زهرة لها حكاية، ولهذا نصمم كل باقة بعناية لتلائم لحظتك الخاصة — من الأعراس إلى أعياد الميلاد وكل مناسبة تستحق الاحتفال.",
              "We believe every flower has a story — that's why each bouquet is crafted with care to match your moment, from weddings to birthdays and every celebration in between."
            )}
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-ink)" }}>
            {t(
              "نجمع بين جودة الزهور الطازجة وإبداع التنسيق، مع لمسة شخصية في كل هدية وكيكة نقدّمها.",
              "We combine fresh-flower quality with creative arrangement, and a personal touch in every gift and cake we offer."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
