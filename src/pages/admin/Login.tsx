import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext";

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل تسجيل الدخول", "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-background)" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] p-6"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src="/images/logo.jfif" alt="Ward & Fall" className="h-12 w-12 rounded-full object-cover mb-2" />
          <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
            {t("تسجيل دخول الإدارة", "Admin Login")}
          </h1>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("البريد الإلكتروني", "Email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("كلمة المرور", "Password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[var(--radius-card)] text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          {loading ? t("جارِ الدخول...", "Signing in...") : t("دخول", "Sign In")}
        </button>

        <p className="text-xs mt-4 text-center" style={{ color: "var(--color-text-secondary)" }}>
          {t(
            "الحساب يُنشأ يدوياً من لوحة Supabase — راجعي التقرير المرفق.",
            "Accounts are created manually via the Supabase dashboard — see the setup notes."
          )}
        </p>
      </form>
    </div>
  );
}
