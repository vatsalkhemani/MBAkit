import { NextRequest } from "next/server";
import { COLD_EMAIL_SYSTEM_PROMPT } from "@/prompts/cold-email";
import { LINKEDIN_SYSTEM_PROMPT } from "@/prompts/linkedin";
import { THANK_YOU_SYSTEM_PROMPT } from "@/prompts/thank-you";
import { RESUME_SYSTEM_PROMPT } from "@/prompts/resume";
import { STAR_SYSTEM_PROMPT } from "@/prompts/star";
import { COFFEE_CHAT_SYSTEM_PROMPT } from "@/prompts/coffee-chat";

const PROMPT_MAP: Record<string, string> = {
  "cold-email": COLD_EMAIL_SYSTEM_PROMPT,
  linkedin: LINKEDIN_SYSTEM_PROMPT,
  "thank-you": THANK_YOU_SYSTEM_PROMPT,
  resume: RESUME_SYSTEM_PROMPT,
  star: STAR_SYSTEM_PROMPT,
  "coffee-chat": COFFEE_CHAT_SYSTEM_PROMPT,
};

const MAX_MESSAGE_LENGTH = 5000;

// Simple in-memory IP rate limiter (resets on cold start, but good enough for abuse prevention)
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const SERVER_RATE_LIMIT = 60; // requests per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkServerRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= SERVER_RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkServerRateLimit(ip)) {
      return Response.json(
        { error: "Too many requests. Try again in a bit." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { toolId, userMessage } = body;

    if (!toolId || !userMessage) {
      return Response.json({ error: "Missing toolId or message" }, { status: 400 });
    }

    const systemPrompt = PROMPT_MAP[toolId];
    if (!systemPrompt) {
      return Response.json({ error: "Unknown tool" }, { status: 400 });
    }

    if (typeof userMessage !== "string" || userMessage.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API key not configured. Add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message =
        res.status === 429
          ? "Lots of people using MBAKit right now. Try again in a few minutes."
          : "Something went wrong with the AI. Try again?";
      console.error("Gemini API error:", err);
      return Response.json({ error: message }, { status: res.status });
    }

    if (!res.body) {
      return Response.json({ error: "No response from AI" }, { status: 502 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("Generate error:", e);
    return Response.json({ error: "Something went wrong. Try again?" }, { status: 500 });
  }
}
