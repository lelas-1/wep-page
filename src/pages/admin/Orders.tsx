import { useEffect, useState } from "react";
import { ClipboardList, AlertCircle, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { orderService } from "../../services/orderService";
import type { OrderInput } from "../../services/orderService";
import { productService } from "../../services/productService";
import type { Order, Product } from "../../types/admin";
import EmptyState from "../../components/admin/ui/EmptyState";
import Select from "../../components/admin/ui/Select";
import Dialog from "../../components/ui/Dialog";
import DialogHeader from "../../components/ui/DialogHeader";
import DialogBody from "../../components/ui/DialogBody";
import AddOrderForm from "../../components/admin/orders/AddOrderForm";

const statusOptions: Order["status"][] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    setError(null);
    orderService
      .list()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"));
  };
  useEffect(load, []);

  const openAdd = () => {
    setAddOpen(true);
    productService.list({ activeOnly: true }).then(setProducts);
  };

  const handleCreate = async (input: OrderInput) => {
    await orderService.create(input);
    setAddOpen(false);
    load();
  };

  const changeStatus = async (order: Order, status: Order["status"]) => {
    setOrders((prev) => prev?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? prev);
    try {
      await orderService.updateStatus(order.id, status);
    } catch (err) {
      setOrders((prev) => prev?.map((o) => (o.id === order.id ? { ...o, status: order.status } : o)) ?? prev);
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (error) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] border flex items-start gap-3" style={{ borderColor: "var(--color-error)", background: "var(--color-surface)" }}>
        <AlertCircle size={18} style={{ color: "var(--color-error)" }} className="shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
      </div>
    );
  }

  if (orders === null) {
    return <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-card)] text-sm font-medium"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={16} />
          {t("إضافة طلب", "Add Order")}
        </button>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden" style={{ background: "var(--color-surface)" }}>
        {orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t("لا توجد طلبات مسجّلة", "No orders recorded yet")}
            description={t(
              "الطلبات تتم عبر واتساب — سجّلي كل طلب هنا لمتابعته وبناء سجل العملاء تلقائياً.",
              "Orders happen over WhatsApp — log each one here to track it and automatically build your customer list."
            )}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[t("رقم الطلب", "Order #"), t("العميل", "Customer"), t("الإجمالي", "Total"), t("الحالة", "Status"), t("التاريخ", "Date")].map((h) => (
                  <th key={h} className="text-start font-medium px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-heading)" }}>{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{o.customerName || "—"}</div>
                    {o.customerPhone && <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{o.customerPhone}</div>}
                  </td>
                  <td className="px-4 py-3">{o.currency} {o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onChange={(s) => changeStatus(o, s)}
                      className="w-36"
                      aria-label={t("حالة الطلب", "Order status")}
                      options={statusOptions.map((s) => ({ value: s, label: t(s, s) }))}
                    />
                  </td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} titleId="add-order-title">
        <DialogHeader titleId="add-order-title" title={t("إضافة طلب جديد", "Add New Order")} onClose={() => setAddOpen(false)} closeLabel={t("إغلاق", "Close")} />
        <DialogBody>
          <AddOrderForm products={products} onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
        </DialogBody>
      </Dialog>
    </div>
  );
}
