/**
 * @fileoverview Sitemap generator for the website.
 *
 * Collects routes from the Nextra page map and produces
 * a sitemap with URL and change frequency per route.
 * Uses force-static to support Next.js static export.
 */

export const dynamic = 'force-static'
import { domain } from '@floren/website/docs'
import { getPageMap } from 'nextra/page-map'

/**
 * Recursively extracts route paths from Nextra page map items.
 *
 * @param {object[]} pageMapItems - Nextra page map tree
 * @returns {string[]} Flat array of route paths
 */
function extractRoutes(pageMapItems) {
  const routes = []
  for (const item of pageMapItems) {
    if ('data' in item) continue
    if ('route' in item && !('children' in item)) {
      routes.push(item.route)
    }
    if ('children' in item) {
      routes.push(item.route)
      routes.push(...extractRoutes(item.children))
    }
  }
  return routes
}

/**
 * Generates the sitemap for the website.
 *
 * @returns {Promise<object[]>} Sitemap entries with url and changeFrequency
 */
async function sitemap() {
  const pageMap = await getPageMap('/')
  const allRoutes = [...new Set(extractRoutes(pageMap))]
  return allRoutes
    .map((route) => ({
      url: `${domain.protocol}://${domain.name}${route === '/' ? '' : route}`,
      changeFrequency: 'weekly'
    }))
    .sort((a, b) => a.url.localeCompare(b.url))
}

export { sitemap as default }
