"use client";

import { useEducationStore } from "@/interface-adapters/store/educationStore";
import { ContentCard } from "@/components/molecules/ContentCard";
import { Progress } from "@/components/ui/progress";
import {
  educationalContent,
  getAvailableContent,
} from "@/data/educationalContent";

export function EducationHub() {
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
            Learn
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Build awareness before the headache speaks
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm md:text-base">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          <Progress
            value={totalProgress}
            className="h-2"
            aria-label={`Overall learning progress: ${totalProgress}%`}
          />
        </div>
      </div>

      {/* Available content */}
      <section aria-labelledby="available-content-heading">
        <h2
          id="available-content-heading"
          className="text-lg md:text-xl lg:text-2xl font-semibold mb-4"
        >
          Start Learning
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {availableContent.map((content) => {
            const progress = contentProgress[content.id];
            return (
              <ContentCard
                key={content.id}
                id={content.id}
                title={content.title}
                subtitle={content.subtitle}
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
            Coming Soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {lockedContent.map((content) => {
              const unlocked = isContentUnlocked(content.id);
              const progress = contentProgress[content.id];
              return (
                <ContentCard
                  key={content.id}
                  id={content.id}
                  title={content.title}
                  subtitle={content.subtitle}
                  icon={content.icon}
                  estimatedMinutes={content.estimatedMinutes}
                  isLocked={!unlocked}
                  unlockRequirement={content.unlockRequirement}
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
