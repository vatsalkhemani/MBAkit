"use client";

import { useCallback } from "react";
import { safeGetJSON, safeSetJSON } from "./storage";

const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  /** Short label for display — first ~80 chars of output */
  preview: string;
  output: string;
}

function storageKey(tool: string): string {
  return `mbakit_history_${tool}`;
}

export function useHistory(tool: string) {
  const getEntries = useCallback((): HistoryEntry[] => {
    return safeGetJSON<HistoryEntry[]>(storageKey(tool)) ?? [];
  }, [tool]);

  const addEntry = useCallback(
    (output: string) => {
      const entries = safeGetJSON<HistoryEntry[]>(storageKey(tool)) ?? [];
      const preview = output
        .split("---")[0]
        .replace(/[#*_\n]/g, " ")
        .trim()
        .slice(0, 80);

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        preview: preview || "Generated output",
        output,
      };

      const updated = [entry, ...entries].slice(0, MAX_ENTRIES);
      safeSetJSON(storageKey(tool), updated);
    },
    [tool]
  );

  const removeEntry = useCallback(
    (id: string) => {
      const entries = safeGetJSON<HistoryEntry[]>(storageKey(tool)) ?? [];
      safeSetJSON(
        storageKey(tool),
        entries.filter((e) => e !== null && e.id !== id)
      );
    },
    [tool]
  );

  const clearAll = useCallback(() => {
    safeSetJSON(storageKey(tool), []);
  }, [tool]);

  return { getEntries, addEntry, removeEntry, clearAll };
}
