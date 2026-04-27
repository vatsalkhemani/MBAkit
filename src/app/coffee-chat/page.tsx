"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Copy, RefreshCw, Loader2, Lightbulb, Download } from "lucide-react";
import { MarkdownOutput } from "@/components/markdown-output";
import { HistoryPanel } from "@/components/history-panel";
import { useGeneration } from "@/lib/use-generation";
import { buildCoffeeChatPrompt } from "@/prompts/coffee-chat";

const TOOL_ID = "coffee-chat";

const contextOptions = [
  { label: "Alumni", value: "alumni from my school" },
  { label: "LinkedIn", value: "found on LinkedIn" },
  { label: "Referral", value: "referred by someone" },
  { label: "Met at event", value: "met at an event" },
  { label: "Recruiter", value: "recruiter or HR" },
  { label: "Other", value: "other" },
];

export default function CoffeeChatPage() {
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personCompany, setPersonCompany] = useState("");
  const [context, setContext] = useState("alumni from my school");
  const [yourBackground, setYourBackground] = useState("");
  const [whatToLearn, setWhatToLearn] = useState("");

  const extractForCopy = useCallback((o: string) => o.split("---")[0].trim(), []);
  const { output, loading, error, copied, generate, handleCopy, handleDownload, setOutput, setError, history } =
    useGeneration({ toolName: TOOL_ID, extractForCopy });

  function loadExample() {
    setPersonName("James Park");
    setPersonRole("VP of Product");
    setPersonCompany("Stripe");
    setContext("alumni from my school");
    setYourBackground("Product manager at a mid-size SaaS company, 4 years. Exploring fintech.");
    setWhatToLearn("What the PM org looks like, how they think about payments infra vs product, and what the transition from mid-size to hypergrowth is like.");
  }

  async function handleGenerate() {
    if (!personCompany) {
      setError("Fill in at least the company name.");
      return;
    }

    const prompt = buildCoffeeChatPrompt({
      personName: personName || "the person",
      personRole,
      personCompany,
      context,
      yourBackground,
      whatToLearn,
    });
    await generate(TOOL_ID, prompt);
  }

  function handleCopyPrep() {
    handleCopy();
  }

  const mainContent = output ? output.split("---")[0].trim() : "";
  const headsUp = output ? output.split("---").slice(1).join("---").trim() : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Coffee Chat Prep</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Smart questions that show you did your homework. Walk in confident, leave memorable.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 grid-cols-1">
          <div>
            <Label htmlFor="personName" className="text-xs">Their name</Label>
            <Input id="personName" placeholder="James Park" value={personName} onChange={(e) => setPersonName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="personRole" className="text-xs">Their role</Label>
            <Input id="personRole" placeholder="VP of Product" value={personRole} onChange={(e) => setPersonRole(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="personCompany" className="text-xs">Company *</Label>
            <Input id="personCompany" placeholder="Stripe" value={personCompany} onChange={(e) => setPersonCompany(e.target.value)} className="h-9" />
          </div>
        </div>

        <PillSelect label="How you know them" value={context} onChange={setContext} options={contextOptions} />

        <div>
          <Label htmlFor="yourBackground" className="text-xs">Your background <span className="text-muted-foreground">(optional, helps tailor questions)</span></Label>
          <Textarea
            id="yourBackground"
            placeholder="PM at a SaaS company, 4 years. Exploring fintech..."
            value={yourBackground}
            onChange={(e) => setYourBackground(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div>
          <Label htmlFor="whatToLearn" className="text-xs">What you want to learn <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea
            id="whatToLearn"
            placeholder="How their PM org is structured, what the day-to-day looks like..."
            value={whatToLearn}
            onChange={(e) => setWhatToLearn(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing...</> : "Prep My Chat"}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-border bg-card p-5 max-h-[600px] overflow-y-auto">
            <MarkdownOutput content={mainContent} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyPrep}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy prep"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>

          {headsUp && (
            <div className="flex gap-2.5 rounded-lg bg-muted/50 p-3.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <MarkdownOutput content={headsUp} />
            </div>
          )}
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>The best coffee chats feel like conversations, not interviews. Ask questions that show genuine curiosity.</span>
        </div>
      )}
      <HistoryPanel
        getEntries={history.getEntries}
        removeEntry={history.removeEntry}
        clearAll={history.clearAll}
        onRestore={setOutput}
      />
    </div>
  );
}
