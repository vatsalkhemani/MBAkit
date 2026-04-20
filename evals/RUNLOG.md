# MBAKit Eval Run Log

Append-only log. Every time the prompts, model, temperature, or fixture set changes meaningfully, add a new run. See [METHODOLOGY.md](METHODOLOGY.md) for how this is measured, and [reports/](reports/) for per-run detail.

---

## Run 001 — 2026-04-20 — baseline

**Model:** Gemini 3.1 Flash Lite (preview)
**Temperature:** 0.65
**Fixtures:** 10 (2 per tool × 5 tools, sparse + rich)
**What changed since last run:** n/a — baseline
**Detailed report:** [reports/run-001.md](reports/run-001.md)

### Verdicts

| Tool | Sparse | Rich |
|------|--------|------|
| Cold Email | borderline | borderline |
| Thank-You | **FAIL** | PASS |
| Resume | PASS | borderline |
| STAR | **FAIL** | PASS |
| Coffee Chat | borderline | borderline |

**Aggregate:** 2 pass, 6 borderline, 2 fail (0% ship-quality)

### Top findings

1. **Sparse-mode hallucination** is systemic — 3/5 tools invented specifics not in the user's input (thank-you invented "internal mobility updates we discussed"; STAR invented a whole CRM-redesign narrative; coffee-chat cited "Claude 3.5").
2. **Uncontracted register** — 4/10 outputs say "I am / I will / I have" instead of "I'm / I'll / I've". Breaks warm voice.
3. **Stale product references** — coffee chat cited "Claude 3.5 release" (~12 months stale in 2026). Reputational risk for users.
4. **Format drift** — resume-rich output started with a preamble paragraph before the first `### Bullet` header, violating the spec.
5. **star-rich was the one genuinely excellent output** — target bar for the others.

### Latency (ms, per fixture)

| Fixture | ms |
|---------|-----|
| cold-email-sparse | 1918 |
| cold-email-rich | 3544 |
| thank-you-sparse | 1851 |
| thank-you-rich | 2020 |
| resume-sparse | 3993 |
| resume-rich | 5560 |
| star-sparse | 3483 |
| star-rich | 4089 |
| coffee-chat-sparse | 4438 |
| coffee-chat-rich | 4009 |

Mean 3.5s, p95 ~5.6s. Acceptable for streamed output.

---

## Run 002 — 2026-04-20 — prompt hardening

**Model:** Gemini 3.1 Flash Lite (preview)
**Temperature:** 0.65
**Fixtures:** 10 (unchanged)
**What changed since last run:** Targeted edits to 5 system prompts to address Run 001 findings:
- cold-email.ts: BACKGROUND FIDELITY, CONTRACTIONS, NO STALE PRODUCT REFERENCES
- thank-you.ts: HARD RULE in minimal mode (banned callback phrases), CONTRACTIONS
- resume.ts: CRITICAL preamble ban (must start with "### Bullet 1")
- coffee-chat.ts: NO STALE PRODUCT REFERENCES, CONTRACTIONS, tightened opening-line rule (no question marks)
- star.ts: HARD RULE for brief input (<30 words → placeholder-only Situation/Task/Action)

**Detailed report:** [reports/run-002.md](reports/run-002.md)

### Verdicts

| Tool | Sparse | Rich | Δ sparse | Δ rich |
|------|--------|------|---------|--------|
| Cold Email | PASS | PASS | ↑ from borderline | ↑ from borderline |
| Thank-You | borderline | PASS | ↑ from FAIL | → |
| Resume | PASS | PASS | → | ↑ from borderline |
| STAR | PASS | PASS | ↑↑ from FAIL | → |
| Coffee Chat | PASS | PASS | ↑ from borderline | ↑ from borderline |

**Aggregate:** 9 pass, 1 borderline, 0 fail (vs. Run 001: 2 pass, 6 borderline, 2 fail)

### Key findings

