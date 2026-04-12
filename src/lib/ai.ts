export async function generateWithAI(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Something went wrong. Try again?");
  }

  const data = await res.json();
  return data.text;
}
