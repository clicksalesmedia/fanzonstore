/**
 * Build 4 World Cup USA watch-party tee products.
 *
 * Generates gpt-image-2 visual artwork, composites exact typography into a
 * 4500x5400 transparent PNG, uploads it to Printify, and creates white/black
 * Gildan tee products.
 *
 * Usage:
 *   node scripts/printify/build-watch-party-capsule.mjs --dry
 *   node scripts/printify/build-watch-party-capsule.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OPENAI = "https://api.openai.com/v1/images/generations";
const PRINTIFY = "https://api.printify.com/v1";
const WIDTH = 4500;
const HEIGHT = 5400;
const MODEL = "gpt-image-2";

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
const FORCE = args.includes("--force");

const PLAN = [
  {
    key: "watch-party-club",
    title: "Watch Party Club",
    price: 2999,
    badge: "New",
    headline: "WATCH PARTY",
    accent: "CLUB",
    footer: "WORLD CUP SUMMER 2026",
    palette: { primary: "#f7fff9", accent: "#12d681", warm: "#f1ff5a", dark: "#07130f" },
    description:
      "A World Cup 2026 watch party tee for friends and families who turn the living room into the loudest section in the house.",
    artPrompt:
      "No text, no letters, no logos. A modern streetwear sports graphic background for a USA soccer World Cup 2026 watch party: glowing TV light, couch silhouettes, snack table, abstract stadium floodlights, soccer ball motion lines, red-white-blue hints mixed with neon green, high contrast screen print style, bold shapes, clean composition, poster-like vertical layout.",
  },
  {
    key: "couch-section-2026",
    title: "Couch Section 2026",
    price: 2999,
    headline: "COUCH SECTION",
    accent: "2026",
    footer: "LOUD SEATS. HOME FIELD.",
    palette: { primary: "#ffffff", accent: "#32f58b", warm: "#7ee4ff", dark: "#07111f" },
    description:
      "A World Cup 2026 fan tee for teens, cousins, and friends who claim the couch like a stadium section.",
    artPrompt:
      "No text, no letters, no logos. A bold modern soccer streetwear graphic background: couch transformed into stadium seats, crowd energy, scarf shapes, TV glow, floodlights, stars, dynamic ball trail, USA matchday mood, neon green and icy blue accents, high contrast, screen print ready, vertical composition.",
  },
  {
    key: "no-one-watches-alone",
    title: "No One Watches Alone",
    price: 2999,
    headline: "NO ONE",
    accent: "WATCHES ALONE",
    footer: "WORLD CUP 2026",
    palette: { primary: "#fffaf0", accent: "#1eea8b", warm: "#ff6b4a", dark: "#101010" },
    description:
      "A World Cup 2026 belonging tee for the friend group, the family room, and every fan who needs the match shared.",
    artPrompt:
      "No text, no letters, no logos. Emotional modern sports graphic background showing togetherness: silhouettes of friends and family watching soccer, raised arms, TV glow, confetti, abstract stadium lights, soccer ball arc, warm orange and neon green accents, clean streetwear poster style, vertical shirt print composition.",
  },
  {
    key: "snacks-goals-nights",
    title: "Snacks Goals Nights",
    price: 2999,
    headline: "SNACKS GOALS",
    accent: "NIGHTS",
    footer: "PASS THE CHIPS. KEEP BELIEVING.",
    palette: { primary: "#f8fbff", accent: "#24e477", warm: "#f8cf3f", dark: "#08120b" },
    description:
      "A fun World Cup 2026 tee for pizza, chips, late goals, and the watch party rituals fans remember.",
    artPrompt:
      "No text, no letters, no logos. Playful modern soccer watch party graphic background: pizza slice, chips bowl, soda cup, remote control, soccer ball, stadium light beams, energetic motion, red-white-blue hints and neon green, high contrast screen print style, clean vector-like composition, vertical t-shirt artwork.",
  },
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(lines, x, y, size, fill, family, weight = 900, gap = 1.08, maxWidth = 3100) {
  return lines
    .map(
      (line, index) => {
        const textLength = line.length > 7 ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : "";
        return `<text x="${x}" y="${y + index * size * gap}" text-anchor="middle" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="0" fill="${fill}" stroke="#07130f" stroke-width="${Math.max(10, size * 0.035)}" paint-order="stroke fill"${textLength}>${esc(line)}</text>`;
      },
    )
    .join("");
}

function designSvg(item, artDataUri) {
  const headline = wrapText(item.headline, 12);
  const accent = wrapText(item.accent, 14);
  const p = item.palette;
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="badge">
        <path d="M730 785 C1240 430 3180 430 3705 790 C4140 1090 4210 3035 3790 3470 C3270 4010 1190 4020 700 3460 C300 3000 310 1095 730 785 Z"/>
      </clipPath>
      <filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="none"/>
    <g opacity="0.98">
      <path d="M660 720 C1200 350 3310 350 3850 720 C4320 1045 4380 3140 3870 3615 C3300 4140 1130 4140 560 3605 C80 3150 120 1050 660 720 Z" fill="${p.dark}"/>
      <path d="M730 785 C1240 430 3180 430 3705 790 C4140 1090 4210 3035 3790 3470 C3270 4010 1190 4020 700 3460 C300 3000 310 1095 730 785 Z" fill="#111"/>
      <image href="${artDataUri}" x="470" y="520" width="3560" height="3560" preserveAspectRatio="xMidYMid slice" clip-path="url(#badge)" opacity="0.76"/>
      <path d="M730 785 C1240 430 3180 430 3705 790 C4140 1090 4210 3035 3790 3470 C3270 4010 1190 4020 700 3460 C300 3000 310 1095 730 785 Z" fill="none" stroke="${p.accent}" stroke-width="34"/>
      <path d="M885 960 C1390 690 3055 690 3565 960" fill="none" stroke="${p.warm}" stroke-width="24" stroke-linecap="round"/>
      <path d="M925 3345 C1450 3725 3040 3725 3550 3345" fill="none" stroke="${p.warm}" stroke-width="22" stroke-linecap="round"/>
      <circle cx="2260" cy="2180" r="1160" fill="${p.dark}" opacity="0.36" filter="url(#soft)"/>
    </g>
    <g transform="rotate(-1.5 ${WIDTH / 2} ${HEIGHT / 2})">
      ${textBlock(headline, WIDTH / 2, 1720, headline.length > 1 ? 430 : 485, p.primary, "Impact, Anton, Arial Black, sans-serif", 900, 1.04, 3050)}
      ${textBlock(accent, WIDTH / 2, headline.length > 1 ? 2660 : 2480, accent.length > 1 ? 300 : 455, p.accent, "Impact, Anton, Arial Black, sans-serif", 900, 1.04, 2920)}
      <text x="${WIDTH / 2}" y="3210" text-anchor="middle" font-family="Arial Black, Chakra Petch, sans-serif" font-size="150" font-weight="900" letter-spacing="0" fill="${p.warm}" stroke="${p.dark}" stroke-width="12" paint-order="stroke fill" textLength="2920" lengthAdjust="spacingAndGlyphs">${esc(item.footer)}</text>
      <text x="${WIDTH / 2}" y="3400" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="112" font-weight="900" letter-spacing="0" fill="${p.primary}" opacity="0.9">FANZONSTORE</text>
    </g>
  </svg>`;
}

async function generateArt(item) {
  const dir = path.join(ROOT, "public", "images", "designs", "watch-party");
  fs.mkdirSync(dir, { recursive: true });
  const artFile = path.join(dir, `${item.key}-art.png`);
  if (fs.existsSync(artFile) && !FORCE) {
    console.log(`  · art cached ${path.basename(artFile)}`);
    return fs.readFileSync(artFile);
  }
  const res = await fetch(OPENAI, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: item.artPrompt,
      size: "1024x1536",
      quality: "high",
      n: 1,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI image (${MODEL}) -> ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`OpenAI image (${MODEL}) returned no b64_json`);
  const bytes = Buffer.from(b64, "base64");
  fs.writeFileSync(artFile, bytes);
  console.log(`  · generated art ${path.basename(artFile)}`);
  return bytes;
}

async function composePrint(item) {
  const dir = path.join(ROOT, "public", "images", "designs", "watch-party");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${item.key}.png`);
  if (fs.existsSync(out) && !FORCE) {
    console.log(`  · print cached ${path.basename(out)}`);
    return fs.readFileSync(out);
  }
  const art = await generateArt(item);
  const artDataUri = `data:image/png;base64,${art.toString("base64")}`;
  await sharp(Buffer.from(designSvg(item, artDataUri))).png().toFile(out);
  console.log(`  · composed print ${path.basename(out)}`);
  return fs.readFileSync(out);
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
  if (!res.ok) throw new Error(`Printify ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

function pickVariants(allVariants) {
  const sizeOrder = ["S", "M", "L", "XL", "2XL"];
  return allVariants
    .filter((variant) => {
      const title = variant.title.toLowerCase();
      const wantedColor = title.includes("black") || title.includes("white");
      const wantedSize = sizeOrder.some((size) =>
        new RegExp(`(^|[/\\s])${size.replace("+", "\\+")}($|[/\\s])`, "i").test(variant.title),
      );
      return wantedColor && wantedSize;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

async function createProduct(item, printBytes) {
  const providers = await pf(`/catalog/blueprints/6/print_providers.json`);
  const providerId = 99 || providers[0].id;
  const variantData = await pf(`/catalog/blueprints/6/print_providers/${providerId}/variants.json`);
  const placeholder =
    variantData.variants[0].placeholders.find((entry) => entry.position === "front")?.position ??
    variantData.variants[0].placeholders[0].position;
  const variants = pickVariants(variantData.variants);
  if (!variants.length) throw new Error("No black/white variants found for blueprint 6");

  const upload = await pf("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({
      file_name: `${item.key}.png`,
      contents: printBytes.toString("base64"),
    }),
  });
  console.log(`  · uploaded ${upload.id}`);

  const product = await pf(`/shops/${SHOP}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: item.title,
      description: item.description,
      blueprint_id: 6,
      print_provider_id: providerId,
      tags: [
        "world-cup-2026",
        "usa-soccer-fans",
        "watch-party",
        "family-friends",
        "category:tees",
        ...(item.badge ? [`badge:${item.badge}`] : []),
      ],
      variants: variants.map((variant) => ({
        id: variant.id,
        price: item.price,
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: variants.map((variant) => variant.id),
          placeholders: [
            {
              position: placeholder,
              images: [
                {
                  id: upload.id,
                  x: 0.5,
                  y: 0.5,
                  scale: 0.9,
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
    }),
  });
  console.log(`  · created ${product.id}`);

  try {
    await pf(`/shops/${SHOP}/products/${product.id}/publish.json`, {
      method: "POST",
      body: JSON.stringify({
        title: true,
        description: true,
        images: true,
        variants: true,
        tags: true,
        keyFeatures: true,
        shipping_template: true,
      }),
    });
    console.log("  · published");
  } catch (error) {
    console.log(`  · publish note: ${(error instanceof Error ? error.message : String(error)).slice(0, 160)}`);
  }

  return product.id;
}

async function main() {
  if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
  if (!TOKEN || !SHOP) throw new Error("Missing PRINTIFY_API_TOKEN / PRINTIFY_SHOP_ID");

  const manifestFile = path.join(ROOT, "lib", "printify-watch-party-catalog.json");
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : [];
  const done = new Set(FORCE ? [] : manifest.map((entry) => entry.key));

  console.log(`${DRY ? "Dry-run" : "Building"} ${PLAN.length} watch-party tee design(s) with ${MODEL}`);
  for (const item of PLAN) {
    console.log(`\n▶ ${item.title}`);
    if (done.has(item.key)) {
      console.log("  · already created, skipping");
      continue;
    }
    try {
      const printBytes = await composePrint(item);
      if (DRY) {
        console.log("  · --dry: skipping Printify product creation");
        continue;
      }
      const printifyId = await createProduct(item, printBytes);
      manifest.push({ key: item.key, title: item.title, printifyId, category: "tees" });
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    } catch (error) {
      console.error(`✗ ${item.key}: ${error instanceof Error ? error.message : error}`);
    }
  }
  console.log("\ndone");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
