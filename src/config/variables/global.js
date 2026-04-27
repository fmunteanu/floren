/**
 * @fileoverview Configuration variables for the website.
 *
 * Defines allowed search engine crawlers, site domain, Cloudflare bindings,
 * and author profile.
 */

export const author = {
  name: 'Floren Munteanu',
  role: 'Site Reliability Engineer'
}

export const cloudflare = {
  analytics: {
    enabled: true,
    token: '00ca09927d65495d9652887f9d59f04f'
  },
  cache: {
    prefixes: [
      '/'
    ]
  }
}

export const crawlers = [
  '*'
]

export const domain = {
  name: process.env.NEXT_PUBLIC_DOMAIN,
  protocol: process.env.NEXT_PUBLIC_PROTOCOL
}

export const google = {
  analytics: {
    enabled: false,
    id: 'G-SRX3L9XFK8'
  }
}

export const repository = {
  home: 'github.com/fmunteanu/floren',
  tag: 'main'
}
