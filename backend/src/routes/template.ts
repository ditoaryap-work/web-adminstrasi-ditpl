import { Hono } from 'hono';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { getTemplateList, getTemplatePath, saveTemplate, TEMPLATE_REGISTRY, syncAllTemplatesFromDrive } from '../services/template.service';

type HonoEnv = { Variables: { user: JwtPayload } };
const templateRouter = new Hono<HonoEnv>();

// Autentikasi menyeluruh, harus terdaftar login (Pegawai maupun Super Admin)
templateRouter.use('/*', authMiddleware);

// [1] Dapatkan daftar semua template dan metadatanya
templateRouter.get('/', async (c) => {
    try {
        const templates = getTemplateList();
        return c.json({ status: true, message: 'Daftar template dimuat', data: templates });
    } catch (e: any) {
        return c.json({ status: false, message: 'Gagal memuat daftar template: ' + (e.message || 'Unknown Error') }, 500);
    }
});

// [2] Download template asli berformat .docx
templateRouter.get('/:id/download', async (c) => {
    const { id } = c.req.param();
    const user = c.get('user') as JwtPayload;
    
    // Gunakan timPoksi user jika ada agar mendownload versi spesifik tim
    const filePath = await getTemplatePath(id, user.timPoksi);
    
    if (!filePath) {
        return c.json({ status: false, message: 'File template ini belum tersedia di server' }, 404);
    }
    
    const tplConfig = TEMPLATE_REGISTRY.find(t => t.id === id);
    
    // Streaming file secara langsung dengan Bun
    const file = Bun.file(filePath);
    return new Response(file, {
        headers: {
            'Content-Disposition': `attachment; filename="${tplConfig?.filename || 'template.docx'}"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
    });
});

// [3] Overwrite File Template
templateRouter.put('/:id/upload', async (c) => {
    try {
        const user = c.get('user') as JwtPayload;
        
        // Proteksi Otorisasi Ketat
        if (user.role !== 'Super Admin') {
            return c.json({ status: false, message: 'Akses Ditolak: Hanya Super Admin yang diizinkan untuk mengubah struktur dokumen dasar!' }, 403);
        }

        const { id } = c.req.param();
        const tplConfig = TEMPLATE_REGISTRY.find(t => t.id === id);
        
        if (!tplConfig) {
            return c.json({ status: false, message: 'Kode Template ID tidak terdaftar di sistem' }, 400);
        }

        // Parsing form file (Multipart Form Data)
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!(file instanceof File)) {
            return c.json({ status: false, message: 'File dokumen tidak ditemukan. Gunakan keyword form "file".' }, 400);
        }

        // Ekstensi proteksi pencegahan malware non-docx
        if (!file.name.endsWith('.docx')) {
            return c.json({ status: false, message: 'Format file tidak diizinkan! Engine hanya dapat menerima tipe file Microsoft Word (.docx).' }, 400);
        }

        // Simpan Overwrite
        const arrayBuffer = await file.arrayBuffer();
        await saveTemplate(id, arrayBuffer);

        return c.json({ 
            status: true, 
            message: `Format ${tplConfig.name} berhasil diperbarui di server secara real-time.` 
        });

    } catch (e: any) {
        console.error("Template Management Upload Error:", e);
        return c.json({ status: false, message: 'Terjadi anomali saat menyimpan file: ' + (e.message || 'Unknown Error') }, 500);
    }
});

// [4] Paksa sinkronisasi dari Google Drive (Smart Sync Trigger)
templateRouter.post('/sync', async (c) => {
    try {
        const user = c.get('user') as JwtPayload;
        if (user.role !== 'Super Admin') {
            return c.json({ status: false, message: 'Akses Ditolak: Hanya Super Admin yang dapat men-sync template' }, 403);
        }

        await syncAllTemplatesFromDrive();
        return c.json({ status: true, message: 'Sinkronisasi seluruh template dari Google Drive berhasil dilakukan secara masal.' });
    } catch (e: any) {
        console.error("Template Sync Error:", e);
        return c.json({ status: false, message: 'Gagal sinkronisasi: ' + e.message }, 500);
    }
});

export default templateRouter;