1. **All four Run 001 FAIL/BORDERLINE patterns fixed in targeted ways:**
   - STAR-sparse went from inventing a whole 6-bullet narrative to correct placeholder-only output (FAIL → PASS)
   - Cold-email-rich now faithfully uses "biotech R&D" instead of rebranding as "technical infrastructure" (borderline → PASS)
   - Coffee-chat no longer cites stale product versions (Claude 3.5 reference gone) (borderline → PASS for both)
   - Resume-rich begins directly with "### Bullet 1" — preamble removed (borderline → PASS)
   - Contractions ("I'm" / "I've" / "I'd") now consistent across all 10 outputs
2. **One residual issue:** thank-you-sparse still emits "the team updates you mentioned" — the HARD RULE listed banned phrases but the model produced a close variant the blocklist didn't cover. Fix for Run 003: rewrite as a trigger-word self-check, not a blocklist.
3. **No regressions detected** — every fixture maintained or improved.

### Latency

Mean 4.3s (up from 3.5s), p95 8.6s (up from 5.6s). Prompt length grew in 4 files. Cold-email-rich is the outlier at 8590ms (+5046ms vs Run 001). Monitor in Run 003; consider compressing redundant additions.

---

## Run 003 — 2026-04-20 — push from PASS to GREAT

**Model:** Gemini 3.1 Flash Lite (preview)
**Temperature:** 0.65
**Fixtures:** 10 (unchanged)
**New verdict tier:** GREAT (added to [METHODOLOGY.md](METHODOLOGY.md)) — all dimensions ≥ 4, majority at 5, no templatey energy.
**What changed since last run:** Targeted upgrades focused on "feels human" vs "feels LLM":
- cold-email.ts: 5 explicit opening-pattern alternatives + rich-mode 5-sentence example weaving two specifics
- thank-you.ts: trigger-word self-check (mentioned/discussed/covered/talked about require verification); GOOD/BETTER minimal examples; concrete bring-to-team example for final round
- star.ts: sparse-mode HARD RULE rewritten — Situation/Task require paraphrased sentences, placeholders ONLY in Action
- coffee-chat.ts: opening-line GOOD/BAD examples, career-history fabrication banned, "Heads up" required to be specific not generic

**Detailed report:** [reports/run-003.md](reports/run-003.md)

### Verdicts

| Tool | Sparse | Rich | Δ sparse | Δ rich |
|------|--------|------|---------|--------|
| Cold Email | PASS | PASS | → | → |
| Thank-You | **GREAT** | PASS | ↑ from borderline | → |
| Resume | **GREAT** | PASS | ↑ from PASS | → |
| STAR | **GREAT** | **GREAT** | ↑ from PASS | ↑ from PASS |
| Coffee Chat | PASS | **GREAT** | → | ↑ from PASS |

**Aggregate:** 5 GREAT, 5 PASS, 0 borderline, 0 fail

Trajectory: 2 pass, 6 borderline, 2 fail → 9 pass, 1 borderline → 5 GREAT, 5 PASS.

### Key findings

