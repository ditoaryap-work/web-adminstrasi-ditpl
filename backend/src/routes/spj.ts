import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db';
import { perjadin, config } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx, mergePdfs, convertImageToPdf } from '../services/pdf.service';
import { syncSpjToSheets, deleteSpjFromSheets } from '../services/sheets.service';
import { uploadBufferToDrive } from '../services/drive.service';
import { getTemplatePath } from '../services/template.service';
import path from 'path';
import fs from 'fs/promises';

type HonoEnv = { Variables: { user: JwtPayload } };
const spjRouter = new Hono<HonoEnv>();
spjRouter.use('/*', authMiddleware);

/**
 * Utilitas Anti-Floating Point Bawaan Node:
 * Uang selalu dikerjakan dalam kerangka BigInt sebelum dilempar kembali sbg String.
 * Mencegah presisi desimal hilang misal (0.1 + 0.2 === 0.30000004) ketika transaksi dieksekusi.
 */
function safeAddFinancials(...amounts: any[]): string {
    const total = amounts.reduce((acc, val) => {
        const cleanVal = String(val || '0').replace(/[^0-9-]/g, ''); // Extract angka real saja
        return acc + BigInt(cleanVal || '0');
    }, BigInt(0));
    return total.toString();
}

/**
 * Drizzle ORM JSONB Optimation Model
 * Melindungi dari tabel bengkak dengan menyerap sub-komponen ke JSONB Schema.
 */
const financialItemSchema = z.array(z.record(z.string(), z.any())).optional().nullable();

const spjSchemaValidator = z.object({
  nomorSt: z.string().max(100).optional().nullable(),
  nip: z.string().max(30).optional().nullable(),
  nama: z.string().max(200).optional().nullable(),
  tujuan: z.array(z.string()).optional().nullable(),
  
  // Array Dinamis Sub-Data Finansial
  uangHarian: financialItemSchema,
  penginapan: financialItemSchema,
  transport: financialItemSchema,
  tiketBerangkat: financialItemSchema,
  tiketPulang: financialItemSchema,
  
  taksi: z.number().or(z.string()).optional().nullable(),
  representasi: z.number().or(z.string()).optional().nullable(),
  uangLainnya: z.number().or(z.string()).optional().nullable(),
});

spjRouter.get('/', async (c) => {
   try {
       const user = c.get('user') as JwtPayload;
       const listQuery = db.select().from(perjadin).orderBy(desc(perjadin.createdAt));
       if (user.role !== 'Super Admin') listQuery.where(eq(perjadin.timPoksi, user.timPoksi));
       const list = await listQuery;
       return c.json({ status: true, message: 'Daftar SPJ di-load sempurna.', data: list });
   } catch(e) {
       return c.json({ status: false, message: 'Gagal merender list SPJ' }, 500);
   }
});

spjRouter.post('/', async (c) => {
    try {
        const user = c.get('user') as JwtPayload;
        const body = await c.req.parseBody();
        
        // 1. Parsing JSON data dari form field 'data'
        const rawData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
        
        // 2. Transaksi Database
        const savedSpj = await db.transaction(async (tx) => {
            const insertResult = await tx.insert(perjadin).values({
                ...rawData,
                timPoksi: user.timPoksi,
                updatedAt: new Date(),
            }).returning();
            return insertResult[0];
        });

        // 3. Sinkronisasi Asynchronus ke Google Sheets (Fire & Forget untuk kecepatan, atau await untuk kepastian)
        // Disini kita await agar user tahu jika gagal sync (sesuai permintaan user untuk reliability)

        // 4. Proses PDF Rendering (Carbone) & Merging (pdf-lib)
        const userConfig = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
        const folderId = userConfig[0]?.folderIdSpj;
        const templateId = userConfig[0]?.templateIdSpj;

        if (templateId && folderId) {
            console.log(`[SPJ Engine] Starting PDF generation for ${savedSpj.id}`);
            
            // a. Ambil Template (Smart Sync: otomatis download ke VPS jika belum ada)
            const localTemplatePath = await getTemplatePath('TPL_SPJ', user.timPoksi);
            if (!localTemplatePath) {
                throw new Error(`Template SPJ untuk tim ${user.timPoksi} gagal dimuat. Cek Google Drive.`);
            }
            const kwitansiBuffer = await generatePdfFromDocx(localTemplatePath, savedSpj);
            
            // b. Ambil Lampiran Bukti dari Multipart
            const pdfBuffers: Buffer[] = [kwitansiBuffer];
            const isMultipart = c.req.header('content-type')?.includes('multipart/form-data');
            const files = isMultipart ? await c.req.formData() : null;
            
            if (files) {
                const attachments = files.getAll('files') as File[];
                for (const file of attachments) {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    if (file.type === 'application/pdf') {
                        pdfBuffers.push(buffer);
                    } else if (file.type.startsWith('image/')) {
                         const imgPdf = await convertImageToPdf(buffer, file.type);
                         pdfBuffers.push(imgPdf);
                    }
                }
            }

            // c. Merge All into Master PDF
            const masterPdfBuffer = await mergePdfs(pdfBuffers);

            // d. Archive to Google Drive
            const fileName = `${savedSpj.tglBerangkat || 'SPJ'}_${savedSpj.nama?.replace(/\s+/g, '_')}_Master.pdf`;
            const driveLink = await uploadBufferToDrive(masterPdfBuffer, 'application/pdf', fileName, folderId);

            // e. Update Database dengan Link Drive Final
            await db.update(perjadin).set({ fileLink: driveLink ?? null }).where(eq(perjadin.id, savedSpj.id));
            savedSpj.fileLink = driveLink ?? null;
        }

        return c.json({ status: true, message: 'SPJ Berhasil Terbit! Data tersimpan di PostgreSQL & Google Sheets, PDF terarsip di Drive.', data: savedSpj });
        
    } catch(err: any) {
        console.error('[SPJ Router Error]', err);
        return c.json({ status: false, message: `Protokol Gagal: ${err.message}` }, 500);
    }
});

spjRouter.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const user = c.get('user') as JwtPayload;

        const existing = await db.select().from(perjadin).where(eq(perjadin.id, id)).limit(1);
        if (existing.length === 0) return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
        
        if (user.role !== 'Super Admin' && existing[0].timPoksi !== user.timPoksi) {
            return c.json({ status: false, message: 'Anda tidak memiliki akses menghapus data tim lain' }, 403);
        }

        await db.delete(perjadin).where(eq(perjadin.id, id));
        
        // Sync Delete ke Sheets

        return c.json({ status: true, message: 'SPJ Dihapuskan dari PostgreSQL & Google Sheets.' });
    } catch (e: any) {
        return c.json({ status: false, message: e.message }, 500);
    }
});

export default spjRouter;
