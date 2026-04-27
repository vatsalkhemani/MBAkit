# MBAKit - Technical Architecture

## Overview

MBAKit is a Next.js 16 application using the App Router pattern. It's intentionally simple: a static frontend with one API route that proxies AI calls with streaming. No database, no auth, no backend complexity.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, Navbar, footer, OG metadata)
│   ├── page.tsx                # Landing page with tool cards
│   ├── globals.css             # Tailwind + shadcn theme tokens
│   ├── about/page.tsx          # About page
│   ├── cold-email/page.tsx     # Cold Email Generator
│   ├── linkedin/page.tsx       # LinkedIn Outreach
│   ├── thank-you/page.tsx      # Thank You Note Writer
│   ├── resume/page.tsx         # Resume Bullet Sharpener
│   ├── star/page.tsx           # STAR Story Builder
│   ├── coffee-chat/page.tsx    # Coffee Chat Prep
│   ├── feedback/page.tsx       # Feedback form
│   └── api/
│       └── generate/route.ts   # Streaming AI proxy (toolId-based, server-side rate limited)
├── components/
│   ├── navbar.tsx              # Navigation with mobile menu + theme toggle
│   ├── pill-select.tsx         # Pill-shaped button group for single-select options
│   ├── markdown-output.tsx     # React Markdown renderer for AI output
│   ├── history-panel.tsx       # Collapsible recent generations panel
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── ui/                     # shadcn/ui primitives (button, input, label, textarea)
├── lib/
│   ├── ai.ts                   # Client-side streaming fetch wrapper for /api/generate
│   ├── tools.ts                # Single source of truth for tool metadata (navbar + home)
│   ├── storage.ts              # Safe localStorage helpers (never throws)
│   ├── use-generation.ts       # Shared hook: generate, copy, download, history
│   ├── use-history.ts          # localStorage-based generation history (last 10 per tool)
│   ├── rate-limit.ts           # Client-side daily rate limiting
│   └── utils.ts                # cn() utility for Tailwind class merging
└── prompts/
    ├── cold-email.ts           # System prompt + input builder for cold emails
    ├── linkedin.ts             # System prompt + input builder for LinkedIn outreach
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
Tool page calls useGeneration hook → generate(toolId, userMessage)
    ↓
Client-side rate limit check (src/lib/rate-limit.ts)
    ↓
POST /api/generate with { toolId, userMessage }
    ↓
Server-side rate limit check (IP-based, 60 req/hr)
    ↓
Server maps toolId → system prompt (prompts never leave the server)
    ↓
API route streams from Gemini (streamGenerateContent?alt=sse)
    ↓
SSE chunks parsed → plain text streamed back to client
    ↓
onChunk callback updates UI progressively (token-by-token)
    ↓
Output saved to localStorage history (last 10 per tool)
```

### AI Architecture

Each tool has two exports in its prompt file:

1. **System prompt** (`*_SYSTEM_PROMPT`): Contains the expertise. Only imported server-side by the API route — never sent to or from the client.

2. **Prompt builder** (`build*Prompt`): Takes form inputs and formats them into a structured user message. Used client-side.

The API route (`/api/generate`) is a secure streaming proxy:
- Receives `toolId` + user message from the client
- Maps `toolId` to the correct system prompt server-side
- Applies IP-based rate limiting (60 req/hr)
- Validates input size (max 5000 chars)
- Calls Gemini Flash with `streamGenerateContent` (SSE mode)
- Parses SSE data chunks and streams plain text back to the client

### Shared Hook: useGeneration

The `useGeneration` hook encapsulates the shared lifecycle across all 6 tool pages:
- Rate limit checking + error display
- Loading/output state management
- Streaming generation via `generateWithAI`
- Copy-to-clipboard (with customizable extract function)
- Download as text file
- History integration (auto-saves to localStorage)

Each tool page still owns its own form, validation, and UI — the hook handles the generate/output/copy/download/history lifecycle.

### History

Each tool stores the last 10 generations in localStorage:

```
Key: mbakit_history_{tool}
Value: Array of { id, timestamp, preview, output }
```

Users can browse, expand, restore, or delete past generations from a collapsible panel at the bottom of each tool page.

### Rate Limiting

**Client-side** (UX friction, via localStorage):
```
Key format: mbakit_ratelimit_{tool}_{YYYY-MM-DD}
Value: integer count of uses today
Limit: 20 per tool per day
```

**Server-side** (abuse prevention, via in-memory IP tracking):
```
Limit: 60 requests per IP per hour
Resets on cold start (serverless function)
```

### Theme System

- Uses `next-themes` with `attribute="class"` strategy
- Defaults to system preference
- Toggle in navbar persists via next-themes (localStorage)
- All colors defined as CSS custom properties in `globals.css` (oklch color space)

### Data Persistence

All data is stored in the user's browser localStorage:

| Key | Purpose |
|-----|---------|
| `mbakit_sender` | Sender name + school (shared across cold-email, linkedin, thank-you) |
| `mbakit_ratelimit_*` | Daily usage counters per tool |
| `mbakit_history_*` | Last 10 generations per tool |

Nothing is sent to any server except the AI generation request itself.

---

## Adding a New Tool

1. Create the prompt file: `src/prompts/your-tool.ts`
   - Export a system prompt constant
   - Export a prompt builder function

2. Register in the API route: `src/app/api/generate/route.ts`
   - Import the system prompt
   - Add to `PROMPT_MAP`

3. Add to tool metadata: `src/lib/tools.ts`
   - Add entry with name, shortName, description, href, icon

4. Create the page: `src/app/your-tool/page.tsx`
   - Use `useGeneration` hook for the generate/copy/download/history lifecycle
   - Build your own form UI

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

All tool pages are statically generated. Only `/api/generate` runs as a serverless function.
