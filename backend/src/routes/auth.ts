import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { setCookie, deleteCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authLimiter } from '../middleware/rateLimiter';

import { authMiddleware, JwtPayload } from '../middleware/auth';

type HonoEnv = { Variables: { user: JwtPayload } };
const authRouter = new Hono<HonoEnv>();

// Skema Validasi Input Login (OWASP Injection Defense)
const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(5, "Password minimal 5 karakter").max(100)
});

// Rute Login: Dibungkus dengan middleware AuthLimiter
authRouter.post('/login', authLimiter, zValidator('json', loginSchema, (result, c) => {
  if (!result.success) {
    return c.json({ status: false, message: 'Format data tidak valid.', errors: result.error.issues }, 400);
  }
}), async (c) => {
  try {
    const { username, password } = c.req.valid('json');

    // Mencegah SQLi via parameterization default Drizzle
    const userRecords = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = userRecords[0];

    if (!user) {
      // Memakai timing attack prevention best practice: Tampilkan pesan general
      return c.json({ status: false, message: 'Akses Ditolak: Username atau password tidak sesuai.' }, 401);
    }

    // BUN Native Password API untuk Efisiensi RAM & CPU
    const isMatch = await Bun.password.verify(password, user.passwordHash);
    
    if (!isMatch) {
      return c.json({ status: false, message: 'Akses Ditolak: Username atau password tidak sesuai.' }, 401);
    }

    // Buat JWT Token payload (Ingat! Jangan menyematkan passwordHash atau data sensitif lain disini)
    const secret = process.env.JWT_SECRET || 'secret123!';
    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
      timPoksi: user.timPoksi
    }, secret, { expiresIn: '12h' });

    // SET HTTPOnly Secure Cookie: Menangkal eksfiltrasi (XSS) via window.localStorage JS
    setCookie(c, 'eoffice_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 jam
    });

    // Update login tracking secara asinkron (gak nge-block flow response)
    db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id)).execute();

    return c.json({
      status: true,
      message: 'Login berhasil.',
      data: {
        username: user.username,
        namaAdmin: user.nama,
        role: user.role,
        timPoksi: user.timPoksi
      }
    });

  } catch (error: any) {
    console.error('[System Security] Login handler crash:', error);
    return c.json({ status: false, message: 'Terjadi kesalahan sistem saat proses otentikasi. Hubungi Admin.' }, 500);
  }
});

authRouter.post('/logout', (c) => {
  // Penghapusan sesi via server response (karena cookie client diproteksi JS-nya)
  deleteCookie(c, 'eoffice_token', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
  return c.json({ status: true, message: 'Anda telah berhasil log out dari sistem.' });
});

// Update Profile: Untuk user yang sedang login mengubah data dirinya sendiri
const updateProfileSchema = z.object({
  namaAdmin: z.string().min(3, "Nama minimal 3 karakter").max(100),
  password: z.string().min(6, "Password minimal 6 karakter").max(100).optional()
});

authRouter.put('/profile', authMiddleware, zValidator('json', updateProfileSchema, (result, c) => {
  if (!result.success) {
    return c.json({ status: false, message: 'Format data tidak valid: ' + result.error.issues[0]?.message, errors: result.error.issues }, 400);
  }
}), async (c) => {
  try {
    const user = c.get('user');
    const { namaAdmin, password } = c.req.valid('json');

    const updateData: any = {
      nama: namaAdmin
    };

    if (password) {
      updateData.passwordHash = await Bun.password.hash(password);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.userId));

    return c.json({ 
      status: true, 
      message: 'Profil berhasil diperbarui.',
      data: {
        namaAdmin: namaAdmin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ status: false, message: 'Gagal memperbarui profil.' }, 500);
  }
});

export default authRouter;
