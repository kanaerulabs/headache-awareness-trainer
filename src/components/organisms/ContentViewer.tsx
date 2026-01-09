"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContentType,
  useEducationStore,
} from "@/interface-adapters/store/educationStore";
import { educationalContent } from "@/data/educationalContent";

interface ContentViewerProps {
  contentId: ContentType;
}

export function ContentViewer({ contentId }: ContentViewerProps) {
  const router = useRouter();
  const {
    markContentViewed,
    markContentCompleted,
    updateProgress,
    isContentUnlocked,
  } = useEducationStore();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Get content and derived values
  const content = educationalContent[contentId];
  const totalSections = content?.sections.length ?? 0;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const currentSection = content?.sections[currentSectionIndex];
  const isLocked = content?.requiresUnlock && !isContentUnlocked(contentId);

  // Mark as viewed on mount (only if content exists and is unlocked)
  useEffect(() => {
    if (content && !isLocked) {
      markContentViewed(contentId);
    }
  }, [contentId, markContentViewed, content, isLocked]);

  // Update progress as user navigates sections
  useEffect(() => {
    if (content && !isLocked && totalSections > 0) {
      const newProgress = Math.round(
        ((currentSectionIndex + 1) / totalSections) * 100,
      );
      updateProgress(contentId, newProgress);
    }
  }, [
    currentSectionIndex,
    contentId,
    totalSections,
    updateProgress,
    content,
    isLocked,
  ]);

  const handleNext = useCallback(() => {
    if (isLastSection) {
      markContentCompleted(contentId);
      router.push("/learn");
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  }, [isLastSection, markContentCompleted, contentId, router]);

  const handlePrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  }, [currentSectionIndex]);

  const handleBack = useCallback(() => {
    router.push("/learn");
  }, [router]);

  // Handle inline formatting (bold, italic)
  const renderInlineFormatting = useCallback((text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  }, []);

  // Simple markdown-like rendering
  const renderContent = useCallback(
    (text: string) => {
      return text.split("\n\n").map((paragraph, pIndex) => {
        // Handle bullet points
        if (
          paragraph.startsWith("•") ||
          paragraph.startsWith("-") ||
          paragraph.startsWith("🔹") ||
          paragraph.startsWith("⚡")
        ) {
          const items = paragraph.split("\n").filter(Boolean);
          return (
            <ul key={pIndex} className="list-none space-y-2 my-3">
              {items.map((item, iIndex) => (
                <li key={iIndex} className="flex gap-2">
                  <span className="flex-shrink-0">{item.charAt(0)}</span>
                  <span>{renderInlineFormatting(item.slice(1).trim())}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Handle numbered lists
        if (/^\d+\./.test(paragraph)) {
          const items = paragraph.split("\n").filter(Boolean);
          return (
            <ol
              key={pIndex}
              className="list-decimal list-inside space-y-2 my-3"
            >
              {items.map((item, iIndex) => (
                <li key={iIndex}>
                  {renderInlineFormatting(item.replace(/^\d+\.\s*/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        return (
          <p key={pIndex} className="my-3 leading-relaxed">
            {renderInlineFormatting(paragraph)}
          </p>
        );
      });
    },
    [renderInlineFormatting],
  );

  // Early return for missing content - AFTER all hooks
  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Content not found</p>
        <Button variant="link" onClick={handleBack}>
          Back to Learn
        </Button>
      </div>
    );
  }

  // Early return for locked content - AFTER all hooks
  if (isLocked) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">Content Locked</h2>
        <p className="text-muted-foreground mb-4">
          {content.unlockRequirement}
        </p>
        <Button variant="outline" onClick={handleBack}>
          Back to Learn
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid={`content-viewer-${contentId}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline">
          {currentSectionIndex + 1} / {totalSections}
        </Badge>
      </div>

      {/* Content header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{content.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground">{content.subtitle}</p>
          </div>
        </div>
        <Progress
          value={((currentSectionIndex + 1) / totalSections) * 100}
          className="h-1.5"
        />
      </div>

      {/* Section content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentSection?.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          {currentSection && renderContent(currentSection.content)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastSection ? "Complete" : "Next"}
        </Button>
      </div>

      {/* Section dots */}
      <div className="flex justify-center gap-2" role="navigation" aria-label="Section navigation">
        {content.sections.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSectionIndex(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCurrentSectionIndex(index);
              }
            }}
            className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              index === currentSectionIndex
                ? "bg-primary"
                : index < currentSectionIndex
                  ? "bg-primary/50"
                  : "bg-muted"
            }`}
            aria-label={`Go to section ${index + 1}`}
            aria-current={index === currentSectionIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
