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
import { COLD_EMAIL_SYSTEM_PROMPT, buildColdEmailPrompt } from "@/prompts/cold-email";

const TOOL_NAME = "cold-email";

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
    const { allowed, remaining } = checkRateLimit(TOOL_NAME);
    if (!allowed) {
      setError(`Daily limit reached (${remaining} remaining). Come back tomorrow.`);
      return;
    }
    if (!recipientName || !recipientRole || !recipientCompany) {
      setError("Fill in at least the recipient's name, role, and company.");
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
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cold Email Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Write cold emails that actually get replies. Short, specific, and human.
        </p>
        <button onClick={loadExample} className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
          Load example to see how it works
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="senderName">Your name</Label>
              <Input
                id="senderName"
                placeholder="e.g. Vatsal Khemani"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                placeholder="e.g. Wharton MBA '28"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
              <Label htmlFor="recipientRole">Their role</Label>
              <Input
                id="recipientRole"
                placeholder="e.g. Senior PM"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recipientCompany">Company</Label>
              <Input
                id="recipientCompany"
                placeholder="e.g. Stripe"
                value={recipientCompany}
                onChange={(e) => setRecipientCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>How you found them</Label>
              <Select value={connectionType} onValueChange={(v) => v && setConnectionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alumni network">Alumni network</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="met at event">Met at event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connectionDetail">Detail (optional)</Label>
              <Input
                id="connectionDetail"
                placeholder="e.g. referred by John Doe"
                value={connectionDetail}
                onChange={(e) => setConnectionDetail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>What you want</Label>
              <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee chat">Coffee chat</SelectItem>
                  <SelectItem value="advice on role/industry">Advice on role/industry</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="informational interview">Informational interview</SelectItem>
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
                  <SelectItem value="warm-professional">Warm professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="personalDetail">Something specific about them (optional)</Label>
            <Textarea
              id="personalDetail"
              placeholder="e.g. Moved from McKinsey to product at Stripe last year. Wrote a blog post about building payments infrastructure."
              value={personalDetail}
              onChange={(e) => setPersonalDetail(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Email"
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
              Your generated email will appear here.
            </div>
          )}

          <Collapsible className="mt-6">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              Tips for great cold emails
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Keep it under 5 sentences. Busy people scan, they don&apos;t read.</p>
              <p>Reference something specific about them. Generic emails get ignored.</p>
              <p>Make a specific, low-commitment ask with a timeline.</p>
              <p>&quot;Would you have 20 minutes this week or next?&quot; beats &quot;I&apos;d love to connect sometime.&quot;</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
