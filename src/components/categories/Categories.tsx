import { useEffect, useState } from "react";
import { Flower } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { categoryService } from "../../services/categoryService";
import type { Category } from "../../types/admin";

export default function Categories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService
      .list({ activeOnly: true })
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load categories"));
  }, []);

  return (
    <section id="categories" className="py-16 sm:py-24" style={{ background: "var(--color-muted)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t("تسوقي حسب القسم", "Shop by Category")}
          </h2>
          <p className="text-sm" style={{ color: "var(--color-ink)" }}>
            {t("اختاري ما يناسب مناسبتك", "Find what fits your occasion")}
          </p>
        </div>

        {error ? (
          <p className="text-center text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
        ) : categories === null ? (
          <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href="#shop"
                className="group flex flex-col items-center gap-3 p-5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
              >
                <span className="w-14 h-14 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--color-lavender-light)" }}>
                  <Flower size={24} style={{ color: "var(--color-primary)" }} />
                </span>
                <span className="text-sm font-medium text-center" style={{ color: "var(--color-ink)" }}>
                  {t(cat.nameAr || cat.name, cat.name)}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
