import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { spt, config } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx } from '../services/pdf.service';
import { uploadBufferToDrive, deleteFileFromDrive } from '../services/drive.service';
import { getTemplatePath } from '../services/template.service';
import { sanitizeFilename, formatFilenameDate } from '../utils/filename';
import { formatIndonesianDatePlain } from '../utils/formatter';

const extractFileId = (link: string | null) => {
  if (!link) return null;
  const match = link.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
};

type HonoEnv = { Variables: { user: JwtPayload } };
const sptRouter = new Hono<HonoEnv>();

sptRouter.use('/*', authMiddleware);

const sptSchemaValidator = z.object({
  no: z.string().min(1, 'Nomor surat wajib diisi'),
  tanggalSurat: z.string().min(1, 'Tanggal surat wajib diisi'),
  maksudPerjalanan: z.string().min(1, 'Maksud perjalanan wajib diisi'),
  kegiatan: z.string().min(1, 'Kegiatan wajib diisi'),
  mak: z.string().min(1, 'MAK wajib diisi'),
  peserta: z.array(z.object({
    namaLengkap: z.string().optional().nullable(),
    nip: z.string().optional().nullable(),
    jabatan: z.string().optional().nullable(),
    gol: z.string().optional().nullable(),
    pangkatGol: z.string().optional().nullable(),
    tujuan: z.string().optional().nullable(),
    tanggalPelaksanaan: z.string().optional().nullable(),
    lamanya: z.string().optional().nullable(),
    tanggalMulai: z.string().optional().nullable(),
    tanggalSelesai: z.string().optional().nullable()
  })).min(1, 'Minimal 1 peserta harus ditambahkan'),
});

sptRouter.get('/', async (c) => {
   try {
       const user = c.get('user') as JwtPayload;
       const listQuery = db.select().from(spt).orderBy(desc(spt.createdAt));
       if (user.role !== 'Super Admin') {
           listQuery.where(eq(spt.timPoksi, user.timPoksi));
       }
       const list = await listQuery;
       return c.json({ status: true, message: 'Data SPT dimuat', data: list });
   } catch(e) {
       return c.json({ status: false, message: 'Gagal memuat list SPT' }, 500);
   }
});

sptRouter.get('/:id', async (c) => {
   try {
       const id = c.req.param('id');
       const user = c.get('user') as JwtPayload;
       const result = await db.select().from(spt).where(eq(spt.id, id)).limit(1);
       if (result.length === 0) return c.json({ status: false, message: 'Data SPT tidak ditemukan' }, 404);
       
       if (user.role !== 'Super Admin' && result[0].timPoksi !== user.timPoksi) {
           return c.json({ status: false, message: 'Akses ditolak' }, 403);
       }
       
       return c.json({ status: true, message: 'Data SPT dimuat', data: result[0] });
   } catch(e) {
       return c.json({ status: false, message: 'Gagal memuat detail SPT' }, 500);
   }
});

// Helper untuk sanitasi body SPT (Convert "" to null)
const sanitizeSptBody = (body: any) => {
    const sanitized: any = {};
    Object.keys(body).forEach(key => {
        let val = body[key];
        
        if (val === "" && key !== 'no') { // Nomor surat tidak boleh null jika ada valitas Zod, tapi antisipasi umum
            sanitized[key] = null;
            return;
        }

        if (key === 'peserta' && Array.isArray(val)) {
            sanitized[key] = val.map(p => {
                const sp: any = {};
                Object.keys(p).forEach(pk => {
                    sp[pk] = p[pk] === "" ? null : p[pk];
                });
                return sp;
            });
            return;
        }

        sanitized[key] = val;
    });
    return sanitized;
};

sptRouter.post('/', zValidator('json', sptSchemaValidator), async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json');
    const pesertaCount = Array.isArray(body.peserta) ? body.peserta.length : 0;
    
    // 1. Sanitasi & Simpan ke database
    const sanitizedBody = sanitizeSptBody(body);
    const insertResult = await db.insert(spt).values({
       ...sanitizedBody,
       timPoksi: user.timPoksi,
       pesertaCount
    }).returning();
    
    const sptData = insertResult[0];
    
    // 2. Ambil Config
    const configResult = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
    const timConfig = configResult[0];
    
    if (!timConfig || !timConfig.folderIdSpt) {
       return c.json({ status: false, message: 'Gagal: Folder Drive SPT belum dikonfigurasi untuk tim ini.' }, 400);
    }
    
    // 3. Baca template
    const templateId = pesertaCount > 5 ? 'TPL_SPT_V2' : 'TPL_SPT_V1';
    const finalTemplatePath = await getTemplatePath(templateId, user.timPoksi);
    
    if (!finalTemplatePath) {
       return c.json({ status: false, message: `Template '${templateId}' untuk tim ${user.timPoksi} gagal dimuat.` }, 400);
    }
    
    // 4. Generate PDF
    const renderData = {
        nomor_surat: sptData.no,
        maksud_perjalanan: sptData.maksudPerjalanan,
        kegiatan: sptData.kegiatan,
        mak: sptData.mak,
        tanggal_surat: formatIndonesianDatePlain(sptData.tanggalSurat),
        peserta: Array.isArray(sptData.peserta) ? (sptData.peserta as any[]).map((p, idx) => ({
            no: idx + 1,
            nama_lengkap: p.namaLengkap,
            gol: p.gol || p.pangkatGol,
            pangkat_gol: p.pangkatGol || p.gol,
            nip: p.nip,
            tujuan: p.tujuan,
            tanggal_pelaksanaan: p.tanggalPelaksanaan
        })) : []
    };

    const pdfBuffer = await generatePdfFromDocx(finalTemplatePath, renderData);
    
    // 5. Upload Drive
    const cleanNo = sanitizeFilename(sptData.no, 20);
    const cleanKegiatan = sanitizeFilename(sptData.kegiatan, 30);
    const cleanDate = formatFilenameDate(sptData.tanggalSurat);
    const pdfFilename = `SPT_${cleanNo || sptData.id}_${cleanKegiatan}_${cleanDate}.pdf`.replace(/_{2,}/g, '_');

    const driveLink = (await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSpt)) || null;
    
    // 6. Update Link
    await db.update(spt).set({ fileLink: driveLink }).where(eq(spt.id, sptData.id));
    
    return c.json({ 
       status: true, 
       message: 'SPT berhasil diterbitkan', 
       data: { ...sptData, fileLink: driveLink }
    });
    
  } catch (error: any) {
    console.error('Error in SPT Creation:', error);
    return c.json({ status: false, message: 'Gagal membuat SPT: ' + error.message }, 500); 
  }
});

