import { Hono } from 'hono';
import { authMiddleware, requireSuperAdmin, JwtPayload } from '../middleware/auth';
import { batchPushAllToSheets } from '../services/sheets.service';

type HonoEnv = { Variables: { user: JwtPayload } };
const syncRouter = new Hono<HonoEnv>();

// Hanya Admin/SuperAdmin yang bisa men-trigger sync manual
syncRouter.use('/*', authMiddleware);

syncRouter.post('/', async (c) => {
  try {
    console.log('[Manual Sync] Sinkronisasi Batch ke Google Sheets dimulai...');
    await batchPushAllToSheets();
    return c.json({ status: true, message: 'Sinkronisasi massal seluruh modul ke Google Sheets berhasil diselesaikan!' });
  } catch (error) {
    console.error('[Manual Sync Error]', error);
    return c.json({ status: false, message: 'Gagal melakukan sinkronisasi massal. Error memanggil Google API.' }, 500);
  }
});

syncRouter.post('/sbm', async (c) => {
  try {
    const { fetchAndSyncSbm } = await import('../services/sheets.service');
    console.log('[Manual Sync] Sinkronisasi SBM dari Google Sheets dimulai...');
    await fetchAndSyncSbm();
    return c.json({ status: true, message: 'Data SBM berhasil diperbarui dari Google Sheets!' });
  } catch (error) {
    console.error('[SBM Sync Error]', error);
    return c.json({ status: false, message: 'Gagal melakukan sinkronisasi SBM.' }, 500);
  }
});

syncRouter.post('/pegawai', async (c) => {
  try {
    const { fetchAndSyncPegawai } = await import('../services/sheets.service');
    console.log('[Manual Sync] Sinkronisasi Master Pegawai dari Google Sheets dimulai...');
    await fetchAndSyncPegawai();
    return c.json({ status: true, message: 'Data Master Pegawai berhasil diperbarui dari Google Sheets!' });
  } catch (error) {
    console.error('[Pegawai Sync Error]', error);
    return c.json({ status: false, message: 'Gagal melakukan sinkronisasi Master Pegawai.' }, 500);
  }
});

export default syncRouter;
