import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/products/ProductForm";
import type { ProductInput } from "../../services/productService";
import { productService } from "../../services/productService";
import { useLanguage } from "../../context/LanguageContext";

export default function AddProduct() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ProductInput) => {
    setError(null);
    try {
      await productService.create(values);
      navigate("/admin/products");
    } catch (err) {
      // Form data is preserved — ProductForm keeps its own state, we only surface the error.
      setError(err instanceof Error ? err.message : t("فشل حفظ المنتج", "Failed to save product"));
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 max-w-3xl p-3 rounded-[var(--radius-card)] border text-sm flex items-start gap-2" style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "var(--color-surface)" }}>
          {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} submitLabel={t("إضافة المنتج", "Add Product")} />
    </div>
  );
}
