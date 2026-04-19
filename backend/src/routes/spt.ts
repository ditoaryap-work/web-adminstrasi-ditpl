import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { spt, config } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx } from '../services/pdf.service';
import { uploadBufferToDrive } from '../services/drive.service';
import { getTemplatePath } from '../services/template.service';
import fs from 'fs';
import { sanitizeFilename, formatFilenameDate } from '../utils/filename';

type HonoEnv = { Variables: { user: JwtPayload } };
const sptRouter = new Hono<HonoEnv>();

sptRouter.use('/*', authMiddleware);

const sptSchemaValidator = z.object({
  no: z.string().optional().nullable(),
  tanggalSurat: z.string().optional().nullable(),
  maksudPerjalanan: z.string().optional().nullable(),
  kegiatan: z.string().optional().nullable(),
  mak: z.string().optional().nullable(),
  peserta: z.array(z.any()).default([]),
});

sptRouter.get('/', async (c) => {
   try {
       const user = c.get('user') as JwtPayload;
       // Super admin bebas ambil, tapi pegawai standar hanya dari tim-nya
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

// CREATE & PARALLEL PDF GENERATION
sptRouter.post('/', zValidator('json', sptSchemaValidator), async (c) => {
  let tmpTemplatePath: string | undefined;
  
  try {
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json');
    const pesertaCount = Array.isArray(body.peserta) ? body.peserta.length : 0;
    
    // 1. Simpan ke database terlebih dahulu
    const insertResult = await db.insert(spt).values({
       ...body,
       timPoksi: user.timPoksi,
       pesertaCount
    }).returning();
    
    const sptData = insertResult[0];
    
    // 2. Ambil Config untuk Folder tujuan upload Drive (template sudah lokal)
    const configResult = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
    const timConfig = configResult[0];
    
    if (!timConfig || !timConfig.folderIdSpt) {
       return c.json({ status: false, message: 'Gagal: Folder Drive SPT belum dikonfigurasi untuk tim ini.' }, 400);
    }
    
    // 3. Baca template lokal (Smart Sync: akan download otomatis dari Drive tim jika belum ada)
    const templateId = pesertaCount > 5 ? 'TPL_SPT_V2' : 'TPL_SPT_V1';
    const finalTemplatePath = await getTemplatePath(templateId, user.timPoksi);
    
    if (!finalTemplatePath) {
       return c.json({ status: false, message: `Template '${templateId}' untuk tim ${user.timPoksi} gagal dimuat. Pastikan file tersedia di Google Drive.` }, 400);
    }
    
    // 4. Generate PDF
    // 4.1 Sync Mapping Placeholders (Gambar 3 & 4)
    const renderData = {
        nomor_surat: sptData.no,
        maksud_perjalanan: sptData.maksudPerjalanan,
        kegiatan: sptData.kegiatan,
        mak: sptData.mak,
        tanggal_surat: sptData.tanggalSurat,
        peserta: Array.isArray(sptData.peserta) ? sptData.peserta.map(p => ({
            nama_lengkap: p.namaLengkap || p.nama_lengkap,
            gol: p.golongan || p.gol,
            nip: p.nip,
            tujuan: p.tujuan,
            tanggal_pelaksanaan: p.tanggalPelaksanaan || p.tanggal_pelaksanaan
        })) : []
    };

    const pdfBuffer = await generatePdfFromDocx(finalTemplatePath, renderData);
    
    // 5. Stream Buffer ke Google Drive
    const cleanNo = sanitizeFilename(sptData.no, 20);
    const cleanKegiatan = sanitizeFilename(sptData.kegiatan, 30);
    const cleanDate = formatFilenameDate(sptData.tanggalSurat);
    
    // Format: SPT_[Nomor]_[Kegiatan]_[Tanggal].pdf
    const pdfFilename = `SPT_${cleanNo || sptData.id}_${cleanKegiatan}_${cleanDate}.pdf`.replace(/_{2,}/g, '_');

    const driveLink = await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSpt);
    
    // 6. Update Link Drive di database
    await db.update(spt).set({ fileLink: driveLink }).where(eq(spt.id, sptData.id));
    
    return c.json({ 
       status: true, 
       message: 'SPT berhasil diterbitkan dan PDF diarsipkan ke Cloud', 
       data: { ...sptData, fileLink: driveLink }
    });
    
  } catch (error: any) {
    console.error('Error in SPT Creation pipeline:', error);
    
    return c.json({ 
        status: false, 
        message: 'Gagal menyelesaikan pembuatan dokumen SPT. Detail: ' + (error.message || 'Unknown error') 
    }, 500); 
  }
});

export default sptRouter;
