"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Copy, RefreshCw, Loader2, Lightbulb } from "lucide-react";
import { MarkdownOutput } from "@/components/markdown-output";
import { generateWithAI } from "@/lib/ai";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { RESUME_SYSTEM_PROMPT, buildResumePrompt } from "@/prompts/resume";

const TOOL_NAME = "resume";

const roleOptions = [
  { label: "Tech PM", value: "tech PM" },
  { label: "Consulting", value: "consulting" },
  { label: "Finance", value: "finance" },
  { label: "General Mgmt", value: "general management" },
  { label: "Marketing", value: "marketing" },
  { label: "Ops / Strategy", value: "ops/strategy" },
];

const goalOptions = [
  { label: "Sharpen existing", value: "sharpen existing" },
  { label: "More concise", value: "make more concise" },
  { label: "Add numbers", value: "add quantification" },
  { label: "Tailor for industry", value: "tailor for industry" },
];

export default function ResumePage() {
  const [bullets, setBullets] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [goal, setGoal] = useState("sharpen existing");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function loadExample() {
    setBullets("Managed a cross-functional team to deliver a new product feature on time\nHelped improve customer retention through data analysis and insights\nWorked on the company's pricing strategy and helped increase revenue");
    setTargetRole("tech PM");
    setGoal("sharpen existing");
  }

  async function handleGenerate() {
    const { allowed } = checkRateLimit(TOOL_NAME);
    if (!allowed) {
      setError("Daily limit reached. Come back tomorrow.");
      return;
    }
    if (!bullets.trim()) {
      setError("Paste at least one resume bullet.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const prompt = buildResumePrompt({ bullets, targetRole, goal });
      const result = await generateWithAI(RESUME_SYSTEM_PROMPT, prompt);
      setOutput(result);
      incrementUsage(TOOL_NAME);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Resume Bullet Sharpener</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Diagnosis + 3 improved versions per bullet, ranked from safe to strongest.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="bullets" className="text-xs">Your resume bullets (1-5, one per line)</Label>
          <Textarea
            id="bullets"
            placeholder={"Managed a cross-functional team to deliver a new product feature\nHelped improve customer retention through data analysis\nWorked on the company's pricing strategy"}
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <PillSelect label="Target role" value={targetRole} onChange={setTargetRole} options={roleOptions} />
        <PillSelect label="What you want" value={goal} onChange={setGoal} options={goalOptions} />

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Sharpen Bullets"}
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

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy all"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>Use the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]. Lead with a strong verb, quantify everything.</span>
        </div>
      )}
    </div>
  );
}
