"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { THANK_YOU_SYSTEM_PROMPT, buildThankYouPrompt } from "@/prompts/thank-you";

const TOOL_NAME = "thank-you";

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
    if (!recipientName || !discussed) {
      setError("Fill in at least the recipient's name and what you discussed.");
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
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Thank You Note Writer</h1>
        <p className="mt-2 text-muted-foreground">
          Send the perfect follow-up. Specific, warm, and memorable.
        </p>
        <button onClick={loadExample} className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
          Load example to see how it works
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="senderName">Your name</Label>
            <Input
              id="senderName"
              placeholder="e.g. Vatsal Khemani"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="recipientName">Recipient name</Label>
              <Input
                id="recipientName"
                placeholder="e.g. Sarah Chen"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recipientRole">Their role (optional)</Label>
              <Input
                id="recipientRole"
                placeholder="e.g. VP of Product at Stripe"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Context</Label>
              <Select value={context} onValueChange={(v) => v && handleContextChange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee chat">Coffee chat</SelectItem>
                  <SelectItem value="first-round interview">First-round interview</SelectItem>
                  <SelectItem value="final-round interview">Final-round interview</SelectItem>
                  <SelectItem value="info session">Info session</SelectItem>
                  <SelectItem value="networking event">Networking event</SelectItem>
                  <SelectItem value="class speaker">Class speaker</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="warm-professional">Warm professional</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="discussed">What you discussed (2-3 things)</Label>
            <Textarea
              id="discussed"
              placeholder="e.g. How Stripe's PM org thinks about platform vs product, their transition from consulting to tech, the importance of technical depth for PMs"
              value={discussed}
              onChange={(e) => setDiscussed(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="followUp">Follow-up or value-add (optional)</Label>
            <Textarea
              id="followUp"
              placeholder="e.g. Article about platform strategy we discussed, they offered to intro me to the hiring manager"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Note"
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
              <div className="rounded-lg border border-border bg-card p-6">
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
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!output && !error && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your thank-you note will appear here.
            </div>
          )}

          <Collapsible className="mt-6">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              Tips for great thank-you notes
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Send within 24 hours. Effectiveness drops sharply after that.</p>
              <p>Reference something specific from the conversation, not just &quot;thanks for your time.&quot;</p>
              <p>Add value: share an article you discussed, offer an intro, or mention next steps.</p>
              <p>Match the tone to the context. Post-coffee-chat is warmer than post-final-round.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
