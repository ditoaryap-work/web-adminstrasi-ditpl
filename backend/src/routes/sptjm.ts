import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { sptjm, config } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx } from '../services/pdf.service';
import { uploadBufferToDrive, deleteFileFromDrive } from '../services/drive.service';
import { getTemplatePath } from '../services/template.service';
import { sanitizeFilename, formatFilenameDate } from '../utils/filename';

const extractFileId = (link: string | null) => {
  if (!link) return null;
  const match = link.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
};

type HonoEnv = { Variables: { user: JwtPayload } };
const sptjmRouter = new Hono<HonoEnv>();

sptjmRouter.use('/*', authMiddleware);

const sptjmSchemaValidator = z.object({
  namaLengkap: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  jabatan: z.string().optional().nullable(),
  tujuan: z.string().optional().nullable(),
  tanggalPerjalanan: z.string().optional().nullable(),
  tanggalKembali: z.string().optional().nullable(),
  tiketBerangkat: z.number().or(z.string()).optional().nullable(),
  tiketPulang: z.number().or(z.string()).optional().nullable(),
  biayaSbm: z.number().or(z.string()).optional().nullable(),
  totalBiaya: z.number().or(z.string()).optional().nullable(),
  tanggalTtd: z.string().optional().nullable(),
});

sptjmRouter.get('/', async (c) => {
   try {
       const user = c.get('user') as JwtPayload;
       const listQuery = db.select().from(sptjm).orderBy(desc(sptjm.createdAt));
       if (user.role !== 'Super Admin') {
           listQuery.where(eq(sptjm.timPoksi, user.timPoksi));
       }
       const list = await listQuery;
       return c.json({ status: true, message: 'Data SPTJM dimuat', data: list });
   } catch(e) {
       return c.json({ status: false, message: 'Gagal memuat list SPTJM' }, 500);
   }
});

sptjmRouter.post('/', zValidator('json', sptjmSchemaValidator), async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json') as any;
    
    // Sanitize body: Postgres doesn't like empty strings for numeric/date columns
    // and definitely doesn't like thousands separators (dots) for numeric columns.
    const sanitizedBody: any = {};
    const numericFields = ['tiketBerangkat', 'tiketPulang', 'biayaSbm', 'totalBiaya'];

    Object.keys(body).forEach(key => {
        let val = body[key];
        
        // 1. Convert empty string to null
        if (val === "") {
            sanitizedBody[key] = null;
            return;
        }

        // 2. Remove dots from numeric fields if they are strings
        if (numericFields.includes(key) && typeof val === 'string') {
            val = val.replace(/\./g, '');
        }

        sanitizedBody[key] = val;
    });
    
    // Simpan ke DB First
    const insertResult = await db.insert(sptjm).values({
       ...sanitizedBody,
       timPoksi: user.timPoksi
    }).returning();
    
    const sptjmData = insertResult[0];
    
    // Ambil Config (hanya butuh folderIdSptjm untuk upload hasil PDF)
    const configResult = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
    const timConfig = configResult[0];
    
    if (!timConfig || !timConfig.folderIdSptjm) {
       return c.json({ status: false, message: 'Gagal: Folder Drive SPTJM belum dikonfigurasi untuk tim ini.' }, 400);
    }
    
    // Baca template SPTJM dari disk lokal (Smart Sync: download otomatis jika belum ada)
    const localTemplatePath = await getTemplatePath('TPL_SPTJM', user.timPoksi);
    if (!localTemplatePath) {
       return c.json({ status: false, message: `Template SPTJM untuk tim ${user.timPoksi} tidak ditemukan. Pastikan file tersedia di Google Drive.` }, 400);
    }
    
    // MUTEX LOCKED PDF PROCESSING
    // 2. Persiapkan data gabungan (Dual-format Keys) untuk Docxtemplater Placeholder
    // Menyesuaikan dengan 'Gambar 2' (Template SPTJM)
    const { numberToTerbilang, formatRupiah, formatIndonesianDatePlain, formatIndonesianDateRange } = await import('../utils/formatter');
    const formattedDateRange = formatIndonesianDateRange(sptjmData.tanggalPerjalanan, sptjmData.tanggalKembali);
    
    const renderData = {
       ...sptjmData,
       // Pascal Case untuk Template (Gambar 2)
       "Nama Lengkap": sptjmData.namaLengkap,
       "NIP": sptjmData.nip,
       "Jabatan": sptjmData.jabatan,
       "Tujuan": sptjmData.tujuan,
       "Tanggal": formattedDateRange,
       "Total": formatRupiah(Number(sptjmData.totalBiaya || 0)),
       "Terbilang": numberToTerbilang(Number(sptjmData.totalBiaya || 0)) + " Rupiah",
       "Tiket Berangkat": formatRupiah(Number(sptjmData.tiketBerangkat || 0)),
       "Tiket Pulang": formatRupiah(Number(sptjmData.tiketPulang || 0)),
       "Biaya SBM": formatRupiah(Number(sptjmData.biayaSbm || 0)),
       "Tanggal TTD": formatIndonesianDatePlain(sptjmData.tanggalTtd),
       "Nama": sptjmData.namaLengkap,
       "NIP BAWAH": sptjmData.nip ? `NIP. ${sptjmData.nip}` : '-',
       
       // Legacy Fallback
       nama_lengkap: sptjmData.namaLengkap,
       nip_formatted: sptjmData.nip ? `NIP. ${sptjmData.nip}` : '-',
       tanggal_ttd: formatIndonesianDatePlain(sptjmData.tanggalTtd)
    };

    const pdfBuffer = await generatePdfFromDocx(localTemplatePath, renderData);
    
    // Upload PDF ke Google Drive
    const cleanNama = sanitizeFilename(sptjmData.namaLengkap, 30);
    const cleanTujuan = sanitizeFilename(sptjmData.tujuan, 30);
    const cleanDate = formatFilenameDate(sptjmData.tanggalPerjalanan);
    
    // Format: SPTJM_[Nama]_[Tujuan]_[Tanggal].pdf
    const pdfFilename = `SPTJM_${cleanNama || sptjmData.id}_${cleanTujuan}_${cleanDate}.pdf`.replace(/_{2,}/g, '_');

    const driveLink = (await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSptjm)) || null;
    
    // Update DB
    await db.update(sptjm).set({ fileLink: driveLink }).where(eq(sptjm.id, sptjmData.id));
    
    return c.json({ 
       status: true, 
       message: 'Pembuatan Pakta Integritas Riil (SPTJM) berhasil.', 
       data: { ...sptjmData, fileLink: driveLink }
    });
    
  } catch (error: any) {
    console.error('Error in SPTJM pipeline:', error);
    return c.json({ status: false, message: 'Generate SPTJM gagal: ' + (error.message || 'Error System') }, 500); 
  }
});

