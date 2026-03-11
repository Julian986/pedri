export const GA_MEASUREMENT_ID = 'G-B246V0KNKB'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function sendPageView(path: string) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
}
