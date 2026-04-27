"use client";

import { useState, useCallback } from "react";
import { generateWithAI } from "./ai";
import { checkRateLimit, incrementUsage } from "./rate-limit";
import { copyToClipboard } from "./storage";
import { useHistory } from "./use-history";

interface UseGenerationOptions {
  toolName: string;
  /** Extract the copyable portion from full output. Defaults to identity. */
  extractForCopy?: (output: string) => string;
}

interface UseGenerationReturn {
  output: string;
  loading: boolean;
  error: string;
  copied: boolean;
  generate: (toolId: string, userMessage: string) => Promise<void>;
  handleCopy: () => void;
  handleDownload: () => void;
  setOutput: (output: string) => void;
  reset: () => void;
  setError: (error: string) => void;
  history: ReturnType<typeof useHistory>;
}

export function useGeneration({
  toolName,
  extractForCopy = (o) => o,
}: UseGenerationOptions): UseGenerationReturn {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const history = useHistory(toolName);

  const generate = useCallback(
    async (toolId: string, userMessage: string) => {
      const { allowed } = checkRateLimit(toolName);
      if (!allowed) {
        setError("You've hit your daily limit for this tool. Come back tomorrow, or try a different tool!");
        return;
      }

      setLoading(true);
      setError("");
      setOutput("");

      try {
        const result = await generateWithAI(toolId, userMessage, setOutput);
        setOutput(result);
        incrementUsage(toolName);
        history.addEntry(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something unexpected happened. Please try again!");
      } finally {
        setLoading(false);
      }
    },
    [toolName, history]
  );

  const handleCopy = useCallback(() => {
    const text = extractForCopy(output);
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output, extractForCopy]);

  const handleDownload = useCallback(() => {
    const text = extractForCopy(output);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mbakit-${toolName}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, extractForCopy, toolName]);

  const reset = useCallback(() => {
    setOutput("");
    setError("");
    setCopied(false);
  }, []);

  return {
    output,
    loading,
    error,
    copied,
    generate,
    handleCopy,
    handleDownload,
    setOutput,
    reset,
    setError,
    history,
  };
}
