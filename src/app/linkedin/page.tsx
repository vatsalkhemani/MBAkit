"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Copy, RefreshCw, Loader2, Lightbulb } from "lucide-react";
import { MarkdownOutput } from "@/components/markdown-output";
import { generateWithAI } from "@/lib/ai";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { LINKEDIN_SYSTEM_PROMPT, buildLinkedInPrompt } from "@/prompts/linkedin";

const TOOL_NAME = "linkedin";

const messageTypeOptions = [
  { label: "Connection note", value: "connection-note" },
  { label: "InMail / message", value: "inmail" },
];

const tierOptions = [
  { label: "Free (≤200 chars)", value: "free" },
  { label: "Premium (≤300 chars)", value: "premium" },
];

const connectionOptions = [
  { label: "Alumni", value: "alumni network" },
  { label: "Cold (their profile)", value: "cold LinkedIn — their profile" },
  { label: "Commented on post", value: "engaged with their recent post" },
  { label: "Referral", value: "referral" },
  { label: "Met at event", value: "met at event" },
  { label: "Other", value: "other" },
];

const goalOptions = [
  { label: "Coffee chat", value: "coffee chat" },
  { label: "Role/industry advice", value: "advice on role/industry" },
  { label: "Referral", value: "referral" },
  { label: "Stay in touch", value: "stay connected" },
];

const toneOptions = [
  { label: "Warm professional", value: "warm-professional" },
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
];

export default function LinkedInPage() {
  const [senderName, setSenderName] = useState("");
  const [school, setSchool] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [messageType, setMessageType] = useState("connection-note");
  const [tier, setTier] = useState("free");
  const [connectionContext, setConnectionContext] = useState("alumni network");
  const [connectionDetail, setConnectionDetail] = useState("");
  const [goal, setGoal] = useState("stay connected");
  const [personalDetail, setPersonalDetail] = useState("");
  const [tone, setTone] = useState("warm-professional");

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

  function loadExample() {
    setSenderName("Vatsal Khemani");
    setSchool("Wharton MBA '28");
    setRecipientName("Sarah Chen");
    setRecipientRole("Senior Product Manager");
    setRecipientCompany("Stripe");
    setMessageType("connection-note");
    setTier("free");
    setConnectionContext("alumni network");
    setConnectionDetail("Wharton '22");
    setGoal("stay connected");
    setPersonalDetail("Moved from McKinsey to product at Stripe two years ago. Wrote a piece on payments infra for emerging markets.");
    setTone("warm-professional");
  }

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
    if (messageType === "connection-note" && goal === "coffee chat") {
      setError("Connection notes shouldn't ask for a meeting — that's what gets them declined. Pick 'Stay in touch' or switch to InMail.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const prompt = buildLinkedInPrompt({
        senderName: senderName || "[Your Name]",
        school: school || "[Your School]",
        recipientName,
        recipientRole,
        recipientCompany,
        messageType,
        tier,
        connectionContext,
        connectionDetail,
        goal,
        personalDetail,
        tone,
      });
      const result = await generateWithAI(LINKEDIN_SYSTEM_PROMPT, prompt, setOutput);
      setOutput(result);
      incrementUsage(TOOL_NAME);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const messageOnly = extractMessageForCopy(output, messageType);
    navigator.clipboard.writeText(messageOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const messageBody = output ? output.split("---")[0].trim() : "";
  const insights = output ? output.split("---").slice(1).join("---").trim() : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">LinkedIn Outreach</h1>
          <button onClick={loadExample} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Load example
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Connection notes that get accepted, InMails that get replies. Respects LinkedIn&apos;s character limits.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <Label htmlFor="senderName" className="text-xs">Your name</Label>
            <Input id="senderName" placeholder="Vatsal Khemani" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="school" className="text-xs">School</Label>
            <Input id="school" placeholder="Wharton MBA '28" value={school} onChange={(e) => setSchool(e.target.value)} className="h-9" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 grid-cols-1">
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

        <PillSelect label="Message type" value={messageType} onChange={setMessageType} options={messageTypeOptions} />

        {messageType === "connection-note" && (
          <PillSelect label="Your LinkedIn tier" value={tier} onChange={setTier} options={tierOptions} />
        )}

        <PillSelect label="How you found them" value={connectionContext} onChange={setConnectionContext} options={connectionOptions} />

        {(connectionContext === "referral" || connectionContext === "met at event") && (
          <Input placeholder={connectionContext === "referral" ? "Referred by..." : "Met at..."} value={connectionDetail} onChange={(e) => setConnectionDetail(e.target.value)} className="h-9" />
        )}

        <PillSelect label="What you want" value={goal} onChange={setGoal} options={goalOptions} />
        <PillSelect label="Tone" value={tone} onChange={setTone} options={toneOptions} />

        <div>
          <Label htmlFor="personalDetail" className="text-xs">Something specific about them <span className="text-muted-foreground">(optional, but makes it 10x better)</span></Label>
          <Textarea
            id="personalDetail"
            placeholder="A post they wrote, career move, talk they gave, shared background..."
            value={personalDetail}
            onChange={(e) => setPersonalDetail(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : "Generate Message"}
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
            <MarkdownOutput content={messageBody} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy message"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>

          {insights && (
            <div className="flex gap-2.5 rounded-lg bg-muted/50 p-3.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <MarkdownOutput content={insights} />
            </div>
          )}
        </div>
      )}

      {!output && !error && !loading && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>
            {messageType === "connection-note"
              ? `A connection note shouldn't pitch — it should earn the accept. Free tier caps at 200 chars, premium at 300. Save the ask for after they connect.`
              : "InMail with a body under 400 chars gets 22% higher response. Keep the subject to 3-7 words and specific."}
          </span>
        </div>
      )}
    </div>
  );
}

function extractMessageForCopy(output: string, messageType: string): string {
  const body = output.split("---")[0].trim();
  if (messageType === "connection-note") {
    // Strip the header line "**Message** (XXX / 300 characters)" if present
    const lines = body.split("\n");
    const startIdx = lines.findIndex(l => l.trim() && !l.startsWith("**Message**") && !l.startsWith("**Subject"));
    return lines.slice(startIdx).join("\n").trim();
  }
  // InMail: return subject + body together, stripping meta lines
  return body
    .split("\n")
    .filter(l => !l.startsWith("**Message length:**"))
    .join("\n")
    .trim();
}
