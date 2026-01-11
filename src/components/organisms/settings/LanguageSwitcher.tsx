"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
] as const;

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`;
}

function getLocaleCookie(): string {
  const match = document.cookie.match(/locale=([^;]+)/);
  return match ? match[1] : "en";
}

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    setLocaleCookie(newLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  // Get current locale from cookie on client side
  const currentLocale =
    typeof document !== "undefined" ? getLocaleCookie() : "en";

  return (
    <div className="space-y-3" data-testid="language-switcher">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-medium">Language / 言語</Label>
      </div>
      <RadioGroup
        value={currentLocale}
        onValueChange={handleLocaleChange}
        className="grid gap-2"
        disabled={isPending}
      >
        {locales.map((locale) => (
          <div key={locale.code} className="flex items-center space-x-3">
            <RadioGroupItem
              value={locale.code}
              id={`locale-${locale.code}`}
              data-testid={`locale-${locale.code}`}
            />
            <Label
              htmlFor={`locale-${locale.code}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span>{locale.nativeName}</span>
              {locale.code !== "en" && (
                <span className="text-muted-foreground text-sm">
                  ({locale.name})
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {isPending && (
        <p className="text-sm text-muted-foreground">Switching language...</p>
      )}
    </div>
  );
}
