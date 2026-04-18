import { Hono } from 'hono';
import { db } from '../db';
import { surat } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadFileToDrive } from '../services/drive.service';
import { authMiddleware, type JwtPayload } from '../middleware/auth';

// Definisikan tipe Env agar c.get('user') dikenali TypeScript
type HonoEnv = { Variables: { user: JwtPayload } };

const suratRouter = new Hono<HonoEnv>();

// [Keamanan]: Semua akses ke Arsip Surat wajib membawa Token Valid.
suratRouter.use('/*', authMiddleware);

suratRouter.get('/', async (c) => {
    try {
        const user = c.get('user');
        const listQuery = db.select().from(surat).orderBy(desc(surat.createdAt));
        if (user.role !== 'Super Admin') {
            listQuery.where(eq(surat.timPoksi, user.timPoksi || ''));
        }
        const list = await listQuery;
        // Drizzle returns camelCase by default now, so we can return 'list' directly.
        return c.json({ status: true, message: 'Data Arsip Surat dimuat.', data: list });
    } catch (e) {
        console.error('[SURAT] GET error:', e);
        return c.json({ status: false, message: 'Gagal memuat surat.' }, 500);
    }
});

suratRouter.post('/', async (c) => {
    try {
        const user = c.get('user');
        const formData = await c.req.parseBody({ all: true });

        const dataStr = formData['data'];
        if (!dataStr || typeof dataStr !== 'string') {
            return c.json({ status: false, message: 'Payload data tidak valid' }, 400);
        }

        const body = JSON.parse(dataStr);
        // Biarkan body diparsing apa adanya, kita akan ambil field camelCase maupun snake_case untuk kompatibilitas sementara saat transisi
        let fileSuratUrl: string | null = body.fileSurat || body.file_surat || null;
        let fileNotulensiUrl: string | null = body.fileNotulensi || body.file_notulensi || null;

        const folderId = process.env.DRIVE_FOLDER_ID || '';

        // Handle file_surat upload
        const fsBody = formData['fileSurat'] || formData['file_surat'];
        if (fsBody && typeof fsBody !== 'string' && !Array.isArray(fsBody)) {
            fileSuratUrl = await uploadFileToDrive(fsBody as File, folderId) || null;
        }

        // Handle file_notulensi upload
        const fnBody = formData['fileNotulensi'] || formData['file_notulensi'];
        if (fnBody && typeof fnBody !== 'string' && !Array.isArray(fnBody)) {
            fileNotulensiUrl = await uploadFileToDrive(fnBody as File, folderId) || null;
        }

        const payload = {
            tipeSurat: body.tipeSurat ?? body.tipe_surat ?? null,
            kategoriSurat: body.kategoriSurat ?? body.kategori_surat ?? null,
            sifatSurat: body.sifatSurat ?? body.sifat_surat ?? null,
            nomorSurat: body.nomorSurat ?? body.nomor_surat ?? null,
            tanggalMasuk: body.tanggalMasuk ?? body.tanggal_masuk ?? null,
            tanggalSurat: body.tanggalSurat ?? body.tanggal_surat ?? null,
            asalTujuan: body.asalTujuan ?? body.asal_tujuan ?? null,
            perihal: body.perihal ?? body.perihal ?? null,
            tglAcaraMulai: body.tglAcaraMulai ?? body.tgl_acara_mulai ?? null,
            tglAcaraSelesai: body.tglAcaraSelesai ?? body.tgl_acara_selesai ?? null,
            disposisiKe: body.disposisiKe ?? body.disposisi_ke ?? [],
            tglDisposisi: body.tglDisposisi ?? body.tgl_disposisi ?? null,
            tindakLanjut: body.tindakLanjut ?? body.tindak_lanjut ?? null,
            fileSurat: fileSuratUrl,
            fileNotulensi: fileNotulensiUrl,
            timPoksi: user.timPoksi || body.timPoksi || body.tim_poksi || '',
        };

        const id = body.id || body.id_surat;
        if (id && typeof id === 'string' && id.trim() !== '') {
            const updated = await db
                .update(surat)
                .set({ ...payload, updatedAt: new Date() })
                .where(eq(surat.id, id))
                .returning();
            return c.json({ status: true, message: 'Arsip Surat diperbarui.', data: updated[0] });
        } else {
            const inserted = await db.insert(surat).values(payload).returning();
            return c.json({ status: true, message: 'Arsip Surat disimpan.', data: inserted[0] });
        }
    } catch (err: unknown) {
        console.error('[SURAT] POST error:', err);
        const msg = err instanceof Error ? err.message : 'I/O Error';
        return c.json({ status: false, message: 'Error Server: ' + msg }, 500);
    }
});

suratRouter.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        await db.delete(surat).where(eq(surat.id, id));
        return c.json({ status: true, message: 'Arsip berhasil dihapus.' });
    } catch (e) {
        console.error('[SURAT] DELETE error:', e);
        return c.json({ status: false, message: 'Gagal hapus surat.' }, 500);
    }
});

export default suratRouter;

