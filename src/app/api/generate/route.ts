import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userMessage } = await req.json();

    if (!systemPrompt || !userMessage) {
      return NextResponse.json({ error: "Missing prompt or message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.8,
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
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: "No response generated. Try again?" }, { status: 500 });
    }

    return NextResponse.json({ text });
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Something went wrong. Try again?" }, { status: 500 });
  }
}
