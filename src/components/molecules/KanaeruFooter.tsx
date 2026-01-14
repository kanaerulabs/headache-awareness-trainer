"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * KanaeruFooter - Branding footer shown on all pages
 *
 * Displays "Fulfilled by" text with KanaeruAI logo as clickable link
 * Appears above the bottom navigation on all pages
 */
export function KanaeruFooter() {
  const t = useTranslations("settings");

  return (
    <footer className="py-6 text-center" data-testid="kanaeru-footer">
      <a
        href="https://kanaeru.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
      >
        <span className="text-xs text-muted-foreground">{t("fulfilledBy")}</span>
        <Image
          src="/kanaeru-logo.png"
          alt="KanaeruAI"
          width={24}
          height={24}
          className="rounded"
        />
      </a>
    </footer>
  );
}
