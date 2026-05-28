import type { MetadataRoute } from 'next'

const SITE_URL = 'https://pedri.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/reservar`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/explorar`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/detalle`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${SITE_URL}/finalizar`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]
}
