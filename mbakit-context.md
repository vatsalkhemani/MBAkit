# MBAKit

> A free toolkit of small, sharp tools for MBA students. No sign-up, no fluff. Just tools that save time on the repetitive stuff so you can focus on what matters.

**Live site**: [TBD]
**Repo**: [TBD]

---

## Who Built This and Why

I'm Vatsal Khemani. Product Manager at Microsoft, incoming Wharton MBA (Class of 2028). I've built 10+ AI projects (agents, multi-agent systems, full-stack apps). I'm building MBAKit because MBA students spend hours every week on repetitive tasks - cold emails, thank-you notes, resume rewrites, interview prep - and most existing tools are either generic, shallow, or hidden behind paywalls.

This isn't a startup. It's a toolkit I'm building for my classmates and the broader MBA community. If it helps people, great. If something takes off, I'll spin it out. But the goal is utility, not revenue.

### What success looks like
- Wharton classmates actually use it (50+ users in first month)
- Students share it unprompted ("have you tried MBAKit?")
- The tools are good enough that people come back, not just try once
- I walk into Wharton orientation known as "the guy who built that toolkit"

---

## Design Philosophy

### 1. Instant value, zero friction
No accounts. No sign-up. No onboarding. A student lands on a tool page and uses it within 30 seconds. Input on the left, output on the right (or top/bottom on mobile). One click to generate, one click to copy.

### 2. Depth over polish
The tools must be GENUINELY useful, not thin AI wrappers. Each tool should encode real expertise about what makes a great cold email, a great resume bullet, a great STAR story. The difference between MBAKit and ChatGPT is that MBAKit already knows what good looks like for MBA contexts. The prompts behind each tool are the product.

### 3. MBA-native language
The tools understand MBA life: recruiting seasons, coffee chats, info sessions, case interviews, behavioral rounds, club applications, course bidding. They don't explain what a coffee chat is. They know.

### 4. Honest output
No sycophantic AI tone. No "I'd be delighted to help." The generated text should sound like a real person wrote it - warm, specific, concise. If a resume bullet is weak, say why. If a STAR story has gaps, flag them.

### 5. Beautiful, minimal UI
Use Claude's `frontend-design` skill for all UI work. The site should feel premium but simple. Clean typography, generous whitespace, subtle animations. Think Linear or Notion aesthetics, not Bootstrap templates. Dark/light mode. Fully responsive. The visual quality should match the content quality.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js (App Router) or Vite + React | Modern, fast, good DX. Use whatever the builder tool (Lovable/Bolt) defaults to. |
| **Styling** | Tailwind CSS + shadcn/ui | Clean components, easy to customize, good defaults |
| **AI** | Google Gemini Flash or OpenAI GPT-4o-mini | Cheapest models that are still good. One API call per generation. |
| **API calls** | Client-side with simple rate limiting | No backend needed for MVP. Add a serverless function later if abuse becomes a problem. |
| **Hosting** | Vercel free tier or Lovable hosting | Zero cost, fast deploys |
| **Domain** | mbakit.co or mbakit.tools (TBD) | Short, memorable |
| **Analytics** | Plausible or simple Vercel Analytics | Know which tools get used. Nothing invasive. |
| **Auth** | None | Kill the friction. Maybe add optional accounts in Phase 2 if there's a reason. |
| **Database** | None | Stateless tools. Nothing to store. |

**Total monthly cost**: Domain ($10/year) + API calls (<$5/month at MBA scale). Essentially free.

### API Cost Control

**This matters. Plan for it from Day 1.**

The AI behind each tool costs money per use. The strategy is: start free, add defenses in layers, never let the site break.

**Layer 1 - Start with Gemini Flash free tier.**
Google gives 15 requests/minute and 1 million tokens/day for free. This covers the first 50-100 users easily. Zero cost. If daily quota runs out, show: "Lots of people using MBAKit today - try again in a few hours." Friendly, honest, not a crash.

