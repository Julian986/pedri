export const GA_MEASUREMENT_ID = 'G-B246V0KNKB'
export const isGAEnabled = GA_MEASUREMENT_ID.length > 0

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function sendPageView(path: string) {
  if (!isGAEnabled || typeof window === 'undefined' || !window.gtag) return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
}

export function sendEvent(
  action: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (!isGAEnabled || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, params ?? {})
}
