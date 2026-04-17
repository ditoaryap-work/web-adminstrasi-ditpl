import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';

/**
 * @systematic-debugging: PENYEBAB HANGING REQUEST DITEMUKAN
 * 
 * getConnInfo dari 'hono/bun' membutuhkan akses ke Bun.Server instance
 * melalui c.env.server. Namun saat export menggunakan pola:
 *   export default { fetch: app.fetch }
 * Bun TIDAK menyuntikkan server instance ke context Hono.
 * 
 * Akibatnya: getBunServer(c) → null → throw TypeError → request HANG
 * karena hono-rate-limiter tidak menangkap error ini secara graceful.
 * 
 * SOLUSI: Gunakan keyGenerator sederhana berbasis header IP
 * yang tidak membutuhkan akses ke Bun.Server internal.
 */
function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    'unknown'
  );
}

// General API rate limit (100 req per minute)
export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-6',
  keyGenerator: (c: Context) => getClientIp(c),
  message: {
    status: false,
    message: 'Terlalu banyak permintaan (Rate Limit exceeded), silakan coba lagi nanti.',
  },
});

// Strict rate limit untuk login (5 req per 15 minutes)
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c: Context) => getClientIp(c),
  skipSuccessfulRequests: true,
  message: {
    status: false,
    message: 'Terlalu banyak percobaan login gagal, silakan coba lagi dalam 15 menit.',
  },
});
