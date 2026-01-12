"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Settings,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettingsStore, AI_RATE_LIMITS } from "@/interface-adapters/store/settingsStore";
import type { ChatMessage } from "@/usecases/chat-insights/interfaces/chat-agent.interface";

interface InsightsChatCardProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: { code: string; message: string } | null;
  onSendMessage: (message: string) => void;
  className?: string;
}

/**
 * Insights Chat Card
 *
 * Single-question interface for asking natural language questions
 * about headache patterns and data. Each new question replaces the previous one.
 */
export function InsightsChatCard({
  messages,
  isLoading,
  error,
  onSendMessage,
  className,
}: InsightsChatCardProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = useSettingsStore((state) => state.hasApiKey)();
  const aiProvider = useSettingsStore((state) => state.aiProvider);
  const getRemainingInsights = useSettingsStore((state) => state.getRemainingInsights);
  const remainingInsights = getRemainingInsights();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasApiKey) return;

    onSendMessage(input.trim());
    setInput("");
  };

  // Suggested questions (natural language, including date-range queries)
  const suggestions = [
    "What happened last week?",
    "What's my most common trigger?",
    "How does sleep affect my headaches?",
    "Any patterns on weekends?",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (!hasApiKey || isLoading) return;
    onSendMessage(suggestion);
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl sm:text-2xl">Ask a Question</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          {hasApiKey && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{remainingInsights}/{AI_RATE_LIMITS.maxInsightsPerHour} left/hr</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Ask a single question about your headache data (e.g., &quot;What happened between Jan 1-7?&quot;)
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
                Add your {aiProvider === "openai" ? "OpenAI" : "OpenRouter"} API key in settings to chat.
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
              <p className="font-medium">Failed to get response</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto space-y-3 p-2 bg-muted/30 rounded-lg">
          {messages.length === 0 && hasApiKey && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about your headache data!</p>
              <p className="text-xs mt-1">Try one of the suggestions below</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 0 && hasApiKey && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasApiKey ? "Ask a question..." : "Add API key to chat"}
            disabled={!hasApiKey || isLoading}
            className="flex-1"
            data-testid="chat-input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || !hasApiKey || isLoading}
            data-testid="chat-send-button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
