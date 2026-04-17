import { fetchAndSyncConfig, fetchAndSyncPegawai, fetchAndSyncSbm } from './src/services/sheets.service';

async function runInitialSync() {
    console.log('🚀 Memulai Sinkronisasi Data Awal dari Google Sheets...');
    
    try {
        console.log('\n--- [1/3] Sync Configuration ---');
        await fetchAndSyncConfig();
        
        console.log('\n--- [2/3] Sync Master Pegawai ---');
        await fetchAndSyncPegawai();
        
        console.log('\n--- [3/3] Sync SBM (Standar Biaya Masukan) ---');
        await fetchAndSyncSbm();
        
        console.log('\n✅ Sinkronisasi Selesai Seluruhnya!');
        process.exit(0);
    } catch (e) {
        console.error('\n❌ Sinkronisasi Gagal:', e);
        process.exit(1);
    }
}

runInitialSync();
