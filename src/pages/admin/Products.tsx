import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, PackageX, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import type { Product, Category } from "../../types/admin";
import Badge from "../../components/admin/ui/Badge";
import EmptyState from "../../components/admin/ui/EmptyState";

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const LOW_STOCK_THRESHOLD = 5;
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([productService.list(), categoryService.list()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products"));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameAr ?? "").includes(search.trim()) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      const matchesFeatured =
        featuredFilter === "all" || (featuredFilter === "featured" ? p.featured : !p.featured);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out_of_stock" && p.stockQuantity === 0) ||
        (stockFilter === "low_stock" && p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD) ||
        (stockFilter === "in_stock" && p.stockQuantity > LOW_STOCK_THRESHOLD);
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured && matchesStock;
    });
  }, [products, search, categoryFilter, statusFilter, featuredFilter, stockFilter]);

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all" || featuredFilter !== "all" || stockFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setStockFilter("all");
  };

  const toggleActive = async (p: Product) => {
    setActionError(null);
    try {
      await productService.update(p.id, { active: !p.active });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const toggleFeatured = async (p: Product) => {
    setActionError(null);
    try {
      await productService.update(p.id, { featured: !p.featured });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const doDelete = async (p: Product) => {
    setActionError(null);
    try {
      await productService.remove(p.id);
      setConfirmDelete(null);
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
      setConfirmDelete(null);
    }
  };

  const categoryName = (id: string | null) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return "—";
    return t(cat.nameAr || cat.name, cat.name);
  };

  if (error) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] border flex items-start gap-3" style={{ borderColor: "var(--color-error)", background: "var(--color-surface)" }}>
        <AlertCircle size={18} style={{ color: "var(--color-error)" }} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-error)" }}>
            {t("تعذّر تحميل المنتجات", "Failed to load products")}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {actionError && (
        <div className="p-3 rounded-[var(--radius-card)] border text-sm" style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "var(--color-surface)" }}>
          {actionError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex flex-1 gap-3 flex-col sm:flex-row">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3" style={{ color: "var(--color-text-secondary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("ابحث بالاسم، SKU، أو الرابط...", "Search by name, SKU, or slug...")}
              className="w-full ps-9 pe-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value="all">{t("كل الأقسام", "All Categories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.nameAr || c.name, c.name)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value="all">{t("كل الحالات", "All Statuses")}</option>
            <option value="active">{t("نشط", "Active")}</option>
            <option value="inactive">{t("غير نشط", "Inactive")}</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as typeof featuredFilter)}
            className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value="all">{t("كل المنتجات", "All Products")}</option>
            <option value="featured">{t("مميز", "Featured")}</option>
            <option value="not_featured">{t("غير مميز", "Not Featured")}</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
            className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value="all">{t("كل المخزون", "All Stock")}</option>
            <option value="in_stock">{t("متوفر", "In Stock")}</option>
            <option value="low_stock">{t("منخفض", "Low Stock")}</option>
            <option value="out_of_stock">{t("نفذ", "Out of Stock")}</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors shrink-0"
            >
              {t("مسح الفلاتر", "Clear Filters")}
            </button>
          )}
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-card)] text-sm font-medium shrink-0"
          style={{ background: "var(--color-primary)", color: "var(--color-background)" }}
        >
          <Plus size={16} />
          {t("إضافة منتج", "Add Product")}
        </Link>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden" style={{ background: "var(--color-surface)" }}>
        {products === null ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("جارِ التحميل...", "Loading...")}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title={t("لا توجد منتجات", "No products found")}
            description={t("جرّبي تعديل البحث أو الفلتر، أو أضيفي منتجاً جديداً.", "Try adjusting your search or filters, or add a new product.")}
          />
        ) : (
          <>
            <table className="w-full hidden md:table text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-start">
                  {[
                    t("المنتج", "Product"),
                    t("القسم", "Category"),
                    t("السعر", "Price"),
                    t("المخزون", "Stock"),
                    t("مميز", "Featured"),
                    t("الحالة", "Status"),
                    t("إجراءات", "Actions"),
                  ].map((h) => (
                    <th key={h} className="text-start font-medium px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-[var(--radius-card)] object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-[var(--radius-card)] flex items-center justify-center" style={{ background: "var(--color-muted)" }} />
                        )}
                        <div>
                          <p className="font-medium" style={{ color: "var(--color-heading)" }}>
                            {t(p.nameAr || p.name, p.name)}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {p.sku || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{categoryName(p.categoryId)}</td>
                    <td className="px-4 py-3">
                      {p.currency} {p.salePrice ?? p.price}
                      {p.salePrice && <span className="ms-1 text-xs line-through opacity-60">{p.price}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.stockQuantity === 0 ? <Badge tone="error">{t("نفذ", "Out")}</Badge> : p.stockQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(p)}>
                        <Badge tone={p.featured ? "warning" : "neutral"}>{p.featured ? t("نعم", "Yes") : t("لا", "No")}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p)}>
                        <Badge tone={p.active ? "success" : "neutral"}>{p.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 rounded hover:bg-[var(--color-muted)]" aria-label={t("تعديل", "Edit")}>
                          <Pencil size={15} />
                        </Link>
                        <a href="/" className="p-1.5 rounded hover:bg-[var(--color-muted)]" aria-label={t("عرض", "View")}>
                          <Eye size={15} />
                        </a>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 rounded hover:bg-[var(--color-muted)]" style={{ color: "var(--color-error)" }} aria-label={t("حذف", "Delete")}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden divide-y divide-[var(--color-border)]">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 flex gap-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-[var(--radius-card)] object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-[var(--radius-card)] shrink-0" style={{ background: "var(--color-muted)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--color-heading)" }}>
                      {t(p.nameAr || p.name, p.name)}
                    </p>
                    <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
                      {categoryName(p.categoryId)} · {p.currency} {p.salePrice ?? p.price}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge tone={p.active ? "success" : "neutral"}>{p.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</Badge>
                      {p.stockQuantity === 0 && <Badge tone="error">{t("نفذ", "Out of stock")}</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/products/${p.id}/edit`} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                        <Pencil size={13} /> {t("تعديل", "Edit")}
                      </Link>
                      <button onClick={() => setConfirmDelete(p)} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                        <Trash2 size={13} /> {t("حذف", "Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm rounded-[var(--radius-card)] p-5" style={{ background: "var(--color-surface)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
              {t("حذف المنتج؟", "Delete product?")}
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
              {t(
                `سيتم حذف "${confirmDelete.nameAr || confirmDelete.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
                `"${confirmDelete.name}" will be permanently deleted. This action cannot be undone.`
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)]">
                {t("إلغاء", "Cancel")}
              </button>
              <button
                onClick={() => doDelete(confirmDelete)}
                className="px-4 py-2 rounded-[var(--radius-card)] text-sm font-medium"
                style={{ background: "var(--color-error)", color: "white" }}
              >
                {t("حذف", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
