import { useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { categoryService } from "../../../services/categoryService";
import { uploadProductImage } from "../../../services/productService";
import type { Category, Product } from "../../../types/admin";
import type { ProductInput } from "../../../services/productService";

const emptyValues: ProductInput = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: 0,
  salePrice: null,
  currency: "USD",
  categoryId: null,
  stockQuantity: 0,
  sku: "",
  imageUrl: null,
  featured: false,
  active: true,
};

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel,
}: {
  initialValues?: Product;
  onSubmit: (values: ProductInput) => Promise<void>;
  submitLabel: string;
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<ProductInput>(
    initialValues
      ? {
          name: initialValues.name,
          nameAr: initialValues.nameAr ?? "",
          description: initialValues.description ?? "",
          descriptionAr: initialValues.descriptionAr ?? "",
          price: initialValues.price,
          salePrice: initialValues.salePrice,
          currency: initialValues.currency,
          categoryId: initialValues.categoryId,
          stockQuantity: initialValues.stockQuantity,
          sku: initialValues.sku ?? "",
          imageUrl: initialValues.imageUrl,
          featured: initialValues.featured,
          active: initialValues.active,
        }
      : emptyValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryService.list().then(setCategories);
  }, []);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t("مطلوب", "Required");
    if (!values.nameAr?.trim()) next.nameAr = t("مطلوب", "Required");
    if (!values.categoryId) next.categoryId = t("مطلوب", "Required");
    if (values.price <= 0) next.price = t("يجب أن يكون السعر أكبر من صفر", "Price must be greater than 0");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      set("imageUrl", url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("فشل رفع الصورة", "Image upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear when actually leaving the dropzone, not its children.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(t("الملف يجب أن يكون صورة", "The file must be an image"));
      return;
    }
    handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-[var(--radius-card)] text-sm border bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          {t("المعلومات الأساسية", "Basic Information")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("اسم المنتج (إنجليزي)", "Product Name (English)")}</label>
            <input value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass} style={{ borderColor: errors.name ? "var(--color-error)" : "var(--color-border)" }} />
            {errors.name && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("اسم المنتج (عربي)", "Product Name (Arabic)")}</label>
            <input dir="rtl" value={values.nameAr ?? ""} onChange={(e) => set("nameAr", e.target.value)} className={inputClass} style={{ borderColor: errors.nameAr ? "var(--color-error)" : "var(--color-border)" }} />
            {errors.nameAr && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.nameAr}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("الوصف (إنجليزي)", "Description (English)")}</label>
            <textarea rows={3} value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputClass} style={{ borderColor: "var(--color-border)" }} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("الوصف (عربي)", "Description (Arabic)")}</label>
            <textarea dir="rtl" rows={3} value={values.descriptionAr ?? ""} onChange={(e) => set("descriptionAr", e.target.value)} className={inputClass} style={{ borderColor: "var(--color-border)" }} />
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          {t("التسعير والمعلومات", "Pricing & Product Info")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("السعر", "Price")}</label>
            <input type="number" min={0} value={values.price} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} style={{ borderColor: errors.price ? "var(--color-error)" : "var(--color-border)" }} />
            {errors.price && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.price}</p>}
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("سعر التخفيض", "Sale Price")}</label>
            <input type="number" min={0} value={values.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : null)} className={inputClass} style={{ borderColor: "var(--color-border)" }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("العملة", "Currency")}</label>
            <select value={values.currency} onChange={(e) => set("currency", e.target.value)} className={inputClass} style={{ borderColor: "var(--color-border)" }}>
              <option value="USD">USD</option>
              <option value="SYP">SYP</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("القسم", "Category")}</label>
            <select value={values.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className={inputClass} style={{ borderColor: errors.categoryId ? "var(--color-error)" : "var(--color-border)" }}>
              <option value="">{t("اختاري قسماً", "Select a category")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{t(c.nameAr || c.name, c.name)}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.categoryId}</p>}
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("الكمية المتوفرة", "Stock Quantity")}</label>
            <input type="number" min={0} value={values.stockQuantity} onChange={(e) => set("stockQuantity", Number(e.target.value))} className={inputClass} style={{ borderColor: "var(--color-border)" }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>SKU</label>
            <input value={values.sku ?? ""} onChange={(e) => set("sku", e.target.value)} className={inputClass} style={{ borderColor: "var(--color-border)" }} placeholder="WF-XXX-000" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
            {t("منتج مميز", "Featured product")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} />
            {t("نشط", "Active")}
          </label>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          {t("صورة المنتج", "Product Image")}
        </h2>
        {values.imageUrl ? (
          <div
            className="relative w-40 h-40"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <img src={values.imageUrl} alt="" className="w-full h-full object-cover rounded-[var(--radius-card)]" />
            <button type="button" onClick={() => set("imageUrl", null)} className="absolute -top-2 -end-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--color-error)", color: "white" }} aria-label={t("إزالة الصورة", "Remove image")}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInput.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInput.current?.click();
            }}
            className="w-full max-w-sm flex flex-col items-center justify-center gap-2 py-8 rounded-[var(--radius-card)] border-2 border-dashed text-sm cursor-pointer transition-colors"
            style={{
              borderColor: dragActive ? "var(--color-primary)" : "var(--color-border)",
              background: dragActive ? "var(--color-lavender-light)" : "transparent",
              color: "var(--color-text-secondary)",
              opacity: uploading ? 0.6 : 1,
              pointerEvents: uploading ? "none" : "auto",
            }}
          >
            <UploadCloud size={22} />
            {uploading
              ? t("جارِ الرفع...", "Uploading...")
              : dragActive
                ? t("أفلتي الصورة هنا", "Drop the image here")
                : t("اسحبي الصورة هنا أو اضغطي للرفع", "Drag an image here or click to upload")}
          </div>
        )}
        {uploadError && <p className="text-xs mt-2" style={{ color: "var(--color-error)" }}>{uploadError}</p>}
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting || uploading} className="px-6 py-2.5 rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-60" style={{ background: "var(--color-primary)", color: "var(--color-background)" }}>
          {submitting ? t("جارِ الحفظ...", "Saving...") : submitLabel}
        </button>
      </div>
    </form>
  );
}
