/**
 * Sync short, emotional, SEO-friendly storefront content back to Printify.
 *
 * Usage:
 *   node scripts/printify/sync-content.mjs --dry
 *   node scripts/printify/sync-content.mjs
 *
 * Reads PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID from .env.local.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRINTIFY = "https://api.printify.com/v1";

function loadEnv() {
  const env = {};
  const file = path.join(ROOT, ".env.local");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  return { ...env, ...process.env };
}

const ENV = loadEnv();
const TOKEN = ENV.PRINTIFY_API_TOKEN;
const SHOP = ENV.PRINTIFY_SHOP_ID;
const DRY = process.argv.includes("--dry");

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

function stripHtml(s = "") {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function inferCategory(product) {
  const hay = `${product.title} ${(product.tags ?? []).join(" ")}`.toLowerCase();
  const has = (...words) => words.some((word) => hay.includes(word));
  if (has("hoodie", "sweatshirt", "sweater", "crewneck")) return "hoodies";
  if (has("mug", "drinkware", "bottle", "tumbler", "cup")) return "drinkware";
  if (has("cap", " hat", "beanie", "headwear", "snapback")) return "headwear";
  if (has("tote", "bag", "backpack", "pouch")) return "accessories";
  if (has("poster", "wall art", "canvas print", " print")) return "prints";
  if (has("jersey")) return "jerseys";
  return "tees";
}

function shortTitle(title, category) {
  const raw = title.trim();
  const lower = raw.toLowerCase();
  if (lower.includes("red white") && lower.includes("goal")) return "Red White Goal Tee";
  if (lower.includes("this time") && lower.includes("our house")) return "This Time Tee";
  if (lower.includes("our house") && lower.includes("eagle")) return "Our House Tee";
  if (lower.includes("american eagle")) return "Eagle Pride Tee";
  if (lower.includes("soccer ball") && lower.includes("flag")) return "Flag Goal Tee";

  const first = raw
    .split("|")[0]
    .replace(/\b(unisex|heavy|cotton|t-shirt|shirt|soccer|football|graphic|design)\b/gi, "")
    .replace(/[^\w\s'&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = first.split(" ").filter(Boolean).slice(0, 4).join(" ");
  if (words.length >= 8) return words;

  const fallback = {
    tees: "Fan Tee",
    hoodies: "Fan Hoodie",
    headwear: "Fan Cap",
    drinkware: "Fan Mug",
    prints: "Fan Print",
    accessories: "Fan Essential",
    jerseys: "Fan Jersey",
  };
  return fallback[category] ?? "Fan Gear";
}

function description(product, category, name) {
  const hay = `${product.title} ${(product.tags ?? []).join(" ")} ${stripHtml(product.description)}`.toLowerCase();
  const usa = /(usa|american|flag|eagle|red white|our house)/i.test(hay);
  const audience = usa ? "USA soccer fans" : "World Cup 2026 supporters";
  const categoryCopy = {
    tees:
      "soft fan tee made for watch parties, street celebrations, and every shout at the screen",
    hoodies:
      "warm supporter hoodie for late kickoffs, road trips, and cold nights when belief still runs hot",
    headwear:
      "easy fan cap for matchday errands, stadium queues, and every casual show of loyalty",
    drinkware:
      "ceramic fan mug for early kickoffs, post-match replays, and the mornings after big wins",
    prints:
      "soccer wall art for bedrooms, fan caves, and the corner of home that always feels like matchday",
    accessories:
      "matchday essential made to carry the colors, snacks, scarves, and small rituals fans never leave behind",
    jerseys:
      "breathable supporter layer for watch parties, summer streets, and standing with your side",
  };
  const original = stripHtml(product.description);
  const materialPatterns = {
    tees: /\b(100% cotton|heavy cotton|cotton|polyester)\b/i,
    hoodies: /\b(fleece|cotton|polyester)\b/i,
    drinkware: /\b(ceramic|mug)\b/i,
    accessories: /\b(canvas|cotton|polyester)\b/i,
    prints: /\b(poster|matte paper|paper)\b/i,
    jerseys: /\b(polyester|mesh|knit)\b/i,
    headwear: /\b(cotton|polyester|canvas)\b/i,
  };
  const materialHint = original.match(materialPatterns[category])?.[0];
  const material = materialHint ? ` with a ${materialHint} feel` : "";

  return `${name} is a ${categoryCopy[category] ?? categoryCopy.tees}${material}. Made for ${audience} who want more than merch: a piece of the 2026 soccer moment, a way to belong, and a reason to say you were there.`;
}

function nextContent(product) {
  const category = inferCategory(product);
  const title = shortTitle(product.title, category);
  return {
    title,
    description: description(product, category, title),
  };
}

async function listProducts() {
  const products = [];
  let page = 1;
  while (true) {
    const data = await pf(`/shops/${SHOP}/products.json?limit=50&page=${page}`);
    products.push(...(data.data ?? []));
    if (!data.next_page_url || (data.data ?? []).length === 0) break;
    page += 1;
  }
  return products;
}

function hasChanged(product, next) {
  return product.title !== next.title || stripHtml(product.description) !== next.description;
}

async function updateProduct(product, next) {
  try {
    return await pf(`/shops/${SHOP}/products/${product.id}.json`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("8252") && !message.includes("disabled for editing")) {
      throw error;
    }

    console.log("  unlock: clearing stale Printify publish lock");
    await pf(`/shops/${SHOP}/products/${product.id}/publishing_failed.json`, {
      method: "POST",
      body: JSON.stringify({
        reason: "Clearing stale publish lock before Fanzonstore content sync.",
      }),
    });
    return pf(`/shops/${SHOP}/products/${product.id}.json`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  }
}

const products = await listProducts();
console.log(`${DRY ? "Dry-run" : "Syncing"} ${products.length} Printify product(s)`);

let changed = 0;
for (const product of products) {
  const next = nextContent(product);
  const shouldUpdate = hasChanged(product, next);
  const status = shouldUpdate ? "update" : "skip";
  console.log(`\n${status}: ${product.id}`);
  console.log(`  title: ${product.title} -> ${next.title}`);
  console.log(`  visible: ${product.visible}`);
  console.log(`  description: ${next.description}`);
  if (!shouldUpdate) continue;
  changed += 1;
  if (!DRY) await updateProduct(product, next);
}

console.log(`\n${DRY ? "Would update" : "Updated"} ${changed} product(s).`);
