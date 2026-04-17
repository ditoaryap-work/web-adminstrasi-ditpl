import { db } from './src/db';
import { users } from './src/db/schema';

async function seed() {
  console.log('Seeding Super Admin...');
  
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
      await db.insert(users).values({
        username: admin.username,
        passwordHash: passwordHash,
        nama: admin.nama,
        role: admin.role,
        timPoksi: admin.timPoksi,
      });
    }
    console.log('✅ 8 Admin dari Google Sheets berhasil disemai!');
  } catch (error) {
    console.error('❌ Gagal melakukan seeding:', error);
  }
  
  process.exit(0);
}

seed();
