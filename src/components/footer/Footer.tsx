import { MessageCircle, Share2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { createWhatsAppGeneralLink } from "../../utils/whatsapp";

export default function Footer() {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();

  return (
    <footer style={{ background: "#3A2450", color: "#E9D9F5" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/images/logo.jfif" alt="Ward & Fall" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              {t("ورد وفل", "Ward & Fall")}
            </span>
          </div>
          <p className="text-sm opacity-80">
            {t("زهور وهدايا صُممت لكل مناسبة تستحق الاحتفال.", "Flowers and gifts crafted for every celebration.")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t("روابط سريعة", "Quick Links")}</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#shop">{t("المتجر", "Shop")}</a></li>
            <li><a href="#categories">{t("الأقسام", "Categories")}</a></li>
            <li><a href="#about">{t("من نحن", "About")}</a></li>
            <li><a href="#contact">{t("تواصل", "Contact")}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t("تابعينا", "Follow Us")}</h4>
          <div className="flex gap-3">
            <a
              href={settings ? createWhatsAppGeneralLink(lang, settings.whatsappNumber) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
            {settings?.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Share2 size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {t("ورد وفل. جميع الحقوق محفوظة.", "Ward & Fall. All rights reserved.")}
      </div>
    </footer>
  );
}
