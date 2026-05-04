/**
 * @fileoverview MDX component overrides for the website.
 *
 * Merges Nextra docs theme components with the shared @floren/website
 * package exports so MDX files can use components without explicit imports.
 */

import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import * as websiteComponents from '@floren/website'

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
    ...websiteComponents,
    ...components
  }
}

export { useMDXComponents }
