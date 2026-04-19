import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Inisialisasi Auth menggunakan OAuth2 (Personal/Workspace Account - No Quota Limit)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // URL standar pengambilan Refresh Token
);

// Masukkan Refresh Token permanen yang didapat dari OAuth Playground
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Upload file ke Google Drive menggunakan metode Streaming.
 * Metode ini sangat hemat RAM karena file tidak di-buffer seluruhnya ke memory,
 * melainkan langsung di-pipe ke Google API.
 */
export async function uploadFileToDrive(file: File, folderId: string) {
  // 1. Validasi Ukuran (Maksimal 5MB sesuai instruksi)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file melebihi batas maksimal 5MB.');
  }

  // 2. Validasi Mime Types (OWASP File Upload Defense)
  const ALLOWED_MIME_TYPES = [
    'application/pdf', 
    'image/png', 
    'image/jpeg', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
  ];
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Tipe file tidak diizinkan. Hanya PDF, PNG, JPG, DOCX, dan XLSX yang diperbolehkan.');
  }

  // 3. Sanitasi Nama File (Mencegah Path Traversal & karakter berbahaya)
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

  try {
    // 4. Streaming Eksekusi Upload
    const fileStream = file.stream();
    
    const response = await drive.files.create({
      requestBody: {
        name: sanitizedName,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        // Konversi dari native Web ReadableStream (Bun) ke Node.js Readable yg diminta oleh googleapis
        // @ts-ignore
        body: Readable.fromWeb(fileStream), 
      },
      fields: 'id, webViewLink, webContentLink',
    });

    // 5. Ubah Permission menjadi 'Anyone with the link can view'
    if (response.data.id) {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    return response.data.webViewLink;

  } catch (error) {
    console.error('Error saat upload streaming ke Google Drive:', error);
    throw new Error('Gagal mengunggah file ke layanan Google Drive.');
  }
}

/**
 * Mendapatkan file dari Google Drive dan menyimpannya ke local (VPS file system) /tmp/
 * Ini vital untuk Carbone.io karena Carbone butuh absolute file path untuk template docx.
 * 
 * @systematic-debugging: Google Workspace native files (Google Docs, Sheets) TIDAK BISA
 * didownload dengan `alt=media`. Mereka harus di-EXPORT ke format binary.
 * - Google Docs → export ke DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
 * - Google Sheets → export ke XLSX (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
 * - File binary biasa (upload DOCX/XLSX) → download langsung dengan alt=media
 */
export async function downloadTemplateToLocal(fileId: string, outputFilename: string): Promise<string> {
  const outputPath = path.resolve('/tmp', outputFilename);

  // Deteksi tipe file terlebih dahulu
  const meta = await drive.files.get({ fileId, fields: 'mimeType, name' });
  const mimeType = meta.data.mimeType || '';

  // Map mimeType Google Workspace ke format export binary-nya
  const exportMimeMap: Record<string, string> = {
    'application/vnd.google-apps.document':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.google-apps.spreadsheet':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };

  const exportAs = exportMimeMap[mimeType];

  if (exportAs) {
    // Google Workspace file — gunakan Export API dengan arraybuffer
    console.log(`[Drive] Exporting Google Workspace file (${mimeType}) as binary...`);
    const res = await drive.files.export(
      { fileId, mimeType: exportAs },
      { responseType: 'arraybuffer' }
    );
    // Tulis binary buffer secara atomik ke disk
    const buffer = Buffer.from(res.data as ArrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Drive] Export OK → ${outputPath} (${buffer.length} bytes)`);
  } else {
    // File binary biasa (pdf, docx upload) — download langsung
    console.log(`[Drive] Downloading binary file (${mimeType})...`);
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const buffer = Buffer.from(res.data as ArrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Drive] Download OK → ${outputPath} (${buffer.length} bytes)`);
  }

  return outputPath;
}

/**
 * Upload Buffer memori langsung ke Google Drive menggunakan stream.
 * Sangat efisien dan membebaskan RAM secara instan saat aliran tertransfer ke Google.
 */
export async function uploadBufferToDrive(buffer: Buffer, mimeType: string, filename: string, folderId: string) {
   const sanitizedName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
   
   try {
     const stream = Readable.from(buffer);
     
     const response = await drive.files.create({
        requestBody: { name: sanitizedName, parents: [folderId] },
        media: { mimeType: mimeType, body: stream },
        fields: 'id, webViewLink',
        supportsAllDrives: true
     });
     
     if (response.data.id) {
       await drive.permissions.create({
         fileId: response.data.id,
         requestBody: { role: 'reader', type: 'anyone' }
       });
     }
     
     return response.data.webViewLink;
   } catch (error) {
     console.error('Error saat upload stream Buffer:', error);
     throw new Error('Gagal upload hasil render dokumen ke Google Drive');
   }
}

/**
 * Menghapus file dari Google Drive berdasarkan ID.
 * Digunakan untuk cleanup file lama saat update dokumen.
 */
export async function deleteFileFromDrive(fileId: string) {
  try {
    await drive.files.delete({ fileId });
    console.log(`[Drive] File deleted successfully: ${fileId}`);
  } catch (error: any) {
    // Jika file sudah tidak ada (404), kita abaikan saja
    if (error.code === 404) {
      console.warn(`[Drive] File not found for deletion: ${fileId}`);
      return;
    }
    console.error(`[Drive] Error deleting file ${fileId}:`, error.message);
  }
}
