import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OWNER_EMAIL = "vatsalkhemani@gmail.com";

// Simple rate limiting: 10 feedback submissions per IP per hour
const ipCounts = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Feedback service is not configured." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { category, tool, message, name, contact } = body as {
    category?: string;
    tool?: string;
    message?: string;
    name?: string;
    contact?: string;
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { error: "Message is too long (max 5000 characters)." },
      { status: 400 }
    );
  }

  const categoryLabel = category || "general";
  const subject = `MBAKit Feedback: ${categoryLabel}${tool ? ` (${tool})` : ""}`;

  const htmlBody = `
    <h2>New MBAKit Feedback</h2>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Category</td><td>${escapeHtml(categoryLabel)}</td></tr>
      ${tool ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tool</td><td>${escapeHtml(tool)}</td></tr>` : ""}
      ${name ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">From</td><td>${escapeHtml(name)}</td></tr>` : ""}
      ${contact ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Contact</td><td>${escapeHtml(contact)}</td></tr>` : ""}
    </table>
    <hr/>
    <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
  `.trim();

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: "MBAKit Feedback <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send feedback. Please try the email fallback." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
