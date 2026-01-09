/**
 * Educational Content Data
 *
 * Static educational content for the Headache Awareness Trainer.
 * Day 1 value - available immediately without any data logging required.
 */

import { ContentType } from "@/interface-adapters/store/educationStore";

export interface ContentSection {
  title: string;
  content: string;
  illustration?: string;
}

export interface EducationalContent {
  id: ContentType;
  title: string;
  subtitle: string;
  icon: string;
  estimatedMinutes: number;
  sections: ContentSection[];
  requiresUnlock: boolean;
  unlockRequirement?: string;
}

export const educationalContent: Record<ContentType, EducationalContent> = {
  "tension-headache": {
    id: "tension-headache",
    title: "What is a Tension Headache?",
    subtitle: "Understanding the most common type of headache",
    icon: "🧠",
    estimatedMinutes: 5,
    requiresUnlock: false,
    sections: [
      {
        title: "Overview",
        content: `Tension headaches are the most common type of headache, affecting up to 80% of adults at some point. Unlike migraines, they typically cause a dull, aching pain that feels like a tight band around your head.

**Key characteristics:**
- Mild to moderate pain on both sides of the head
- Pressure or tightness sensation
- No nausea or sensitivity to light (unlike migraines)
- Can last from 30 minutes to several days`,
      },
      {
        title: "What Causes Them?",
        content: `Tension headaches often result from muscle contractions in the head, neck, and shoulder regions. Common triggers include:

• **Stress** - Both physical and emotional stress
• **Poor posture** - Especially from prolonged computer use
• **Eye strain** - From screens or reading
• **Jaw clenching** - Often unconscious
• **Dehydration** - Not drinking enough water
• **Skipped meals** - Irregular eating patterns
• **Sleep issues** - Too little or too much sleep`,
      },
      {
        title: "Your Body's Early Signals",
        content: `Before a tension headache fully develops, your body often sends early warning signs:

🔹 Neck or shoulder stiffness
🔹 Jaw tightness
🔹 Feeling "wound up" or tense
🔹 Eye fatigue
🔹 Difficulty concentrating

**The key insight:** If you can catch these early signals, you may be able to prevent the headache from developing fully.`,
      },
      {
        title: "Self-Care Strategies",
        content: `When you notice early tension signals:

**Immediate actions:**
- Take a 5-minute break from screens
- Do gentle neck stretches
- Practice deep breathing
- Drink a glass of water
- Apply a warm compress to your neck

**Long-term prevention:**
- Regular sleep schedule
- Stress management techniques
- Ergonomic workspace setup
- Regular physical activity
- Staying hydrated throughout the day`,
      },
    ],
  },

  "body-scan": {
    id: "body-scan",
    title: "How to Do a Body Scan",
    subtitle: "A step-by-step guide to noticing body tension",
    icon: "🧘",
    estimatedMinutes: 8,
    requiresUnlock: false,
    sections: [
      {
        title: "What is a Body Scan?",
        content: `A body scan is a mindfulness technique where you systematically focus your attention on different parts of your body, noticing any sensations, tension, or discomfort.

**Why it helps with headaches:**
Body scans help you develop "interoception" - your ability to sense what's happening inside your body. Many people don't realize they're holding tension until it becomes a headache.

**Time needed:** 5-10 minutes
**Best done:** Morning, evening, or when you feel stressed`,
      },
      {
        title: "Step 1: Prepare",
        content: `Find a comfortable position - sitting or lying down works well.

**Setup:**
- Close your eyes or soften your gaze
- Take three deep breaths
- Let your body relax into the surface beneath you
- Set an intention to simply notice, without judgment

*There's no "right" or "wrong" way to feel. You're just observing.*`,
      },
      {
        title: "Step 2: Scan from Head Down",
        content: `Start at the top of your head and slowly move your attention downward:

**Head & Face (30 seconds each)**
🔹 Top of head - any pressure?
🔹 Forehead - holding any tension?
🔹 Eyes - strained or relaxed?
🔹 Jaw - clenched or loose?
🔹 Temples - any pulsing?

**Neck & Shoulders (30 seconds)**
🔹 Back of neck - stiff?
🔹 Shoulders - lifted or dropped?
🔹 Upper back - tight?`,
      },
      {
        title: "Step 3: Notice & Release",
        content: `As you scan each area, practice the "Notice & Release" technique:

1. **Notice** - What sensation do you feel? Tightness? Warmth? Numbness?
2. **Breathe** - Direct a slow breath toward that area
3. **Release** - On the exhale, imagine the tension dissolving

**Common findings for headache-prone people:**
- Jaw clenching (often unconscious)
- Shoulder tension ("carrying stress")
- Squinting or forehead furrowing
- Neck stiffness from posture`,
      },
      {
        title: "Making it a Habit",
        content: `The more you practice body scanning, the faster you'll notice tension building.

**Quick check-ins:**
Do a "mini scan" (30 seconds) whenever you:
- Stop at a red light
- Wait for something to load
- Transition between tasks
- Feel stressed

**Full scans:**
Try to do one 5-10 minute body scan daily, ideally at the same time to build the habit.

*Over time, you'll start noticing tension automatically - before it becomes a headache.*`,
      },
    ],
  },

  "body-signals": {
    id: "body-signals",
    title: "Signs Your Body Gives You",
    subtitle: "Learning to read your body's early warning system",
    icon: "📡",
    estimatedMinutes: 6,
    requiresUnlock: false,
    sections: [
      {
        title: "What is Interoception?",
        content: `Interoception is your body's "sixth sense" - the ability to feel internal signals like hunger, thirst, heart rate, and muscle tension.

**Why it matters for headaches:**
People who are more attuned to their body's signals can often catch headaches earlier, when they're easier to address.

The good news: Interoception is a skill you can improve with practice.`,
      },
      {
        title: "Common Pre-Headache Signals",
        content: `Your body often sends warning signals hours before a headache develops:

**Physical signals:**
⚡ Neck stiffness or aching
⚡ Shoulder tension
⚡ Eye fatigue or strain
⚡ Jaw tightness
⚡ Scalp tenderness

**Energy signals:**
⚡ Unusual fatigue
⚡ Difficulty concentrating
⚡ Irritability
⚡ Yawning frequently

**Sensory signals:**
⚡ Light seems brighter
⚡ Sounds seem louder
⚡ Food cravings (especially sugar)`,
      },
      {
        title: "Your Personal Pattern",
        content: `Everyone's warning signals are slightly different. The key is discovering YOUR pattern.

**Questions to explore:**
- Where do YOU typically hold tension?
- What does YOUR "pre-headache" feel like?
- What triggers tend to affect YOU most?

**Tracking tip:**
As you use this app, note not just when headaches happen, but what you felt in the hours before. Patterns will emerge.`,
      },
      {
        title: "Building Body Awareness",
        content: `Here are ways to strengthen your interoception:

**Daily practices:**
🔹 Regular body scans (see our tutorial)
🔹 Pause before eating: "Am I actually hungry?"
🔹 Notice your breathing throughout the day
🔹 Check in with your posture hourly

**During daily activities:**
🔹 Notice how your body feels after coffee
🔹 Pay attention during stressful moments
🔹 Feel your feet on the ground while walking

*The goal isn't constant monitoring - it's building a natural awareness that alerts you when something's off.*`,
      },
    ],
  },

  "vocabulary-builder": {
    id: "vocabulary-builder",
    title: "Headache Type Vocabulary",
    subtitle: "Words to describe what you're experiencing",
    icon: "📚",
    estimatedMinutes: 4,
    requiresUnlock: false,
    sections: [
      {
        title: "Why Words Matter",
        content: `Having the right vocabulary helps you:
- Track your experiences more accurately
- Communicate better with healthcare providers
- Notice subtle differences between headache types

This guide covers common terms used to describe headache characteristics.`,
      },
      {
        title: "Pain Quality",
        content: `**How does the pain feel?**

• **Throbbing/Pulsating** - Pain that beats like a drum
• **Pressing/Tightening** - Like a band around your head
• **Sharp/Stabbing** - Sudden, intense pain
• **Dull/Aching** - Constant, low-grade discomfort
• **Burning** - Hot, searing sensation

**Tension headaches** usually feel pressing or tightening.
**Migraines** often feel throbbing or pulsating.`,
      },
      {
        title: "Pain Location",
        content: `**Where is the pain?**

• **Bilateral** - Both sides of the head
• **Unilateral** - One side only
• **Frontal** - Forehead area
• **Temporal** - Temple area (sides)
• **Occipital** - Back of head
• **Behind the eyes** - Deep pressure sensation

**Tension headaches** are usually bilateral.
**Migraines** are often unilateral (but not always).`,
      },
      {
        title: "Intensity Scale",
        content: `When tracking headaches, using a consistent scale helps:

**1-3: Mild**
- Noticeable but doesn't stop activities
- Can work/function normally
- May forget about it at times

**4-6: Moderate**
- Definitely affects concentration
- May need to reduce activities
- Hard to ignore

**7-10: Severe**
- Significantly impacts activities
- May need to lie down
- Difficult to function normally

*Your "5" might be different from someone else's "5" - that's okay. Consistency in YOUR scale is what matters.*`,
      },
      {
        title: "Associated Symptoms",
        content: `Headaches can come with other symptoms:

**Migraine-associated:**
• Nausea or vomiting
• Light sensitivity (photophobia)
• Sound sensitivity (phonophobia)
• Aura (visual disturbances)

**Tension-associated:**
• Neck/shoulder stiffness
• Scalp tenderness
• Fatigue

**Track these too!** They help distinguish headache types and identify triggers.`,
      },
    ],
  },

  "general-patterns": {
    id: "general-patterns",
    title: "Research-Backed Patterns",
    subtitle: "What science tells us about headache triggers",
    icon: "🔬",
    estimatedMinutes: 7,
    requiresUnlock: false,
    sections: [
      {
        title: "Common Triggers",
        content: `Research has identified triggers that affect many people:

**Lifestyle factors:**
• Irregular sleep (too much or too little)
• Skipping meals or dehydration
• Excessive caffeine or caffeine withdrawal
• Alcohol (especially red wine)
• Intense physical exertion

**Environmental factors:**
• Weather changes (especially barometric pressure)
• Strong smells (perfume, smoke)
• Bright or flickering lights
• Loud noises

*Important: Triggers are personal. What affects one person may not affect you.*`,
      },
      {
        title: "The Stress Connection",
        content: `Stress is the #1 reported trigger for both tension headaches and migraines.

**How stress causes headaches:**
1. Muscle tension builds in neck, shoulders, jaw
2. Blood vessels constrict then dilate
3. Pain threshold lowers (less tolerance)
4. Sleep and eating patterns disrupt

**The paradox:**
Many people get "let-down headaches" - headaches that hit AFTER a stressful period ends (like weekends after a busy week).`,
      },
      {
        title: "Hormonal Patterns",
        content: `For many people (especially women), hormones play a significant role:

**Menstrual migraines:**
- Often occur 2 days before to 3 days after period starts
- Related to estrogen level drops
- May be more severe than other migraines

**Other hormonal triggers:**
• Birth control (starting or stopping)
• Pregnancy (can improve OR worsen)
• Menopause
• Hormone replacement therapy

*Tracking headaches alongside your cycle can reveal patterns.*`,
      },
      {
        title: "Sleep's Role",
        content: `Sleep and headaches have a complex relationship:

**Too little sleep:**
- Increases pain sensitivity
- Raises stress hormones
- Disrupts brain chemistry

**Too much sleep:**
- Can trigger headaches (weekend headaches)
- May indicate underlying issues

**Sleep quality matters too:**
- Sleep apnea links to morning headaches
- Interrupted sleep can trigger migraines

**The sweet spot:**
Most adults do best with 7-8 hours of consistent sleep, going to bed and waking at similar times daily.`,
      },
      {
        title: "The Threshold Theory",
        content: `Modern headache science uses the "threshold" concept:

**Think of it like a cup:**
- Your cup has a capacity (your threshold)
- Triggers add "water" to the cup
- When it overflows = headache

**Why this matters:**
A single trigger might not cause a headache, but multiple small triggers can combine:

*Skipped breakfast + poor sleep + stressful meeting = headache*

**Building resilience:**
- Regular sleep, meals, and hydration raise your threshold
- Stress management techniques help
- Body awareness lets you notice when your cup is filling up`,
      },
    ],
  },

  "advanced-patterns": {
    id: "advanced-patterns",
    title: "Your Personal Insights",
    subtitle: "Advanced pattern analysis based on your data",
    icon: "✨",
    estimatedMinutes: 5,
    requiresUnlock: true,
    unlockRequirement: "Log 7 days of data to unlock personalized insights",
    sections: [
      {
        title: "Coming Soon",
        content: `This content will unlock once you've logged enough data for meaningful pattern analysis.

**What you'll see:**
- Your personal trigger correlations
- Time-of-day patterns
- Weekly trends
- Weather correlations (if enabled)
- Sleep-headache connections

Keep tracking, and your personal insights will appear here!`,
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
