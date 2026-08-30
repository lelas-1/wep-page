import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { productService } from "../../services/productService";
import type { Product } from "../../types/admin";
import ProductCard from "../product-card/ProductCard";

export default function FeaturedProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService
      .list({ activeOnly: true })
      .then((all) => setProducts(all.filter((p) => p.featured)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products"));
  }, []);

  return (
    <section id="shop" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t("الأكثر طلباً", "Best Sellers")}
          </h2>
          <p className="text-sm" style={{ color: "var(--color-ink)" }}>
            {t("اختيارات مميزة من متجرنا", "Featured picks from our shop")}
          </p>
        </div>

        {error ? (
          <p className="text-center text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
        ) : products === null ? (
          <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("لا توجد منتجات مميزة حالياً.", "No featured products yet.")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
