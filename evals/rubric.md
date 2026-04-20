# MBAKit Judging Rubric

Claude (Opus 4.7) acts as the judge. Every output is scored on a shared quality frame plus tool-specific criteria. Score on a **1–5 scale** per dimension: **1 = broken, 2 = weak, 3 = acceptable, 4 = strong, 5 = exceptional**. A score below 3 is a failure; the model is expected to hit 4+ on everything.

## Shared dimensions (scored on every tool)

1. **Format compliance** — Does output follow the exact structure the system prompt requires (subject line location, section headers, bullet markers, sign-off)? Deviation = failure.
2. **Banned-phrase avoidance** — System prompts list phrases that must never appear ("I hope this email finds you well," "truly inspiring," em dashes in some tools, etc.). Any single violation = score ≤ 2 on this dimension.
3. **Hallucination control** — In sparse mode, the model must NOT invent specifics (fake articles, fake talks, fake career moves). In rich mode, the model must faithfully use what the user provided without distorting.
4. **Sendability** — Could the user paste this and hit send with zero edits? Placeholders, brackets, or generic boilerplate = lower score.
5. **Voice** — Feels human, specific, one-off. Corporate-MBA-speak, buzzwords, or template energy = lower score.

## Tool-specific dimensions

### Cold Email
- **Sentence count** — must be 4–6 sentences. Count literally.
- **Specificity of ask** — timeline + duration required ("20 min next week") not "love to connect."
- **Connection handling** — sparse mode must reference role/company generically; rich mode must weave in the personal detail naturally.

### Thank-You
- **Sentence count** — must be 3–5 sentences.
- **Specific callback** — first sentence must reference the actual conversation, not "thanks for your time."
- **Context-fit** — tone adjusted to coffee chat vs final-round vs info session per the rules in the system prompt.

### Resume
- **Diagnosis quality** — weak verbs, missing numbers, vague impact, passive voice flagged accurately per the checklist.
- **Three versions** — each bullet gets Safe / Stronger / Strongest. Escalation must be real (not three near-identical rewrites).
- **Bracket hygiene** — vague input → brackets for missing data; detailed input → no brackets.
- **XYZ formula** — strongest version should approximate "Accomplished [X] as measured by [Y] by doing [Z]."

### STAR
- **Section proportion** — Situation 10–15%, Task 5–10%, Action 60%, Result 15–20%. Glaring imbalance = lower score.
- **"I" not "we"** — Action bullets must use "I."
- **Decision point** — at least one moment of pushback / tradeoff / choice in Action.
- **Gap flags honesty** — sparse input must produce honest "what's missing" notes, not pretend the story is complete.
- **Interview-type fit** — Amazon LP should tag LPs; consulting PEI should go deeper on one dimension; tech PM should emphasize data/tradeoffs.

### Coffee Chat
- **Question quality** — each question must be specific, reference something about the person/company, and invite genuine reflection. Generic questions = failure.
- **Seniority calibration** — VP+ gets strategic questions, peer gets tactical. Wrong calibration = lower score.
- **Opening line** — must be a comment, not a question, and feel natural.
- **"Heads up" usefulness** — the closing caution must be context-specific, not boilerplate.

## Output of the judge

For each fixture, the judge produces:

```
### <fixture-id>
**Verdict:** pass / borderline / fail

| Dimension | Score | Note |
|-----------|-------|------|
| ... | ... | ... |

**Quotes flagged:** <short excerpts with problems>
**Top fix:** <one concrete change the prompt author should make>
```

Then an aggregate:
- Per-tool average
- Worst dimension across the set (= where the prompts need the most work)
- Patterns noticed across multiple outputs (systemic issues vs one-offs)
