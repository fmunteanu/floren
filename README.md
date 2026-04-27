# floren.ca

Website powered by [Next.js](https://nextjs.org) and [Nextra](https://nextra.site) docs theme.

## Local Development

For local development and testing, use the following commands:

```shell
# Install the dependencies
npm install

# Preview on Cloudflare Workers runtime
npx wrangler login
npm run preview
```

### Credentials

Create a `.dev.vars` file in the project root for local builds:

```shell
NEXTJS_ENV=development
WRANGLER_LOG=debug
WRANGLER_LOG_PATH=./logs

KV_PURGE_SECRET=<your-kv-purge-secret>
ZONE_CACHE_TOKEN=<your-zone-cache-token>
ZONE_ID=<your-zone-id>
```

> [!NOTE]
>
> For Cloudflare Worker deployments, variables are configured as encrypted environment secrets.

## Dependency Management

This project uses [Renovate](https://github.com/renovatebot/renovate) to automatically manage `npm` dependencies. Renovate creates pull requests when new major or minor versions are available.

To update the dependencies, use the following commands:

```shell
# Review the outdated dependencies
npm outdated

# Update the dependencies
npm update
```

> [!NOTE]
>
> The `npm update` command applies updates within existing `package.json` semver ranges.

## Code Formatting

This project uses [Prettier](https://prettier.io) with [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) to automatically sort Tailwind CSS utility classes in `@apply` directives and `class` attributes.
