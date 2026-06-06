/**
 * Sync Fanzonstore retail prices back to Printify.
 *
 * Usage:
 *   node scripts/printify/sync-prices.mjs --dry
 *   node scripts/printify/sync-prices.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRINTIFY = "https://api.printify.com/v1";

const PRICE_BY_TITLE = new Map([
  ["Red White Goal Tee", 3999],
  ["This Time Tee", 3999],
  ["Our House Tee", 2999],
]);

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

function desiredPrice(product) {
  return PRICE_BY_TITLE.get(product.title);
}

function nextVariants(product, price) {
  return (product.variants ?? []).map((variant) => ({
    id: variant.id,
    price,
    is_enabled: variant.is_enabled !== false,
  }));
}

function enabledPriceSummary(product) {
  const enabled = (product.variants ?? []).filter((variant) => variant.is_enabled !== false);
  return [...new Set(enabled.map((variant) => variant.price))].sort((a, b) => a - b);
}

async function unlockAndUpdate(product, variants) {
  try {
    return await pf(`/shops/${SHOP}/products/${product.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ variants }),
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
        reason: "Clearing stale publish lock before Fanzonstore price sync.",
      }),
    });
    return pf(`/shops/${SHOP}/products/${product.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ variants }),
    });
  }
}

const products = await listProducts();
console.log(`${DRY ? "Dry-run" : "Syncing"} prices for ${products.length} Printify product(s)`);

let changed = 0;
for (const product of products) {
  const price = desiredPrice(product);
  if (!price) {
    console.log(`\nskip: ${product.title} (${product.id}) no target price`);
    continue;
  }

  const current = enabledPriceSummary(product);
  const shouldUpdate = current.some((value) => value !== price) || current.length !== 1;
  console.log(`\n${shouldUpdate ? "update" : "skip"}: ${product.title} (${product.id})`);
  console.log(`  current enabled prices: ${current.map((value) => `$${(value / 100).toFixed(2)}`).join(", ")}`);
  console.log(`  target price: $${(price / 100).toFixed(2)}`);

  if (!shouldUpdate) continue;
  changed += 1;
  if (!DRY) await unlockAndUpdate(product, nextVariants(product, price));
}

console.log(`\n${DRY ? "Would update" : "Updated"} ${changed} product(s).`);
