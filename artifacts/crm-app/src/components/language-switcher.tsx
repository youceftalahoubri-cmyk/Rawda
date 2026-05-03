import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localeLabels, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 h-9 px-3"
        onClick={() => setOpen((value) => !value)}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="text-sm">Language</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </Button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 w-40 rounded-md border bg-background p-1 shadow-lg">
          {(Object.entries(localeLabels) as [Locale, string][]).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant={locale === value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setLocale(value);
                setOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}