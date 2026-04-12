"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { generateWithAI } from "@/lib/ai";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { RESUME_SYSTEM_PROMPT, buildResumePrompt } from "@/prompts/resume";

const TOOL_NAME = "resume";

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resume Bullet Sharpener</h1>
        <p className="mt-2 text-muted-foreground">
          Turn vague bullets into quantified, impactful statements. Diagnosis + 3 improved versions per bullet.
        </p>
        <button onClick={loadExample} className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
          Load example to see how it works
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="bullets">Paste your resume bullets (1-5, one per line)</Label>
            <Textarea
              id="bullets"
              placeholder={"e.g.\nManaged a cross-functional team to deliver a new product feature\nHelped improve customer retention through data analysis\nWorked on the company's pricing strategy"}
              value={bullets}
              onChange={(e) => setBullets(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Target role/industry (optional)</Label>
              <Select value={targetRole} onValueChange={(v) => v && setTargetRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech PM">Tech PM</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="general management">General Management</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="ops/strategy">Ops / Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What you want</Label>
              <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharpen existing">Sharpen existing</SelectItem>
                  <SelectItem value="make more concise">Make more concise</SelectItem>
                  <SelectItem value="add quantification">Add quantification</SelectItem>
                  <SelectItem value="tailor for industry">Tailor for industry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Sharpen Bullets"
            )}
          </Button>
        </div>

        <div>
          {error && (
            <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {output && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {output}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy all"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!output && !error && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your sharpened bullets will appear here with diagnosis and improved versions.
            </div>
          )}

          <Collapsible className="mt-6">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              Tips for great resume bullets
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Use the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].</p>
              <p>Lead with a strong action verb. &quot;Built&quot; and &quot;Led&quot; beat &quot;Responsible for.&quot;</p>
              <p>Quantify everything. Numbers, percentages, dollar amounts, users affected.</p>
              <p>One line per bullet. If it&apos;s two lines, split it or cut.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
