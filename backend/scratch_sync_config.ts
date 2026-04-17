import { fetchAndSyncConfig } from './src/services/sheets.service';
import { db } from './src/db';

async function runSync() {
    console.log('--- Memulai Sinkronisasi Konfigurasi dari Google Sheets ---');
    try {
        await fetchAndSyncConfig();
        console.log('--- Sinkronisasi Selesai ---');
        process.exit(0);
    } catch (e) {
        console.error('Sinkronisasi Gagal:', e);
        process.exit(1);
    }
}

runSync();
