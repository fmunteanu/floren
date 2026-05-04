/**
 * @fileoverview MDX component overrides for the website.
 *
 * Re-exports default Nextra docs theme components.
 */

import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Link } from '@floren/website'

const docsComponents = getDocsMDXComponents()

/**
 * Returns merged MDX components.
 *
 * @param {object} components - Additional component overrides
 * @returns {object} Merged MDX components
 */
function useMDXComponents(components) {
  return {
    ...docsComponents,
    Link,
    ...components
  }
}

export { useMDXComponents }
