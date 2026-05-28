import type { MetadataRoute } from 'next'

const SITE_URL = 'https://pedri.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/reservas', '/calendario', '/gastos', '/analisis'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
