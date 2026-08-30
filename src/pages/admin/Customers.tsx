import { useEffect, useState } from "react";
import { Users, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { customerService } from "../../services/customerService";
import type { Customer } from "../../types/admin";
import EmptyState from "../../components/admin/ui/EmptyState";

export default function Customers() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerService
      .list()
      .then(setCustomers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customers"));
  }, []);

  if (error) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] border flex items-start gap-3" style={{ borderColor: "var(--color-error)", background: "var(--color-surface)" }}>
        <AlertCircle size={18} style={{ color: "var(--color-error)" }} className="shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
      </div>
    );
  }

  if (customers === null) {
    return <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>;
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden" style={{ background: "var(--color-surface)" }}>
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("لا يوجد عملاء بعد", "No customers yet")}
          description={t(
            "سيتم بناء سجل العملاء عند تسجيل الطلبات بقاعدة البيانات.",
            "A customer record will build up as orders are recorded in the database."
          )}
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {[t("الاسم", "Name"), t("الهاتف", "Phone"), t("عدد الطلبات", "Orders"), t("إجمالي الإنفاق", "Total Spent"), t("آخر طلب", "Last Order")].map((h) => (
                <th key={h} className="text-start font-medium px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 font-medium" style={{ color: "var(--color-heading)" }}>{c.name || "—"}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">{c.totalSpent}</td>
                <td className="px-4 py-3">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
