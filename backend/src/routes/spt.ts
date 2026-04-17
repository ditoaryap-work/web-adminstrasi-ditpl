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
    
    // 3. Baca template lokal (tanpa download dari Google Drive)
    const pesertaCount = Array.isArray(sptData.peserta) ? (sptData.peserta as any[]).length : 0;
    const templateId = pesertaCount > 5 ? 'TPL_SPT_V2' : 'TPL_SPT_V1';
    const tmpTemplatePath2 = getTemplatePath(templateId);
    
    if (!tmpTemplatePath2) {
       return c.json({ status: false, message: `Template lokal '${templateId}' tidak ditemukan. Upload template terlebih dahulu via Sistem Template.` }, 400);
    }
    
    // 4. Generate PDF
    const pdfBuffer = await generatePdfFromDocx(tmpTemplatePath2, sptData);
    
    // 5. Stream Buffer ke Google Drive
    const pdfFilename = `SPT_${sptData.no ? sptData.no.replace(/\//g, '_') : sptData.id}.pdf`;
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
    
    // Pembersihan fall-back local template jika gagal saat merender
    if (tmpTemplatePath && fs.existsSync(tmpTemplatePath)) {
        fs.unlinkSync(tmpTemplatePath);
    }
    
    return c.json({ 
        status: false, 
        message: 'Gagal menyelesaikan pembuatan dokumen SPT. Detail mesin: ' + (error.message || 'Unknown error') 
    }, 500); 
  }
});

export default sptRouter;
