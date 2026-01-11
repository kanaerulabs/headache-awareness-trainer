"use client";

import { useEducationStore } from "@/interface-adapters/store/educationStore";
import { ContentCard } from "@/components/molecules/ContentCard";
import { Progress } from "@/components/ui/progress";
import {
  educationalContent,
  getAvailableContent,
} from "@/data/educationalContent";
import { useTranslations } from "next-intl";

export function EducationHub() {
  const t = useTranslations("learn");
  const tc = useTranslations("content");
  const { contentProgress, isContentUnlocked, getTotalProgress } =
    useEducationStore();

  const totalProgress = getTotalProgress();
  const availableContent = getAvailableContent();
  const lockedContent = Object.values(educationalContent).filter(
    (c) => c.requiresUnlock,
  );

  return (
    <div className="space-y-8" data-testid="education-hub">
      {/* Header with overall progress */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm md:text-base">
            <span className="text-muted-foreground">{t("progress")}</span>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          <Progress
            value={totalProgress}
            className="h-2"
            aria-label={`${t("progress")}: ${totalProgress}%`}
          />
        </div>
      </div>

      {/* Available content */}
      <section aria-labelledby="available-content-heading">
        <h2
          id="available-content-heading"
          className="text-lg md:text-xl lg:text-2xl font-semibold mb-4"
        >
          {t("startLearning")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {availableContent.map((content) => {
            const progress = contentProgress[content.id];
            return (
              <ContentCard
                key={content.id}
                id={content.id}
                title={tc(content.titleKey)}
                subtitle={tc(content.subtitleKey)}
                icon={content.icon}
                estimatedMinutes={content.estimatedMinutes}
                isLocked={false}
                progress={progress?.progressPercent ?? 0}
                isCompleted={progress?.completed ?? false}
              />
            );
          })}
        </div>
      </section>

      {/* Locked content */}
      {lockedContent.length > 0 && (
        <section aria-labelledby="locked-content-heading">
          <h2
            id="locked-content-heading"
            className="text-lg md:text-xl lg:text-2xl font-semibold mb-4"
          >
            {t("comingSoon")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {lockedContent.map((content) => {
              const unlocked = isContentUnlocked(content.id);
              const progress = contentProgress[content.id];
              return (
                <ContentCard
                  key={content.id}
                  id={content.id}
                  title={tc(content.titleKey)}
                  subtitle={tc(content.subtitleKey)}
                  icon={content.icon}
                  estimatedMinutes={content.estimatedMinutes}
                  isLocked={!unlocked}
                  unlockRequirement={content.unlockRequirementKey ? tc(content.unlockRequirementKey) : undefined}
                  progress={progress?.progressPercent ?? 0}
                  isCompleted={progress?.completed ?? false}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
