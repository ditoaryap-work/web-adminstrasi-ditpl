import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { pegawai } from '../db/schema';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';
import { authMiddleware, requireSuperAdmin, JwtPayload } from '../middleware/auth';
import { syncPegawaiToSheets, deletePegawaiFromSheets } from '../services/sheets.service';

type HonoEnv = { Variables: { user: JwtPayload } };
const pegawaiRouter = new Hono<HonoEnv>();

// [Keamanan Berlapis 1]: Semua akses ke Database wajib membawa Token Valid.
pegawaiRouter.use('/*', authMiddleware);

// [Keamanan Berlapis 2]: Skema Input Terstruktur & Sanitasi Default Zod
const pegawaiSchemaValidation = z.object({
  namaLengkap: z.string().min(3).max(200),
  nip: z.string().max(30).optional(),
  kode: z.string().max(20).optional().nullable(),
  golongan: z.string().max(50).optional().nullable(),
  pangkatGolRuang: z.string().max(100).optional().nullable(),
  tingkatBiaya: z.string().max(50).optional().nullable(),
  jabatan: z.string().max(200).optional().nullable(),
  direktorat: z.string().max(100).optional().nullable(),
  poksi: z.string().max(100).optional().nullable()
});

pegawaiRouter.get('/', async (c) => {
  try {
    const { search } = c.req.query();
    let query = db.select().from(pegawai);

    if (search) {
      // @systematic-debugging: Gunakan ilike agar pencarian kebal terhadap Huruf Besar/Kecil
      query = query.where(
        or(
          ilike(pegawai.namaLengkap, `%${search}%`),
          ilike(pegawai.nip, `%${search}%`),
          ilike(pegawai.kode, `%${search}%`)
        )
      ) as any;
    }

    const list = await query.orderBy(desc(pegawai.createdAt));
    return c.json({ status: true, message: 'Data master pegawai berhasil ditarik', data: list });
  } catch (error) {
    return c.json({ status: false, message: 'Sistem mengalami kegagalan proses memuat data pegawai' }, 500);
  }
});

pegawaiRouter.post('/', zValidator('json', pegawaiSchemaValidation), async (c) => {
  try {
    const body = c.req.valid('json');
    
    // @security-expert: Pastikan NIP kosong diubah menjadi NULL agar tidak melanggar Unique Constraint
    const payload: any = {
      ...body,
      nip: body.nip && body.nip.trim() !== '' ? body.nip : null
    };

    // @backend-refactoring: Auto-generate Kode jika dikosongkan
    if (!payload.kode || String(payload.kode).trim() === '') {
      const lastPegawai = await db.select({ kode: pegawai.kode })
        .from(pegawai)
        .where(sql`${pegawai.kode} ~ '^[0-9]+$'`)
        .orderBy(sql`CAST(${pegawai.kode} AS INTEGER) DESC`)
        .limit(1);
      
      const lastNumber = lastPegawai.length > 0 ? parseInt(lastPegawai[0].kode || '0') : 0;
      payload.kode = (lastNumber + 1).toString();
    }

    const result = await db.insert(pegawai).values(payload).returning();
    
    // Background Sync (Non-blocking)

    return c.json({ status: true, message: 'Pegawai berhasil ditambahkan ke dalam basis data', data: result[0] });
  } catch (error: any) {
    console.error('[Pegawai Create Error]', error);
    return c.json({ status: false, message: 'Gagal menambah data pegawai. Nama Lengkap & Kode wajib unik.' }, 500);
  }
});

pegawaiRouter.put('/:id', zValidator('json', pegawaiSchemaValidation), async (c) => {
  try {
    const id = c.req.param('id');
    if (!id) return c.json({ status: false, message: 'ID tidak valid' }, 400);
    const body = c.req.valid('json');

    const payload = {
      ...body,
      nip: body.nip && body.nip.trim() !== '' ? body.nip : null
    };

    const result = await db.update(pegawai).set(payload).where(eq(pegawai.id, id)).returning();
    
    if (result.length === 0) {
      return c.json({ status: false, message: 'Data pegawai tidak ditemukan dalam sistem' }, 404);
    }
    
    // Background Sync (Non-blocking)

    return c.json({ status: true, message: 'Data pegawai telah diperbarui secara aman', data: result[0] });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal memperbarui rekam data pegawai' }, 500);
  }
});

// [Keamanan Berlapis 3]: Menghapus data fundamental wajib berstatus Super Admin.
pegawaiRouter.delete('/:id', requireSuperAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    if (!id) return c.json({ status: false, message: 'ID tidak valid' }, 400);
    const result = await db.delete(pegawai).where(eq(pegawai.id, id)).returning();
    
    if (result.length === 0) {
      return c.json({ status: false, message: 'Otoritas gagal, data pegawai tidak dikenali' }, 404);
    }
    
    // Background Sync (Non-blocking) - Gunakan KODE sebagai rujukan hapus di Sheets
    if (result[0].kode) {
    }

    return c.json({ status: true, message: 'Rekam Data Pegawai telah dilenyapkan dengan sukses' });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal menghapus rekaman master data' }, 500);
  }
});

export default pegawaiRouter;
