# Project Instructions

A Next.js personal website hosting [floren.ca](https://floren.ca). Single-section portfolio site using the [Nextra](https://nextra.site) docs theme, with automated deployment via Cloudflare Workers.

## Collaborator

- **Name:** Floren Munteanu
- **Work:** Engineering

### Personal Preferences

I'm a site reliability engineer specialized in:

- Advanced GitHub actions based on JS code
- Helm charts
- IaC for Kubernetes clusters
- Next.js/Nextra static websites

## Architecture

The site is a static Next.js/Nextra application deployed to Cloudflare Workers via OpenNext. Cloudflare's zone CDN absorbs warm traffic without invoking the Worker; the Worker only runs on cold misses, post-purge first hits, and dynamic paths (RSC). The whole thing runs on the free Cloudflare Workers plan.

### Directory Tree

```
.
├── mdx-components.js                      Next.js canonical MDX entry point (merges Nextra + package + overrides)
├── next.config.mjs                        Next.js config, wraps Nextra, initializes OpenNext for dev
├── open-next.config.ts                    OpenNext adapter config (selects kvIncrementalCache)
├── wrangler.jsonc                         Cloudflare Worker bindings (KV, assets, images, services)
├── package.json                           Workspace root, npm scripts (prebuild, build, deploy, preview)
├── packages/
│   └── website/                           Local @floren/website package with subpath exports
│       ├── index.js                       Shared components and utilities
│       ├── docs.js                        Author, domain, cloudflare, repository constants
│       └── theme.js                       Nextra HeadPropsSchema re-export for theme defaults
├── public/                                Static assets (home/, _headers)
├── scripts/
│   ├── deploy.js                          Deploy-time: KV purge, wrangler deploy, edge purge
│   ├── prebuild.js                        Build-time: generates timestamps map from git history
│   ├── preview.js                         Local dev: runs Wrangler bound to LAN IP over HTTP
│   └── worker.js                          Runtime: Worker entry, wraps OpenNext with caches.default
└── src/
    ├── app/                               Next.js app routes
    │   ├── (home)/                        Home page route group
    │   ├── apple-icon.png
    │   ├── favicon.ico
    │   ├── icon.svg
    │   ├── icon1.png                      192x192 PWA icon
    │   ├── icon2.png                      512x512 PWA icon
    │   ├── layout.jsx
    │   ├── manifest.js                    PWA web app manifest
    │   ├── not-found.jsx
    │   ├── robots.js
    │   └── sitemap.js
    ├── components/                        Structural and presentational React components
    │   ├── FeatureCard.jsx                Responsive card grid for landing pages
    │   ├── Hero.jsx                       Full-width landing hero
    │   ├── Image.jsx                      Theme-aware image with optional card template
    │   ├── NotFound.jsx                   Theme-aware 404 page
    │   └── Skill.jsx                      Inline skill pill with icon
    ├── config/
    │   ├── site.js                        Theme config (navbar, sidebar, footer)
    │   └── variables/
    │       └── docs.js                    Author, domain, cloudflare, repository constants
    ├── content/
    │   ├── _meta.js
    │   └── index.mdx                      Single-page portfolio content
    ├── generated/                         Build-time generated files (gitignored)
    │   └── timestamps.json                Last-modified timestamps from git history
    └── styles/
        └── globals.css
```

### Scripts

Four scripts in `scripts/`, each running at a different lifecycle stage:

- `deploy.js` — deploy-time, runs after `next build`. Orchestrates the three-step deploy:
  - KV cache purge through the currently-deployed Worker's internal endpoint
  - `wrangler deploy` to ship the new Worker
  - Edge cache purge for configured route prefixes
- `prebuild.js` — build-time, runs before `next build`. Generates the artifacts the build depends on:
  - Timestamps map at `src/generated/timestamps.json` from git history
- `preview.js` — local dev, runs via `npm run preview`. Detects the LAN IPv4, builds the OpenNext bundle, and runs the preview server bound to that IP over plain HTTP.
- `worker.js` — runtime, the Worker entry point. Wraps OpenNext with the request-time caching and policy layer:
  - `caches.default` layer scoped by `BUILD_ID` so deploys invalidate naturally
  - `Vary` normalization on cacheable responses so the zone CDN accepts them
  - Status-keyed `cache-control` policy applied to responses leaving the Worker
  - Internal `/__internal/purge-kv-cache` endpoint for the deploy-time KV purge

### Cache Layers

Three layers, each with a distinct purpose:

- **Cloudflare zone CDN** — configured via a Cache Rule in the Cloudflare dashboard
  - First layer a request hits. Stores responses at the PoP keyed by URL.
  - Cache Rule expression matches `floren.ca` and excludes RSC requests (`?_rsc=` query string).
  - Edge TTL set to "Use cache-control header if present" — the rule trusts the Worker's emitted cache-control as the policy.
  - On hit, the Worker is not invoked. The CDN responds directly.
- **`caches.default`** — managed by `scripts/worker.js`
  - Per-PoP cache inside the Worker, used when the zone CDN didn't already have an answer.
  - Cache keys include `BUILD_ID` so deploys invalidate naturally.
  - RSC and prefetch requests bypass this layer to avoid serving HTML to clients expecting an RSC stream.
- **OpenNext incremental cache (KV)** — configured in `open-next.config.ts` via `kvIncrementalCache`, backed by the `NEXT_INC_CACHE_KV` binding in `wrangler.jsonc`
  - Global via Cloudflare KV's edge-local replication.
  - Persists rendered HTML across PoPs.

### Cache Policy

The Worker is the authoritative source for cache policy across all responses. The zone CDN trusts whatever `cache-control` header the Worker sends. Three pieces of policy live in `scripts/worker.js`:

- **`Vary` normalization.** OpenNext emits `Vary: RSC, Next-Router-State-Tree, ...` on prerendered pages. Cloudflare's CDN refuses to cache responses with non-standard `Vary` values. The Worker overwrites `Vary` to `Accept-Encoding` on cacheable responses before returning to the zone.
- **`statusTtl` and `setTtl`.** A status-keyed table at module scope sets per-status `cache-control` policy: 60s for 404/410, 24h for 301/308, no-store for 302/307 and all 5xx. For 5xx, the rewrite is unconditional — a safety floor that origin cache-control cannot override.
- **HEAD as GET.** HEAD requests are rewritten to GET internally for cache lookup and origin fetch, then the body is stripped on return. Routes around an OpenNext bug where HEAD on cold-cache state returns 503.

### Preview

The `npm run preview` command runs `scripts/preview.js`, which detects the Mac's LAN IPv4, builds the OpenNext bundle, and runs `opennextjs-cloudflare preview` bound to that IP over plain HTTP. Output mirrors to a timestamped log file under `./logs/`. Reachable at `http://<lan-ip>:8787`.

### Deploy

The `npm run deploy` command runs `scripts/deploy.js`, which performs three steps in order:

1. **KV purge.** Calls the currently-deployed Worker's internal `/__internal/purge-kv-cache` endpoint with a shared secret (`KV_PURGE_SECRET`). The Worker uses its own KV binding to delete every key from the previous build. No Cloudflare API token needed.
2. **Wrangler deploy.** Ships the new Worker. OpenNext's deploy step populates the KV namespace with the new build's prerendered pages.
3. **Edge cache purge.** Clears Cloudflare's CDN cache for configured prefixes via the Cloudflare Cache API.

Secrets required in the deploy environment:

- `KV_PURGE_SECRET` — shared secret authenticating the script-to-Worker purge request in step 1. The same value must also be set as a Worker secret via `wrangler secret put` so the Worker can validate it.
- `ZONE_CACHE_TOKEN` — Cloudflare API token scoped to `Zone:Cache Purge` on the website's zone, used by the cache purge in step 3.
- `ZONE_ID` — Cloudflare zone identifier for `floren.ca`, passed to the cache purge call.

### Key Bindings

Declared in `wrangler.jsonc`:

- `NEXT_INC_CACHE_KV` — KV namespace for OpenNext's incremental cache
- `ASSETS` — static assets from `.open-next/assets`, including the `BUILD_ID` file
- `IMAGES` — Cloudflare Images binding for media optimization
- `WORKER_SELF_REFERENCE` — self-service binding used internally by OpenNext

Runtime secrets (not in `wrangler.jsonc`, set via `wrangler secret put`):

- `KV_PURGE_SECRET` — shared secret for the internal purge endpoint

## Coding Standards

- JSDoc `@fileoverview` on every file, `@param`/`@returns` on all functions
- No empty lines inside functions
- Exports at the bottom of each file (except Next.js required inline exports like `metadata` and `dynamic`)
- Alphabetical ordering for imports, exports, and configuration arrays
- No hardcoded domain or protocol — use `domain` from `@floren/website/docs`
- CSS Modules with `@reference "tailwindcss"` for Tailwind v4