sptjmRouter.patch('/:id', zValidator('json', sptjmSchemaValidator), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json') as any;
    
    const numericFields = ['tiketBerangkat', 'tiketPulang', 'biayaSbm', 'totalBiaya'];
    const sanitizedBody: any = {};
    Object.keys(body).forEach(key => {
        let val = body[key];
        if (val === "") {
            sanitizedBody[key] = null;
            return;
        }
        if (numericFields.includes(key) && typeof val === 'string') {
            val = val.replace(/\./g, '');
        }
        sanitizedBody[key] = val;
    });

    // Get existing record to cleanup old file if exists
    const existing = await db.select().from(sptjm).where(eq(sptjm.id, id)).limit(1);
    const oldFileLink = existing[0]?.fileLink;

    // Update DB
    const updateResult = await db.update(sptjm)
      .set({ ...sanitizedBody, updatedAt: new Date() })
      .where(eq(sptjm.id, id))
      .returning();
    
    if (updateResult.length === 0) {
      return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
    }

    const sptjmData = updateResult[0];
    
    // Re-generate PDF logic
    const configResult = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
    const timConfig = configResult[0];
    
    if (timConfig && timConfig.folderIdSptjm) {
      const localTemplatePath = await getTemplatePath('TPL_SPTJM', user.timPoksi);
      if (localTemplatePath) {
        const { numberToTerbilang, formatRupiah, formatIndonesianDatePlain, formatIndonesianDateRange } = await import('../utils/formatter');
        const formattedDateRange = formatIndonesianDateRange(sptjmData.tanggalPerjalanan, sptjmData.tanggalKembali);
        
        const renderData = {
           ...sptjmData,
           "Nama Lengkap": sptjmData.namaLengkap,
           "NIP": sptjmData.nip,
           "Jabatan": sptjmData.jabatan,
           "Tujuan": sptjmData.tujuan,
           "Tanggal": formattedDateRange,
           "Total": formatRupiah(Number(sptjmData.totalBiaya || 0)),
           "Terbilang": numberToTerbilang(Number(sptjmData.totalBiaya || 0)) + " Rupiah",
           "Tiket Berangkat": formatRupiah(Number(sptjmData.tiketBerangkat || 0)),
           "Tiket Pulang": formatRupiah(Number(sptjmData.tiketPulang || 0)),
           "Biaya SBM": formatRupiah(Number(sptjmData.biayaSbm || 0)),
           "Tanggal TTD": formatIndonesianDatePlain(sptjmData.tanggalTtd),
           "Nama": sptjmData.namaLengkap,
           "NIP BAWAH": sptjmData.nip ? `NIP. ${sptjmData.nip}` : '-',
        };

        const pdfBuffer = await generatePdfFromDocx(localTemplatePath, renderData);
        const cleanNama = sanitizeFilename(sptjmData.namaLengkap, 30);
        const cleanTujuan = sanitizeFilename(sptjmData.tujuan, 30);
        const cleanDate = formatFilenameDate(sptjmData.tanggalPerjalanan);
        const pdfFilename = `SPTJM_${cleanNama || sptjmData.id}_${cleanTujuan}_${cleanDate}.pdf`.replace(/_{2,}/g, '_');
        const driveLink = (await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSptjm)) || null;
        
        // Cleanup old file from Drive if we have a new one
        const oldFileId = extractFileId(oldFileLink);
        if (oldFileId && driveLink) {
          await deleteFileFromDrive(oldFileId);
        }

        await db.update(sptjm).set({ fileLink: driveLink }).where(eq(sptjm.id, sptjmData.id));
        sptjmData.fileLink = driveLink;
      }
    }

    return c.json({ status: true, message: 'Update SPTJM berhasil', data: sptjmData });
  } catch (error: any) {
    console.error('Error in SPTJM Update:', error);
    return c.json({ status: false, message: 'Update SPTJM gagal: ' + error.message }, 500);
  }
});

sptjmRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.delete(sptjm).where(eq(sptjm.id, id)).returning();
    if (result.length === 0) {
      return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
    }

    // Cleanup file from Drive if exists
    const fileId = extractFileId(result[0].fileLink);
    if (fileId) {
      await deleteFileFromDrive(fileId);
    }

    return c.json({ status: true, message: 'Data SPTJM berhasil dihapus' });
  } catch (e: any) {
    return c.json({ status: false, message: 'Gagal menghapus data: ' + e.message }, 500);
  }
});

export default sptjmRouter;
