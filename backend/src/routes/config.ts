import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { config } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import { TEMPLATE_DIR, TEMPLATE_REGISTRY } from '../services/template.service';

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
    
    // [Bug 3 Fix] Cache Invalidation: Hapus file template lokal tim ini agar
    // getTemplatePath dipaksa re-download menggunakan Drive ID baru dari config.
    // Tanpa ini: update templateId di Settings tidak berpengaruh selama file lokal masih ada.
    try {
      const timDirName = timPoksiId.replace(/\s+/g, '_');
      const timDir = path.join(TEMPLATE_DIR, timDirName);
      if (fs.existsSync(timDir)) {
        for (const tpl of TEMPLATE_REGISTRY) {
          const teamFilePath = path.join(timDir, tpl.filename);
          if (fs.existsSync(teamFilePath)) {
            fs.unlinkSync(teamFilePath);
            console.log(`[Config Update] Cache template ${tpl.id} untuk tim "${timPoksiId}" dihapus. Sistem akan menggunakan versi MASTER.`);
          }
        }
      }
    } catch (cacheErr) {
      // Non-fatal: config sudah tersimpan ke DB, log warning saja
      console.warn('[Config Update] Gagal menghapus cache template lokal:', cacheErr);
    }

    return c.json({
      status: true,
      message: `Konfigurasi tim "${timPoksiId}" berhasil diperbarui. Cache template tim telah direset ke versi MASTER lokal.`,
      data: result[0]
    });
  } catch (error: any) {
    return c.json({ status: false, message: 'Gagal memperbarui konfigurasi sistem.' }, 500);
  }
});

export default configRouter;
