/**
 * Update selected Printify product titles/descriptions only.
 *
 * Usage:
 *   node scripts/printify/update-target-content.mjs --dry
 *   node scripts/printify/update-target-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRINTIFY = "https://api.printify.com/v1";
const DRY = process.argv.includes("--dry");

const CONTENT = {
  "6a2404648ca667581803202e": {
    title: "One Nation, One Team USA 2026 Soccer Tee",
    description:
      "For the fans who feel the anthem before the whistle. This USA 2026 soccer tee brings everyone under one flag, one team, and one shared summer of belief. A proud everyday shirt for watch parties, street celebrations, and anyone who wants to belong to the moment.",
  },
  "6a240312ebab40861f089e07": {
    title: "Here for '26 Kids USA Soccer Tee",
    description:
      "Made for the little supporter stepping into his first big 2026 soccer summer beside Dad. This kids heavy cotton tee is part of the father-and-son matching set: pair it with the Was There '94 Dad tee to turn family history into a new matchday memory.",
  },
  "6a240049beda42506c04c9af": {
    title: "Was There '94 Dad USA Soccer Tee",
    description:
      "For the dad who remembers 1994 and now gets to pass the feeling down in 2026. This unisex heavy cotton tee is part of the father-and-son matching set: pair it with the Here for '26 kids tee and wear the story together.",
  },
  "6a231f5b7eee7f279102d21e": {
    title: "America's Time 1994-2026 Soccer Tee",
    description:
      "From the memories of 1994 to the promise of 2026, this USA soccer tee is for fans who believe this summer belongs to all of us. Wear it for the watch party, the family gathering, and the feeling that your country is part of something bigger.",
  },
  "6a231090ea7700f32b032e58": {
    title: "America's Time USA Trophy Soccer Tee",
    description:
      "A bold USA soccer trophy tee for supporters ready to dream out loud. Built for 2026 pride, shared chants, and the feeling of standing with millions of fans who believe America's time is here.",
  },
};

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  return { ...env, ...process.env };
}

const ENV = loadEnv();
const TOKEN = ENV.PRINTIFY_API_TOKEN;
const SHOP = ENV.PRINTIFY_SHOP_ID;

if (!TOKEN || !SHOP) {
  throw new Error("Missing PRINTIFY_API_TOKEN / PRINTIFY_SHOP_ID");
}

async function pf(endpoint, options = {}) {
  const res = await fetch(`${PRINTIFY}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "fanzonstore",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Printify ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function updateProduct(id, next) {
  try {
    await pf(`/shops/${SHOP}/products/${id}.json`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("8252") && !message.includes("disabled for editing")) {
      throw error;
    }

    console.log("  unlock: clearing stale Printify publish lock");
    await pf(`/shops/${SHOP}/products/${id}/publishing_failed.json`, {
      method: "POST",
      body: JSON.stringify({
        reason: "Clearing stale publish lock before Fanzonstore content update.",
      }),
    });
    await pf(`/shops/${SHOP}/products/${id}.json`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  }
}

console.log(`${DRY ? "Dry-run" : "Updating"} ${Object.keys(CONTENT).length} selected Printify products`);

let changed = 0;
for (const [id, next] of Object.entries(CONTENT)) {
  const current = await pf(`/shops/${SHOP}/products/${id}.json`);
  const isChanged =
    current.title !== next.title || current.description?.replace(/<[^>]+>/g, "").trim() !== next.description;

  console.log(`\n${isChanged ? "update" : "skip"}: ${id}`);
  console.log(`  title: ${current.title} -> ${next.title}`);
  console.log(`  locked: ${current.is_locked === true}`);
  console.log(`  description: ${next.description}`);

  if (!isChanged) continue;
  changed += 1;
  if (!DRY) await updateProduct(id, next);
}

console.log(`\n${DRY ? "Would update" : "Updated"} ${changed} product(s).`);
