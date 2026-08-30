import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { settingsService, type SiteSettings } from "../services/settingsService";

interface SettingsContextValue {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const FALLBACK: SiteSettings = {
  storeName: "Ward & Fall",
  storeNameAr: "ورد وفل",
  whatsappNumber: "963968429475",
  facebookUrl: null,
  email: null,
  phone: null,
  address: null,
  updatedAt: "",
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    settingsService
      .get()
      .then(setSettings)
      .catch((err) => {
        // Storefront must never break if settings fail to load — fall back
        // to known-good static values (e.g. offline, RLS misconfig) rather
        // than hiding the WhatsApp/contact buttons entirely.
        setError(err instanceof Error ? err.message : "Failed to load settings");
        setSettings(FALLBACK);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
