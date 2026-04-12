"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Copy, RefreshCw, Loader2, Lightbulb } from "lucide-react";
import { generateWithAI } from "@/lib/ai";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { THANK_YOU_SYSTEM_PROMPT, buildThankYouPrompt } from "@/prompts/thank-you";

const TOOL_NAME = "thank-you";

const contextOptions = [
  { label: "Coffee chat", value: "coffee chat" },
  { label: "First round", value: "first-round interview" },
  { label: "Final round", value: "final-round interview" },
  { label: "Info session", value: "info session" },
  { label: "Networking event", value: "networking event" },
  { label: "Class speaker", value: "class speaker" },
  { label: "Other", value: "other" },
];

const toneOptions = [
  { label: "Warm", value: "warm" },
  { label: "Warm professional", value: "warm-professional" },
  { label: "Professional", value: "professional" },
];

const toneDefaults: Record<string, string> = {
  "coffee chat": "warm",
  "first-round interview": "professional",
  "final-round interview": "professional",
  "info session": "warm-professional",
  "networking event": "warm",
  "class speaker": "warm-professional",
  other: "warm-professional",
};

export default function ThankYouPage() {
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [context, setContext] = useState("coffee chat");
  const [discussed, setDiscussed] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [tone, setTone] = useState("warm");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function loadExample() {
    setSenderName("Vatsal Khemani");
    setRecipientName("Sarah Chen");
    setRecipientRole("Senior PM at Stripe");
    setContext("coffee chat");
    setDiscussed("How Stripe's PM org thinks about platform vs product, her transition from consulting to tech, the importance of building technical depth as a PM");
    setFollowUp("She offered to connect me with the payments team hiring manager. Also discussed the Ben Thompson article on platform strategy.");
    setTone("warm");
  }

  useEffect(() => {
    const saved = localStorage.getItem("mbakit_sender");
    if (saved) {
      const { name } = JSON.parse(saved);
      if (name) setSenderName(name);
    }
  }, []);

  function handleContextChange(val: string) {
    setContext(val);
    setTone(toneDefaults[val] || "warm-professional");
  }

  async function handleGenerate() {
    const { allowed } = checkRateLimit(TOOL_NAME);
    if (!allowed) {
      setError("Daily limit reached. Come back tomorrow.");
      return;
    }
    if (!recipientName) {
      setError("Fill in at least the recipient's name.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const prompt = buildThankYouPrompt({
        senderName: senderName || "[Your Name]",
        recipientName,
        recipientRole,
        context,
        discussed,
        followUp,
        tone,
      });
      const result = await generateWithAI(THANK_YOU_SYSTEM_PROMPT, prompt);
      setOutput(result);
      incrementUsage(TOOL_NAME);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const noteOnly = output.split("---")[0].trim();
    navigator.clipboard.writeText(noteOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const noteBody = output ? output.split("---")[0].trim() : "";
  const proTip = output ? output.split("---").slice(1).join("---").trim() : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Thank You Note Writer</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Specific, warm, and memorable. Send within 24 hours.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-3">
          <div>
            <Label htmlFor="senderName" className="text-xs">Your name</Label>
            <Input id="senderName" placeholder="Vatsal Khemani" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="recipientName" className="text-xs">Recipient name *</Label>
            <Input id="recipientName" placeholder="Sarah Chen" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="recipientRole" className="text-xs">Their role</Label>
            <Input id="recipientRole" placeholder="VP of Product at Stripe" value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)} className="h-9" />
          </div>
        </div>

        <PillSelect label="Context" value={context} onChange={handleContextChange} options={contextOptions} />
        <PillSelect label="Tone" value={tone} onChange={setTone} options={toneOptions} />

        <div>
          <Label htmlFor="discussed" className="text-xs">What you discussed <span className="text-muted-foreground">(even a few words helps)</span></Label>
          <Textarea
            id="discussed"
            placeholder="PM career paths, platform strategy, their transition from consulting..."
            value={discussed}
            onChange={(e) => setDiscussed(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div>
          <Label htmlFor="followUp" className="text-xs">Follow-up or value-add <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea
            id="followUp"
            placeholder="Article you discussed, intro they offered, your application timeline..."
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : "Generate Note"}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{noteBody}</pre>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy note"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>

          {proTip && (
            <div className="flex gap-2.5 rounded-lg bg-muted/50 p-3.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{proTip}</pre>
            </div>
          )}
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>Send within 24 hours. Reference something specific from the conversation, not just &quot;thanks for your time.&quot;</span>
        </div>
      )}
    </div>
  );
}
