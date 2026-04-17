import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { uploadFileToDrive } from '../services/drive.service';

const uploadRouter = new Hono();

// Melindungi endpoint upload hanya untuk pengguna yang sudah login
uploadRouter.use('/*', authMiddleware);

uploadRouter.post('/', async (c) => {
  try {
    const formData = await c.req.parseBody({ all: true }); // izinkan file parsing di Hono
    const fileData = formData['file'];
    const folderId = formData['folderId'];

    // Validasi input
    if (!fileData || Array.isArray(fileData) || typeof fileData === 'string') {
        return c.json({ status: false, message: 'File tidak valid atau tidak ditemukan dalam request.' }, 400);
    }
    const file = fileData as File;

    if (!folderId || typeof folderId !== 'string') {
      return c.json({ status: false, message: 'ID Folder tujuan (folderId) valid harus disertakan.' }, 400);
    }

    // Panggil service streaming
    const fileUrl = await uploadFileToDrive(file, folderId);

    return c.json({
      status: true,
      message: 'File berhasil diunggah',
      data: {
        url: fileUrl
      }
    });

  } catch (error: any) {
    // Tangkap error dari internal validasi (seperti: ukuran file atau mime type)
    return c.json({
      status: false,
      message: error.message || 'Terjadi kesalahan saat mengunggah file.'
    }, 400);
  }
});

export default uploadRouter;
