import { MessageCircle } from "lucide-react";
import type { Product } from "../../types/admin";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { useProductModal } from "../../context/ProductModalContext";
import { createWhatsAppOrderLink } from "../../utils/whatsapp";

export default function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();
  const { open } = useProductModal();

  return (
    <article className="group rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={t(product.nameAr || product.name, product.name)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ background: "var(--color-muted)" }} />
        )}
        {product.salePrice && (
          <span
            className="absolute top-3 start-3 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-pill)]"
            style={{ background: "var(--color-blush)", color: "var(--color-heading)" }}
          >
            {t("خصم", "Sale")}
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span
            className="absolute top-3 end-3 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-pill)]"
            style={{ background: "var(--color-error)", color: "white" }}
          >
            {t("نفذ", "Out of stock")}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          {t(product.nameAr || product.name, product.name)}
        </h3>
        {(product.description || product.descriptionAr) && (
          <p className="text-sm line-clamp-2 flex-1" style={{ color: "var(--color-ink)", opacity: 0.75 }}>
            {t(product.descriptionAr || product.description || "", product.description || "")}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
            {product.currency} {product.salePrice ?? product.price}
          </span>
          {product.salePrice && (
            <span className="text-sm line-through opacity-50">{product.currency} {product.price}</span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => open(product)}
            className="flex-1 text-sm font-medium px-3 py-2.5 rounded-[var(--radius-card)] border transition-colors hover:bg-[var(--color-muted)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          >
            {t("التفاصيل", "View Details")}
          </button>
          <a
            href={settings ? createWhatsAppOrderLink(product, lang, settings.whatsappNumber) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("اطلبي عبر واتساب", "Order on WhatsApp")}
            className="flex items-center justify-center px-3 py-2.5 rounded-[var(--radius-card)] transition-colors"
            style={{ background: "var(--color-gold)", color: "var(--color-ink)" }}
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}
