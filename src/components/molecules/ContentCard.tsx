"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ContentType } from "@/interface-adapters/store/educationStore";
import { useTranslations } from "next-intl";

interface ContentCardProps {
  id: ContentType;
  title: string;
  subtitle: string;
  icon: string;
  estimatedMinutes: number;
  isLocked: boolean;
  unlockRequirement?: string;
  progress: number;
  isCompleted: boolean;
  className?: string;
}

export function ContentCard({
  id,
  title,
  subtitle,
  icon,
  estimatedMinutes,
  isLocked,
  unlockRequirement,
  progress,
  isCompleted,
  className,
}: ContentCardProps) {
  const t = useTranslations("learn");
  const cardContent = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/50 cursor-pointer",
        isCompleted && "border-green-500/50 bg-green-50/50",
        className,
      )}
      data-testid={`content-card-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={title}>
              {icon}
            </span>
            <div>
              <CardTitle className="text-lg leading-tight">{title}</CardTitle>
              <CardDescription className="mt-1">{subtitle}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isCompleted ? (
              <Badge variant="default" className="bg-green-600">
                {t("completedBadge")}
              </Badge>
            ) : isLocked ? (
              <Badge variant="secondary">{t("lockedBadge")}</Badge>
            ) : progress > 0 ? (
              <Badge variant="outline">{progress}%</Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLocked ? (
          <p className="text-sm text-muted-foreground">{unlockRequirement}</p>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{t("minRead", { minutes: estimatedMinutes })}</span>
              {!isCompleted && progress > 0 && (
                <span>{t("percentComplete", { percent: progress })}</span>
              )}
            </div>
            {!isCompleted && progress > 0 && (
              <Progress value={progress} className="h-1.5" />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={`/learn/${id}`} className="block">
      {cardContent}
    </Link>
  );
}
