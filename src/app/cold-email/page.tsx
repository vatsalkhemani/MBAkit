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
import { COLD_EMAIL_SYSTEM_PROMPT, buildColdEmailPrompt } from "@/prompts/cold-email";

const TOOL_NAME = "cold-email";

const connectionOptions = [
  { label: "Alumni", value: "alumni network" },
  { label: "LinkedIn", value: "LinkedIn" },
  { label: "Referral", value: "referral" },
  { label: "Met at event", value: "met at event" },
  { label: "Other", value: "other" },
];

const goalOptions = [
  { label: "Coffee chat", value: "coffee chat" },
  { label: "Role/industry advice", value: "advice on role/industry" },
  { label: "Referral", value: "referral" },
  { label: "Info interview", value: "informational interview" },
];

const toneOptions = [
  { label: "Warm professional", value: "warm-professional" },
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
];

export default function ColdEmailPage() {
  const [senderName, setSenderName] = useState("");
  const [school, setSchool] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [connectionType, setConnectionType] = useState("alumni network");
  const [connectionDetail, setConnectionDetail] = useState("");
  const [goal, setGoal] = useState("coffee chat");
  const [personalDetail, setPersonalDetail] = useState("");
  const [tone, setTone] = useState("warm-professional");

  function loadExample() {
    setSenderName("Vatsal Khemani");
    setSchool("Wharton MBA '28");
    setRecipientName("Sarah Chen");
    setRecipientRole("Senior Product Manager");
    setRecipientCompany("Stripe");
    setConnectionType("alumni network");
    setConnectionDetail("Wharton '22");
    setGoal("coffee chat");
    setPersonalDetail("Moved from McKinsey to product at Stripe two years ago. Wrote a blog post about building payments infrastructure for emerging markets.");
    setTone("warm-professional");
  }

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mbakit_sender");
    if (saved) {
      const { name, school: s } = JSON.parse(saved);
      if (name) setSenderName(name);
      if (s) setSchool(s);
    }
  }, []);

  useEffect(() => {
    if (senderName || school) {
      localStorage.setItem("mbakit_sender", JSON.stringify({ name: senderName, school }));
    }
  }, [senderName, school]);

  async function handleGenerate() {
    const { allowed } = checkRateLimit(TOOL_NAME);
    if (!allowed) {
      setError("Daily limit reached. Come back tomorrow.");
      return;
    }
    if (!recipientName || !recipientCompany) {
      setError("Fill in at least the recipient's name and company.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const prompt = buildColdEmailPrompt({
        senderName: senderName || "[Your Name]",
        school: school || "[Your School]",
        recipientName,
        recipientRole,
        recipientCompany,
        connectionType,
        connectionDetail,
        goal,
        personalDetail,
        tone,
      });
      const result = await generateWithAI(COLD_EMAIL_SYSTEM_PROMPT, prompt);
      setOutput(result);
      incrementUsage(TOOL_NAME);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const emailOnly = output.split("---")[0].trim();
    navigator.clipboard.writeText(emailOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const emailBody = output ? output.split("---")[0].trim() : "";
  const insights = output ? output.split("---").slice(1).join("---").trim() : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Cold Email Generator</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Short, specific, and human. Emails that actually get replies.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-2">
          <div>
            <Label htmlFor="senderName" className="text-xs">Your name</Label>
            <Input id="senderName" placeholder="Vatsal Khemani" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="school" className="text-xs">School</Label>
            <Input id="school" placeholder="Wharton MBA '28" value={school} onChange={(e) => setSchool(e.target.value)} className="h-9" />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-3">
          <div>
            <Label htmlFor="recipientName" className="text-xs">Recipient name *</Label>
            <Input id="recipientName" placeholder="Sarah Chen" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="recipientRole" className="text-xs">Their role</Label>
            <Input id="recipientRole" placeholder="Senior PM" value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="recipientCompany" className="text-xs">Company *</Label>
            <Input id="recipientCompany" placeholder="Stripe" value={recipientCompany} onChange={(e) => setRecipientCompany(e.target.value)} className="h-9" />
          </div>
        </div>

        <PillSelect label="How you found them" value={connectionType} onChange={setConnectionType} options={connectionOptions} />

        {(connectionType === "referral" || connectionType === "met at event") && (
          <Input placeholder={connectionType === "referral" ? "Referred by..." : "Met at..."} value={connectionDetail} onChange={(e) => setConnectionDetail(e.target.value)} className="h-9" />
        )}

        <PillSelect label="What you want" value={goal} onChange={setGoal} options={goalOptions} />
        <PillSelect label="Tone" value={tone} onChange={setTone} options={toneOptions} />

        <div>
          <Label htmlFor="personalDetail" className="text-xs">Something specific about them <span className="text-muted-foreground">(optional, but makes it 10x better)</span></Label>
          <Textarea
            id="personalDetail"
            placeholder="Career move, article they wrote, talk they gave, shared background..."
            value={personalDetail}
            onChange={(e) => setPersonalDetail(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : "Generate Email"}
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
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{emailBody}</pre>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy email"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>

          {insights && (
            <div className="flex gap-2.5 rounded-lg bg-muted/50 p-3.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{insights}</pre>
            </div>
          )}
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>The best cold emails are under 5 sentences with a specific ask and a timeline.</span>
        </div>
      )}
    </div>
  );
}
