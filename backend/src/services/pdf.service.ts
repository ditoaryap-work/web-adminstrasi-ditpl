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
const pdfMutex = new Mutex();

const BACKEND_TEMP_DIR = path.resolve(process.cwd(), 'temp');

/**
 * Merender Template DOCX dengan isolasi profil LibreOffice (No Cache)
 */
export async function generatePdfFromDocx(templatePath: string, data: any): Promise<Buffer> {
    const release = await pdfMutex.acquire();
    
    // Per-request Workspace
    const id = Math.random().toString(36).substring(2, 11);
    const workDir = path.join(BACKEND_TEMP_DIR, `work_${id}`);
    const profileDir = path.join(workDir, 'profile');
    
    const tempDocxPath = path.join(workDir, `render.docx`);
    const tempPdfName = `render.pdf`;
    const tempPdfPath = path.join(workDir, tempPdfName);

    try {
        // [1] Setup Workspace
        if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });
        if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

        console.log(`[Templating] Rendering DOCX logic (JS)...`);
        const content = fs.readFileSync(templatePath, 'binary');
        
        // AUTO-DETECTION DELIMITERS: Jika konten mengandung '{{', gunakan legacy delimiters.
        // Jika hanya '{', gunakan SPTJM style. Default ke legacy jika bingung.
        const isLegacy = content.includes('{{');
        const delimiters = isLegacy 
            ? { start: '{{', end: '}}' } 
            : { start: '{', end: '}' };
            
        console.log(`[Templating] Using Delimiters: ${delimiters.start} ${delimiters.end} (Legacy: ${isLegacy})`);

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            delimiters: delimiters,
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ""
        });

        doc.render(data);
        const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
        fs.writeFileSync(tempDocxPath, buf);

        // [2] Conversion with Isolated Profile
        const isMac = os.platform() === 'darwin';
        const sofficeCmd = isMac ? '/Applications/LibreOffice.app/Contents/MacOS/soffice' : 'soffice';
        
        // Flags Teroptimasi & Profil Terisolasi (-env:UserInstallation)
        // Penulisan path profil untuk LibreOffice harus diawali 'file://'
        const profileUrl = `file://${profileDir}`;
        const flags = [
            `"-env:UserInstallation=${profileUrl}"`,
            '--headless',
            '--nologo',
            '--nodefault',
            '--norestore',
            '--nolockcheck',
            '--invisible',
            '--convert-to pdf',
            `"${tempDocxPath}"`,
            `--outdir "${workDir}"`
        ].join(' ');

        const libreCmd = `"${sofficeCmd}" ${flags}`;
        console.log(`[LibreOffice Native] Executing: ${sofficeCmd} (Isolated Profile)`);
        
        await execAsync(libreCmd, { timeout: 60000 });

        if (!fs.existsSync(tempPdfPath)) {
            throw new Error('LibreOffice gagal membuat file PDF. Cek ketersediaan binary soffice.');
        }
        
        if (!fs.existsSync(tempPdfPath)) {
            throw new Error('LibreOffice gagal membuat file PDF. Cek ketersediaan binary soffice.');
        }
        
        // [3] Langsung kirim file asli tanpa kompresi Ghostscript 
        // Agar kualitas 100% jernih (menghindari artefak shadow/ringing)
        console.log(`[PDF Pipeline] Mengirim dokumen asli (Uncompressed) untuk kualitas maksimal.`);
        return fs.readFileSync(tempPdfPath);

    } catch (error) {
        console.error('[PDF Pipeline Error]', error);
        try {
            // Jika macet total, bersihkan proses yang menggantung
            await execAsync('pkill -f soffice.bin');
        } catch (killErr) {}
        throw error;
    } finally {
        release(); // Penting: Bebaskan lock agar request lain bisa jalan
        // Deep Cleanup: Hapus seluruh folder workspace request
        try {
            if (fs.existsSync(workDir)) {
                fs.rmSync(workDir, { recursive: true, force: true });
            }
        } catch(cleanupErr) {
             console.error('[Cleanup Error]', cleanupErr);
        }
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
 * Kompresi PDF menggunakan Ghostscript.
 * Target: /printer (300 dpi) - Kualitas standar cetak (sangat tajam).
 */
async function compressPdf(inputPath: string, outputPath: string): Promise<void> {
    const gsCmd = [
        'gs',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/printer',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile="${outputPath}"`,
        `"${inputPath}"`
    ].join(' ');

    console.log(`[Ghostscript] Compressing: ${inputPath}`);
    await execAsync(gsCmd, { timeout: 30000 });
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
