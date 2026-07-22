import crypto from 'crypto';

const API_URL = 'https://api.mercadopago.com';

function accessToken(): string {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!value) throw new Error('Falta configurar MERCADOPAGO_ACCESS_TOKEN');
  return value;
}

export async function mercadoPagoRequest<T>(
  path: string,
  init: RequestInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken()}`);
  headers.set('Content-Type', 'application/json');
  if (idempotencyKey) headers.set('X-Idempotency-Key', idempotencyKey);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('[Mercado Pago]', response.status, json);
    throw new Error(`Mercado Pago rechazó la operación (${response.status})`);
  }
  return json as T;
}

export function publicBookingUrl(requestUrl?: string): string {
  const configured =
    process.env.PEDRI_PUBLIC_BOOKING_URL?.trim() ||
    process.env.NEXT_PUBLIC_PEDRI_PUBLIC_BOOKING_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (requestUrl) return new URL(requestUrl).origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:9060';
}

export function verifyMercadoPagoSignature(params: {
  dataId: string;
  requestId: string | null;
  signature: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret || !params.signature || !params.dataId) return false;

  const parts = Object.fromEntries(
    params.signature.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')];
    }),
  );
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received) return false;

  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 10 * 60 * 1000) {
    return false;
  }

  const id = params.dataId.toLowerCase();
  const manifest = `id:${id};${params.requestId ? `request-id:${params.requestId};` : ''}ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
