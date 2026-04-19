# MBAKit - Technical Architecture

## Overview

MBAKit is a Next.js 16 application using the App Router pattern. It's intentionally simple: a static frontend with one API route that proxies AI calls with streaming. No database, no auth, no backend complexity.

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
│   ├── coffee-chat/page.tsx    # Coffee Chat Prep
│   └── api/
│       └── generate/route.ts   # Streaming AI proxy endpoint (Gemini 3.1 Flash Lite)
├── components/
│   ├── navbar.tsx              # Navigation with mobile menu + theme toggle
│   ├── pill-select.tsx         # Pill-shaped button group for single-select options
│   ├── markdown-output.tsx     # React Markdown renderer for AI output
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── ui/                     # shadcn/ui components (button, card, input, etc.)
├── lib/
│   ├── ai.ts                   # Client-side streaming fetch wrapper for /api/generate
│   ├── rate-limit.ts           # localStorage-based daily rate limiting
│   └── utils.ts                # cn() utility for Tailwind class merging
└── prompts/
    ├── cold-email.ts           # System prompt + input builder for cold emails
    ├── thank-you.ts            # System prompt + input builder for thank-you notes
    ├── resume.ts               # System prompt + input builder for resume bullets
    ├── star.ts                 # System prompt + input builder for STAR stories
    └── coffee-chat.ts          # System prompt + input builder for coffee chat prep
```

---

## How It Works

### Request Flow

```
User fills form → clicks Generate
    ↓
Tool page calls generateWithAI(systemPrompt, userMessage, onChunk)
    ↓
Client-side rate limit check (src/lib/rate-limit.ts)
    ↓
POST /api/generate with { systemPrompt, userMessage }
    ↓
API route streams from Gemini (streamGenerateContent?alt=sse)
    ↓
SSE chunks parsed → plain text streamed back to client
    ↓
onChunk callback updates UI progressively (token-by-token)
```

### AI Architecture

Each tool has two exports in its prompt file:

1. **System prompt** (`*_SYSTEM_PROMPT`): Contains the expertise. What makes a great cold email, what to flag in a resume bullet, how to structure a STAR story. This is where the real value lives. These prompts encode specific patterns, anti-patterns, and MBA-context knowledge.

2. **Prompt builder** (`build*Prompt`): Takes the form inputs and formats them into a structured user message. Handles optional fields gracefully.

The API route (`/api/generate`) is a streaming proxy:
- Receives system prompt + user message from the client
- Calls Gemini Flash with `streamGenerateContent` (SSE mode)
- Parses SSE data chunks and streams plain text back to the client
- Handles errors with human-readable messages (never raw API errors)

### Streaming

The client-side `generateWithAI()` accepts an optional `onChunk` callback. When provided:
- The response body is read as a stream
- Each chunk is decoded and appended to the accumulated text
- `onChunk(fullTextSoFar)` is called on each chunk, which updates React state
- The UI renders progressively as tokens arrive

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
   - Form with PillSelect for options, Input/Textarea for text
   - Call `generateWithAI(systemPrompt, builtPrompt, setOutput)` for streaming
   - Include rate limit checks, copy button, try again, and tips

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
