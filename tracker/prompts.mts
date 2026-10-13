// Prompt generator: drafts a buyer-question list for a client, for you to review and apply.
//
//   npm run prompts -- acme               draft ~150 prompts into tracker/clients/acme.prompts-draft.txt
//   npm run prompts -- acme --count 50    a different number (e.g. 20-30 for a free audit)
//   npm run prompts -- acme --apply       copy the (edited) draft into acme.json's "prompts"
//
// With OPENAI_API_KEY set, an AI writes the draft. Without it, templates fill it in from the client's
// category, audience, products and competitors (free). Either way: read it, edit it, then --apply.
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { ClientConfig } from "./types.mts"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const CLIENTS_DIR = path.join(ROOT, "clients")

const args = process.argv.slice(2)
const slug = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--count")
const countIndex = args.indexOf("--count")
const COUNT = countIndex >= 0 ? Number(args[countIndex + 1]) : 150
const apply = args.includes("--apply")

type Group = { intent: string; prompts: string[] }

// --- Templates (no API needed) -------------------------------------------------------------

function templatePrompts(client: ClientConfig, count: number): Group[] {
  const c = client.category!.trim()
  const year = new Date().getFullYear()
  const audiences = client.audience ?? []
  const products = client.products ?? []
  const rivals = client.competitors.map((r) => r.name)

  const groups: Group[] = [
    {
      intent: "Best-of and recommendations",
      prompts: [
        `What's the best ${c}?`,
        `Who are the top ${c}s right now?`,
        `Which ${c} would you recommend?`,
        `What are the most trusted ${c}s?`,
        `Top-rated ${c}s in ${year}`,
        `What ${c} do experts recommend?`,
        `Which ${c} has the best reviews?`,
      ],
    },
    {
      intent: "By audience and use case",
      prompts: audiences.flatMap((a) => [`Best ${c} for ${a}`, `Which ${c} is good for ${a}?`, `What ${c} do ${a} use?`]),
    },
    {
      intent: "Products and services",
      prompts: products.flatMap((p) => [`Who offers the best ${p}?`, `Best ${p} provider`, `Where can I get ${p}?`]),
    },
    {
      intent: "Alternatives to competitors",
      prompts: rivals.flatMap((r) => [`What are the best alternatives to ${r}?`, `Is there something better than ${r}?`, `Is ${r} worth it?`]),
    },
    {
      intent: "Comparisons",
      prompts: rivals.flatMap((r, i) => rivals.slice(i + 1).map((r2) => `${r} vs ${r2}: which is better?`)),
    },
    {
      intent: "Pricing and value",
      prompts: [`How much does a ${c} cost?`, `Affordable ${c} that's still good`, `Is a ${c} worth the money?`, `Cheapest good ${c}`],
    },
    {
      intent: "Choosing and problems",
      prompts: [
        `How do I choose a ${c}?`,
        `What should I look for in a ${c}?`,
        `What questions should I ask a ${c} before hiring?`,
        `Signs you need a ${c}`,
        `What are common mistakes when choosing a ${c}?`,
      ],
    },
  ]

  // Not enough yet? Add variations of the best-of questions until we reach the count.
  const modifiers = [" for a small business", " for a growing team", " on a budget", " in the US", " with great support", " for beginners"]
  const extra: string[] = []
  for (const m of modifiers) for (const p of groups[0].prompts) extra.push(p.replace(/\?$/, "") + m + (p.endsWith("?") ? "?" : ""))
  groups.push({ intent: "Variations", prompts: extra })

  // Trim to the count, keeping every group represented.
  let total = 0
  return groups
    .map((g) => ({ ...g, prompts: [...new Set(g.prompts)] }))
    .map((g) => {
      const take = Math.max(0, Math.min(g.prompts.length, count - total))
      total += take
      return { ...g, prompts: g.prompts.slice(0, take) }
    })
    .filter((g) => g.prompts.length)
}

// --- AI-written draft (with OPENAI_API_KEY) ------------------------------------------------

