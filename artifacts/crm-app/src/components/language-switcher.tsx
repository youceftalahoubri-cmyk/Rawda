import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { localeLabels, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 px-3">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm">Language</span>
        </Button>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
