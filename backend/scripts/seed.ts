import 'dotenv/config';
import { db } from '../src/db';
import { users, config } from '../src/db/schema';
import { sql } from 'drizzle-orm';
import { fetchAndSyncConfig, fetchAndSyncPegawai, fetchAndSyncSbm } from '../src/services/sheets.service';

async function seed() {
  console.log('🚀 Memulai seeding database...');
  
  const configData = [
    {
      timPoksi: 'Tata Usaha Direktorat Penyediaan Lahan',
      folderIdSpt: '1fcuyFzsv8WkHCLMbJiUIFPQFG7qwqW5c',
      folderIdSptjm: '1OtnULCMT4UKJbgSlaQCL_zVPm8SkMtlF',
      templateIdSptV1: '17XTjNzd-oVqBxSvsC487p1WarQB1BgukSRwGS5Li6XY',
      templateIdSptV2: '1dpMMGokvyfdl52ZAqaZLjq4bMVuS7ItAc-MqHvJuuwc',
      templateIdSptjm: '1t2u-kIk5Nmusrf-yVrjk0tGWGCuDVAiUSRbHNN--tD8',
      folderIdSuratMasuk: '1Gs9sSO_TLpXLg8ei-uUCMcc20fwzcR2k',
      folderIdSuratKeluar: '1ytA3n88SaBvFdsw3LcPf9wHBiyr7FcPw',
      folderIdNotulensi: '1evyjB7ziigjOOZD6FN4VX4Ds3EkQOYWB',
      folderIdSpj: null,
      templateIdSpj: '14GiF9glFYyg9TlC3Yt7lL2Edyfl1C89EDUz_XzcNQWU',
    },
    {
      timPoksi: 'Pendayagunaan Lahan',
      folderIdSpt: '1wVdjpRrnnaO_E7u8T6xWtqg_5iXmFp6J',
      folderIdSptjm: '1akDlNy3OBXnbTXsLeS5B7sFTkw8JTKPC',
      templateIdSptV1: '17XTjNzd-oVqBxSvsC487p1WarQB1BgukSRwGS5Li6XY',
      templateIdSptV2: '1dpMMGokvyfdl52ZAqaZLjq4bMVuS7ItAc-MqHvJuuwc',
      templateIdSptjm: '1t2u-kIk5Nmusrf-yVrjk0tGWGCuDVAiUSRbHNN--tD8',
      folderIdSuratMasuk: '1sI_TBJr3658mPWRjzvb14rpWG1fOFOAg',
      folderIdSuratKeluar: '17bd6F-TN1l1Z8SCHFXDDo2nUSKUie6tI',
      folderIdNotulensi: '19EqDWFRIJpfRDMUz7QmhlaxlMcDuxw57',
      folderIdSpj: null,
      templateIdSpj: '14GiF9glFYyg9TlC3Yt7lL2Edyfl1C89EDUz_XzcNQWU',
    },
    {
      timPoksi: 'Perancangan Teknis Penyediaan Lahan',
      folderIdSpt: '1LaU7UYNxBriyKkfguF7mFJmyUKJduq-f',
      folderIdSptjm: '1beHOx9Jem3XJkrfpCrFwcey464lsHQw3',
      templateIdSptV1: '17XTjNzd-oVqBxSvsC487p1WarQB1BgukSRwGS5Li6XY',
      templateIdSptV2: '1dpMMGokvyfdl52ZAqaZLjq4bMVuS7ItAc-MqHvJuuwc',
      templateIdSptjm: '1t2u-kIk5Nmusrf-yVrjk0tGWGCuDVAiUSRbHNN--tD8',
      folderIdSuratMasuk: '1yCdvKbLbhLUgvDInMBOabe6EIJzxrIyE',
      folderIdSuratKeluar: '1B8mmGMKJx4qT4Pvck-E0l0v0L9QrzT2p',
      folderIdNotulensi: '13_OgvUmqCNMNjVsblNKG0MgWITMxYo9J',
      folderIdSpj: null,
      templateIdSpj: '14GiF9glFYyg9TlC3Yt7lL2Edyfl1C89EDUz_XzcNQWU',
    },
    {
      timPoksi: 'Perluasan Lahan Wilayah I',
      folderIdSpt: '1DEF0ZB2wWgboW0OZY95LyVh8YIErumRt',
      folderIdSptjm: '1GqGQSdFZd5PNxtrTgjq_ezV4tIEsj-Hp',
      templateIdSptV1: '17XTjNzd-oVqBxSvsC487p1WarQB1BgukSRwGS5Li6XY',
      templateIdSptV2: '1dpMMGokvyfdl52ZAqaZLjq4bMVuS7ItAc-MqHvJuuwc',
      templateIdSptjm: '1t2u-kIk5Nmusrf-yVrjk0tGWGCuDVAiUSRbHNN--tD8',
      folderIdSuratMasuk: '18fgMM__NlCcgPACm6X00dkTlyDUF_-IS',
      folderIdSuratKeluar: '1EUerOo3ajgCH2SUPyz8O9FuV7NDceorL',
      folderIdNotulensi: '1wNtNucwWJdVhFVaPWwVNKerQqLPVMyQ0',
      folderIdSpj: null,
      templateIdSpj: '14GiF9glFYyg9TlC3Yt7lL2Edyfl1C89EDUz_XzcNQWU',
    },
    {
      timPoksi: 'Perluasan Lahan Wilayah II',
      folderIdSpt: '1OsEVUwU8LQzt4jdivWdYnGZOhnLg3xar',
      folderIdSptjm: '1G_TOLI2URsOOYFb29EJsynGOoitTH5BP',
      templateIdSptV1: '17XTjNzd-oVqBxSvsC487p1WarQB1BgukSRwGS5Li6XY',
      templateIdSptV2: '1dpMMGokvyfdl52ZAqaZLjq4bMVuS7ItAc-MqHvJuuwc',
      templateIdSptjm: '1t2u-kIk5Nmusrf-yVrjk0tGWGCuDVAiUSRbHNN--tD8',
      folderIdSuratMasuk: '1p5Jkvok-lvJt4KhhkVRNLioImkJspPGc',
      folderIdSuratKeluar: '106GQlj0z63yRq4X4RBH-yc5iwCTtfCob',
      folderIdNotulensi: '1RUjLiCcwRmMloDHDnaPG2tmEE5Yq7cMR',
      folderIdSpj: null,
      templateIdSpj: '14GiF9glFYyg9TlC3Yt7lL2Edyfl1C89EDUz_XzcNQWU',
    },
  ];

  console.log('--- 1. Seeding Config (Folder &Template IDs) ---');
  try {
    for (const cfg of configData) {
      await db.insert(config)
        .values(cfg)
        .onConflictDoUpdate({
          target: config.timPoksi,
          set: {
            folderIdSpt: cfg.folderIdSpt,
            folderIdSptjm: cfg.folderIdSptjm,
            templateIdSptV1: cfg.templateIdSptV1,
            templateIdSptV2: cfg.templateIdSptV2,
            templateIdSptjm: cfg.templateIdSptjm,
            folderIdSuratMasuk: cfg.folderIdSuratMasuk,
            folderIdSuratKeluar: cfg.folderIdSuratKeluar,
            folderIdNotulensi: cfg.folderIdNotulensi,
            folderIdSpj: cfg.folderIdSpj,
            templateIdSpj: cfg.templateIdSpj,
          }
        });
    }
    console.log('✅ 5 Config Tim Poksi + Folder/Template IDs siap!');
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

  console.log('--- 3. Syncing Data from Google Sheets ---');
  if (process.env.SPREADSHEET_ID) {
    try {
      console.log('📦 Menarik data SBM...');
      await fetchAndSyncSbm();
      console.log('📦 Menarik data Pegawai...');
      await fetchAndSyncPegawai();
      console.log('📦 Menarik data Config Detail...');
      await fetchAndSyncConfig();
      console.log('✅ Sinkronisasi Google Sheets selesai!');
    } catch (error) {
      console.error('❌ Gagal menarik data dari Google Sheets:', error);
    }
  } else {
    console.warn('⚠️ SPREADSHEET_ID tidak ditemukan, skip sinkronisasi data master.');
  }
  
  console.log('✨ Seeding selesai!');
  process.exit(0);
}

seed();
