"use client";

import { useTranslations } from "next-intl";

/**
 * KanaeruFooter - Branding footer shown on all pages
 *
 * Displays "Fulfilled by KanaeruAI" with link to kanaeru.ai
 * Appears above the bottom navigation on all pages
 */
export function KanaeruFooter() {
  const t = useTranslations("settings");

  return (
    <footer className="pt-8 pb-4 text-center" data-testid="kanaeru-footer">
      <p className="text-sm text-muted-foreground">
        {t("fulfilledBy")}{" "}
        <a
          href="https://kanaeru.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          KanaeruAI
        </a>
      </p>
    </footer>
  );
}
