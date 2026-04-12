# MBAKit

**Free, sharp tools for the repetitive stuff in MBA life.**

MBAKit is a toolkit built for MBA students who spend hours every week writing cold emails, thank-you notes, resume bullets, and interview stories. Each tool encodes real expertise about what works in MBA recruiting — not generic AI wrappers. No sign-up, no paywall, no data collection. Just use it.

---

## The Tools

### Cold Email Generator
Write cold emails that actually get replies. Inputs your details and the recipient's context, outputs a 4-6 sentence email with a specific ask, credibility signal, and connection point. Explains *why* the email works so you learn the pattern.

### Thank You Note Writer
Send the right follow-up within 24 hours. References specific things from your conversation, suggests value-adds, and matches tone to context (coffee chat vs. final round vs. info session). Includes a pro tip for each situation.

### Resume Bullet Sharpener
Paste 1-5 bullets, get a diagnosis of what's strong and what's weak, plus 3 improved versions per bullet ranked from safe to strongest. Flags passive voice, missing quantification, vague impact, and buried leads. Tailors to your target industry.

### STAR Story Builder
Dump a messy description of something you did. Get back a structured Situation-Task-Action-Result story with strength checks, gap flags, competency tags, likely follow-up questions, and alternative framings. Built for behavioral interview prep.

---

## Screenshots

*Coming soon*

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
| **AI** | Google Gemini 2.0 Flash Lite (free tier) |
| **Hosting** | Vercel (free tier) |
| **Auth** | None (zero friction by design) |
| **Database** | None (stateless tools, localStorage for preferences) |

For detailed technical documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Cost

MBAKit is designed to cost essentially nothing to run:

- **Gemini Flash Lite free tier** covers the first 50-100 daily active users at zero cost
- **Client-side rate limiting** (20 uses/tool/day) prevents abuse
- If the free tier is exceeded, a friendly message appears and expert tips remain visible
- Estimated cost at full Wharton class scale (~900 users): ~$80/month

---

## Contributing

Got an idea for a tool? Open an issue. Built something? Open a PR.

---

## Security

- API keys are stored server-side in `.env.local`, never exposed to the client
- `.env.local` is gitignored by default
- No user data is collected or stored on any server
- All AI calls are proxied through a Next.js API route

**Important:** Never commit your `.env.local` file.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture, project structure, and how to add new tools

---

## Author

**Vatsal Khemani**
Product Manager at Microsoft. Incoming Wharton MBA, Class of 2028.

---

Built for MBA students, by an MBA student.
