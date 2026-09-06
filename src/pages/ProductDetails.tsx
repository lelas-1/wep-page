import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StorefrontLayout from "../layouts/StorefrontLayout";
import { useLanguage } from "../context/LanguageContext";
import { productService } from "../services/productService";
import ProductDetailsContent from "../components/product-details/ProductDetailsContent";
import type { Product } from "../types/admin";

/**
 * Direct-URL fallback for a product (sharing/bookmarking a link). The
 * normal in-app flow is the modal opened from a product card — this page
 * reuses the exact same <ProductDetailsContent>, so there's one source of
 * truth for what a product's details look like, not two.
 */
export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetailsPage key={slug} slug={slug} />;
}

function ProductDetailsPage({ slug }: { slug?: string }) {
  const { t, dir } = useLanguage();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    productService
      .getBySlug(slug)
      .then((p) => setProduct(p ?? null))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load product");
        setProduct(null);
      });
  }, [slug]);

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (product === undefined) {
    return (
      <StorefrontLayout>
        <div className="pt-32 pb-24 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {t("جارِ التحميل...", "Loading...")}
        </div>
      </StorefrontLayout>
    );
  }

  if (product === null) {
    return (
      <StorefrontLayout>
        <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
            {t("المنتج غير موجود", "Product not found")}
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            {error || t("قد يكون هذا المنتج غير متوفر حالياً.", "This product may no longer be available.")}
          </p>
          <Link to="/#shop" className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            {t("العودة للمتجر", "Back to shop")}
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link
          to="/#shop"
          className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <BackArrow size={16} />
          {t("العودة للمتجر", "Back to shop")}
        </Link>
        <ProductDetailsContent product={product} />
      </div>
    </StorefrontLayout>
  );
}
