"use client";

import { useState, useEffect } from "react";
import { Sparkles, Eye, EyeOff, ExternalLink, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSettingsStore,
  AI_MODELS,
  type AIProvider,
} from "@/interface-adapters/store/settingsStore";

/**
 * AI Settings Component
 *
 * Allows users to configure their AI provider, API key, and model selection.
 * Supports both OpenAI and OpenRouter providers.
 */
export function AISettings() {
  const {
    aiProvider,
    openaiApiKey,
    openrouterApiKey,
    selectedModel,
    setAiProvider,
    setOpenaiApiKey,
    setOpenrouterApiKey,
    setSelectedModel,
    hasApiKey,
  } = useSettingsStore();

  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(false);

  // Update input value when provider changes
  useEffect(() => {
    setInputValue(aiProvider === "openai" ? openaiApiKey : openrouterApiKey);
  }, [aiProvider, openaiApiKey, openrouterApiKey]);

  const handleSave = () => {
    if (aiProvider === "openai") {
      setOpenaiApiKey(inputValue);
    } else {
      setOpenrouterApiKey(inputValue);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputValue("");
    if (aiProvider === "openai") {
      setOpenaiApiKey("");
    } else {
      setOpenrouterApiKey("");
    }
  };

  const currentApiKey =
    aiProvider === "openai" ? openaiApiKey : openrouterApiKey;
  const models = AI_MODELS[aiProvider];

  const isValidKeyFormat = (key: string) => {
    if (aiProvider === "openai") {
      return key.startsWith("sk-") && key.length > 20;
    }
    // OpenRouter keys also start with sk-
    return key.startsWith("sk-") && key.length > 20;
  };

  const getKeyHelpUrl = () => {
    if (aiProvider === "openai") {
      return "https://platform.openai.com/api-keys";
    }
    return "https://openrouter.ai/keys";
  };

  const getProviderName = () => {
    return aiProvider === "openai" ? "OpenAI" : "OpenRouter";
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
          Enable AI-powered pattern analysis with your preferred provider
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Provider</label>
          <Select
            value={aiProvider}
            onValueChange={(value: AIProvider) => setAiProvider(value)}
          >
            <SelectTrigger data-testid="ai-provider-select">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openrouter">
                <div className="flex flex-col">
                  <span>OpenRouter</span>
                  <span className="text-xs text-muted-foreground">
                    Multiple models, hard spending limits
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="openai">
                <div className="flex flex-col">
                  <span>OpenAI</span>
                  <span className="text-xs text-muted-foreground">
                    Direct API access
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {aiProvider === "openrouter" && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Recommended: Set hard spending limits in your OpenRouter dashboard
            </p>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger data-testid="ai-model-select">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(models).map(([id, info]) => (
                <SelectItem key={id} value={id}>
                  <div className="flex flex-col">
                    <span>{info.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {info.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              hasApiKey() ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {hasApiKey()
              ? `${getProviderName()} API key configured`
              : `No ${getProviderName()} API key set`}
          </span>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label htmlFor="api-key" className="text-sm font-medium">
            {getProviderName()} API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-..."
                className="pr-10 font-mono text-sm"
                data-testid="api-key-input"
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
              disabled={!inputValue || inputValue === currentApiKey}
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
        {hasApiKey() && (
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
            href={getKeyHelpUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Get an API key from {getProviderName()}
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
