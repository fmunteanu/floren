/**
 * @fileoverview Next.js configuration with Nextra integration.
 *
 * Configures static export for Cloudflare Pages deployment,
 * with Nextra docs theme for MDX content rendering.
 */

import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/',
  defaultShowCopyCode: true
})

const nextConfig = withNextra({
  reactStrictMode: true
})

export { nextConfig as default }
import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
