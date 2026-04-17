import { db } from './src/db';
import { users, config } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🚀 Memulai seeding database...');
  
  const timPoksiList = [
    'Perluasan Lahan Wilayah I',
    'Perluasan Lahan Wilayah II',
    'Pendayagunaan Lahan',
    'Perancangan Teknis Penyediaan Lahan',
    'Tata Usaha Direktorat Penyediaan Lahan'
  ];

  console.log('--- 1. Seeding Config (Tim Poksi) ---');
  try {
    for (const tim of timPoksiList) {
      await db.insert(config)
        .values({ timPoksi: tim })
        .onConflictDoNothing();
    }
    console.log('✅ Tabel Config (Tim Poksi) siap!');
  } catch (error) {
    console.error('❌ Gagal seeding Config:', error);
  }

  console.log('--- 2. Seeding Users (Admins) ---');
  // Hash password menggunakan Bun native
  const passwordHash = await Bun.password.hash('123456');

  const legacyAdmins = [
    { username: 'dito', nama: 'Dito Aryaputra', role: 'Super Admin', timPoksi: 'Perluasan Lahan Wilayah II' },
    { username: 'ledy', nama: 'Ledy Aufa Aulia', role: 'Admin', timPoksi: 'Perluasan Lahan Wilayah II' },
    { username: 'yasir', nama: 'Yasir', role: 'Admin', timPoksi: 'Tata Usaha Direktorat Penyediaan Lahan' },
    { username: 'mukti', nama: 'Mukti Prabandari', role: 'Admin', timPoksi: 'Tata Usaha Direktorat Penyediaan Lahan' },
    { username: 'nuranita', nama: 'Nur anita', role: 'Admin', timPoksi: 'Perluasan Lahan Wilayah I' },
    { username: 'yeyen', nama: 'Prisila Karoviena', role: 'Admin', timPoksi: 'Pendayagunaan Lahan' },
    { username: 'rifa', nama: 'Rifa Rafifah', role: 'Admin', timPoksi: 'Pendayagunaan Lahan' },
    { username: 'medy', nama: 'medy ronaldy saputro', role: 'Admin', timPoksi: 'Perancangan Teknis Penyediaan Lahan' },
  ];

  try {
    for (const admin of legacyAdmins) {
      await db.insert(users)
        .values({
          username: admin.username,
          passwordHash: passwordHash,
          nama: admin.nama,
          role: admin.role,
          timPoksi: admin.timPoksi,
        })
        .onConflictDoNothing();
    }
    console.log('✅ 8 Admin dari Google Sheets berhasil disemai!');
  } catch (error) {
    console.error('❌ Gagal seeding Users:', error);
  }
  
  console.log('✨ Seeding selesai!');
  process.exit(0);
}

seed();
