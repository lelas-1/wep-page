import { useEffect, useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import { createWhatsAppOrderLink } from "../../utils/whatsapp";
import ProductCard from "../product-card/ProductCard";
import type { Product, Category } from "../../types/admin";

export default function ProductDetailsContent({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  // The product itself is already in memory (passed in by whoever opened
  // this — a product card that already fetched the list), so the details
  // render instantly with zero network wait. Only the secondary "related
  // products" section loads asynchronously afterward, non-blocking.
  useEffect(() => {
    let cancelled = false;
    Promise.all([categoryService.list({ activeOnly: true }), productService.list({ activeOnly: true })]).then(
      ([categories, all]) => {
        if (cancelled) return;
        setCategory(categories.find((c) => c.id === product.categoryId) ?? null);
        setRelated(all.filter((r) => r.id !== product.id && r.categoryId === product.categoryId).slice(0, 4));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [product.id, product.categoryId]);

  const outOfStock = product.stockQuantity === 0;

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-card)] aspect-square" style={{ border: "1px solid var(--color-border)" }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={t(product.nameAr || product.name, product.name)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "var(--color-muted)" }} />
          )}
        </div>

        <div>
          {category && (
            <span
              className="inline-block text-xs uppercase tracking-wide mb-3 px-3 py-1 rounded-[var(--radius-pill)]"
              style={{ background: "var(--color-blush)", color: "var(--color-heading)" }}
            >
              {t(category.nameAr || category.name, category.name)}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t(product.nameAr || product.name, product.name)}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold" style={{ color: "var(--color-heading)" }}>
              {product.currency} {product.salePrice ?? product.price}
            </span>
            {product.salePrice && <span className="text-lg line-through opacity-50">{product.currency} {product.price}</span>}
            {outOfStock && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-[var(--radius-pill)]" style={{ background: "var(--color-error)", color: "white" }}>
                {t("نفذ من المخزون", "Out of stock")}
              </span>
            )}
          </div>

          {(product.description || product.descriptionAr) && (
            <p className="text-base leading-relaxed mb-8" style={{ color: "var(--color-ink)" }}>
              {t(product.descriptionAr || product.description || "", product.description || "")}
            </p>
          )}

          {!outOfStock && (
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {t("الكمية", "Quantity")}
              </span>
              <div className="flex items-center rounded-[var(--radius-card)] border" style={{ borderColor: "var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label={t("إنقاص الكمية", "Decrease quantity")}
                  className="p-2.5 hover:bg-[var(--color-muted)] transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  aria-label={t("زيادة الكمية", "Increase quantity")}
                  className="p-2.5 hover:bg-[var(--color-muted)] transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}

          <a
            href={settings && !outOfStock ? createWhatsAppOrderLink(product, lang, settings.whatsappNumber, quantity) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={outOfStock}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[var(--radius-card)] font-medium transition-transform"
            style={{
              background: outOfStock ? "var(--color-muted)" : "var(--color-gold)",
              color: outOfStock ? "var(--color-text-secondary)" : "var(--color-ink)",
              pointerEvents: outOfStock ? "none" : "auto",
            }}
          >
            <MessageCircle size={18} />
            {t("اطلبي عبر واتساب", "Order on WhatsApp")}
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t("منتجات ذات صلة", "Related Products")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
