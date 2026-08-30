import { useLanguage } from "../../context/LanguageContext";

const occasions = [
  { ar: "أعراس", en: "Weddings", image: "photo_5800802729021083597_y.jpg" },
  { ar: "أعياد ميلاد", en: "Birthdays", image: "photo_5800802729021083598_y.jpg" },
  { ar: "هدايا", en: "Gifts", image: "photo_5800802729021083604_y.jpg" },
  { ar: "مناسبات رومانسية", en: "Romantic Occasions", image: "5666f4845c95503d69a918dea6adda6d.jpg" },
];

export default function Occasions() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}
          >
            {t("لكل مناسبة", "For Every Occasion")}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {occasions.map((o) => (
            <div
              key={o.en}
              className="relative rounded-[var(--radius-card)] overflow-hidden aspect-[3/4] group shadow-[var(--shadow-card)]"
            >
              <img
                src={`/images/${o.image}`}
                alt={t(o.ar, o.en)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end p-4"
                style={{ background: "linear-gradient(to top, rgba(46,32,54,0.65), transparent 60%)" }}
              >
                <span className="text-white font-medium">{t(o.ar, o.en)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
