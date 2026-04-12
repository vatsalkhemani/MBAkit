const DAILY_LIMIT = 20;

function getKey(tool: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `mbakit_ratelimit_${tool}_${today}`;
}

export function checkRateLimit(tool: string): { allowed: boolean; remaining: number } {
  if (typeof window === "undefined") return { allowed: true, remaining: DAILY_LIMIT };
  const key = getKey(tool);
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  return { allowed: count < DAILY_LIMIT, remaining: DAILY_LIMIT - count };
}

export function incrementUsage(tool: string): void {
  if (typeof window === "undefined") return;
  const key = getKey(tool);
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(count + 1));
}
