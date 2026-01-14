"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: "pattern" | "trigger" | "tip" | "achievement";
  isPersonal: boolean;
  isUnlocked: boolean;
  unlockCondition?: string;
}

export interface InsightCardProps {
  /**
   * The insight to display
   */
  insight: Insight;
  /**
   * Optional callback when card is tapped
   */
  onTap?: (id: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Icon mapping for categories
const CATEGORY_ICONS = {
  pattern: TrendingUp,
  trigger: AlertTriangle,
  tip: Lightbulb,
  achievement: Trophy,
} as const;

// Color/gradient mapping for categories
const CATEGORY_STYLES = {
  pattern: {
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
  trigger: {
    gradient: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950",
    border: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    titleColor: "text-orange-900 dark:text-orange-100",
  },
  tip: {
    gradient:
      "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-900 dark:text-emerald-100",
  },
  achievement: {
    gradient: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-900 dark:text-purple-100",
  },
} as const;

/**
 * InsightCard - Displays personalized insights with unlock states
 *
 * A card component that shows insights about patterns, triggers, tips, or achievements.
 * Features category-specific gradients, icons, and locked/unlocked states with animations.
 * Personal insights are blurred until unlocked by meeting specific conditions.
 *
 * @example
 * ```tsx
 * const insight = {
 *   id: '1',
 *   title: 'Afternoon Pattern Detected',
 *   description: 'You tend to get headaches between 2-4 PM',
 *   category: 'pattern',
 *   isPersonal: true,
 *   isUnlocked: true
 * };
 * <InsightCard insight={insight} onTap={(id) => console.log(id)} />
 * ```
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onTap,
  className,
}) => {
  const t = useTranslations("insights");
  const ti = useTranslations();
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [wasLocked, setWasLocked] = React.useState(
    insight.isPersonal && !insight.isUnlocked,
  );

  // Get translated category label
  const getCategoryLabel = (category: Insight["category"]) => {
    return t(`category${category.charAt(0).toUpperCase() + category.slice(1)}`);
  };

  // Translate insight data keys
  const insightTitle = insight.title.startsWith("insightData.")
    ? ti(insight.title)
    : insight.title;
  const insightDescription = insight.description.startsWith("insightData.")
    ? ti(insight.description)
    : insight.description;
  const insightUnlockCondition = insight.unlockCondition?.startsWith(
    "insightData.",
  )
    ? ti(insight.unlockCondition)
    : insight.unlockCondition;

  // Detect unlock transition
  React.useEffect(() => {
    if (wasLocked && insight.isUnlocked) {
      setIsUnlocking(true);
      const timer = setTimeout(() => {
        setIsUnlocking(false);
        setWasLocked(false);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [insight.isUnlocked, wasLocked]);

  const isLocked = insight.isPersonal && !insight.isUnlocked;
  const Icon = CATEGORY_ICONS[insight.category];
  const styles = CATEGORY_STYLES[insight.category];

  const handleClick = () => {
    if (!isLocked && onTap) {
      onTap(insight.id);
    }
  };

  return (
    <Card
      className={cn(
        "w-full bg-gradient-to-br border transition-all duration-300",
        styles.gradient,
        styles.border,
        !isLocked &&
          onTap &&
          "cursor-pointer hover:shadow-md active:scale-[0.98]",
        isLocked && "relative overflow-hidden",
        isUnlocking && "animate-pulse",
        className,
      )}
      onClick={handleClick}
      role={!isLocked && onTap ? "button" : undefined}
      aria-disabled={isLocked}
      aria-label={
        isLocked
          ? `${t("lockedInsight")}: ${insightUnlockCondition || t("completeRequirements")}`
          : insightTitle
      }
      data-testid={`insight-card-${insight.id}`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-full p-2.5 transition-transform",
              styles.iconBg,
              isUnlocking && "scale-110",
            )}
            aria-hidden="true"
          >
            {isLocked ? (
              <Lock
                className={cn("h-5 w-5", "text-gray-400 dark:text-gray-500")}
              />
            ) : (
              <Icon className={cn("h-5 w-5", styles.iconColor)} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-sm sm:text-base font-semibold mb-1",
                isLocked
                  ? "text-gray-400 dark:text-gray-500"
                  : styles.titleColor,
              )}
            >
              {isLocked ? t("personalInsightLocked") : insightTitle}
            </h3>
            <p
              className={cn(
                "text-sm text-gray-700 dark:text-gray-300 leading-relaxed",
                isLocked && "blur-sm select-none",
              )}
              data-testid="insight-description"
            >
              {isLocked ? t("lockedInsightDesc") : insightDescription}
            </p>

            {/* Unlock condition badge */}
            {isLocked && insightUnlockCondition && (
              <div className="mt-3 flex items-center gap-2">
                <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {insightUnlockCondition}
                </p>
              </div>
            )}

            {/* Category badge (for unlocked insights) */}
            {!isLocked && (
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    styles.iconBg,
                    styles.iconColor,
                  )}
                >
                  {getCategoryLabel(insight.category)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Glassmorphism overlay for locked state */}
        {isLocked && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/40 to-gray-100/40 dark:from-gray-900/40 dark:to-gray-800/40 backdrop-blur-[2px] pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Unlock animation sparkles */}
        {isUnlocking && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-[shimmer_1s_ease-in-out]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

InsightCard.displayName = "InsightCard";
