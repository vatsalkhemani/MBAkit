import { FIXTURES, Fixture } from "./fixtures";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = join(process.cwd(), "evals", "outputs");

async function runFixture(f: Fixture): Promise<{ ok: true; text: string; ms: number } | { ok: false; error: string }> {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: f.tool, userMessage: f.userMessage }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 400)}` };
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    return { ok: true, text, ms: Date.now() - started };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Running ${FIXTURES.length} fixtures against ${BASE_URL}\n`);

  const index: { id: string; tool: string; mode: string; label: string; status: string; ms?: number; file?: string; error?: string }[] = [];

  for (const f of FIXTURES) {
    process.stdout.write(`  [${f.id}] `);
    const result = await runFixture(f);
    if (result.ok) {
      const filePath = join(OUTPUT_DIR, `${f.id}.md`);
      const content = `# ${f.id}\n\n**Tool:** ${f.tool}\n**Mode:** ${f.mode}\n**Label:** ${f.label}\n**Latency:** ${result.ms}ms\n\n---\n\n## User message sent\n\n\`\`\`\n${f.userMessage}\n\`\`\`\n\n---\n\n## Model output\n\n${result.text}\n`;
      await writeFile(filePath, content, "utf8");
      index.push({ id: f.id, tool: f.tool, mode: f.mode, label: f.label, status: "ok", ms: result.ms, file: `outputs/${f.id}.md` });
      console.log(`ok (${result.ms}ms, ${result.text.length} chars)`);
    } else {
      index.push({ id: f.id, tool: f.tool, mode: f.mode, label: f.label, status: "error", error: result.error });
      console.log(`ERROR: ${result.error}`);
    }
  }

  await writeFile(join(OUTPUT_DIR, "_index.json"), JSON.stringify(index, null, 2), "utf8");
  console.log(`\nDone. Outputs in evals/outputs/`);

  const failed = index.filter(x => x.status === "error");
  if (failed.length > 0) {
    console.log(`\n${failed.length} fixture(s) failed:`);
    for (const x of failed) console.log(`  - ${x.id}: ${x.error}`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
