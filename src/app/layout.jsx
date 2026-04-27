/**
 * @fileoverview Root layout for the website.
 *
 * Provides the HTML shell, global metadata, and shared styles
 * for all pages across every section.
 */

import { analytics, author, domain } from '@floren/website/docs'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Head } from 'nextra/components'
import '../styles/globals.css'

export const metadata = {
  metadataBase: new URL(`${domain.protocol}://${domain.name}`),
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
      <GoogleAnalytics gaId={analytics.id} />
      <body>
        {children}
      </body>
    </html>
  )
}

export { RootLayout as default }
