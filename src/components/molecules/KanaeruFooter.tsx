"use client";

import Image from "next/image";

/**
 * KanaeruFooter - Branding footer shown on all pages
 *
 * Displays KanaeruAI logo as clickable link to kanaeru.ai
 * Appears above the bottom navigation on all pages
 * Extra bottom padding ensures it's not cut off by mobile nav bar
 */
export function KanaeruFooter() {
  return (
    <footer
      className="pt-8 pb-24 sm:pb-8 text-center"
      data-testid="kanaeru-footer"
    >
      <a
        href="https://kanaeru.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fulfilled by KanaeruAI"
      >
        <Image
          src="/kanaeru-logo.png"
          alt="KanaeruAI"
          width={40}
          height={40}
          className="rounded-lg"
        />
      </a>
    </footer>
  );
}
