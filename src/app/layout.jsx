/**
 * @fileoverview Root layout for the website.
 *
 * Provides the HTML shell, global metadata, and shared styles
 * for all pages across every section.
 */

import { Head } from 'nextra/components'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import { author, cloudflare, domain, google } from '@floren/website/global'
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
      {cloudflare.analytics.enabled && (
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${cloudflare.analytics.token}"}`}
          strategy="afterInteractive"
        />
      )}
      {google.analytics.enabled && <GoogleAnalytics gaId={google.analytics.id} />}
      <body>
        {children}
      </body>
    </html>
  )
}

export { RootLayout as default }
