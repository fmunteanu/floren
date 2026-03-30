/**
 * @fileoverview Root layout for the website.
 *
 * Provides the HTML shell, global metadata, and shared styles
 * for all pages across every section.
 */

import { author } from '@floren/website'
import { analytics, domain } from '../config/variables/docs'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Head } from 'nextra/components'
import '../styles/globals.css'

export const metadata = {
  metadataBase: new URL(`https://${domain}`),
  title: {
    template: `%s - ${author.name}`
  },
  description: 'Imagine. Create.',
  applicationName: author.name,
  generator: 'Next.js',
  openGraph: {
    siteName: author.name,
    type: 'website'
  },
  appleWebApp: {
    title: author.name
  }
}

/**
 * Root HTML layout wrapping all pages.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Page content
 */
function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        {children}
      </body>
      <GoogleAnalytics gaId={analytics.id} />
    </html>
  )
}

export { RootLayout as default }