async function aiPrompts(client: ClientConfig, count: number): Promise<Group[]> {
  const brief = [
    `Business: ${client.name} (${client.website}), but NEVER mention this brand in the questions.`,
    `What they sell: ${client.category}`,
    client.audience?.length ? `Customers: ${client.audience.join(", ")}` : "",
    client.products?.length ? `Products/services: ${client.products.join(", ")}` : "",
    client.competitors.length ? `Competitors (may appear in comparison and alternative questions): ${client.competitors.map((c) => c.name).join(", ")}` : "",
  ].filter(Boolean).join("\n")

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input:
        `Write ${count} realistic questions a potential customer would type into ChatGPT or Google AI while choosing a provider like this. ` +
        `Use buyers' own words, mix short and long phrasings, and group them by intent (best-of, by audience/use case, alternatives, comparisons, pricing, choosing/problems, local or industry-specific). ` +
        `Questions must be ones where an AI answer would recommend specific companies.\n\n${brief}`,
      text: {
        format: {
          type: "json_schema",
          name: "prompt_groups",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["groups"],
            properties: {
              groups: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["intent", "prompts"],
                  properties: { intent: { type: "string" }, prompts: { type: "array", items: { type: "string" } } },
                },
              },
            },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as { output?: { type: string; content?: { type: string; text?: string }[] }[] }
  const raw = data.output?.flatMap((o) => (o.type === "message" ? (o.content ?? []) : [])).find((c) => c.type === "output_text")?.text
  if (!raw) throw new Error("OpenAI returned no prompts")
  const groups = (JSON.parse(raw) as { groups: Group[] }).groups

  // Safety net: drop any question that slipped in the client's own brand name.
  const brand = [client.name, ...(client.aliases ?? [])].map((b) => b.toLowerCase())
  return groups.map((g) => ({ ...g, prompts: g.prompts.filter((p) => !brand.some((b) => p.toLowerCase().includes(b))) }))
}

// --- main ----------------------------------------------------------------------------------

async function main() {
  if (!slug) throw new Error("Which client? e.g. npm run prompts -- acme   (the file name in tracker/clients, without .json)")
  const clientPath = path.join(CLIENTS_DIR, `${slug}.json`)
  const client = JSON.parse(await readFile(clientPath, "utf8")) as ClientConfig
  const draftPath = path.join(CLIENTS_DIR, `${slug}.prompts-draft.txt`)

  if (apply) {
    const lines = (await readFile(draftPath, "utf8")).split("\n").map((l) => l.trim())
    const prompts = [...new Set(lines.filter((l) => l && !l.startsWith("#")))]
    if (!prompts.length) throw new Error(`${path.relative(process.cwd(), draftPath)} has no prompts in it.`)
    if (client.prompts?.length) {
      const backup = path.join(CLIENTS_DIR, `${slug}.prompts-backup-${new Date().toLocaleDateString("en-CA")}.txt`)
      await writeFile(backup, client.prompts.join("\n") + "\n")
      console.log(`Old prompts backed up to ${path.relative(process.cwd(), backup)}`)
    }
    await writeFile(clientPath, JSON.stringify({ ...client, prompts }, null, 2) + "\n")
    console.log(`Applied ${prompts.length} prompts to ${path.relative(process.cwd(), clientPath)}`)
    return
  }

  if (!client.category) {
    throw new Error(`Add a "category" to ${path.relative(process.cwd(), clientPath)} first (what they sell, e.g. "bookkeeping firm"). "audience" and "products" help too.`)
  }

  const useAI = Boolean(process.env.OPENAI_API_KEY)
  const groups = useAI ? await aiPrompts(client, COUNT) : templatePrompts(client, COUNT)
  const total = groups.reduce((n, g) => n + g.prompts.length, 0)

  const body = [
    `# Draft prompts for ${client.name}, ${new Date().toLocaleDateString("en-CA")} (${useAI ? "written by AI" : "from templates"})`,
    `# One question per line. Edit freely: delete weak ones, add your own. Lines starting with # are ignored.`,
    `# When it looks right: npm run prompts -- ${slug} --apply`,
    "",
    ...groups.flatMap((g) => [`# ${g.intent}`, ...g.prompts, ""]),
  ].join("\n")
  await writeFile(draftPath, body)

  console.log(`Drafted ${total} prompts (${useAI ? "AI" : "templates; add OPENAI_API_KEY for AI-written ones"})`)
  for (const g of groups) console.log(`  ${g.prompts.length.toString().padStart(3)}  ${g.intent}`)
  console.log(`\nReview and edit: ${path.relative(process.cwd(), draftPath)}`)
  console.log(`Then apply:      npm run prompts -- ${slug} --apply`)
  if (total < COUNT) console.log(`\nOnly ${total} of ${COUNT}: add more "audience", "products" or competitors to the client file for more variety.`)
}

main().catch((err) => {
  console.error(`\nPrompt generator failed: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
