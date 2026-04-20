# How MBAKit Evals Work

A plain-English guide to what we test and how we decide if it's good.

## The problem

MBAKit is 5 tools powered by prompts. If I change a prompt, did the output get better or worse? I can't tell by reading one output — I need a repeatable test. That's what these evals are.

## What we test

Each of the 5 tools, on two kinds of input:

- **Sparse input** — the user gives the bare minimum (just a name and context). This is the "I'm in a hurry, just make me something passable" case.
- **Rich input** — the user gives full detail (specific talks, interview topics, personal backgrounds). This is the "I have 5 minutes to make this great" case.

Testing both matters because they stress the prompts differently. Sparse mode tests whether the model avoids making things up. Rich mode tests whether the model actually uses what it's given.

## What we measure (per tool)

Every output gets scored 1–5 on a few dimensions. 1 = broken, 5 = exceptional. Target is 4+ everywhere.

**Shared across all tools:**
- Does it follow the exact format the prompt asks for?
- Does it avoid phrases the prompt bans (like "pick your brain," "truly inspiring," etc.)?
- Does it make things up? (Sparse mode is where this usually breaks.)
- Could the user paste this and hit send? Or would they have to edit first?
- Does it sound like a human wrote it, or like a prompt-engineered LLM?

**Tool-specific:**
- **Cold Email** — 4–6 sentences, specific ask with timeline, references the connection type correctly
- **Thank-You** — 3–5 sentences, real callback (not fake one), tone matches context (coffee chat vs final round vs class speaker)
- **Resume** — three escalating versions per bullet, honest diagnosis, placeholders only where data is missing
- **STAR** — right section proportions, uses "I" not "we", shows a real decision point, flags what's weak
- **Coffee Chat** — questions are specific not generic, seniority-appropriate, opening line is a statement not a question

Full criteria in [rubric.md](rubric.md).

## Verdicts

Every output gets one of four labels:

- **GREAT** — all dimensions ≥4, most at 5. Feels like a human wrote it for this exact person. This is the shipping bar.
- **PASS** — all dimensions ≥4, nothing broken. Usable but feels a bit templatey.
- **BORDERLINE** — one or two dimensions at 2. User might send this but it's not best work.
- **FAIL** — something fundamentally wrong (hallucinates facts, violates format, uses banned phrases). Don't ship.

## How examples are made

Currently hand-written — 15 fixtures in [fixtures.ts](fixtures.ts). Each one is a realistic scenario an MBA student would plausibly give the tool:

- Different connection types (alumni, referral, LinkedIn cold)
- Different backgrounds (biotech R&D, military, consulting, engineering)
- Different interview types (general behavioral, Amazon LP, consulting PEI)
- Different seniority levels (SVP, Principal PM, peer-level founding PM)

Input varies from "two sentences" (sparse) to "full paragraph with specifics" (rich). The point is to stress the prompt at its edges, not just test the happy path.

**Not randomly generated.** We could auto-generate fixtures from a few seed parameters (names, companies, backgrounds) — that would give us hundreds of tests cheaply. Trade-off: auto-generated tests are shallow; hand-curated ones probe specific known weak spots. For now the 15 curated fixtures catch more real issues than random ones would. Once those stabilize at GREAT, expanding to auto-generated volume makes sense.

## How a run works

1. **Start the dev server** (`npm run dev`). This gives us the live Gemini-backed API at `http://localhost:3000/api/generate`.
2. **Run the harness** (`npm run eval`). It sends every fixture through the real API, streams the response, and saves each output to `outputs/<fixture-id>.md`.
3. **A Claude session judges** — reads each output and scores it against the rubric. Writes a detailed report to `reports/run-NNN.md` and a summary row to [RUNLOG.md](RUNLOG.md).

The judge runs inside Claude Code, so it doesn't need a separate API key. If you want to re-score later, just open Claude Code and say "re-judge the outputs in evals/outputs/ against evals/rubric.md."

## How the log works

Every run gets:

- A summary row in [RUNLOG.md](RUNLOG.md) — which fixtures passed, what changed in the prompts, how latency moved
- A detailed report in [reports/run-NNN.md](reports/) — per-fixture scores, quotes flagged, proposed fixes

Read the log chronologically if you're debugging. The "what changed since last run" line tells you which prompt edit caused a regression.

## What's NOT tested

Worth being explicit:

- **Latency SLA** — we log it, we don't enforce it
- **Streaming correctness** — we consume the stream but don't assert well-formed SSE
- **Cost / token usage** — Gemini 3.1 Flash Lite is free tier, not worth tracking yet
- **Rate limiting** — the client-side localStorage limit isn't exercised
- **Safety / toxicity** — tools are low-risk, not a priority
- **UX flow** — this is API-layer only, not a browser test
- **Adversarial inputs** — no prompt injection tests yet

## Shipping criteria

MBAKit is ready to promote to real users when:

- Every fixture scores **GREAT** (not just PASS)
- Three consecutive runs maintain that
- At least 25 fixtures covering the realistic input distribution
