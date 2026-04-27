"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Copy, RefreshCw, Loader2, Lightbulb, Download } from "lucide-react";
import { MarkdownOutput } from "@/components/markdown-output";
import { HistoryPanel } from "@/components/history-panel";
import { useGeneration } from "@/lib/use-generation";
import { buildStarPrompt } from "@/prompts/star";

const TOOL_ID = "star";

const competencyOptions = [
  { label: "Leadership", value: "leadership" },
  { label: "Conflict resolution", value: "conflict resolution" },
  { label: "Failure / Mistake", value: "failure/mistake" },
  { label: "Data-driven", value: "data-driven decision" },
  { label: "Ambiguity", value: "ambiguity" },
  { label: "Cross-functional", value: "cross-functional collaboration" },
  { label: "Influence w/o authority", value: "influence without authority" },
  { label: "Innovation", value: "innovation" },
  { label: "Customer obsession", value: "customer obsession" },
];

const interviewOptions = [
  { label: "Tech PM", value: "tech PM" },
  { label: "Consulting", value: "consulting" },
  { label: "Amazon LP", value: "Amazon Leadership Principles" },
  { label: "General Mgmt", value: "general management" },
  { label: "Other", value: "other" },
];

export default function StarPage() {
  const [rawStory, setRawStory] = useState("");
  const [competency, setCompetency] = useState("");
  const [interviewType, setInterviewType] = useState("");

  const { output, loading, error, copied, generate, handleCopy, handleDownload, setOutput, setError, history } =
    useGeneration({ toolName: TOOL_ID });

  function loadExample() {
    setRawStory("At my last job I noticed our onboarding flow was causing a lot of drop-off. I pulled the funnel data and found that 60% of users were leaving at step 3 where we asked for company size. I hypothesized the question felt too invasive for a free trial. I convinced my manager to let me run an A/B test removing that field. Worked with engineering to set it up in two days. The new version had 35% better completion and we didn't lose any meaningful segmentation data. We rolled it out to all users and it became the template for how we evaluated friction in other flows.");
    setCompetency("data-driven decision");
    setInterviewType("tech PM");
  }

  async function handleGenerate() {
    if (!rawStory.trim()) {
      setError("Describe what happened. It can be messy, the tool will structure it.");
      return;
    }

    const prompt = buildStarPrompt({ rawStory, competency, interviewType });
    await generate(TOOL_ID, prompt);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">STAR Story Builder</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Dump your raw experience, get an interview-ready STAR story with feedback.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="rawStory" className="text-xs">What happened? (as messy as you want)</Label>
          <Textarea
            id="rawStory"
            placeholder="I noticed our onboarding had a lot of drop-off. I looked at the data, found the problem, redesigned the flow, ran an A/B test, and completion went up 35%..."
            value={rawStory}
            onChange={(e) => setRawStory(e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>

        <PillSelect label="Competency" value={competency} onChange={setCompetency} options={competencyOptions} />
        <PillSelect label="Interview type" value={interviewType} onChange={setInterviewType} options={interviewOptions} />

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building story...</> : "Build STAR Story"}
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
            <MarkdownOutput content={output} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy story"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try different framing
            </Button>
          </div>
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>Keep Situation + Task to 20%. Use &quot;I,&quot; not &quot;we.&quot; Quantify everything in the Result.</span>
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
