import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { syncAdminToSheets, deleteAdminFromSheets } from '../services/sheets.service';

type HonoEnv = { Variables: { user: JwtPayload } };
const adminRouter = new Hono<HonoEnv>();

// Hanya Super Admin yang diizinkan mengelola manajemen admin
adminRouter.use('/*', authMiddleware, async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'Super Admin') {
    return c.json({ status: false, message: 'Akses Ditolak: Fitur ini hanya untuk Super Admin.' }, 403);
  }
  await next();
});

const saveAdminSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  namaAdmin: z.string().min(3),
  timPoksi: z.string().min(2),
  role: z.string().default('Admin')
});

// GET_ADMINS
adminRouter.get('/', async (c) => {
  try {
    const list = await db.select({
      username: users.username,
      namaAdmin: users.nama,
      timPoksi: users.timPoksi,
      role: users.role,
      lastLogin: users.lastLogin
    }).from(users);

    return c.json({ status: true, message: 'Data admin dimuat', data: list });
  } catch (error: any) {
    return c.json({ status: false, message: 'Gagal memuat list admin' }, 500);
  }
});

// SAVE_ADMIN (Create or Update)
adminRouter.post('/', zValidator('json', saveAdminSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    // Check exist
    const existing = await db.select().from(users).where(eq(users.username, data.username)).limit(1);

    if (existing.length > 0) {
      // Update
      const updatePayload: any = {
        nama: data.namaAdmin,
        timPoksi: data.timPoksi,
        role: data.role
      };
      
      if (data.password) {
        updatePayload.passwordHash = await Bun.password.hash(data.password);
      }

      await db.update(users).set(updatePayload).where(eq(users.username, data.username));
      
      return c.json({ status: true, message: 'Data admin diperbarui' });
    } else {
      // Create
      if (!data.password) {
         return c.json({ status: false, message: 'Kata sandi wajib untuk admin baru' }, 400);
      }
      
      const passwordHash = await Bun.password.hash(data.password);
      await db.insert(users).values({
        username: data.username,
        passwordHash,
        nama: data.namaAdmin,
        timPoksi: data.timPoksi,
        role: data.role
      });

      return c.json({ status: true, message: 'Admin baru dibuat' });
    }
  } catch (error: any) {
    return c.json({ status: false, message: 'Gagal menyimpan admin: ' + error.message }, 500);
  }
});

// DELETE_ADMIN
adminRouter.delete('/:username', async (c) => {
  try {
    const { username } = c.req.param();
    await db.delete(users).where(eq(users.username, username));
    
    // Sync to Sheets
    
    return c.json({ status: true, message: 'Admin dihapus' });
  } catch (error: any) {
    return c.json({ status: false, message: 'Gagal menghapus admin' }, 500);
  }
});

export default adminRouter;
