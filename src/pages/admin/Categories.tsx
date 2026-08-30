import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import type { Category, Product } from "../../types/admin";
import Badge from "../../components/admin/ui/Badge";
import EmptyState from "../../components/admin/ui/EmptyState";

export default function Categories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "" });
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([categoryService.list(), productService.list()])
      .then(([c, p]) => {
        setCategories(c);
        setProducts(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load categories"));
  };
  useEffect(load, []);

  const openNew = () => {
    setForm({ name: "", nameAr: "" });
    setSaveError(null);
    setEditing("new");
  };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, nameAr: c.nameAr ?? "" });
    setSaveError(null);
    setEditing(c);
  };

  const save = async () => {
    if (!form.name.trim() || !form.nameAr.trim()) return;
    setSaveError(null);
    try {
      if (editing === "new") {
        await categoryService.create({ name: form.name, nameAr: form.nameAr, active: true });
      } else if (editing) {
        await categoryService.update(editing.id, { name: form.name, nameAr: form.nameAr });
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const toggleActive = async (c: Category) => {
    await categoryService.update(c.id, { active: !c.active });
    load();
  };

  const remove = async (c: Category) => {
    await categoryService.remove(c.id);
    load();
  };

  const productCount = (id: string) => products.filter((p) => p.categoryId === id).length;

  if (error) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] border flex items-start gap-3" style={{ borderColor: "var(--color-error)", background: "var(--color-surface)" }}>
        <AlertCircle size={18} style={{ color: "var(--color-error)" }} className="shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-card)] text-sm font-medium" style={{ background: "var(--color-primary)", color: "var(--color-background)" }}>
          <Plus size={16} />
          {t("إضافة قسم", "Add Category")}
        </button>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden" style={{ background: "var(--color-surface)" }}>
        {categories === null ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</div>
        ) : categories.length === 0 ? (
          <EmptyState icon={FolderTree} title={t("لا توجد أقسام", "No categories yet")} description={t("أضيفي أول قسم للبدء.", "Add your first category to get started.")} />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "var(--color-heading)" }}>{t(c.nameAr || c.name, c.name)}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{productCount(c.id)} {t("منتج", "products")}</p>
                </div>
                <button onClick={() => toggleActive(c)}>
                  <Badge tone={c.active ? "success" : "neutral"}>{c.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</Badge>
                </button>
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-[var(--color-muted)]" aria-label={t("تعديل", "Edit")}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-[var(--color-muted)]" style={{ color: "var(--color-error)" }} aria-label={t("حذف", "Delete")}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm rounded-[var(--radius-card)] p-5" style={{ background: "var(--color-surface)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "var(--color-heading)" }}>
              {editing === "new" ? t("إضافة قسم", "Add Category") : t("تعديل القسم", "Edit Category")}
            </h3>
            <div className="flex flex-col gap-3 mb-2">
              <input placeholder={t("الاسم بالإنجليزي", "Name in English")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)]" />
              <input dir="rtl" placeholder={t("الاسم بالعربي", "Name in Arabic")} value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} className="px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)]" />
            </div>
            {saveError && <p className="text-xs mb-3" style={{ color: "var(--color-error)" }}>{saveError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)]">{t("إلغاء", "Cancel")}</button>
              <button onClick={save} className="px-4 py-2 rounded-[var(--radius-card)] text-sm font-medium" style={{ background: "var(--color-primary)", color: "var(--color-background)" }}>{t("حفظ", "Save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
