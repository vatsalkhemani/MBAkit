# MBAKit - Technical Architecture

## Overview

MBAKit is a Next.js 16 application using the App Router pattern. It's intentionally simple: a static frontend with one API route that proxies AI calls. No database, no auth, no backend complexity.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, Navbar, footer)
│   ├── page.tsx                # Landing page with tool cards
│   ├── globals.css             # Tailwind + shadcn theme tokens
│   ├── about/page.tsx          # About page
│   ├── cold-email/page.tsx     # Cold Email Generator
│   ├── thank-you/page.tsx      # Thank You Note Writer
│   ├── resume/page.tsx         # Resume Bullet Sharpener
│   ├── star/page.tsx           # STAR Story Builder
│   └── api/
│       └── generate/route.ts   # AI proxy endpoint (Gemini Flash)
├── components/
│   ├── navbar.tsx              # Navigation with mobile menu + theme toggle
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── ui/                     # shadcn/ui components (button, card, input, etc.)
├── lib/
│   ├── ai.ts                   # Client-side fetch wrapper for /api/generate
│   ├── rate-limit.ts           # localStorage-based daily rate limiting
│   └── utils.ts                # cn() utility for Tailwind class merging
└── prompts/
    ├── cold-email.ts           # System prompt + input builder for cold emails
    ├── thank-you.ts            # System prompt + input builder for thank-you notes
    ├── resume.ts               # System prompt + input builder for resume bullets
    └── star.ts                 # System prompt + input builder for STAR stories
```

---

## How It Works

### Request Flow

```
User fills form → clicks Generate
    ↓
Tool page calls generateWithAI() (src/lib/ai.ts)
    ↓
Client-side rate limit check (src/lib/rate-limit.ts)
    ↓
POST /api/generate with { systemPrompt, userMessage }
    ↓
API route (src/app/api/generate/route.ts)
    ↓
Gemini Flash API (generativelanguage.googleapis.com)
    ↓
Response text returned to client → rendered in output panel
```

### AI Architecture

Each tool has two exports in its prompt file:

1. **System prompt** (`*_SYSTEM_PROMPT`): Contains the expertise. What makes a great cold email, what to flag in a resume bullet, how to structure a STAR story. This is where the real value lives. These prompts encode specific patterns, anti-patterns, and MBA-context knowledge.

2. **Prompt builder** (`build*Prompt`): Takes the form inputs and formats them into a structured user message. Handles optional fields gracefully.

The API route (`/api/generate`) is a thin proxy:
- Receives system prompt + user message from the client
- Calls Gemini Flash with those prompts
- Returns the generated text
- Handles errors with human-readable messages (never raw API errors)

### Rate Limiting

Client-side only, via localStorage:

```
Key format: mbakit_ratelimit_{tool}_{YYYY-MM-DD}
Value: integer count of uses today
Limit: 20 per tool per day
```

This isn't meant to be abuse-proof (localStorage is clearable). It's a soft cap to prevent one person from burning the shared Gemini quota accidentally.

### Theme System

- Uses `next-themes` with `attribute="class"` strategy
- Defaults to system preference
- Toggle in navbar persists via next-themes (localStorage)
- All colors defined as CSS custom properties in `globals.css` (oklch color space)
- shadcn/ui components automatically respect the theme

### Data Persistence

The only data stored is in the user's browser localStorage:

| Key | Purpose |
|-----|---------|
| `mbakit_sender` | Sender name + school (shared across cold-email and thank-you tools) |
| `mbakit_ratelimit_*` | Daily usage counters per tool |

Nothing is sent to any server except the AI generation request itself.

---

## Adding a New Tool

1. Create the prompt file: `src/prompts/your-tool.ts`
   - Export a system prompt constant with the expertise
   - Export a prompt builder function that takes form inputs

2. Create the page: `src/app/your-tool/page.tsx`
   - "use client" directive (all tool pages are client components)
   - Form inputs on the left, output on the right (responsive)
   - Call `generateWithAI()` with your system prompt + built prompt
   - Include rate limit checks, copy button, try again, and collapsible tips

3. Add to navbar: `src/components/navbar.tsx` (tools array)

4. Add to landing page: `src/app/page.tsx` (tools array)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key ([get one free](https://aistudio.google.com/apikey)) |

---

## Deployment

Built for Vercel free tier:

```bash
npm run build   # Produces static pages + one serverless function (/api/generate)
```

All tool pages are statically generated. Only `/api/generate` runs as a serverless function. This keeps costs at zero and response times fast.
