import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocale, localeLabels, setLocale, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [locale, setCurrentLocale] = useState<Locale>(getLocale());

  useEffect(() => {
    const onChange = () => setCurrentLocale(getLocale());
    window.addEventListener("rawdat-locale-change", onChange);
    return () => window.removeEventListener("rawdat-locale-change", onChange);
  }, []);

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="w-[140px] h-10">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
