/**
 * Automated POD catalog builder.
 *
 *   gpt-image-2  ->  Printify upload  ->  create product  ->  publish
 *
 * For each item in PLAN: generate transparent print artwork, upload it to
 * Printify, create a product on a real blueprint/print-provider with priced
 * variants, place the art on the front, and publish it to the shop.
 *
 * Usage:
 *   node scripts/printify/build-catalog.mjs            # build the whole PLAN
 *   node scripts/printify/build-catalog.mjs --limit 1  # pilot: first item only
 *   node scripts/printify/build-catalog.mjs --dry      # generate art only, no Printify writes
 *
 * Reads OPENAI_API_KEY, PRINTIFY_API_TOKEN, PRINTIFY_SHOP_ID from .env.local.
 * Writes a manifest to lib/printify-catalog.json and design PNGs to public/images/designs/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

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
const OPENAI_KEY = ENV.OPENAI_API_KEY;
const TOKEN = ENV.PRINTIFY_API_TOKEN;
const SHOP = ENV.PRINTIFY_SHOP_ID;

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const LIMIT = args.includes("--limit")
  ? Number(args[args.indexOf("--limit") + 1])
  : Infinity;

const PRINTIFY = "https://api.printify.com/v1";

// ---- product plan: one full "general store" theme -------------------------
const PLAN = [
  {
    key: "classic-2026-tee",
    blueprint: 6, // Unisex Heavy Cotton Tee (Gildan)
    category: "tees",
    name: "Classic Tee",
    badge: "Bestseller",
    price: 3200,
    description:
      "A World Cup 2026 fan tee for supporters who feel every pass, every roar, and every heartbeat before kickoff. Made for watch parties, street celebrations, and belonging to the soccer summer.",
    colors: ["White", "Black", "Sport Grey"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    scale: 0.82,
    design:
      "Bold screen-print graphic on a fully transparent background, centered, no garment, no mockup. A gold World Cup trophy emblem above a clean ribbon banner reading 'WORLD CUP 2026', flanked by minimal emerald-green laurels and three small stars. Vector style, high contrast, crisp edges, limited palette of emerald green, gold and off-white. Nothing outside the artwork.",
  },
  {
    key: "champions-hoodie",
    blueprint: 77, // Unisex Heavy Blend Hooded Sweatshirt (Gildan)
    category: "hoodies",
    name: "Champions Hoodie",
    badge: "New",
    price: 6400,
    description:
      "A warm World Cup 2026 supporter hoodie for late kickoffs, road trips, and cold nights when belief still runs hot.",
    colors: ["Black", "Dark Heather", "Navy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    scale: 0.42,
    placementY: 0.34,
    design:
      "Small chest-crest graphic on a fully transparent background, centered, no garment. A circular gold crest with a soccer ball and 'USA 26' text, emerald-green and gold, clean vector emblem, high contrast. Nothing outside the artwork.",
  },
  {
    key: "golden-goal-mug",
    blueprint: 68, // Mug 11oz
    category: "drinkware",
    name: "Golden Goal Mug",
    price: 1800,
    description:
      "A glossy World Cup 2026 fan mug for early kickoffs, post-match replays, and the mornings after big wins.",
    colors: [],
    sizes: [],
    scale: 1.0,
    design:
      "Wrap-around mug print artwork on a transparent background, a horizontal emerald and gold World Cup 2026 pattern band with a centered gold trophy and 'WORLD CUP 2026' text, repeating subtle star motif on the sides, clean vector, high contrast.",
  },
  {
    key: "supporter-tote",
    blueprint: 553, // Cotton Tote Bag
    category: "accessories",
    name: "Supporter Tote",
    price: 2200,
    description:
      "A sturdy soccer fan tote for snacks, scarves, extra layers, and the small rituals that make matchday feel like matchday.",
    colors: [],
    sizes: [],
    scale: 0.9,
    design:
      "Minimalist single-color screen-print graphic on a fully transparent background, centered, dark ink: a line-art soccer ball with 'WORLD CUP 2026' in a bold condensed typeface beneath it and a small 'USA · CAN · MEX' line, clean vector, no background.",
  },
  {
    key: "stadium-poster",
    blueprint: 282, // Matte Vertical Poster
    category: "prints",
    name: "Stadium Nights Print",
    badge: "Limited",
    price: 2400,
    description:
      "World Cup 2026 soccer wall art for the fan room, bedroom, or office corner that always feels like matchday.",
    colors: [],
    sizes: [],
    scale: 1.0,
    design:
      "A full-bleed vertical poster artwork (not a mockup): a bold geometric celebration of World Cup 2026 across the USA, Canada and Mexico, emerald green, gold and deep ink, stylised stadium and confetti, modern editorial sports-poster style, 'WORLD CUP 2026' headline. Fill the whole frame.",
  },
  {
    key: "unity-cap",
    blueprint: 1108, // Low Profile Baseball Cap
    category: "headwear",
    name: "Unity Cap",
    price: 2800,
    description:
      "An easy World Cup 2026 supporter cap for everyday pride, stadium queues, and casual matchday loyalty.",
    colors: [],
    sizes: [],
    scale: 0.5,
    placementY: 0.42,
    design:
      "Small embroidered-style cap front emblem on a fully transparent background, centered, no cap: a compact gold trophy with a tiny emerald banner reading '2026', clean vector emblem, bold, high contrast. Nothing outside the artwork.",
  },
];

// ---- helpers ---------------------------------------------------------------
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
    throw new Error(`Printify ${endpoint} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function generateDesign(item) {
  const dir = path.join(ROOT, "public", "images", "designs");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${item.key}.png`);
  if (fs.existsSync(out)) {
    console.log(`  · design cached ${item.key}.png`);
    return fs.readFileSync(out).toString("base64");
  }
  // posters fill a vertical frame (gpt-image-2); print graphics need a
  // transparent background which only gpt-image-1 supports.
  const isPoster = item.category === "prints";
  const body = isPoster
    ? { model: "gpt-image-2", prompt: item.design, size: "1024x1536", quality: "high", n: 1 }
    : { model: "gpt-image-1", prompt: item.design, size: "1024x1024", quality: "high", n: 1, background: "transparent" };
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI image: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log(`  · generated ${item.key}.png`);
  return b64;
}

function pickVariants(allVariants, item) {
  const wantColor = (t) =>
    item.colors.length === 0 ||
    item.colors.some((c) => t.toLowerCase().includes(c.toLowerCase()));
  const wantSize = (t) =>
    item.sizes.length === 0 ||
    item.sizes.some((s) => {
      // match size as a whole token e.g. "/ M", "/ 2XL"
      const re = new RegExp(`(^|[/\\s])${s.replace(/[+]/g, "\\+")}($|[/\\s])`, "i");
      return re.test(t);
    });
  let chosen = allVariants.filter((v) => wantColor(v.title) && wantSize(v.title));
  if (chosen.length === 0) chosen = allVariants.slice(0, 10);
  // cap to keep product tidy
  return chosen.slice(0, 24);
}

async function buildItem(item) {
  console.log(`\n▶ ${item.name} (${item.key})`);
  const b64 = await generateDesign(item);
  if (DRY) {
    console.log("  · --dry: skipping Printify writes");
    return null;
  }

  // 1. resolve print provider + variants for the blueprint
  const providers = await pf(`/catalog/blueprints/${item.blueprint}/print_providers.json`);
  const providerId = providers[0].id;
  const variantData = await pf(
    `/catalog/blueprints/${item.blueprint}/print_providers/${providerId}/variants.json`,
  );
  const placeholderPos =
    variantData.variants[0].placeholders.find((p) => p.position === "front")?.position ||
    variantData.variants[0].placeholders[0].position;
  const chosen = pickVariants(variantData.variants, item);
  console.log(`  · provider ${providerId}, ${chosen.length} variants, placeholder "${placeholderPos}"`);

  // 2. upload the artwork
  const upload = await pf(`/uploads/images.json`, {
    method: "POST",
    body: JSON.stringify({ file_name: `${item.key}.png`, contents: b64 }),
  });
  console.log(`  · uploaded image ${upload.id}`);

  // 3. create the product
  const variantIds = chosen.map((v) => v.id);
  const product = await pf(`/shops/${SHOP}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: item.name,
      description: item.description,
      blueprint_id: item.blueprint,
      print_provider_id: providerId,
      tags: ["world-cup-2026", `category:${item.category}`, ...(item.badge ? [`badge:${item.badge}`] : [])],
      variants: chosen.map((v) => ({ id: v.id, price: item.price, is_enabled: true })),
      print_areas: [
        {
          variant_ids: variantIds,
          placeholders: [
            {
              position: placeholderPos,
              images: [
                {
                  id: upload.id,
                  x: 0.5,
                  y: item.placementY ?? 0.5,
                  scale: item.scale,
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
    }),
  });
  console.log(`  · created product ${product.id}`);

  // 4. publish
  try {
    await pf(`/shops/${SHOP}/products/${product.id}/publish.json`, {
      method: "POST",
      body: JSON.stringify({
        title: true, description: true, images: true,
        variants: true, tags: true, keyFeatures: true, shipping_template: true,
      }),
    });
    console.log(`  · published`);
  } catch (e) {
    console.log(`  · publish note: ${e.message.slice(0, 120)}`);
  }

  return {
    key: item.key,
    printifyId: product.id,
    category: item.category,
    badge: item.badge ?? null,
  };
}

async function main() {
  if (!TOKEN || !SHOP) throw new Error("Missing PRINTIFY_API_TOKEN / PRINTIFY_SHOP_ID");
  if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
  // resume: load existing manifest, skip keys already created (unless --force)
  const manifestFile = path.join(ROOT, "lib", "printify-catalog.json");
  const existing = fs.existsSync(manifestFile)
    ? JSON.parse(fs.readFileSync(manifestFile, "utf8"))
    : [];
  const done = new Set(args.includes("--force") ? [] : existing.map((e) => e.key));
  const items = PLAN.filter((p) => !done.has(p.key)).slice(
    0,
    LIMIT === Infinity ? PLAN.length : LIMIT,
  );
  console.log(
    `Building ${items.length} product(s)${DRY ? " (dry run)" : ""}` +
      `${done.size ? `, skipping ${done.size} already done` : ""}...`,
  );
  const manifest = [...existing];
  for (const item of items) {
    try {
      const r = await buildItem(item);
      if (r) manifest.push(r);
    } catch (e) {
      console.error(`✗ ${item.key}: ${e.message}`);
    }
  }
  if (!DRY && manifest.length) {
    const file = path.join(ROOT, "lib", "printify-catalog.json");
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
    console.log(`\n✓ wrote ${manifest.length} entries to lib/printify-catalog.json`);
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
