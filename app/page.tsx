"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/interface-adapters/store/onboardingStore";
import {
  Brain,
  BookOpen,
  BarChart3,
  Settings,
  Lightbulb,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isCompleted, headacheType } = useOnboardingStore();

  // Redirect new users to onboarding
  useEffect(() => {
    if (!isCompleted) {
      router.push("/onboarding");
    }
  }, [isCompleted, router]);

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

        {/* Quick Action Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            data-testid="quick-actions"
          >
            {/* Log Headache */}
            <ActionCard
              icon={<Brain className="h-5 w-5" />}
              title="Log Headache"
              description="Record a headache episode"
              onClick={() => router.push("/log")}
              testId="log-headache-card"
              variant="primary"
            />

            {/* Learn */}
            <ActionCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Learn"
              description="Build body awareness"
              onClick={() => router.push("/learn")}
              testId="learn-card"
            />

            {/* Insights */}
            <ActionCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Insights"
              description="View your patterns"
              onClick={() => router.push("/insights")}
              testId="insights-card"
            />

            {/* Settings */}
            <ActionCard
              icon={<Settings className="h-5 w-5" />}
              title="Settings"
              description="Update preferences"
              onClick={() => router.push("/settings")}
              testId="settings-card"
            />
          </div>
        </div>

        {/* Empty State Message */}
        <div
          className="rounded-lg border bg-card p-6 text-center"
          data-testid="empty-state"
        >
          <p className="text-sm text-muted-foreground">
            No headaches logged yet. Start by logging your first episode or
            explore the learning section to build awareness.
          </p>
        </div>
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
