import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { localeLabels, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 px-3">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm">Language</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        {(Object.entries(localeLabels) as [Locale, string][]).map(([value, label]) => (
          <Button
            key={value}
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
      </PopoverContent>
    </Popover>
  );
}