sptRouter.patch('/:id', zValidator('json', sptSchemaValidator), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json');
    const pesertaCount = Array.isArray(body.peserta) ? body.peserta.length : 0;

    // 1. RBAC Check & Get Existing
    const existingResult = await db.select().from(spt).where(eq(spt.id, id)).limit(1);
    if (existingResult.length === 0) return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
    
    const existing = existingResult[0];
    if (user.role !== 'Super Admin' && existing.timPoksi !== user.timPoksi) {
       return c.json({ status: false, message: 'Anda tidak memiliki akses ke data tim lain' }, 403);
    }

    const oldFileLink = existing.fileLink;

    // 2. Sanitasi & Update DB
    const sanitizedBody = sanitizeSptBody(body);
    const updateResult = await db.update(spt)
      .set({ ...sanitizedBody, pesertaCount, updatedAt: new Date() })
      .where(eq(spt.id, id))
      .returning();
    
    const sptData = updateResult[0];

    // 3. Re-generate PDF
    const configResult = await db.select().from(config).where(eq(config.timPoksi, sptData.timPoksi)).limit(1);
    const timConfig = configResult[0];

    if (timConfig && timConfig.folderIdSpt) {
       const templateId = pesertaCount > 5 ? 'TPL_SPT_V2' : 'TPL_SPT_V1';
       const finalTemplatePath = await getTemplatePath(templateId, sptData.timPoksi);
       
       if (finalTemplatePath) {
          const renderData = {
              nomor_surat: sptData.no,
              maksud_perjalanan: sptData.maksudPerjalanan,
              kegiatan: sptData.kegiatan,
              mak: sptData.mak,
              tanggal_surat: formatIndonesianDatePlain(sptData.tanggalSurat),
              peserta: Array.isArray(sptData.peserta) ? (sptData.peserta as any[]).map((p, idx) => ({
                  no: idx + 1,
                  nama_lengkap: p.namaLengkap,
                  gol: p.gol || p.pangkatGol,
                  pangkat_gol: p.pangkatGol || p.gol,
                  nip: p.nip,
                  tujuan: p.tujuan,
                  tanggal_pelaksanaan: p.tanggalPelaksanaan
              })) : []
          };

          const pdfBuffer = await generatePdfFromDocx(finalTemplatePath, renderData);
          
          const cleanNo = sanitizeFilename(sptData.no, 20);
          const cleanKegiatan = sanitizeFilename(sptData.kegiatan, 30);
          const cleanDate = formatFilenameDate(sptData.tanggalSurat);
          const pdfFilename = `SPT_${cleanNo || sptData.id}_${cleanKegiatan}_${cleanDate}.pdf`.replace(/_{2,}/g, '_');

          const driveLink = (await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSpt)) || null;
          
          // Cleanup old file
          const oldFileId = extractFileId(oldFileLink);
          if (oldFileId && driveLink) {
            await deleteFileFromDrive(oldFileId);
          }

          await db.update(spt).set({ fileLink: driveLink }).where(eq(spt.id, sptData.id));
          sptData.fileLink = driveLink;
       }
    }

    return c.json({ status: true, message: 'Update SPT berhasil', data: sptData });
  } catch (error: any) {
    console.error('Error in SPT Update:', error);
    return c.json({ status: false, message: 'Update SPT gagal: ' + error.message }, 500);
  }
});

sptRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user') as JwtPayload;

    // 1. RBAC Check
    const existingResult = await db.select().from(spt).where(eq(spt.id, id)).limit(1);
    if (existingResult.length === 0) return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
    
    if (user.role !== 'Super Admin' && existingResult[0].timPoksi !== user.timPoksi) {
       return c.json({ status: false, message: 'Anda tidak memiliki akses menghapus data tim lain' }, 403);
    }

    // 2. Delete from DB
    const result = await db.delete(spt).where(eq(spt.id, id)).returning();
    
    // 3. Cleanup Drive
    const fileId = extractFileId(result[0].fileLink);
    if (fileId) {
      await deleteFileFromDrive(fileId);
    }

    return c.json({ status: true, message: 'SPT berhasil dihapus' });
  } catch (e: any) {
    return c.json({ status: false, message: 'Gagal menghapus SPT: ' + e.message }, 500);
  }
});

export default sptRouter;
