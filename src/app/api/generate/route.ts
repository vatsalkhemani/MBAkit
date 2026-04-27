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
const NVIDIA_MODEL = "mistralai/mistral-small-4-119b-2603";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Simple in-memory IP rate limiter (resets on cold start, good enough for abuse prevention)
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const SERVER_RATE_LIMIT = 60;
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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkServerRateLimit(ip)) {
      return Response.json(
        { error: "You've been generating a lot! Take a short break and try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { toolId, userMessage } = body;

    if (!toolId || !userMessage) {
      return Response.json(
        { error: "Missing toolId or message" },
        { status: 400 }
      );
    }

    const systemPrompt = PROMPT_MAP[toolId];
    if (!systemPrompt) {
      return Response.json({ error: "Unknown tool" }, { status: 400 });
    }

    if (
      typeof userMessage !== "string" ||
      userMessage.length > MAX_MESSAGE_LENGTH
    ) {
      return Response.json(
        { error: `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "API key not configured. Add NVIDIA_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const res = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.65,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      let message: string;
      if (res.status === 429) {
        message =
          "MBAKit is seeing high traffic right now. Please try again in a few minutes!";
      } else if (res.status === 402) {
        message =
          "MBAKit has hit its daily AI quota. Please come back in a few hours, we'll be back up soon!";
      } else if (res.status === 503 || res.status === 502) {
        message =
          "The AI service is temporarily down for maintenance. Please try again in a little while!";
      } else {
        message =
          "Something unexpected happened. Please try again, and if it keeps happening, let us know via the Feedback page!";
      }
      console.error("NVIDIA NIM API error:", res.status, err);
      return Response.json({ error: message }, { status: res.status });
    }

    if (!res.body) {
      return Response.json({ error: "No response from AI" }, { status: 502 });
    }

    // Parse OpenAI-compatible SSE stream and forward plain text to client
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
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  // Strip em-dashes from output (model sometimes ignores the prompt rule)
                  const cleaned = text.replaceAll("\u2014", ",");
                  controller.enqueue(new TextEncoder().encode(cleaned));
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
    return Response.json(
      { error: "Something unexpected happened. Please try again!" },
      { status: 500 }
    );
  }
}
