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
import { STAR_SYSTEM_PROMPT, buildStarPrompt } from "@/prompts/star";

const TOOL_NAME = "star";

export default function StarPage() {
  const [rawStory, setRawStory] = useState("");
  const [competency, setCompetency] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function loadExample() {
    setRawStory("At my last job I noticed our onboarding flow was causing a lot of drop-off. I pulled the funnel data and found that 60% of users were leaving at step 3 where we asked for company size. I hypothesized the question felt too invasive for a free trial. I convinced my manager to let me run an A/B test removing that field. Worked with engineering to set it up in two days. The new version had 35% better completion and we didn't lose any meaningful segmentation data. We rolled it out to all users and it became the template for how we evaluated friction in other flows.");
    setCompetency("data-driven decision");
    setInterviewType("tech PM");
  }

  async function handleGenerate() {
    const { allowed } = checkRateLimit(TOOL_NAME);
    if (!allowed) {
      setError("Daily limit reached. Come back tomorrow.");
      return;
    }
    if (!rawStory.trim()) {
      setError("Describe what happened. It can be messy - the tool will structure it.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const prompt = buildStarPrompt({ rawStory, competency, interviewType });
      const result = await generateWithAI(STAR_SYSTEM_PROMPT, prompt);
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
        <h1 className="text-3xl font-bold tracking-tight">STAR Story Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Dump your raw experience. Get a structured, interview-ready STAR story with feedback and follow-up prep.
        </p>
        <button onClick={loadExample} className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
          Load example to see how it works
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="rawStory">What happened? (be as messy and detailed as you want)</Label>
            <Textarea
              id="rawStory"
              placeholder={"e.g. At my last job I noticed our onboarding flow was causing a lot of drop-off. I looked at the data and found that 60% of users were leaving at step 3. I redesigned the flow, ran an A/B test, and the new version had 35% better completion. My manager was really happy and we rolled it out to all users."}
              value={rawStory}
              onChange={(e) => setRawStory(e.target.value)}
              rows={8}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Competency/theme (optional)</Label>
              <Select value={competency} onValueChange={(v) => v && setCompetency(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="conflict resolution">Conflict resolution</SelectItem>
                  <SelectItem value="failure/mistake">Failure / Mistake</SelectItem>
                  <SelectItem value="data-driven decision">Data-driven decision</SelectItem>
                  <SelectItem value="ambiguity">Ambiguity</SelectItem>
                  <SelectItem value="cross-functional collaboration">Cross-functional collaboration</SelectItem>
                  <SelectItem value="influence without authority">Influence without authority</SelectItem>
                  <SelectItem value="innovation">Innovation</SelectItem>
                  <SelectItem value="customer obsession">Customer obsession</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interview type (optional)</Label>
              <Select value={interviewType} onValueChange={(v) => v && setInterviewType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech PM">Tech PM</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="general management">General Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Building story...
              </>
            ) : (
              "Build STAR Story"
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
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Try different framing
                </Button>
              </div>
            </div>
          )}

          {!output && !error && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your structured STAR story will appear here with feedback, competency tags, and follow-up prep.
            </div>
          )}

          <Collapsible className="mt-6">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              Tips for great STAR stories
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Keep Situation + Task to 20% of the story. Most people spend 50%+ setting the scene.</p>
              <p>Use &quot;I,&quot; not &quot;we.&quot; Interviewers want YOUR contribution.</p>
              <p>Show decision-making: &quot;I chose X over Y because...&quot;</p>
              <p>Quantify results. Revenue, time saved, users, adoption rate.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
