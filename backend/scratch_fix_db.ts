import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function fixDb() {
    console.log('🔧 Memperbaiki skema database PostgreSQL...');
    
    try {
        // 1. Pastikan kec_kab di sbm adalah UNIQUE
        await sql`ALTER TABLE sbm ADD CONSTRAINT sbm_kec_kab_unique UNIQUE (kec_kab)`;
        console.log('✅ SBM: Unique constraint added on kec_kab.');
    } catch (e: any) {
        if (e.code === '42710' || e.code === '42P07') {
            console.log('ℹ️ SBM: Constraint sudah ada, lanjut.');
        } else {
            console.error('❌ SBM Error:', e.message);
        }
    }

    try {
        // 2. Tambahkan kolom tujuan_1, tujuan_2, tujuan_3 ke perjadin jika belum ada
        // (Jika drizzle-kit push gagal setengah jalan)
        await sql`ALTER TABLE perjadin ADD COLUMN IF NOT EXISTS tujuan_1 VARCHAR(255)`;
        await sql`ALTER TABLE perjadin ADD COLUMN IF NOT EXISTS tujuan_2 VARCHAR(255)`;
        await sql`ALTER TABLE perjadin ADD COLUMN IF NOT EXISTS tujuan_3 VARCHAR(255)`;
        console.log('✅ Perjadin: Kolom tujuan_1, tujuan_2, tujuan_3 dipastikan ada.');
    } catch (e: any) {
        console.error('❌ Perjadin Error:', e.message);
    }

    console.log('✨ Perbaikan Skema Selesai.');
    process.exit(0);
}

fixDb();