**Layer 2 - Client-side daily rate limit.**
Use localStorage to track generations per tool per day per browser. Cap at 20 per tool per day. No legitimate user needs more. This prevents one person from burning the shared quota. Counter resets at midnight. This should be built into the MVP from the start.

**Layer 3 - Budget cap on paid tier (when free tier isn't enough).**
When usage outgrows the free tier, switch to paid Gemini or GPT-4o-mini with a hard monthly spending limit ($20-50/month). Both Google and OpenAI support budget caps. If the cap is hit, tools gracefully degrade: show a friendly message + the expert tips for that skill (so the page is still useful even without AI). Never a blank error or cryptic failure.

**Layer 4 - Bring Your Own Key (if it really takes off).**
Add an optional "Use your own API key" field in a settings panel. Stored in localStorage only, never sent to any server. Power users paste their own key for unlimited access. Everyone else shares the default quota. This costs users nothing if they already have a Gemini/OpenAI key.

**What to build into the MVP:**
1. Graceful error handling on ALL API calls. If anything fails (rate limit, quota, network), show a human message + expert tips. Never crash.
2. Client-side daily cap (20/tool/day via localStorage).
3. That's it. Don't build token tracking, usage dashboards, or payment flows. Solve the scaling problem when you actually have the scaling problem.

**Cost reference:**
- 100 users x 5 uses/day = ~$15/month on GPT-4o-mini (or free on Gemini free tier)
- 900 users x 3 uses/day = ~$80/month (the "full Wharton class" dream scenario - a great problem to have)

---

## The Tools (MVP - 4 tools)

### IMPORTANT: Quality Standards for All Tools

Every tool must follow these principles:
- **The system prompt is the product.** Spend 80% of the effort on the AI prompt behind each tool. It should encode real expertise, not generic instructions. The prompt should know what great looks like and actively steer the output there.
- **Show, don't just generate.** Where relevant, show WHY the output is good. Highlight what makes a bullet strong, flag what's missing from a STAR story, note what makes an email more likely to get a reply.
- **No AI slop.** The output must never sound like ChatGPT. No "I hope this email finds you well." No "Leveraged cross-functional synergies." No em dashes. Real human language.
- **Edge cases matter.** Handle short inputs gracefully. If someone gives a vague resume bullet, don't just polish vagueness - flag that it needs specifics. If a STAR story has no quantified result, say so.

---

### Tool 1: Cold Email Generator

**The problem**: MBA students send 50-100+ cold emails during recruiting. To alumni, recruiters, hiring managers, people they met at events. Writing each one from scratch is slow. Using templates sounds templated. Most students either procrastinate (and miss opportunities) or send generic emails (and get ignored).

**What makes a GREAT cold email (encode this in the prompt)**:
- **Short.** 4-6 sentences max. Busy people scan, they don't read.
- **Specific ask.** "Would you have 20 minutes for a call this week or next?" not "I'd love to connect sometime."
- **Credibility signal in sentence 1-2.** Why should they care? Shared school, shared company, shared interest, referral from someone they know.
- **One concrete connection point.** Reference something specific about them (a talk, an article, their career path). Shows you did 60 seconds of homework.
- **Easy to say yes to.** Low commitment ask. Coffee chat > "pick your brain." 20 minutes > open-ended.
- **No flattery.** "I admire your career" is noise. "I saw you moved from consulting to product at Stripe - I'm considering a similar path" is signal.
- **Subject line matters.** Short, specific, human. "[Wharton MBA] Quick question about PM at Stripe" > "Networking Request"

**What most people get wrong (the prompt should actively avoid)**:
- Too long (3+ paragraphs)
- Too vague ("I'd love to learn about your experience")
- Too formal ("Dear Mr. Smith, I hope this email finds you well")
- All about themselves, not about the recipient
- No specific ask or timeline
- Sycophantic ("Your career is truly inspiring")

**Input fields**:
- Your name + school (pre-fillable, saved in localStorage)
- Recipient's name + role + company
- How you found/know them (dropdown: alumni network, LinkedIn, referral from [name], met at [event], other)
- What you want (dropdown: coffee chat, advice on [role/industry], referral, informational interview)
- One personal detail about them (optional free text: career path, something they wrote, shared background)
- Tone (dropdown: warm-professional, casual, formal) - default warm-professional

**Output**:
- Subject line + email body
- A small "Why this works" note (2-3 bullet points explaining the choices made: why this opening, why this ask format)
- "Copy" button for each
- "Try again" for a fresh variation

---

### Tool 2: Thank You Note Writer

**The problem**: After every coffee chat, interview, info session, and networking event, you should send a thank-you. Most students know this but either forget, delay too long (effectiveness drops sharply after 24 hours), or send something generic that adds no value.

**What makes a GREAT thank-you note (encode this in the prompt)**:
- **Send within 24 hours.** The tool should make this so easy there's no excuse to delay.
- **Reference 1-2 specific things from the conversation.** "Your point about how Stripe's PM org thinks about platform vs product was really helpful" > "Thanks for taking the time to chat."
- **Add value.** Send an article you discussed, offer to connect them with someone, share a resource. Even small value signals that you're not just extracting.
- **Signal next steps.** If they offered to connect you with someone, reference it. If you're applying, mention timeline. Keep momentum.
- **Match the relationship stage.** Post-coffee-chat is warmer and shorter than post-final-round. Post-info-session (where they spoke to 50 people) needs a strong differentiator.
- **Short.** 3-5 sentences. They don't need an essay.

**What most people get wrong**:
- Generic ("Thank you for your time, I really enjoyed our conversation")
- Too long
- No specific callback to what was discussed
- No next step or value-add
- Wrong tone (too formal after a casual coffee chat, too casual after a final round)

**Input fields**:
- Your name (pre-fillable from localStorage)
- Recipient's name + role
- Context (dropdown: coffee chat, first-round interview, final-round interview, info session, networking event, class speaker, other)
- 2-3 things you discussed (free text, comma-separated or bullet points)
- Anything you want to follow up on or offer (optional: article to share, intro to make, next step)
- Tone (auto-suggested based on context, but overridable)

**Output**:
- Subject line + email body
- "Pro tip" relevant to the context (e.g., "For post-interview notes, mention something you'd bring to the team. It reinforces your candidacy without being pushy.")
- Copy button + Try again

---

### Tool 3: Resume Bullet Sharpener

**The problem**: MBA students rewrite their resume 10-20 times across recruiting season. Each bullet needs to be concise, quantified, impactful, and tailored. Students stare at bullets for 20 minutes trying to make them 5% better. Career services gives generic advice ("use strong action verbs"). What students need is a tool that shows them exactly what's weak and how to fix it.

**What makes a GREAT resume bullet (encode this in the prompt)**:
- **XYZ formula**: Accomplished [X] as measured by [Y] by doing [Z]. Not every bullet fits perfectly, but the best ones follow this pattern.
- **Strong action verb.** "Built," "Led," "Reduced," "Shipped," "Designed" > "Responsible for," "Helped with," "Assisted in," "Worked on."
- **Quantified impact.** Numbers, percentages, dollar amounts, time saved, users affected. If you can't quantify, at least scope it ("for a team of 12," "across 3 product lines").
- **Specific, not vague.** "Reduced API latency by 40% by implementing Redis caching" > "Improved system performance."
- **Show YOUR contribution.** "I" is implied on a resume, but the bullet should make clear what YOU did vs what the team did.
- **Right length.** One line ideally, two lines max. If it's more, split or cut.
- **Industry-aware.** Tech PM bullets emphasize metrics and technical decisions. Consulting bullets emphasize client impact and frameworks. Finance bullets emphasize deal size and returns.

**What the tool should actively flag**:
- Passive voice ("Was responsible for" -> "Led")
- Vague impact ("improved efficiency" -> needs numbers)
- Missing quantification (suggest what COULD be quantified)
- Too long (suggest cuts)
- Weak verb (suggest 3 stronger alternatives)
- Buried lead (the most impressive part isn't at the start)

**Input fields**:
- Paste 1-5 resume bullets (free text, one per line)
- Target role/industry (optional dropdown: tech PM, consulting, finance, general management, marketing, ops/strategy)
- What you want (dropdown: sharpen existing, make more concise, add quantification, tailor for [industry])

**Output**:
- For EACH bullet:
  - Original bullet displayed
  - Diagnosis: what's strong, what's weak (color-coded: green for good, yellow for fixable, red for missing)
  - 3 improved versions, ranked from "safe improvement" to "strongest rewrite"
  - What changed and why (brief annotation per version)
- Overall notes if patterns emerge across bullets ("You tend to bury the impact - lead with the number")
- Copy all button + copy individual

---

### Tool 4: STAR Story Builder

**The problem**: Every behavioral interview requires STAR stories (Situation, Task, Action, Result). Students have the raw experiences but struggle to structure them. Common failure modes: the Situation goes on for 2 minutes (interviewer zones out), the Action is vague ("I worked with the team"), the Result has no numbers, or the story doesn't actually answer the question asked.

**What makes a GREAT STAR story (encode this in the prompt)**:
- **Situation + Task: 20% of the story.** Set the scene in 2-3 sentences. Include just enough context for the Action to make sense. Most people spend 50%+ here. Cut ruthlessly.
- **Action: 60% of the story.** This is what they're evaluating. Be specific. Use "I," not "we." Break it into 3-4 concrete steps you took. Show decision-making ("I chose X over Y because..."), not just execution.
- **Result: 20% of the story.** Quantify. Revenue, time saved, adoption rate, customer satisfaction, team performance. If you can't quantify, describe the qualitative outcome AND what you learned.
- **Transferable insight.** The best stories end with a principle: "This taught me that..." This shows self-awareness and makes the story stick.
- **Tailorable.** The same raw experience can be framed for leadership, conflict resolution, failure, data-driven decision-making, etc. The STAR builder should suggest which competencies the story maps to.

**What the tool should actively flag**:
- Situation too long (suggest cuts)
- Action uses "we" too much (where's YOUR contribution?)
- Action is vague (ask for specifics: "What exactly did you do? What was the decision point?")
- Result not quantified (suggest what to measure)
- Story doesn't match the competency (if they said "leadership" but the story is really about execution)
- Missing the "so what" (why does this story matter?)

**What interviewers actually probe on (the tool should prepare students for follow-ups)**:
- "What would you do differently?"
- "How did you decide between X and Y?"
- "What was the hardest part?"
- "How did you handle disagreement?"
- "What was the quantified impact?"

**Input fields**:
- Raw description of what happened (free text, can be messy and long - the tool structures it)
- Competency/theme (optional dropdown: leadership, conflict resolution, failure/mistake, data-driven decision, ambiguity, cross-functional collaboration, influence without authority, innovation, customer obsession, other)
- Target interview type (optional: tech PM, consulting, general management, other)

**Output**:
- Structured STAR story:
  - **Situation** (2-3 sentences, concise)
  - **Task** (1-2 sentences, your specific responsibility)
  - **Action** (3-5 bullet points, specific steps YOU took, with decision rationale)
  - **Result** (quantified outcomes + learning/principle)
- **Strength check**: What's strong about this story (green highlights)
- **Gap flags**: What's missing or weak (yellow/red flags with specific suggestions)
- **Competency tags**: Which behavioral questions this story answers well
- **Likely follow-ups**: 3-4 questions an interviewer would ask based on this story, so the student can prepare
- **Alternative framings**: "This story also works for [leadership/conflict/etc.] if you emphasize [specific angle]"
- Copy button + Try again with different framing

---

## Site Structure

```
mbakit.co/
  Landing page     -- hero + 4 tool cards + "Built by an MBA student, for MBA students"
  /cold-email      -- Cold Email Generator
  /thank-you       -- Thank You Note Writer
  /resume          -- Resume Bullet Sharpener
  /star            -- STAR Story Builder
  /about           -- Short about page (who built this, why, open to feedback)
```

### Landing Page
- Hero: "The MBA Toolkit" + one-liner tagline ("Sharp tools for the repetitive stuff. So you can focus on what matters.")
- 4 cards, each with: tool name, one-sentence description, "Use it" button
- No sign-up CTA. No email capture. Just tools.
- Footer: "Built by Vatsal Khemani, Wharton '28" + GitHub link

### Each Tool Page
- Clean layout: input form on top/left, output below/right
- Pre-filled example showing what good output looks like (so users understand the tool before trying)
- Generate button + Copy button + Try Again button
- Small "Tips" section (collapsible) with 3-4 expert tips for that skill (e.g., "The best cold emails are under 5 sentences")

---

## Phase 2 Ideas (Build at Wharton, Based on Real Demand)

Only build these if students actually ask for them:
- **Bid Strategizer**: Help allocate course bidding points based on priorities and demand estimates
- **Peer Feedback Writer**: Structure constructive feedback for mandatory team evaluations
- **Club App Essay Helper**: Draft application essays for competitive MBA clubs
- **Elevator Pitch Refiner**: Multiple versions of "tell me about yourself" for different contexts
- **Coffee Chat Prep**: Input a person's details, get smart questions and connection points
- **Case Math Trainer**: Quick mental math problems styled like case interviews

---

## README Structure

The README should be clean, welcoming, and human. Not a wall of badges and technical jargon. Structure:

1. **Hero**: Project name + one-line description + screenshot/gif of the tool in action
2. **What is this**: 2-3 sentences. A toolkit of free, no-sign-up tools for MBA students.
3. **The tools**: One paragraph per tool. What it does, why it's useful, one example.
4. **Built with**: Simple tech stack list. Not a giant table. Just: "Next.js, Tailwind, shadcn/ui, [AI model]"
5. **Run locally**: 3-4 commands max. Clone, install, add API key to .env, run. Anyone should be able to get it running in 2 minutes.
6. **Contributing**: "Got an idea for a tool? Open an issue. Built something? Open a PR." Keep it simple.
7. **About**: One paragraph about who built it and why.

No badges. No lengthy architecture diagrams. No "Table of Contents" for a 50-line README. Just clear, human writing.

---

## What NOT to Do

- **Don't add auth.** The moment someone needs to create an account, 80% of potential users leave.
- **Don't add a database.** These are stateless tools. If you need persistence later (saved emails, history), use localStorage.
- **Don't build a backend.** Client-side API calls are fine for this scale. Add a serverless function only if API key abuse becomes a real problem.
- **Don't optimize for SEO.** The distribution is word-of-mouth within MBA communities. If SEO matters later, add it later.
- **Don't add features nobody asked for.** Ship the 4 tools. See what people use. Add what people request. Kill what nobody touches.
- **Don't over-engineer the prompts.** Start with good prompts, ship, then iterate based on output quality. Perfect is the enemy of shipped.
- **Don't use AI-sounding language in any copy.** No "harness the power of AI." No "supercharge your recruiting." Write like a human.
- **Don't monetize yet.** Free is the growth strategy. Monetization is a Phase 3 problem.

---

## Builder Notes

- Use Claude's **frontend-design** skill for all UI/UX decisions. Every page should feel premium.
- Use **shadcn/ui** components as the base, customize colors and typography to feel unique.
- Mobile-first. MBA students will use this on their phones between classes and events.
- Dark mode + light mode. Default to system preference.
- Every tool should have a pre-filled example so users see the output quality before they type anything.
- Loading state while AI generates should feel smooth (skeleton or typing animation), not a spinner.
- Error states should be human ("Something went wrong. Try again?" not "Error 500: Internal Server Error").
- The AI prompts behind each tool ARE the product. They should be in clearly separated files (e.g., `/prompts/cold-email.ts`) so they're easy to iterate on.
