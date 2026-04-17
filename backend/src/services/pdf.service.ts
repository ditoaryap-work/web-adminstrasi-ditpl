import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
import { Mutex } from 'async-mutex';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// CONCURRENCY CONTROL:
// Mutex (Lock mechanism) antrean eksekusi agar LibreOffice TIDAK BERJALAN MULTIPROSSES (Mencegah VPS 2GB OOM)
const pdfMutex = new Mutex();

/**
 * Merender Template DOCX dengan docxtemplater lalu mengkonversi ke PDF dengan Native LibreOffice CLI
 * Dilengkapi dengan proteksi Memory (Mutex queue).
 * Jika ada multiple HTTP requests untuk render dokumen, proses akan antre berurutan (Awaiting).
 * @param templatePath Path template source dari disk VPS local
 * @param data Object parameter placeholder untuk di-injeksi ke template
 * @returns Buffer biner dari PDF untuk disalurkan ke Drive API stream.
 */
export async function generatePdfFromDocx(templatePath: string, data: any): Promise<Buffer> {
    // Wajib Menunggu Pintu Terbuka (Lock) -> Memblokir proses berjalan bersamaan
    const release = await pdfMutex.acquire();
    
    // File sementara (Temporary files)
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const tempDocsDir = os.tmpdir();
    
    const tempDocxPath = path.join(tempDocsDir, `temp_${uniqueId}.docx`);
    const tempPdfName = `temp_${uniqueId}.pdf`;
    const tempPdfPath = path.join(tempDocsDir, tempPdfName);

    try {
        console.log(`[Templating] Membaca docx template murni JS...`);
        // 1. Membaca DOCX Template murni dalam memori
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        
        // Konfigurasi agar mendukung {{variabel}} secara native
        const doc = new Docxtemplater(zip, {
            delimiters: { 
                start: '{{', 
                end: '}}' 
            },
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ""
        });

        // 2. Set Data & render DOCX (Murni di Node/Bun RAM)
        doc.render(data);

        // 3. Simpan DOCX mutasi sementara
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
        fs.writeFileSync(tempDocxPath, buf);

        console.log(`[LibreOffice Native CLI] Mengkonversi DOCX ke PDF...`);
        // 4. Konversi PDF secara sinkron menggunakan Native LibreOffice CLI
        // Handling untuk Local Mac development dan Ubuntu VPS
        const isMac = os.platform() === 'darwin';
        const sofficeCmd = isMac ? '/Applications/LibreOffice.app/Contents/MacOS/soffice' : 'soffice';
        
        // Timeout 15 dtk agar jika LibreOffice nge-hang, proses child ini mati dan release() Mutex tetap dipanggil via finally.
        await execAsync(`"${sofficeCmd}" --headless --convert-to pdf "${tempDocxPath}" --outdir "${tempDocsDir}"`, { timeout: 15000 });

        // 5. Baca hasil jadi dari LibreOffice
        if (!fs.existsSync(tempPdfPath)) {
            throw new Error('Hasil PDF tidak ditemukan setelah proses eksekusi LibreOffice selesai.');
        }
        
        const resultPdfBuffer = fs.readFileSync(tempPdfPath);
        console.log(`[PDF Renderer Success] File PDF berhasil dibuat. Memori aman.`);
        
        return resultPdfBuffer;
    } catch (error) {
        console.error('[PDF Pipeline Error]', error);
        
        // FALLBACK ERROR & ZOMBIE PROCESS KILLER
        try {
            await execAsync('pkill -f soffice.bin');
            console.log('[System Recovery] Zombie LibreOffice processes dikill secara brutal untuk mencegah OOM leak.');
        } catch (killErr) {
            // Abaikan error pkill
        }
        throw new Error('Terjadi kegagalan rendering atau konversi dokumen.');
    } finally {
        // Membersihkan Memory / Sampah Temporer
        try {
            if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        } catch(cleanupErr) {
             console.error('[Cleanup Error] Gagal menghapus file temp:', cleanupErr);
        }

        // Kuncinya Dibuka, trigger antrean proses berikutnya
        release();
    }
}

/**
 * Utility Function: Opsi paksa bunuh daemon libreoffice dari system script eksternal atau cron scheduler
 */
export async function killZombieLibreOffice() {
    try {
        await execAsync('pkill -f soffice.bin');
    } catch(e) {}
}

/**
 * Menggabungkan beberapa PDF Buffer menjadi 1 PDF Master Buffer.
 * Mendukung PDF asli dan Lampiran Gambar (yang sudah dikonversi ke PDF).
 */
export async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}

/**
 * Konversi Buffer Gambar (JPG/PNG) menjadi halaman PDF.
 */
export async function convertImageToPdf(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let image;

  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    image = await pdfDoc.embedJpg(imageBuffer);
  } else if (mimeType === 'image/png') {
    image = await pdfDoc.embedPng(imageBuffer);
  } else {
    throw new Error(`Mime type ${mimeType} tidak didukung untuk konversi ke PDF.`);
  }

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
