import { useEffect, useState } from "react";
import { ClipboardList, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { orderService } from "../../services/orderService";
import type { Order } from "../../types/admin";
import Badge from "../../components/admin/ui/Badge";
import EmptyState from "../../components/admin/ui/EmptyState";

const statusTone: Record<Order["status"], "success" | "error" | "warning" | "neutral"> = {
  pending: "neutral",
  confirmed: "warning",
  preparing: "warning",
  ready: "success",
  completed: "success",
  cancelled: "error",
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .list()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"));
  }, []);

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
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden" style={{ background: "var(--color-surface)" }}>
      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("لا توجد طلبات مسجّلة", "No orders recorded yet")}
          description={t(
            "الطلبات تتم حالياً عبر واتساب مباشرة. جدول orders بقاعدة البيانات جاهز لتسجيلها.",
            "Orders currently happen directly over WhatsApp. The orders table is live and ready to record them."
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
                <td className="px-4 py-3">{o.customerName || "—"}</td>
                <td className="px-4 py-3">{o.currency} {o.totalAmount}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[o.status]}>{o.status}</Badge></td>
                <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
