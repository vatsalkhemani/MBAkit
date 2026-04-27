"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PillSelect } from "@/components/pill-select";
import { Loader2, Send, Check } from "lucide-react";

const categoryOptions = [
  { label: "Bug", value: "bug" },
  { label: "Feature idea", value: "feature" },
  { label: "Prompt quality", value: "prompt-quality" },
  { label: "General", value: "general" },
];

const OWNER_EMAIL = "vatsalkhemani@gmail.com";

export default function FeedbackPage() {
  const [category, setCategory] = useState("feature");
  const [tool, setTool] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Write something in the message field.");
      return;
    }
    setSubmitting(true);
    setError("");

    const endpoint = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT;

    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, tool, message, name, contact }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSubmitted(true);
      } catch {
        // Fall through to mailto
        openMailto();
      }
    } else {
      openMailto();
    }

    setSubmitting(false);
  }

  function openMailto() {
    const subject = `MBAKit feedback: ${categoryLabel(category)}${tool ? ` (${tool})` : ""}`;
    const bodyLines = [
      `Category: ${categoryLabel(category)}`,
      tool ? `Tool: ${tool}` : "",
      name ? `From: ${name}` : "",
      contact ? `Contact: ${contact}` : "",
      "",
      message,
    ].filter(Boolean);
    const href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Thanks for sending this.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            I read every one. If you left contact info, I&apos;ll follow up when it makes sense.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => { setSubmitted(false); setMessage(""); }}>
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bugs, feature ideas, or a prompt that gave you a weird output &mdash; send it here. Short is fine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PillSelect label="What is this about?" value={category} onChange={setCategory} options={categoryOptions} />

        <div>
          <Label htmlFor="tool" className="text-xs">Which tool? <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            id="tool"
            placeholder="Cold Email / LinkedIn / Resume / STAR / Coffee Chat / Thank You"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="message" className="text-xs">Your message *</Label>
          <Textarea
            id="message"
            placeholder="What went wrong, what would help, or what you'd want next..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <Label htmlFor="name" className="text-xs">Your name <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="name" placeholder="Vatsal Khemani" value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label htmlFor="contact" className="text-xs">Email or LinkedIn <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="contact" placeholder="so I can follow up" value={contact} onChange={(e) => setContact(e.target.value)} className="h-9" />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="mr-2 h-4 w-4" />Send feedback</>}
        </Button>

        {error && (
          <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          This opens your email client by default. Prefer LinkedIn?{" "}
          <a
            href="https://www.linkedin.com/in/vatsal-khemani-39a483192"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Message me there instead
          </a>.
        </p>
      </form>
    </div>
  );
}

function categoryLabel(value: string): string {
  return categoryOptions.find(o => o.value === value)?.label ?? value;
}
