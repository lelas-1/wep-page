import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/admin/products/ProductForm";
import type { ProductInput } from "../../services/productService";
import { productService } from "../../services/productService";
import { useLanguage } from "../../context/LanguageContext";
import type { Product } from "../../types/admin";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    productService
      .get(id)
      .then((p) => setProduct(p ?? null))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load product");
        setProduct(null);
      });
  }, [id]);

  const handleSubmit = async (values: ProductInput) => {
    if (!id) return;
    setError(null);
    try {
      await productService.update(id, values);
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل حفظ التعديلات", "Failed to save changes"));
    }
  };

  if (product === undefined) {
    return <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>;
  }

  if (product === null) {
    return <p className="text-sm" style={{ color: "var(--color-error)" }}>{error || t("المنتج غير موجود.", "Product not found.")}</p>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 max-w-3xl p-3 rounded-[var(--radius-card)] border text-sm" style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "var(--color-surface)" }}>
          {error}
        </div>
      )}
      <ProductForm initialValues={product} onSubmit={handleSubmit} submitLabel={t("حفظ التعديلات", "Save Changes")} />
    </div>
  );
}
