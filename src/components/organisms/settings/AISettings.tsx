"use client";

import { useState } from "react";
import { Sparkles, Eye, EyeOff, ExternalLink, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/interface-adapters/store/settingsStore";

/**
 * AI Settings Component
 *
 * Allows users to configure their OpenAI API key for AI-powered insights.
 */
export function AISettings() {
  const { openaiApiKey, setOpenaiApiKey, hasOpenaiApiKey } = useSettingsStore();
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(openaiApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setOpenaiApiKey(inputValue);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputValue("");
    setOpenaiApiKey("");
  };

  const isValidKeyFormat = (key: string) => {
    return key.startsWith("sk-") && key.length > 20;
  };

  return (
    <Card data-testid="ai-settings" id="ai-settings">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <CardTitle>AI Insights</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Enable AI-powered pattern analysis by adding your OpenAI API key
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              hasOpenaiApiKey() ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {hasOpenaiApiKey() ? "API key configured" : "No API key set"}
          </span>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label htmlFor="openai-api-key" className="text-sm font-medium">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="openai-api-key"
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-..."
                className="pr-10 font-mono text-sm"
                data-testid="openai-api-key-input"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              onClick={handleSave}
              disabled={!inputValue || inputValue === openaiApiKey}
              className="gap-2"
              data-testid="save-api-key-button"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
          {inputValue && !isValidKeyFormat(inputValue) && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              API keys typically start with &quot;sk-&quot;
            </p>
          )}
        </div>

        {/* Clear Button */}
        {hasOpenaiApiKey() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            Clear API Key
          </Button>
        )}

        {/* Help Link */}
        <div className="pt-2 border-t">
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Get an API key from OpenAI
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-xs text-muted-foreground mt-1">
            Your key is stored locally and never sent to our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
