/**
 * @fileoverview Root layout for the home section.
 *
 * Wraps all home pages in the Nextra docs theme Layout with
 * shared footer and minimal chrome.
 */

import { footer } from '@floren/website'
import { Layout } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'

/**
 * Home section layout with docs theme and minimal chrome.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Page content
 */
async function HomeLayout({ children }) {
  const pageMap = await getPageMap()
  return (
    <Layout
      editLink={null}
      feedback={{ link: '' }}
      footer={footer}
      navbar={null}
      pageMap={pageMap}
      search={null}
    >
      {children}
    </Layout>
  )
}

export { HomeLayout as default }
