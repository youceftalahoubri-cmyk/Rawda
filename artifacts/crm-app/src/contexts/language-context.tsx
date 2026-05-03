import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getLocale, setLocale as persistLocale, t, type Locale } from "@/lib/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof t>;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  const handleSetLocale = (newLocale: Locale) => {
    persistLocale(newLocale);
    setLocaleState(newLocale);
  };

  const isRtl = locale === "ar";

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", isRtl ? "rtl" : "ltr");
    root.setAttribute("lang", locale);
  }, [locale, isRtl]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t: t(locale), isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
