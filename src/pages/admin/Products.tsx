import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, PackageX, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { productService } from "../../services/productService";
import type { ProductInput } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import type { Product, Category } from "../../types/admin";
import Badge from "../../components/admin/ui/Badge";
import EmptyState from "../../components/admin/ui/EmptyState";
import Select from "../../components/admin/ui/Select";
import Switch from "../../components/admin/ui/Switch";
import Dialog from "../../components/ui/Dialog";
import DialogHeader from "../../components/ui/DialogHeader";
import DialogBody from "../../components/ui/DialogBody";
import ProductForm from "../../components/admin/products/ProductForm";
import Pagination from "../../components/admin/ui/Pagination";
import { usePageSearch } from "../../context/AdminSearchContext";

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = usePageSearch(t("ابحث بالاسم، SKU، أو الرابط...", "Search by name, SKU, or slug..."));
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const LOW_STOCK_THRESHOLD = 5;
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDirty, setAddDirty] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Dashboard's "Add New Product" quick action navigates here with this
  // flag instead of a separate /admin/products/new page, so it opens the
  // same modal used by the in-page "Add Product" button (no duplicate
  // add-product implementation). Cleared immediately via `replace` so
  // browser back/forward doesn't reopen it.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      setAddOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestCloseAdd = () => {
    if (
      addDirty &&
      !window.confirm(t("لديك بيانات غير محفوظة، هل تريدين إغلاق النموذج؟", "You have unsaved changes. Close anyway?"))
    ) {
      return;
    }
    setAddOpen(false);
    setAddDirty(false);
    setAddError(null);
  };

  const handleAddSubmit = async (values: ProductInput) => {
    setAddError(null);
    try {
      await productService.create(values);
      setAddOpen(false);
      setAddDirty(false);
      load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t("فشل حفظ المنتج", "Failed to save product"));
    }
  };

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editDirty, setEditDirty] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const requestCloseEdit = () => {
    if (
      editDirty &&
      !window.confirm(t("لديك بيانات غير محفوظة، هل تريدين إغلاق النموذج؟", "You have unsaved changes. Close anyway?"))
    ) {
      return;
    }
    setEditProduct(null);
    setEditDirty(false);
    setEditError(null);
  };

  const handleEditSubmit = async (values: ProductInput) => {
    if (!editProduct) return;
    setEditError(null);
    try {
      await productService.update(editProduct.id, values);
      setEditProduct(null);
      setEditDirty(false);
      load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : t("فشل حفظ التعديلات", "Failed to save changes"));
    }
  };

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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  // Derived during render rather than synced via an effect: if a filter
  // change shrinks the results below the current page, this clamps back
  // to the last valid page automatically instead of showing an empty page.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all" || featuredFilter !== "all" || stockFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setStockFilter("all");
    setPage(1);
  };

  const toggleActive = async (p: Product) => {
    setActionError(null);
    // Optimistic update: flip the UI instantly, then sync with Supabase in
    // the background. Waiting for a full reload() after every toggle (two
    // network round-trips) was the cause of the sluggish response.
    setProducts((prev) => prev?.map((row) => (row.id === p.id ? { ...row, active: !p.active } : row)) ?? prev);
    try {
      await productService.update(p.id, { active: !p.active });
    } catch (err) {
      setProducts((prev) => prev?.map((row) => (row.id === p.id ? { ...row, active: p.active } : row)) ?? prev);
      setActionError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const toggleFeatured = async (p: Product) => {
    setActionError(null);
    setProducts((prev) => prev?.map((row) => (row.id === p.id ? { ...row, featured: !p.featured } : row)) ?? prev);
    try {
      await productService.update(p.id, { featured: !p.featured });
    } catch (err) {
      setProducts((prev) => prev?.map((row) => (row.id === p.id ? { ...row, featured: p.featured } : row)) ?? prev);
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
          <div className="relative flex-1 max-w-sm md:hidden">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3" style={{ color: "var(--color-text-secondary)" }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("ابحث بالاسم، SKU، أو الرابط...", "Search by name, SKU, or slug...")}
              className="w-full ps-9 pe-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            className="w-full sm:w-44 shrink-0"
            aria-label={t("فلترة حسب القسم", "Filter by category")}
            options={[
              { value: "all", label: t("كل الأقسام", "All Categories") },
              ...categories.map((c) => ({ value: c.id, label: t(c.nameAr || c.name, c.name) })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            className="w-full sm:w-40 shrink-0"
            aria-label={t("فلترة حسب الحالة", "Filter by status")}
            options={[
              { value: "all", label: t("كل الحالات", "All Statuses") },
              { value: "active", label: t("نشط", "Active") },
              { value: "inactive", label: t("غير نشط", "Inactive") },
            ]}
          />
          <Select
            value={featuredFilter}
            onChange={(v) => { setFeaturedFilter(v); setPage(1); }}
            className="w-full sm:w-44 shrink-0"
            aria-label={t("فلترة حسب التمييز", "Filter by featured")}
            options={[
              { value: "all", label: t("كل المنتجات", "All Products") },
              { value: "featured", label: t("مميز", "Featured") },
              { value: "not_featured", label: t("غير مميز", "Not Featured") },
            ]}
          />
          <Select
            value={stockFilter}
            onChange={(v) => { setStockFilter(v); setPage(1); }}
            className="w-full sm:w-40 shrink-0"
            aria-label={t("فلترة حسب المخزون", "Filter by stock")}
            options={[
              { value: "all", label: t("كل المخزون", "All Stock") },
              { value: "in_stock", label: t("متوفر", "In Stock") },
              { value: "low_stock", label: t("منخفض", "Low Stock") },
              { value: "out_of_stock", label: t("نفذ", "Out of Stock") },
            ]}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors shrink-0"
              style={{ color: "var(--color-text)" }}
            >
              {t("مسح الفلاتر", "Clear Filters")}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-card)] text-sm font-medium shrink-0"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={16} />
          {t("إضافة منتج", "Add Product")}
        </button>
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
                {pageItems.map((p) => (
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
                      <Switch
                        checked={p.featured}
                        onChange={() => toggleFeatured(p)}
                        label={p.featured ? t("نعم", "Yes") : t("لا", "No")}
                        ariaLabel={t(`تبديل تمييز ${p.nameAr || p.name}`, `Toggle featured for ${p.name}`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={p.active}
                        onChange={() => toggleActive(p)}
                        label={p.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}
                        ariaLabel={t(`تبديل حالة ${p.nameAr || p.name}`, `Toggle status for ${p.name}`)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setEditProduct(p)} className="p-1.5 rounded hover:bg-[var(--color-muted)]" aria-label={t("تعديل", "Edit")}>
                          <Pencil size={15} />
                        </button>
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
              {pageItems.map((p) => (
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
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Switch
                        checked={p.active}
                        onChange={() => toggleActive(p)}
                        label={p.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}
                        ariaLabel={t(`تبديل حالة ${p.nameAr || p.name}`, `Toggle status for ${p.name}`)}
                      />
                      <Switch
                        checked={p.featured}
                        onChange={() => toggleFeatured(p)}
                        label={t("مميز", "Featured")}
                        ariaLabel={t(`تبديل تمييز ${p.nameAr || p.name}`, `Toggle featured for ${p.name}`)}
                      />
                      {p.stockQuantity === 0 && <Badge tone="error">{t("نفذ", "Out of stock")}</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setEditProduct(p)} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                        <Pencil size={13} /> {t("تعديل", "Edit")}
                      </button>
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
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          prevLabel={t("السابق", "Previous")}
          nextLabel={t("التالي", "Next")}
          pageLabel={(p, total) => t(`صفحة ${p} من ${total}`, `Page ${p} of ${total}`)}
        />
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
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)]" style={{ color: "var(--color-text)" }}>
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

      <Dialog open={addOpen} onClose={requestCloseAdd} titleId="add-product-title">
        <DialogHeader
          titleId="add-product-title"
          title={t("إضافة منتج", "Add Product")}
          onClose={requestCloseAdd}
          closeLabel={t("إغلاق", "Close")}
        />
        <DialogBody>
          {addError && (
            <div
              className="mb-4 p-3 rounded-[var(--radius-card)] border text-sm"
              style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "var(--color-surface)" }}
            >
              {addError}
            </div>
          )}
          <ProductForm
            onSubmit={handleAddSubmit}
            submitLabel={t("إضافة المنتج", "Add Product")}
            onCancel={requestCloseAdd}
            cancelLabel={t("إلغاء", "Cancel")}
            onDirtyChange={setAddDirty}
            stickyFooter
          />
        </DialogBody>
      </Dialog>

      <Dialog open={editProduct !== null} onClose={requestCloseEdit} titleId="edit-product-title">
        <DialogHeader
          titleId="edit-product-title"
          title={t("تعديل المنتج", "Edit Product")}
          onClose={requestCloseEdit}
          closeLabel={t("إغلاق", "Close")}
        />
        <DialogBody>
          {editError && (
            <div
              className="mb-4 p-3 rounded-[var(--radius-card)] border text-sm"
              style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "var(--color-surface)" }}
            >
              {editError}
            </div>
          )}
          {editProduct && (
            <ProductForm
              key={editProduct.id}
              initialValues={editProduct}
              onSubmit={handleEditSubmit}
              submitLabel={t("حفظ التعديلات", "Save Changes")}
              onCancel={requestCloseEdit}
              cancelLabel={t("إلغاء", "Cancel")}
              onDirtyChange={setEditDirty}
              stickyFooter
            />
          )}
        </DialogBody>
      </Dialog>
    </div>
  );
}
