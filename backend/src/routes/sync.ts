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
    
    // Eksekusi fungsi sinkronisasi batch (Fire & forget atau Awaiting)
    // TAPI karena user perlu tahu sukses atau tidak, kita await
    // Waktu 3-5 detik dapat ditoleransi karena ini dieksekusi secara sadar (Manual).
    await batchPushAllToSheets();
    
    return c.json({ status: true, message: 'Sinkronisasi massal seluruh modul ke Google Sheets berhasil diselesaikan!' });
  } catch (error) {
    console.error('[Manual Sync Error]', error);
    return c.json({ status: false, message: 'Gagal melakukan sinkronisasi massal. Error memanggil Google API.' }, 500);
  }
});

export default syncRouter;
