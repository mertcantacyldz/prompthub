import { useLocation, useNavigate } from "react-router";
import { getLocale, locales, setLocale } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
};

export function LanguageSwitcher() {
  const currentLocale = getLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Languages className="h-4 w-4" />
          <span className="hidden text-sm font-medium sm:inline">
            {LOCALE_LABELS[currentLocale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => setLocale(locale as any)}
            className={locale === currentLocale ? "bg-accent-500/10 text-accent-500" : ""}
          >
            {LOCALE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
