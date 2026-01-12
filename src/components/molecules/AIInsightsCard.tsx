"use client";

import Link from "next/link";
import { Sparkles, RefreshCw, AlertCircle, Lightbulb, Target, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIInsightsState } from "@/interface-adapters/store/insightsStore";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";

interface AIInsightsCardProps {
  aiInsights: AIInsightsState;
  onGenerate: () => void;
  className?: string;
}

/**
 * AI Insights Card
 *
 * Displays AI-powered pattern analysis and recommendations.
 * Shows loading state, error state, or insights data.
 */
export function AIInsightsCard({
  aiInsights,
  onGenerate,
  className,
}: AIInsightsCardProps) {
  const { data, isLoading, error, lastGenerated } = aiInsights;
  const hasApiKey = useSettingsStore((state) => state.hasOpenaiApiKey)();

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-xl sm:text-2xl">AI Insights</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isLoading || !hasApiKey}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? "Analyzing..." : data ? "Refresh" : "Generate"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered pattern analysis based on your headache data
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Missing API Key Warning */}
        {!hasApiKey && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                API key required
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Add your OpenAI API key in settings to enable AI-powered insights.
              </p>
              <Link
                href="/settings#ai-settings"
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mt-2 underline underline-offset-2"
              >
                Go to Settings
                <Settings className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to generate insights</p>
              <p className="text-sm opacity-80">{error.message}</p>
              {error.code === "INSUFFICIENT_DATA" && (
                <p className="text-sm mt-2">
                  Log more headaches and check-ins to enable AI analysis.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !data && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click &quot;Generate&quot; to get AI-powered insights about your headache
              patterns
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Works best with 7+ days of data
            </p>
          </div>
        )}

        {/* Insights Data */}
        {data && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{data.summary}</p>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.round(data.confidence * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(data.confidence * 100)}%
              </span>
            </div>

            {/* Patterns */}
            {data.patterns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">Patterns Detected</h4>
                </div>
                <ul className="space-y-2">
                  {data.patterns.map((pattern, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-purple-500 mt-1">•</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium">Recommendations</h4>
                </div>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-yellow-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Generated */}
            {lastGenerated && (
              <p className="text-xs text-muted-foreground text-right">
                Generated {lastGenerated.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
