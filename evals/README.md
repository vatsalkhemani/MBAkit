# MBAKit Evals

LLM-as-judge quality harness for the 5 MBAKit tools. Generates outputs from the live Gemini-backed API, then a Claude judge scores them against [rubric.md](rubric.md).

## How it works

1. [fixtures.ts](fixtures.ts) defines 2 scenarios per tool (sparse + rich input).
2. [run.ts](run.ts) POSTs each fixture to `/api/generate` and saves the streamed output to `outputs/<id>.md`.
3. A Claude session reads those outputs and scores them against [rubric.md](rubric.md), producing [report.md](report.md).

The judge runs in-chat (inside a Claude Code session), not in a script — this avoids needing a separate `ANTHROPIC_API_KEY`.

## Running

```bash
# In terminal 1:
npm run dev

# In terminal 2:
npm run eval
```

This writes outputs to `evals/outputs/`. To re-judge, start a Claude Code session in the repo and say: "read evals/outputs/ and score against evals/rubric.md. Write the verdict to evals/report.md."

## Files

- [METHODOLOGY.md](METHODOLOGY.md) — **what and why** we measure (stable reference)
- [RUNLOG.md](RUNLOG.md) — **append-only log** of every run with deltas
- [rubric.md](rubric.md) — scoring criteria (shared + per-tool)
- [fixtures.ts](fixtures.ts) — test inputs (add more scenarios here)
- [run.ts](run.ts) — harness that calls the API
- [reports/](reports/) — latest detailed judgment report (`run-NNN.md`). Older runs live as summary rows in RUNLOG.md rather than separate files.
- `outputs/` — most recent run's captured model outputs per fixture

## Adding a fixture

Append to `FIXTURES` in [fixtures.ts](fixtures.ts). Use the existing `build*Prompt` helpers so the user-message shape matches the app.

## Notes

- The harness uses `tsx` (added as devDep) so fixtures can import the real prompt constants from `src/prompts/`. No duplication.
- Latency is captured per fixture — useful for spotting regressions if prompt length blows up.
- Outputs include the exact `userMessage` sent, so a failed output is reproducible.
