import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { settingsService, type SiteSettingsInput } from "../../services/settingsService";

export default function Settings() {
  const { t } = useLanguage();
  const { settings, loading, error: loadError, refresh } = useSettings();
  const [form, setForm] = useState<SiteSettingsInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        storeNameAr: settings.storeNameAr,
        whatsappNumber: settings.whatsappNumber,
        facebookUrl: settings.facebookUrl,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      });
    }
  }, [settings]);

  const set = <K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await settingsService.update(form);
      refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const labelClass = "block text-sm font-medium mb-1.5";

  if (loading || !form) {
    return <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{t("جارِ التحميل...", "Loading...")}</p>;
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {loadError && (
        <div className="p-3 rounded-[var(--radius-card)] border text-sm flex items-start gap-2" style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)", background: "var(--color-surface)" }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {t("تعذّر تحميل الإعدادات من قاعدة البيانات، يتم عرض قيم افتراضية: ", "Couldn't load settings from the database, showing defaults: ")}{loadError}
        </div>
      )}

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5" style={{ background: "var(--color-surface)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-heading)" }}>
          {t("معلومات المتجر", "Store Information")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("اسم المتجر (عربي)", "Store Name (Arabic)")}</label>
            <input dir="rtl" value={form.storeNameAr} onChange={(e) => set("storeNameAr", e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("اسم المتجر (إنجليزي)", "Store Name (English)")}</label>
            <input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("رقم واتساب", "WhatsApp Number")}</label>
            <input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className={fieldClass} placeholder="963XXXXXXXXX" />
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {t("بالصيغة الدولية بدون صفر بالبداية.", "International format, no leading zero.")}
            </p>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("رابط فيسبوك", "Facebook URL")}</label>
            <input value={form.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value || null)} className={fieldClass} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("البريد الإلكتروني", "Email")}</label>
            <input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value || null)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("رقم الهاتف", "Phone")}</label>
            <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value || null)} className={fieldClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} style={{ color: "var(--color-text)" }}>{t("العنوان", "Address")}</label>
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value || null)} className={fieldClass} />
          </div>
        </div>

        {saveError && (
          <p className="text-sm mt-4 flex items-center gap-1.5" style={{ color: "var(--color-error)" }}>
            <AlertCircle size={14} /> {saveError}
          </p>
        )}
        {saved && (
          <p className="text-sm mt-4 flex items-center gap-1.5" style={{ color: "var(--color-success)" }}>
            <CheckCircle2 size={14} /> {t("تم الحفظ بنجاح", "Saved successfully")}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 px-6 py-2.5 rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)", color: "var(--color-background)" }}
        >
          {saving ? t("جارِ الحفظ...", "Saving...") : t("حفظ التغييرات", "Save Changes")}
        </button>
      </section>
    </div>
  );
}
