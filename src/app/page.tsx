"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingStore, useHasHydrated } from "@/interface-adapters/store/onboardingStore";
import {
  useLoggingStore,
  HeadacheEntry,
} from "@/interface-adapters/store/loggingStore";
import { Brain, Lightbulb, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageSkeleton() {
  return (
    <main
      className="flex min-h-screen flex-col p-6 pb-4"
      data-testid="home-page-loading"
    >
      <div className="mx-auto w-full max-w-2xl space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted rounded" />
          <div className="h-6 w-64 bg-muted rounded" />
        </div>
        <div className="rounded-lg border bg-card p-6 h-32" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-4 h-28" />
          <div className="rounded-lg border bg-card p-4 h-28" />
        </div>
      </div>
    </main>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCompleted, headacheType } = useOnboardingStore();
  const hasHydrated = useHasHydrated();

  // Use logging store (same as log page)
  const loggingStore = useLoggingStore();
  const [recentEntries, setRecentEntries] = useState<HeadacheEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initialize DB and load entries
  const refreshRecentEntries = useCallback(async () => {
    if (!loggingStore.db) return;
    const entries = await loggingStore.getRecentEntries(5);
    setRecentEntries(entries);
  }, [loggingStore]);

  useEffect(() => {
    const init = async () => {
      if (!loggingStore.db) {
        await loggingStore.initializeDB();
      }
      setIsReady(true);
      const entries = await loggingStore.getRecentEntries(5);
      setRecentEntries(entries);
      setIsInitialLoading(false);
    };
    init();
  }, [loggingStore]);

  const hasHandledLoggedRef = useRef(false);
  const t = useTranslations("home");
  const tHeadache = useTranslations("headacheTypes");
  const tIntensity = useTranslations("intensity");
  const tTime = useTranslations("time");
  const tCommon = useTranslations("common");

  // Check if we just logged an entry
  const justLogged = searchParams.get("logged") === "true";

  // Redirect new users to onboarding (only after hydration to avoid flash)
  useEffect(() => {
    if (hasHydrated && !isCompleted) {
      router.push("/onboarding");
    }
  }, [hasHydrated, isCompleted, router]);

  // Handle the ?logged=true param - trigger refresh and clear URL
  useEffect(() => {
    if (justLogged && !hasHandledLoggedRef.current && isReady) {
      hasHandledLoggedRef.current = true;
      // Fetch entries silently
      refreshRecentEntries();
      // Clear the URL param
      router.replace("/", { scroll: false });
    }
    // Reset the ref when justLogged becomes false (URL is cleared)
    if (!justLogged) {
      hasHandledLoggedRef.current = false;
    }
  }, [justLogged, router, isReady, refreshRecentEntries]);

  // Show loading until hydration is complete, then redirect if needed
  if (!hasHydrated || !isCompleted) {
    return <HomePageSkeleton />;
  }

  // Get headache type label for personalized greeting
  const getHeadacheTypeLabel = () => {
    switch (headacheType) {
      case "tension":
        return tHeadache("tension");
      case "migraine":
        return tHeadache("migraine");
      case "mixed":
        return tHeadache("mixed");
      case "unsure":
        return tHeadache("unsure");
      default:
        return tHeadache("unsure");
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col p-6 pb-4"
      data-testid="home-page"
    >
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Header with Settings */}
        <div
          className="flex items-start justify-between"
          data-testid="greeting-section"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("welcomeBack")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("managing", { headacheType: getHeadacheTypeLabel() })}
            </p>
          </div>
          <Link
            href="/settings"
            data-testid="settings-link"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={tCommon("settings")}
          >
            <Settings className="h-6 w-6 text-muted-foreground" />
          </Link>
        </div>

        {/* Daily Tip Section */}
        <div
          className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm"
          data-testid="daily-tip-section"
        >
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">{t("tipOfDay")}</h2>
              <p className="text-sm text-muted-foreground">{t("dailyTip")}</p>
            </div>
          </div>
        </div>

        {/* Primary Actions - Only the 2 most important */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("whatToDo")}</h2>
          <div className="grid grid-cols-2 gap-3" data-testid="quick-actions">
            {/* Log Headache */}
            <ActionCard
              icon={<Brain className="h-5 w-5" />}
              title={t("logHeadache")}
              description={t("recordEpisode")}
              onClick={() => router.push("/log")}
              testId="log-headache-card"
              variant="primary"
            />

            {/* Quick Check-in */}
            <ActionCard
              icon={<Clock className="h-5 w-5" />}
              title={t("quickCheckin")}
              description={t("trackFeeling")}
              onClick={() => router.push("/checkin")}
              testId="checkin-card"
              variant="default"
            />
          </div>
        </div>

        {/* Recent Entries Section */}
        {!isReady || isInitialLoading ? (
          <div
            className="rounded-lg border bg-card p-6 text-center"
            data-testid="loading-entries"
          >
            <p className="text-sm text-muted-foreground">
              {t("loadingEntries")}
            </p>
          </div>
        ) : recentEntries.length > 0 ? (
          <div className="space-y-4" data-testid="recent-entries-section">
            <h2 className="text-lg font-semibold">{t("recentEntries")}</h2>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  tIntensity={tIntensity}
                  tTime={tTime}
                />
              ))}
            </div>
            {recentEntries.length >= 5 && (
              <button
                onClick={() => router.push("/insights")}
                className="text-sm text-primary hover:underline"
              >
                {t("viewAllEntries")}
              </button>
            )}
          </div>
        ) : (
          <div
            className="rounded-lg border bg-card p-6 text-center"
            data-testid="empty-state"
          >
            <p className="text-sm text-muted-foreground">{t("noEntries")}</p>
          </div>
        )}
      </div>
    </main>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  testId?: string;
  variant?: "primary" | "default";
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
  testId,
  variant = "default",
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        variant === "primary"
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      }`}
      data-testid={testId}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          variant === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

interface EntryCardProps {
  entry: HeadacheEntry;
  tIntensity: ReturnType<typeof useTranslations<"intensity">>;
  tTime: ReturnType<typeof useTranslations<"time">>;
}

const intensityColors = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-red-800",
} as const;

function EntryCard({ entry, tIntensity, tTime }: EntryCardProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return tTime("justNow");
    if (diffHours < 24) return tTime("hoursAgo", { hours: diffHours });
    if (diffDays === 1) return tTime("yesterday");
    if (diffDays < 7) return tTime("daysAgo", { days: diffDays });
    return d.toLocaleDateString();
  };

  const intensityLabel = tIntensity(
    String(entry.intensity) as "1" | "2" | "3" | "4" | "5",
  );

  return (
    <div
      className="rounded-lg border bg-card p-4 transition-all hover:border-primary/30"
      data-testid="entry-card"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold ${intensityColors[entry.intensity as keyof typeof intensityColors]}`}
        >
          {entry.intensity}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">
              {intensityLabel} {tIntensity("headache")}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(entry.timestamp)}
            </span>
          </div>
          {entry.note && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {entry.note}
            </p>
          )}
          {entry.contextTags && entry.contextTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.contextTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
              {entry.contextTags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{entry.contextTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
