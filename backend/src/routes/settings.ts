import { Hono } from 'hono';
import { authMiddleware, requireSuperAdmin, JwtPayload } from '../middleware/auth';
import { batchPushAllToSheets } from '../services/sheets.service';

type HonoEnv = { Variables: { user: JwtPayload } };
const settingsRouter = new Hono<HonoEnv>();

// Hanya Admin/SuperAdmin yang bisa mengakses settings
settingsRouter.use('/*', authMiddleware);

/**
 * Endpoint Sinkronisasi Massal (Postgres -> Google Sheets)
 * Mengirimkan data dari 8 Tab utama sebagai mirror/arsip.
 */
settingsRouter.post('/sync-sheets', async (c) => {
  try {
    console.log('[Manual Sync] Memulai Sinkronisasi Massal (Postgres -> Sheets)...');
    
    // Eksekusi Batch Push
    await batchPushAllToSheets();
    
    return c.json({ 
      status: true, 
      message: 'Sinkronisasi massal (8 Tab) ke Google Sheets berhasil diselesaikan!' 
    });
  } catch (error: any) {
    console.error('[Manual Sync Error]', error);
    return c.json({ 
      status: false, 
      message: 'Gagal melakukan sinkronisasi. Terjadi kesalahan pada integrasi Google API.',
      error: error.message 
    }, 500);
  }
});

export default settingsRouter;
