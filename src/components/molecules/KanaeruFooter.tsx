"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * KanaeruFooter - Branding footer shown on most pages
 *
 * Displays "Fulfilled by" text with KanaeruAI logo as clickable link
 * Hidden on pages with fixed bottom elements (like /log with its submit bar)
 */
export function KanaeruFooter() {
  const t = useTranslations("settings");
  const pathname = usePathname();

  // Hide footer on pages with fixed bottom elements that would overlap
  if (pathname === "/log") {
    return null;
  }

  return (
    <footer
      className="py-3 text-center"
      data-testid="kanaeru-footer"
    >
      <a
        href="https://kanaeru.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity"
      >
        <span className="text-sm text-muted-foreground">{t("fulfilledBy")}</span>
        <Image
          src="/kanaeru-logo.png"
          alt="KanaeruAI"
          width={28}
          height={28}
          className="rounded"
        />
      </a>
    </footer>
  );
}
