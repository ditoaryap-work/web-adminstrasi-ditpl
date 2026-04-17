import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { config } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth';

const configRouter = new Hono();

// Wajib Auth
configRouter.use('/*', authMiddleware);

const configSchemaValidation = z.object({
  timPoksi: z.string().min(1).max(100),
  folderIdSpt: z.string().max(100).optional().nullable(),
  folderIdSptjm: z.string().max(100).optional().nullable(),
  templateIdSptV1: z.string().max(100).optional().nullable(),
  templateIdSptV2: z.string().max(100).optional().nullable(),
  templateIdSptjm: z.string().max(100).optional().nullable(),
  folderIdSuratMasuk: z.string().max(100).optional().nullable(),
  folderIdSuratKeluar: z.string().max(100).optional().nullable(),
  folderIdNotulensi: z.string().max(100).optional().nullable(),
  folderIdSpj: z.string().max(100).optional().nullable(),
  templateIdSpj: z.string().max(100).optional().nullable(),
});

configRouter.get('/', async (c) => {
  try {
    const list = await db.select().from(config);
    return c.json({ status: true, message: 'Data konfigurasi berhasil ditarik', data: list });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mengambil data konfigurasi' }, 500);
  }
});

// Update/Upsert konfigurasi (Hanya Super Admin)
configRouter.put('/:timPoksi', requireSuperAdmin, zValidator('json', configSchemaValidation), async (c) => {
  try {
    const timPoksiId = c.req.param('timPoksi');
    const body = c.req.valid('json');
    if (body.timPoksi !== timPoksiId) {
       return c.json({ status: false, message: 'Identitas Tim/Poksi tidak valid/cocok.' }, 400);
    }
    
    const existing = await db.select().from(config).where(eq(config.timPoksi, timPoksiId));
    let result;
    if (existing.length === 0) {
       result = await db.insert(config).values(body).returning();
    } else {
       result = await db.update(config).set(body).where(eq(config.timPoksi, timPoksiId)).returning();
    }
    
    return c.json({ status: true, message: 'Data Konfigurasi telah diperbarui secara sistem.', data: result[0] });
  } catch (error: any) {
    return c.json({ status: false, message: 'Gagal memperbarui konfigurasi sistem.' }, 500);
  }
});

export default configRouter;
