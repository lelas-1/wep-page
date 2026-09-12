import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import Select from "../ui/Select";
import type { OrderInput, OrderItemInput } from "../../../services/orderService";
import type { Product } from "../../../types/admin";

const emptyDetails = { customerName: "", customerPhone: "", customerEmail: "", notes: "" };

export default function AddOrderForm({
  products,
  onSubmit,
  onCancel,
}: {
  products: Product[];
  onSubmit: (input: OrderInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [details, setDetails] = useState(emptyDetails);
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [pickProductId, setPickProductId] = useState("");
  const [pickQuantity, setPickQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    const product = products.find((p) => p.id === pickProductId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + pickQuantity } : i));
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: pickQuantity, unitPrice: product.salePrice ?? product.price }];
    });
    setPickProductId("");
    setPickQuantity(1);
  };

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderCurrency = products.find((p) => p.id === items[0]?.productId)?.currency ?? "USD";

  const handleSave = async () => {
    setError(null);
    if (!details.customerName.trim() || !details.customerPhone.trim()) {
      setError(t("الاسم ورقم الهاتف مطلوبان", "Name and phone are required"));
      return;
    }
    if (items.length === 0) {
      setError(t("أضيفي منتجاً واحداً على الأقل", "Add at least one item"));
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        customerName: details.customerName,
        customerPhone: details.customerPhone,
        customerEmail: details.customerEmail || null,
        notes: details.notes || null,
        currency: orderCurrency,
        items,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل حفظ الطلب", "Failed to save order"));
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)]";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <section>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-heading)" }}>
          {t("بيانات العميلة", "Customer Information")}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            value={details.customerName}
            onChange={(e) => setDetails((f) => ({ ...f, customerName: e.target.value }))}
            placeholder={t("الاسم", "Name")}
            className={fieldClass}
          />
          <input
            value={details.customerPhone}
            onChange={(e) => setDetails((f) => ({ ...f, customerPhone: e.target.value }))}
            placeholder={t("رقم الهاتف", "Phone number")}
            className={fieldClass}
          />
          <input
            type="email"
            value={details.customerEmail}
            onChange={(e) => setDetails((f) => ({ ...f, customerEmail: e.target.value }))}
            placeholder={t("البريد الإلكتروني (اختياري)", "Email (optional)")}
            className={fieldClass}
          />
          <input
            value={details.notes}
            onChange={(e) => setDetails((f) => ({ ...f, notes: e.target.value }))}
            placeholder={t("ملاحظات (اختياري)", "Notes (optional)")}
            className={fieldClass}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
          {t(
            "إذا كان رقم الهاتف موجوداً مسبقاً، سيُربط الطلب بنفس العميلة تلقائياً.",
            "If this phone number already exists, the order links to that customer automatically."
          )}
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-heading)" }}>
          {t("المنتجات", "Products")}
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Select
            value={pickProductId}
            onChange={setPickProductId}
            className="flex-1"
            aria-label={t("اختاري منتجاً", "Select a product")}
            options={[
              { value: "", label: t("اختاري منتجاً", "Select a product") },
              ...products.map((p) => ({ value: p.id, label: `${t(p.nameAr || p.name, p.name)} — ${p.currency} ${p.salePrice ?? p.price}` })),
            ]}
          />
          <input
            type="number"
            min={1}
            value={pickQuantity}
            onChange={(e) => setPickQuantity(Math.max(1, Number(e.target.value)))}
            className={`w-full sm:w-20 ${fieldClass}`}
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!pickProductId}
            className="px-4 py-2.5 rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-50 shrink-0"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            {t("إضافة", "Add")}
          </button>
        </div>

        {items.length > 0 && (
          <div className="rounded-[var(--radius-card)] border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {items.map((i) => (
              <div key={i.productId} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{i.productName}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {i.quantity} × {i.unitPrice} = {i.quantity * i.unitPrice}
                  </p>
                </div>
                <button type="button" onClick={() => removeItem(i.productId)} className="p-1.5 rounded hover:bg-[var(--color-muted)]" style={{ color: "var(--color-error)" }} aria-label={t("إزالة", "Remove")}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5" style={{ background: "var(--color-muted)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>{t("الإجمالي", "Total")}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>{orderCurrency} {total}</span>
            </div>
          </div>
        )}
      </section>

      {error && <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          {saving ? t("جارِ الحفظ...", "Saving...") : t("حفظ الطلب", "Save Order")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2.5 rounded-[var(--radius-card)] text-sm font-medium border disabled:opacity-60"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          {t("إلغاء", "Cancel")}
        </button>
      </div>
    </div>
  );
}