1. **5 outputs are now GREAT:** star-sparse + star-rich + thank-you-sparse + resume-sparse + coffee-chat-rich.
2. **5 outputs are PASS but templatey.** Four distinct issues explain all 5:
   - **Cold email (both modes):** still default-opens with "I'm a first-year at Wharton" despite 5 alternatives in the prompt. Gemini ignoring the rule list.
   - **Thank-you rich:** still closes with "I'm excited about the possibility of contributing" generic enthusiasm cliché despite a better example in the prompt.
   - **Resume rich:** diagnosis incorrectly flags "Coordinated" as passive voice (it's active but weak).
   - **Coffee-chat sparse:** "Heads up" section fabricates Rachel's career history ("spent her career in high-growth marketplaces").
3. **Pattern identified:** Fixes expressed as GOOD/BAD examples land. Fixes expressed as rule lists without examples often don't. Implication for Run 004: convert every remaining rule to example-pair form.

### Latency

Mean 3.5s (recovered to Run 001 baseline). Cold-email-rich outlier from Run 002 (8.6s) resolved — back to 2.7s. No latency concerns.

---

## Run 004 — 2026-04-20 — example-pair fixes + generalization test

**Model:** Gemini 3.1 Flash Lite (preview)
**Temperature:** 0.65
**Fixtures:** **15** (10 existing + 5 new scenarios added to test generalization beyond what we optimized against)
**What changed since last run:**
- cold-email.ts: banned opener ("I'm a first-year at [school]") with GOOD/BAD example pair; 4 opening patterns by connection type
- thank-you.ts: banned-phrase list for final-round closings ("excited about the possibility," "contributing to these initiatives," "bringing my experience") with GOOD/BAD examples
- resume.ts: fixed diagnosis taxonomy — weak active verbs (coordinated, helped, assisted) are NOT passive voice
- coffee-chat.ts: extended career-history fabrication ban to the Heads Up section with GOOD/BAD examples
- fixtures.ts: added 5 new fixtures covering different branches — referral-based cold email, class-speaker thank-you, polished resume bullets, consulting PEI STAR, peer-level founding-PM coffee chat

**Detailed report:** [reports/run-004.md](reports/run-004.md)

### Verdicts

**Existing 10:**

| Tool | Sparse | Rich | Δ sparse | Δ rich |
|------|--------|------|---------|--------|
| Cold Email | GREAT | GREAT | ↑ from PASS | ↑ from PASS |
| Thank-You | PASS | **BORDERLINE** | ↓ from GREAT | ↓ from PASS |
| Resume | GREAT | PASS | → | → |
| STAR | GREAT | GREAT | → | → |
| Coffee Chat | GREAT | GREAT | ↑ from PASS | → |

**New 5 (first run):**

| Fixture | Verdict |
|---------|---------|
| cold-email-referral | PASS |
| thank-you-class-speaker | GREAT |
| resume-polished | GREAT |
| star-consulting-pei | GREAT |
| coffee-chat-peer | GREAT |

**Aggregate:** 10 GREAT, 4 PASS, 1 BORDERLINE, 0 fail. Trajectory: 0 → 5 → 10 at GREAT.

### Key findings

1. **Cold-email banned-opener fix landed.** Both cold-email outputs now lead with connection-first framing ("Fellow Wharton alum here..." / "Your talk at Config 2025...") instead of the default "I'm a first-year at Wharton."
2. **Coffee-chat career-history fabrication fixed.** Heads Up section now ties to seniority/role/company positioning — no invented career history.
3. **Prompts generalize.** 4 of 5 fresh fixtures hit GREAT on first try, suggesting the prompt set handles cases beyond what we optimized against.
4. **Regression: thank-you-rich.** Banning generic enthusiasm ("excited about the possibility") pushed the model toward inventing specific sender experience instead ("navigating similar sunsetting processes with legacy builders" — fully fabricated). This is a **bans-without-safe-fallback** failure mode: when the model can't use filler, it fills the void with fabrication. Every ban needs an explicit safe alternative.
5. **New-fixture gap: cold-email-referral.** When no sender background is provided, the model invents one ("Coming from a background in non-profit program management..." — James Chen's actual background was never specified). The BACKGROUND FIDELITY rule addresses rebranding but not invention-from-void.
6. **thank-you-sparse slight regression.** The trigger-word list was enumerated ("mentioned / discussed / covered"); the model found a near-synonym not on the list ("touched on"). Enumeration is whack-a-mole; needs to generalize to the principle.

### Latency

Mean 3.36s across 15 fixtures (~51s total run time). No anomalies. p95 ~5s.

---

## Run 005 — 2026-04-20 — principled fixes for Run 004 regressions

**Fixtures:** 15 (unchanged)
**What changed:** Three fixes addressing Run 004 failure modes:
- thank-you.ts: generalized trigger-word rule to a principle ("every concrete noun phrase must be traceable") + banned sender-experience fabrication with GOOD (no-background) / BAD examples
- cold-email.ts: extended BACKGROUND FIDELITY to "do not invent sender background when none given" with GOOD/BAD examples
- resume.ts: reworded PASSIVE VOICE rule — don't use word "passive" in explanation text for active-voice weak verbs

**Verdicts:** 14 GREAT, 1 PASS (thank-you-sparse regressed due to a bad "GOOD" example still in the prompt containing "the areas we touched on").

**Key finding:** thank-you-rich regression fixed. cold-email-referral fixed. But leaving a borderline "GOOD" example in the prompt caused Gemini to pattern-match to it, producing a new thank-you-sparse regression.

---

## Run 006 — 2026-04-20 — remove bad example from thank-you prompt

**Fixtures:** 15 (unchanged)
**What changed:** thank-you.ts — deleted the borderline example that contained "the areas we touched on"; replaced with explicit ALLOWED / BANNED content lists + one clean GOOD example and one BAD example.

**Verdicts:** **15 GREAT, 0 PASS, 0 BORDERLINE, 0 FAIL.** First all-GREAT run.

**Key finding:** Examples must be clean, not aspirational. A borderline example in the prompt is an instruction to produce borderline output. Every example must be the target bar.

---

## Run 007 — 2026-04-20 — add 5 fresh unoptimized fixtures

**Fixtures:** **20** (15 optimized + 5 new scenarios added to test generalization)
**New fixtures:** cold-email-boutique-vp (VP at boutique healthcare firm), thank-you-networking-event (large-group differentiator), resume-finance (buy-side PE bullets), star-tech-customer-obsession (failed-launch story), coffee-chat-international (PhonePe + UPI regulation).

**Verdicts:** **18 GREAT, 2 PASS, 0 BORDERLINE, 0 FAIL.**

- **resume-finance:** PASS — model flagged active verbs "Analyzed" and "Produced" as "passive" (same issue "fixed" in Run 005 for resume-rich; fix didn't fully propagate)
- **thank-you-networking-event:** PASS — model invented Elena's response ("your perspective on long-term potential") when user only provided the question asked, not the answer.

All other 18 fixtures hit GREAT, including 4 of 5 new unoptimized fixtures. **Prompts generalize.**

---

## Run 008 — 2026-04-20 — final fixes, all 20 GREAT

**Fixtures:** 20 (unchanged from Run 007)
**What changed:** Two targeted GOOD/BAD example-pair fixes:
- resume.ts: HARD BAN on word "passive" for active-voice weak verbs, with 3 concrete BAD→GOOD conversions
- thank-you.ts: "Special case — differentiator without discussion content" section with GOOD/BAD example for the networking-event scenario

**Verdicts:** **🎯 20 GREAT / 0 PASS / 0 BORDERLINE / 0 FAIL.**

**Detailed report:** [reports/run-008.md](reports/run-008.md)

### Trajectory

| Run | Fixtures | GREAT | PASS | BORDERLINE | FAIL |
|-----|----------|-------|------|------------|------|
| 001 | 10 | 0 | 2 | 6 | 2 |
| 002 | 10 | 0 | 9 | 1 | 0 |
| 003 | 10 | 5 | 5 | 0 | 0 |
| 004 | 15 | 10 | 4 | 1 | 0 |
| 005 | 15 | 14 | 1 | 0 | 0 |
| 006 | 15 | 15 | 0 | 0 | 0 |
| 007 | 20 | 18 | 2 | 0 | 0 |
| 008 | 20 | **20** | 0 | 0 | 0 |

### Ship-readiness

Per [METHODOLOGY.md](METHODOLOGY.md), shipping criteria are:

- [x] Every fixture scores GREAT (20/20)
- [ ] Three consecutive runs maintain that (only Run 008 so far)
- [ ] ≥25 fixtures (currently 20)

**Next action:** run the harness twice more without prompt changes to verify stability, then add 5 more fresh fixtures to reach 25.

### Key learnings across 8 runs

1. **GOOD/BAD example pairs reliably land.** Rule lists without examples often don't.
2. **Every ban needs an explicit safe fallback.** Banning filler without naming an alternative pushes the model toward fabrication.
3. **Sparse-mode is where hallucination lives.** Rich-mode was consistently strong.
4. **The model follows the most specific/recent example it sees.** Never leave a "borderline acceptable" example in the prompt.
5. **Background/identity fabrication is distinct from content fabrication.** Both need explicit constraints.

---
