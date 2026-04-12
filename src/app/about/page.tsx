export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About MBAKit</h1>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          MBA students spend hours every week on repetitive tasks: cold emails, thank-you notes,
          resume rewrites, interview prep. Most existing tools are either generic, shallow, or hidden
          behind paywalls.
        </p>
        <p>
          MBAKit is a free toolkit built specifically for MBA students. Every tool encodes real
          expertise about what works in MBA recruiting contexts. The difference between this and
          ChatGPT is that MBAKit already knows what good looks like.
        </p>
        <p>
          No accounts. No data collection. No monetization. Just tools that save you time so you can
          focus on what matters.
        </p>

        <div className="rounded-lg border border-border/60 bg-card p-6 mt-8">
          <h2 className="font-semibold text-foreground">Built by Vatsal Khemani</h2>
          <p className="mt-2 text-sm">
            Product Manager at Microsoft. Incoming Wharton MBA, Class of 2028. I built this for my
            classmates and the broader MBA community. If you have feedback or ideas for new tools,
            I&apos;d genuinely love to hear from you.
          </p>
        </div>
      </div>
    </div>
  );
}
