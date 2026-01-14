"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * KanaeruFooter - Branding footer shown on all pages
 *
 * Displays "Fulfilled by" text with KanaeruAI logo as clickable link
 * Appears above the bottom navigation on all pages
 * Includes safe area padding to avoid being cut off by mobile nav
 */
export function KanaeruFooter() {
  const t = useTranslations("settings");

  return (
    <footer
      className="pt-4 pb-20 lg:pb-4 text-center"
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
