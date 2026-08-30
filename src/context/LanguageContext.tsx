import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "ar" | "en";

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  toggleLang: () => void;
  t: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("wf-lang");
    return stored === "en" ? "en" : "ar";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("wf-lang", lang);
  }, [lang, dir]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
