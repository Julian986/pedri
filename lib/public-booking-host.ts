/**
 * Hostname(s) donde corre el canal público de reservas (sin Cloudflare Access).
 * Configurable con PEDRI_PUBLIC_BOOKING_HOST; por defecto reservas.pedriapp.com.
 */
export function isPublicBookingHostname(hostname: string): boolean {
  const h = (hostname || '').split(':')[0].trim().toLowerCase();
  if (!h) return false;
  const fromEnv = process.env.PEDRI_PUBLIC_BOOKING_HOST?.trim().toLowerCase();
  if (fromEnv) return h === fromEnv;
  return h === 'reservas.pedriapp.com' || h === 'reservas.localhost';
}

export function getRequestHostname(headers: Headers): string {
  return (
    headers.get('x-forwarded-host') ||
    headers.get('host') ||
    ''
  )
    .split(':')[0]
    .trim()
    .toLowerCase();
}
