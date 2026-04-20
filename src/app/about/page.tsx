import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About MBAKit</h1>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          The MBA is a stretch of constant networking, coffee chats, info sessions, and follow-ups. Every message, email, and piece of polish needs context, and most of us end up writing the same setup prompt to an LLM over and over just to get something usable. That overhead adds up fast, and it pulls focus away from the actual interaction that matters.
        </p>
        <p>
          MBAKit handles the drafting layer. Each tool already knows the context (recruiter vs. alum, coffee chat vs. final round, career switcher vs. insider), so you fill in a few specifics and get a sendable draft. Your energy stays on the conversation, the relationship, the follow-through. Not the prompt.
        </p>
        <p>
          No sign-up. No paywall. No data stored. Just tools.
        </p>

        <div className="rounded-lg border border-border/60 bg-card p-6 mt-8">
          <h2 className="font-semibold text-foreground">
            <a
              href="https://www.linkedin.com/in/vatsal-khemani-39a483192"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Vatsal Khemani
            </a>
          </h2>
          <p className="mt-2 text-sm">
            Wharton &apos;28, ex-Microsoft Copilot.
          </p>
          <p className="mt-3 text-sm">
            Have feedback or an idea for another tool?{" "}
            <Link href="/feedback" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Send it here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
