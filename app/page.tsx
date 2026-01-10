"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";
import { useLoggingStore, type HeadacheEntry } from "@/interface-adapters/store/loggingStore";
import {
  Brain,
  Lightbulb,
  Clock,
} from "lucide-react";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col p-6 pb-24" data-testid="home-page-loading">
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
  const loggingStore = useLoggingStore();
  const [recentEntries, setRecentEntries] = useState<HeadacheEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if we just logged an entry
  const justLogged = searchParams.get("logged") === "true";

  // Redirect new users to onboarding
  useEffect(() => {
    if (!isCompleted) {
      router.push("/onboarding");
    }
  }, [isCompleted, router]);

  // Trigger refresh when navigating back with ?logged=true
  useEffect(() => {
    if (justLogged) {
      setRefreshTrigger((prev) => prev + 1);
      // Clear the URL params without navigation
      router.replace("/", { scroll: false });
    }
  }, [justLogged, router]);

  // Fetch recent entries
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoadingEntries(true);
      await loggingStore.initializeDB();
      const entries = await loggingStore.getRecentEntries(5);
      setRecentEntries(entries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  }, [loggingStore]);

  useEffect(() => {
    if (isCompleted) {
      fetchEntries();
    }
  }, [isCompleted, fetchEntries, refreshTrigger]);

  // If not completed, show nothing (will redirect)
  if (!isCompleted) {
    return null;
  }

  // Get headache type label for personalized greeting
  const getHeadacheTypeLabel = () => {
    switch (headacheType) {
      case "tension":
        return "Tension Headaches";
      case "migraine":
        return "Migraines";
      case "mixed":
        return "Mixed Headaches";
      case "unsure":
        return "Headaches";
      default:
        return "Headaches";
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col p-6 pb-24"
      data-testid="home-page"
    >
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Personalized Greeting */}
        <div className="space-y-2" data-testid="greeting-section">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-lg text-muted-foreground">
            Managing your {getHeadacheTypeLabel().toLowerCase()}
          </p>
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
              <h2 className="font-semibold">Tip of the Day</h2>
              <p className="text-sm text-muted-foreground">
                Notice your posture throughout the day. Tension in the neck and
                shoulders often precedes headaches. Take short breaks to stretch
                and reset your alignment.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Actions - Only the 2 most important */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What would you like to do?</h2>
          <div
            className="grid grid-cols-2 gap-3"
            data-testid="quick-actions"
          >
            {/* Log Headache */}
            <ActionCard
              icon={<Brain className="h-5 w-5" />}
              title="Log Headache"
              description="Record an episode"
              onClick={() => router.push("/log")}
              testId="log-headache-card"
              variant="primary"
            />

            {/* Quick Check-in */}
            <ActionCard
              icon={<Clock className="h-5 w-5" />}
              title="Quick Check-in"
              description="Track how you feel"
              onClick={() => router.push("/checkin")}
              testId="checkin-card"
              variant="default"
            />
          </div>
        </div>

        {/* Recent Entries Section */}
        {isLoadingEntries ? (
          <div className="rounded-lg border bg-card p-6 text-center" data-testid="loading-entries">
            <p className="text-sm text-muted-foreground">Loading entries...</p>
          </div>
        ) : recentEntries.length > 0 ? (
          <div className="space-y-4" data-testid="recent-entries-section">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
            {recentEntries.length >= 5 && (
              <button
                onClick={() => router.push("/insights")}
                className="text-sm text-primary hover:underline"
              >
                View all entries →
              </button>
            )}
          </div>
        ) : (
          <div
            className="rounded-lg border bg-card p-6 text-center"
            data-testid="empty-state"
          >
            <p className="text-sm text-muted-foreground">
              No headaches logged yet. Start by logging your first episode or
              explore the learning section to build awareness.
            </p>
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
}

const intensityColors = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-red-800",
} as const;

const intensityLabels = {
  1: "Minimal",
  2: "Mild",
  3: "Moderate",
  4: "Severe",
  5: "Extreme",
} as const;

function EntryCard({ entry }: EntryCardProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

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
              {intensityLabels[entry.intensity as keyof typeof intensityLabels]} Headache
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
                  +{entry.contextTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
