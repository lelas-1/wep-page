import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, CheckCircle2, FolderTree, ClipboardList, Clock, PackagePlus, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { orderService } from "../../services/orderService";
import EmptyState from "../../components/admin/ui/EmptyState";

export default function Dashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, categories: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    Promise.all([productService.list(), categoryService.list(), orderService.list()])
      .then(([products, categories, orders]) => {
        setStats({
          total: products.length,
          active: products.filter((p) => p.active).length,
          categories: categories.length,
          orders: orders.length,
          lowStock: products.filter((p) => p.active && p.stockQuantity > 0 && p.stockQuantity <= 3).length,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  const cards = [
    { icon: Package, label: t("إجمالي المنتجات", "Total Products"), value: stats.total },
    { icon: CheckCircle2, label: t("منتجات نشطة", "Active Products"), value: stats.active },
    { icon: FolderTree, label: t("الأقسام", "Categories"), value: stats.categories },
    { icon: ClipboardList, label: t("الطلبات", "Orders"), value: stats.orders },
  ];

  if (error) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] border" style={{ borderColor: "var(--color-error)", background: "var(--color-surface)" }}>
        <p className="text-sm" style={{ color: "var(--color-error)" }}>
          {t("تعذّر تحميل بيانات اللوحة: ", "Failed to load dashboard data: ")}
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded-[var(--radius-card)] border border-[var(--color-border)]" style={{ background: "var(--color-surface)" }}>
            <span className="w-10 h-10 rounded-[var(--radius-card)] flex items-center justify-center mb-3" style={{ background: "var(--color-lavender-light)" }}>
              <c.icon size={18} style={{ color: "var(--color-primary)" }} />
            </span>
            <p className="text-2xl font-semibold" style={{ color: "var(--color-heading)" }}>
              {loading ? "—" : c.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {!loading && stats.lowStock > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-[var(--radius-card)] border"
          style={{ borderColor: "var(--color-warning)", background: "var(--color-surface)" }}
        >
          <AlertTriangle size={18} style={{ color: "var(--color-warning)" }} />
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            {t(
              `${stats.lowStock} منتج على وشك النفاد (3 قطع أو أقل).`,
              `${stats.lowStock} product(s) are running low on stock (3 units or fewer).`
            )}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
            {t("الطلبات الأخيرة", "Recent Orders")}
          </h2>
          <EmptyState
            icon={Clock}
            title={t("لا توجد طلبات بعد", "No orders yet")}
            description={t(
              "الطلبات تتم حالياً عبر واتساب، وستظهر هنا عند تسجيلها بقاعدة البيانات.",
              "Orders currently happen over WhatsApp — they'll appear here once recorded in the database."
            )}
          />
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
            {t("إجراءات سريعة", "Quick Actions")}
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-medium transition-colors"
              style={{ background: "var(--color-primary)", color: "var(--color-background)" }}
            >
              <PackagePlus size={16} />
              {t("إضافة منتج جديد", "Add New Product")}
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors"
            >
              <FolderTree size={16} />
              {t("إدارة الأقسام", "Manage Categories")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
