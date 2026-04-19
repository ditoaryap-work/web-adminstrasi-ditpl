import { Hono } from 'hono';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import {
    getTemplateList,
    getTemplatePath,
    saveTemplate,
    validateExtension,
    validateFileContent,
    getMimeType,
    updateTemplateMeta,
    zipAllTemplates,
    TEMPLATE_REGISTRY,
    MAX_UPLOAD_BYTES,
} from '../services/template.service';
import path from 'path';

type HonoEnv = { Variables: { user: JwtPayload } };
const templateRouter = new Hono<HonoEnv>();

// Autentikasi menyeluruh
templateRouter.use('/*', authMiddleware);

// ─── [1] GET / ─── Daftar semua template dan metadatanya
templateRouter.get('/', async (c) => {
    try {
        const templates = getTemplateList();
        return c.json({ status: true, message: 'Daftar template dimuat', data: templates });
    } catch (e: any) {
        return c.json({ status: false, message: 'Gagal memuat daftar template: ' + (e.message || 'Unknown Error') }, 500);
    }
});

// ─── [2] GET /:id/download ─── Download template dengan Content-Type yang benar
templateRouter.get('/:id/download', async (c) => {
    const { id } = c.req.param();
    const user = c.get('user') as JwtPayload;

    const filePath = await getTemplatePath(id, user.timPoksi);

    if (!filePath) {
        return c.json({ status: false, message: 'File template ini belum tersedia di server' }, 404);
    }

    const actualFilename = path.basename(filePath);
    const mimeType = getMimeType(actualFilename);

    // Streaming file langsung dengan Bun (zero-copy)
    const file = Bun.file(filePath);
    return new Response(file, {
        headers: {
            'Content-Disposition': `attachment; filename="${actualFilename}"`,
            'Content-Type': mimeType,
            'Content-Length': String(file.size),
            'Cache-Control': 'no-cache',
        }
    });
});

// ─── [3] GET /export/zip ─── Export semua template aktif ke dalam satu file ZIP
templateRouter.get('/export/zip', async (c) => {
    try {
        const buffer = await zipAllTemplates();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

        return new Response(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename="Templates_E-Office_${timestamp}.zip"`,
                'Content-Type': 'application/zip',
                'Content-Length': String(buffer.length),
                'Cache-Control': 'no-cache',
            }
        });
    } catch (e: any) {
        return c.json({ status: false, message: 'Gagal membuat ZIP: ' + (e.message || 'Unknown Error') }, 500);
    }
});

// ─── [3] PUT /:id/upload ─── Overwrite/Replace File Template
templateRouter.put('/:id/upload', async (c) => {
    try {
        const user = c.get('user') as JwtPayload;

        // Proteksi Otorisasi: Super Admin only (bypass di dev)
        const isDev = process.env.NODE_ENV === 'development';
        if (user.role !== 'Super Admin' && !isDev) {
            return c.json({ status: false, message: 'Akses Ditolak: Hanya Super Admin yang diizinkan mengubah template!' }, 403);
        }

        const { id } = c.req.param();
        const tplConfig = TEMPLATE_REGISTRY.find(t => t.id === id);

        if (!tplConfig) {
            return c.json({ status: false, message: 'Kode Template ID tidak terdaftar di sistem' }, 400);
        }

        // Parsing multipart form data
        const body = await c.req.parseBody({ all: false });
        const file = body['file'];

        if (!(file instanceof File)) {
            return c.json({ status: false, message: 'File dokumen tidak ditemukan. Gunakan keyword form "file".' }, 400);
        }

        // [Validasi 1] Ukuran file
        if (file.size > MAX_UPLOAD_BYTES) {
            return c.json({
                status: false,
                message: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimum: ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`
            }, 400);
        }

        // [Validasi 2] Ekstensi file terhadap daftar yang diizinkan per template
        const extCheck = validateExtension(file.name, id);
        if (!extCheck.valid) {
            return c.json({ status: false, message: extCheck.message }, 400);
        }

        // [Validasi 3] Magic bytes — memastikan konten benar-benar file Office
        const isContentValid = await validateFileContent(file);
        if (!isContentValid) {
            return c.json({
                status: false,
                message: 'File terdeteksi bukan dokumen Office yang valid. Konten tidak sesuai dengan format yang diharapkan.'
            }, 400);
        }

        // Simpan (overwrite lama, bersihkan orphan, invalidasi cache tim)
        await saveTemplate(id, file);

        return c.json({
            status: true,
            message: `Template "${tplConfig.name}" berhasil diperbarui di server secara real-time.`
        });

    } catch (e: any) {
        console.error('Template Upload Error:', e);
        return c.json({ status: false, message: 'Terjadi kesalahan saat menyimpan file: ' + (e.message || 'Unknown Error') }, 500);
    }
});

// ─── [5] PATCH /:id ─── Update Metadata (Custom Nama)
templateRouter.patch('/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const { customName } = body;

        if (!customName || typeof customName !== 'string') {
            return c.json({ status: false, message: 'Nama kustom (customName) wajib diisi.' }, 400);
        }

        await updateTemplateMeta(id, customName);

        return c.json({
            status: true,
            message: `Nama tampilan template berhasil diubah menjadi "${customName}".`
        });
    } catch (e: any) {
        return c.json({ status: false, message: 'Gagal mengupdate metadata: ' + (e.message || 'Unknown Error') }, 500);
    }
});

export default templateRouter;
