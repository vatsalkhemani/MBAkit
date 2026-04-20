# MBAKit

**Free, sharp tools for the repetitive stuff in MBA life.**

MBA students spend hours every week on cold emails, thank-you notes, resume rewrites, interview prep, and coffee chat research. MBAKit handles the repetitive parts so you can focus on what matters. Each tool encodes real expertise about what works in MBA recruiting, not generic AI output.

---

## The Tools

### Cold Email Generator
Write cold emails that actually get replies. Input your details and the recipient's context, get a 4-6 sentence email with a specific ask, credibility signal, and connection point. Career-switcher aware. The tool explains *why* the email works so you learn the pattern.

### Thank You Note Writer
Send the right follow-up within 24 hours. References specific things from your conversation, suggests value-adds, and matches tone to context (coffee chat vs. final round vs. info session vs. follow-up after intro).

### Resume Bullet Sharpener
Paste 1-5 bullets, get a diagnosis of what's strong and what's weak, plus 3 improved versions per bullet ranked from safe to strongest. Flags passive voice, missing quantification, vague impact, and buried leads. Translates non-traditional backgrounds (military, non-profit, engineering) into business language. Tailors to your target industry.

### STAR Story Builder
Describe a raw experience. Get back a structured Situation-Task-Action-Result story with strength checks, gap flags, competency tags, likely follow-up questions, and alternative framings. Supports Tech PM, Consulting, Amazon LP, and General Management interview formats.

### Coffee Chat Prep
Smart questions that show you did your homework. Input who you're meeting, get tailored questions based on their role, company, and seniority. Adapts for alumni vs. cold outreach, career switcher context, and what you want to learn.

---

## Screenshots

<div align="center">
  <img src="./screenshots/home.png" alt="MBAKit Home" width="800"/>
  <p><em>Home - All tools at a glance</em></p>
</div>

<div align="center">
  <img src="./screenshots/cold-email.png" alt="Cold Email Generator" width="800"/>
  <p><em>Cold Email Generator</em></p>
</div>

<div align="center">
  <img src="./screenshots/coffee-chat.png" alt="Coffee Chat Prep" width="800"/>
  <p><em>Coffee Chat Prep</em></p>
</div>

<div align="center">
  <img src="./screenshots/star.png" alt="STAR Story Builder" width="800"/>
  <p><em>STAR Story Builder</em></p>
</div>

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key ([get one free](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone the repository
git clone https://github.com/vatsalkhemani/mbakit.git
cd mbakit

# Install dependencies
npm install

# Add your API key
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to go.

---

## Technology Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **AI** | Google Gemini 3.1 Flash Lite (free tier, streaming) |
| **Hosting** | Vercel (free tier) |

No database. No auth. No tracking. One serverless API endpoint.

---

## Quality

Every tool is evaluated with an automated quality harness before shipping. Each prompt is tested against 15 realistic fixtures (both minimal-input and rich-input scenarios across different backgrounds, industries, and interview types). An LLM-as-judge scores each output on format compliance, hallucination control, sendability, voice, and tool-specific criteria. Every run is logged in [evals/RUNLOG.md](evals/RUNLOG.md) and the detailed reports live in [evals/reports/](evals/reports/).

Current status: see the latest row in the runlog. The shipping bar is **every fixture scoring GREAT** (all dimensions ≥4, majority at 5) across three consecutive runs. See [evals/METHODOLOGY.md](evals/METHODOLOGY.md) for how the evals work.

---

## Security

- API keys are stored server-side in `.env.local`, never exposed to the client
- `.env.local` is gitignored by default
- All AI calls are proxied through a Next.js API route

**Important:** Never commit your `.env.local` file.

---

## Author

**[Vatsal Khemani](https://www.linkedin.com/in/vatsal-khemani-39a483192)**
Product Manager at Microsoft. Incoming Wharton MBA, Class of 2028.
