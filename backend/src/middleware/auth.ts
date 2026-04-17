import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';

// Definisikan tipe payload dari JWT
export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  timPoksi: string;
}

export const authMiddleware = async (c: Context, next: Next) => {
  // Mengambil token JWT dari HttpOnly Cookie (lebih aman daripada localStorage via Authorization header)
  const token = getCookie(c, 'eoffice_token');
  
  if (!token) {
    return c.json({ status: false, message: 'Akses ditolak: Sesi tidak valid atau telah berakhir. Harap login kembali.' }, 401);
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret123!';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Menyimpan data user ke dalam context dari Hono agar bisa diakses oleh route handler
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ status: false, message: 'Akses ditolak: Token tidak valid atau kedaluwarsa.' }, 403);
  }
};

export const requireSuperAdmin = async (c: Context, next: Next) => {
  const user = c.get('user') as JwtPayload;
  if (!user || user.role !== 'Super Admin') {
    return c.json({ status: false, message: 'Akses ditolak: Membutuhkan hak akses tingkat Super Admin.' }, 403);
  }
  await next();
};
