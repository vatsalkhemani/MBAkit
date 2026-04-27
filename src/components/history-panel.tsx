"use client";

import { useState } from "react";
import { History, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownOutput } from "@/components/markdown-output";
import type { HistoryEntry } from "@/lib/use-history";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  getEntries: () => HistoryEntry[];
  removeEntry: (id: string) => void;
  clearAll: () => void;
  onRestore: (output: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryPanel({
  getEntries,
  removeEntry,
  clearAll,
  onRestore,
}: HistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  function handleToggle() {
    if (!open) {
      setEntries(getEntries());
    }
    setOpen(!open);
    setExpandedId(null);
  }

  function handleRemove(id: string) {
    removeEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function handleClear() {
    clearAll();
    setEntries([]);
    setExpandedId(null);
  }

  function handleRestore(output: string) {
    onRestore(output);
    setOpen(false);
  }

  return (
    <div className="mt-8 border-t border-border/50 pt-4">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <History className="h-3.5 w-3.5" />
        <span>Recent generations</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No history yet. Your recent generations will appear here.
            </p>
          ) : (
            <>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border/60 bg-card text-sm"
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === entry.id ? null : entry.id)
                      }
                      aria-expanded={expandedId === entry.id}
                      className="flex-1 text-left truncate text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="text-xs text-muted-foreground/70 mr-2">
                        {timeAgo(entry.timestamp)}
                      </span>
                      {entry.preview}
                    </button>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {expandedId === entry.id && (
                    <div className="border-t border-border/40 px-3 py-3">
                      <div
                        className={cn(
                          "max-h-[300px] overflow-y-auto rounded bg-muted/30 p-3"
                        )}
                      >
                        <MarkdownOutput content={entry.output} />
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(entry.output)}
                        >
                          Load this output
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear history
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
