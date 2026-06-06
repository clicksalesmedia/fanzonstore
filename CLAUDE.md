@AGENTS.md

# World Cup Website

A marketing/content website for the World Cup, built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**.

> ⚠️ Next.js 16 has breaking changes vs. earlier versions. Before writing routing, data-fetching, or config code, consult `node_modules/next/dist/docs/` and heed deprecation notices (see AGENTS.md).

## Stack
- Next.js 16.2.x (App Router, `app/` directory)
- React 19.2.x
- Tailwind CSS v4 (via `@tailwindcss/postcss`, configured in `postcss.config.mjs`)
- TypeScript 5
- ESLint 9 (`eslint-config-next`)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Printify POD integration (live)
The storefront is backed by **Printify** (print-on-demand). Env in `.env.local` (gitignored):
`PRINTIFY_API_TOKEN`, `PRINTIFY_SHOP_ID` (27802346), `OPENAI_API_KEY`.

- `lib/printify.ts` — **server-only** Printify client: fetch products, map `PFProduct → Product`
  (mockups fall back to category garment photos in `public/images/products` when Printify hasn't
  rendered mockups), and `createPrintifyOrder()`. Orders are created **on-hold and NOT sent to
  production** unless `PRINTIFY_AUTO_PRODUCTION=true` (wire that to fire only after a real payment).
- `lib/catalog.ts` — the storefront data source. `getCatalog()` reads Printify (cached, `revalidate:300`)
  and falls back to the static mock `lib/products.ts` if Printify is empty/unreachable. Pages await this;
  `ShopGrid` receives `products` as a prop (it's a client component).
- `app/api/checkout/route.ts` + `app/checkout/page.tsx` — live order submission flow.
- `scripts/printify/build-catalog.mjs` — **automated catalog pipeline**:
  gpt-image-1 (transparent print art) / gpt-image-2 (posters) → Printify upload → create product →
  publish. Resumable (skips keys already in `lib/printify-catalog.json`).
  `node scripts/printify/build-catalog.mjs [--limit N] [--dry] [--force]`.
  Note: Printify's `/publish` returns code 8254 for this disconnected shop — expected; we read products
  directly via the API. Mockup `images` populate asynchronously (often empty for API/disconnected shops).

## Project conventions
- App Router pages and layouts live under `app/`.
- Prefer Server Components by default; add `"use client"` only when interactivity requires it.
- Use Tailwind utility classes for styling; keep design tokens consistent (see the design skills below).
- Never import `lib/printify.ts` from a client component (it carries the API token; it has `import "server-only"`).

## Design & UI work — use the UI/UX Pro Max skills
This project ships with a bundled design-intelligence skill suite in `.claude/skills/`:
- **ui-ux-pro-max** — 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types. Use for any UI structure, visual design, interaction, or UX decisions.
- **design**, **design-system** — token architecture, semantic/component tokens, Tailwind integration.
- **ui-styling**, **brand**, **banner-design**, **slides** — styling, brand expression, banners, presentations.

Invoke these whenever building or refactoring pages/components, choosing colors/typography/spacing, or reviewing UI for accessibility and polish. The `ui-ux-pro-max` skill includes a searchable database — run its scripts (e.g. `.claude/skills/ui-ux-pro-max/scripts/search.py`) for priority-based recommendations.

Given this is a World Cup site, lean toward an energetic, bold, accessible aesthetic with strong typographic hierarchy and football/tournament theming.

## Animation — use the GSAP skills
The official GSAP skill suite is also installed in `.claude/skills/`:
- **gsap-core** — `gsap.to/from/fromTo`, easing, stagger, `matchMedia` (responsive + reduced-motion)
- **gsap-timeline** — sequencing and choreography
- **gsap-scrolltrigger** — scroll-linked animation, pinning, parallax, scrub
- **gsap-plugins** — ScrollSmoother, Flip, Draggable, SplitText, Observer, etc.
- **gsap-react** — `useGSAP` hook, refs, cleanup (use this for React 19 components)
- **gsap-frameworks** — Vue/Svelte/Nuxt lifecycle (not needed here, kept for completeness)
- **gsap-performance** — prefer transforms, avoid layout thrash, 60fps
- **gsap-utils** — `gsap.utils` helpers (clamp, mapRange, random, snap, etc.)

For this Next.js/React project, prefer **gsap-react** (`useGSAP`) for component animations and **gsap-scrolltrigger** for scroll-driven sections (hero reveals, match timelines, standings). Always respect `prefers-reduced-motion` via `gsap.matchMedia()`.
