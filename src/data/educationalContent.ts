/**
 * Educational Content Data
 *
 * Static educational content for the Headache Awareness Trainer.
 * Day 1 value - available immediately without any data logging required.
 *
 * NOTE: title, subtitle, and section content use translation keys.
 * The actual translations are in messages/en.json and messages/ja.json
 * under the "content" namespace.
 */

import { ContentType } from "@/interface-adapters/store/educationStore";

export interface ContentSection {
  titleKey: string;
  contentKey: string;
  illustration?: string;
}

export interface EducationalContent {
  id: ContentType;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  estimatedMinutes: number;
  sections: ContentSection[];
  requiresUnlock: boolean;
  unlockRequirementKey?: string;
}

export const educationalContent: Record<ContentType, EducationalContent> = {
  "tension-headache": {
    id: "tension-headache",
    titleKey: "tensionHeadache.title",
    subtitleKey: "tensionHeadache.subtitle",
    icon: "🧠",
    estimatedMinutes: 5,
    requiresUnlock: false,
    sections: [
      {
        titleKey: "tensionHeadache.overview.title",
        contentKey: "tensionHeadache.overview.content",
      },
      {
        titleKey: "tensionHeadache.causes.title",
        contentKey: "tensionHeadache.causes.content",
      },
      {
        titleKey: "tensionHeadache.signals.title",
        contentKey: "tensionHeadache.signals.content",
      },
      {
        titleKey: "tensionHeadache.selfCare.title",
        contentKey: "tensionHeadache.selfCare.content",
      },
    ],
  },

  "body-scan": {
    id: "body-scan",
    titleKey: "bodyScan.title",
    subtitleKey: "bodyScan.subtitle",
    icon: "🧘",
    estimatedMinutes: 8,
    requiresUnlock: false,
    sections: [
      {
        titleKey: "bodyScan.what.title",
        contentKey: "bodyScan.what.content",
      },
      {
        titleKey: "bodyScan.step1.title",
        contentKey: "bodyScan.step1.content",
      },
      {
        titleKey: "bodyScan.step2.title",
        contentKey: "bodyScan.step2.content",
      },
      {
        titleKey: "bodyScan.step3.title",
        contentKey: "bodyScan.step3.content",
      },
      {
        titleKey: "bodyScan.habit.title",
        contentKey: "bodyScan.habit.content",
      },
    ],
  },

  "body-signals": {
    id: "body-signals",
    titleKey: "bodySignals.title",
    subtitleKey: "bodySignals.subtitle",
    icon: "📡",
    estimatedMinutes: 6,
    requiresUnlock: false,
    sections: [
      {
        titleKey: "bodySignals.interoception.title",
        contentKey: "bodySignals.interoception.content",
      },
      {
        titleKey: "bodySignals.preHeadache.title",
        contentKey: "bodySignals.preHeadache.content",
      },
      {
        titleKey: "bodySignals.personal.title",
        contentKey: "bodySignals.personal.content",
      },
      {
        titleKey: "bodySignals.building.title",
        contentKey: "bodySignals.building.content",
      },
    ],
  },

  "vocabulary-builder": {
    id: "vocabulary-builder",
    titleKey: "vocabulary.title",
    subtitleKey: "vocabulary.subtitle",
    icon: "📚",
    estimatedMinutes: 4,
    requiresUnlock: false,
    sections: [
      {
        titleKey: "vocabulary.why.title",
        contentKey: "vocabulary.why.content",
      },
      {
        titleKey: "vocabulary.quality.title",
        contentKey: "vocabulary.quality.content",
      },
      {
        titleKey: "vocabulary.location.title",
        contentKey: "vocabulary.location.content",
      },
      {
        titleKey: "vocabulary.intensity.title",
        contentKey: "vocabulary.intensity.content",
      },
      {
        titleKey: "vocabulary.symptoms.title",
        contentKey: "vocabulary.symptoms.content",
      },
    ],
  },

  "general-patterns": {
    id: "general-patterns",
    titleKey: "generalPatterns.title",
    subtitleKey: "generalPatterns.subtitle",
    icon: "🔬",
    estimatedMinutes: 7,
    requiresUnlock: false,
    sections: [
      {
        titleKey: "generalPatterns.triggers.title",
        contentKey: "generalPatterns.triggers.content",
      },
      {
        titleKey: "generalPatterns.stress.title",
        contentKey: "generalPatterns.stress.content",
      },
      {
        titleKey: "generalPatterns.hormonal.title",
        contentKey: "generalPatterns.hormonal.content",
      },
      {
        titleKey: "generalPatterns.sleep.title",
        contentKey: "generalPatterns.sleep.content",
      },
      {
        titleKey: "generalPatterns.threshold.title",
        contentKey: "generalPatterns.threshold.content",
      },
    ],
  },

  "advanced-patterns": {
    id: "advanced-patterns",
    titleKey: "advancedPatterns.title",
    subtitleKey: "advancedPatterns.subtitle",
    icon: "✨",
    estimatedMinutes: 5,
    requiresUnlock: true,
    unlockRequirementKey: "advancedPatterns.unlockRequirement",
    sections: [
      {
        titleKey: "advancedPatterns.comingSoon.title",
        contentKey: "advancedPatterns.comingSoon.content",
      },
    ],
  },
};

/**
 * Get content that's available from Day 1 (no unlock required)
 */
export function getAvailableContent(): EducationalContent[] {
  return Object.values(educationalContent).filter((c) => !c.requiresUnlock);
}

/**
 * Get all content IDs that require unlock
 */
export function getLockedContentIds(): ContentType[] {
  return Object.values(educationalContent)
    .filter((c) => c.requiresUnlock)
    .map((c) => c.id);
}
