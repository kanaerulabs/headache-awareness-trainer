"use client";

import * as React from "react";
import { Brain, ClipboardCheck, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type EntryType = "headache" | "checkin";

export interface RecentEntry {
  /**
   * Unique entry ID
   */
  id: string;
  /**
   * Entry type (headache or check-in)
   */
  type: EntryType;
  /**
   * Entry timestamp
   */
  timestamp: Date;
  /**
   * Brief summary text (e.g., "Mild headache" or "Feeling calm")
   */
  summary: string;
}

export interface RecentEntriesListProps {
  /**
   * List of recent entries (max 5 displayed)
   */
  entries: RecentEntry[];
  /**
   * Callback when an entry is clicked
   */
  onEntryClick?: (id: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const entryTypeConfig = {
  headache: {
    icon: Brain,
    color: "text-red-600 dark:text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    label: "Headache",
  },
  checkin: {
    icon: ClipboardCheck,
    color: "text-blue-600 dark:text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "Check-in",
  },
} as const;

/**
 * RecentEntriesList - Display recent headaches and check-ins
 *
 * Shows the last 3-5 combined entries with:
 * - Icon to distinguish headache vs check-in
 * - Relative timestamp ("2h ago", "Yesterday")
 * - Brief summary text
 * - Optional tap to view details
 *
 * Scrollable list with empty state when no entries exist.
 * Mobile-optimized with touch-friendly tap targets.
 *
 * @example
 * ```tsx
 * const entries: RecentEntry[] = [
 *   { id: '1', type: 'headache', timestamp: new Date(), summary: 'Mild headache' },
 *   { id: '2', type: 'checkin', timestamp: subHours(new Date(), 3), summary: 'Feeling calm' },
 * ];
 *
 * <RecentEntriesList
 *   entries={entries}
 *   onEntryClick={(id) => router.push(`/entry/${id}`)}
 * />
 * ```
 */
export const RecentEntriesList: React.FC<RecentEntriesListProps> = ({
  entries,
  onEntryClick,
  className,
}) => {
  // Limit to 5 most recent entries
  const displayEntries = entries.slice(0, 5);

  // Empty state
  if (entries.length === 0) {
    return (
      <Card
        className={cn("w-full", className)}
        data-testid="recent-entries-list"
      >
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center py-8 text-center"
            role="status"
          >
            <ClipboardCheck
              className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent entries
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Log your first headache or check-in to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} data-testid="recent-entries-list">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul
          className="divide-y divide-gray-200 dark:divide-gray-800"
          role="list"
          aria-label="Recent activity entries"
        >
          {displayEntries.map((entry) => {
            const config = entryTypeConfig[entry.type];
            const Icon = config.icon;
            const relativeTime = formatDistanceToNow(entry.timestamp, {
              addSuffix: true,
            });

            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onEntryClick?.(entry.id)}
                  disabled={!onEntryClick}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-4",
                    "transition-colors duration-150",
                    onEntryClick &&
                      "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                    onEntryClick &&
                      "active:bg-gray-100 dark:active:bg-gray-900",
                    onEntryClick && "cursor-pointer",
                    !onEntryClick && "cursor-default",
                  )}
                  aria-label={`${config.label} entry from ${relativeTime}: ${entry.summary}`}
                  data-testid={`entry-${entry.id}`}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 rounded-full p-2",
                      config.bgColor,
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", config.color)}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {entry.summary}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {relativeTime}
                    </p>
                  </div>

                  {/* Chevron (only if clickable) */}
                  {onEntryClick && (
                    <ChevronRight
                      className="h-5 w-5 text-gray-400 dark:text-gray-600 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

RecentEntriesList.displayName = "RecentEntriesList";
