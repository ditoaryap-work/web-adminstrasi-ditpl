import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { sptjm, config } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx } from '../services/pdf.service';
import { uploadBufferToDrive } from '../services/drive.service';
import { getTemplatePath } from '../services/template.service';
import fs from 'fs';

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
  let tmpTemplatePath: string | undefined;
  
  try {
    const user = c.get('user') as JwtPayload;
    const body = c.req.valid('json') as any;
    
    // Simpan ke DB First
    const insertResult = await db.insert(sptjm).values({
       ...body,
       timPoksi: user.timPoksi
    }).returning();
    
    const sptjmData = insertResult[0];
    
    // Ambil Config (hanya butuh folderIdSptjm untuk upload hasil PDF)
    const configResult = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
    const timConfig = configResult[0];
    
    if (!timConfig || !timConfig.folderIdSptjm) {
       return c.json({ status: false, message: 'Gagal: Folder Drive SPTJM belum dikonfigurasi untuk tim ini.' }, 400);
    }
    
    // Baca template SPTJM dari disk lokal
    const localTemplatePath = getTemplatePath('TPL_SPTJM');
    if (!localTemplatePath) {
       return c.json({ status: false, message: 'Template SPTJM lokal tidak ditemukan. Upload template via Sistem Template.' }, 400);
    }
    
    // Mutex Locked PDF Processing
    const pdfBuffer = await generatePdfFromDocx(localTemplatePath, sptjmData);
    
    // Upload PDF ke Google Drive
    const pdfFilename = `SPTJM_${sptjmData.namaLengkap ? sptjmData.namaLengkap.replace(/\s+/g, '_') : sptjmData.id}.pdf`;
    const driveLink = await uploadBufferToDrive(pdfBuffer, 'application/pdf', pdfFilename, timConfig.folderIdSptjm);
    
    // Update DB
    await db.update(sptjm).set({ fileLink: driveLink }).where(eq(sptjm.id, sptjmData.id));
    
    return c.json({ 
       status: true, 
       message: 'Pembuatan Pakta Integritas Riil (SPTJM) berhasil.', 
       data: { ...sptjmData, fileLink: driveLink }
    });
    
  } catch (error: any) {
    console.error('Error in SPTJM pipeline:', error);
    if (tmpTemplatePath && fs.existsSync(tmpTemplatePath)) {
        fs.unlinkSync(tmpTemplatePath);
    }
    return c.json({ status: false, message: 'Generate SPTJM gagal: ' + (error.message || 'Error System') }, 500); 
  }
});

export default sptjmRouter;
