/**
 * @fileoverview Configuration variables for the website.
 *
 * Defines allowed search engine crawlers, site domain, Cloudflare bindings,
 * and author profile.
 */

export const analytics = {
  id: 'G-SRX3L9XFK8'
}

export const author = {
  name: 'Floren Munteanu',
  role: 'Site Reliability Engineer'
}

export const cloudflare = {
  cache: {
    prefixes: [
      '/'
    ]
  },
  kv: {
    namespace: {
      id: '<your-kv-namespace-id>'
    }
  }
}

export const crawlers = [
  '*'
]

export const domain = {
  name: process.env.NEXT_PUBLIC_DOMAIN,
  protocol: process.env.NEXT_PUBLIC_PROTOCOL
}

export const repository = {
  home: 'github.com/fmunteanu/floren',
  tag: 'main'
}
