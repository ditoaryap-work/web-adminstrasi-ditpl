import { pgTable, uuid, varchar, text, timestamp, date, boolean, jsonb, numeric, smallint, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// USERS & AUTH
// ============================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  nama: varchar('nama', { length: 150 }).notNull(),
  timPoksi: varchar('tim_poksi', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).default('Admin').notNull(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// CONFIG (Mapping Folder Drive per Tim)
// ============================================
export const config = pgTable('config', {
  timPoksi: varchar('tim_poksi', { length: 100 }).primaryKey(),
  folderIdSpt: varchar('folder_id_spt', { length: 100 }),
  folderIdSptjm: varchar('folder_id_sptjm', { length: 100 }),
  templateIdSptV1: varchar('template_id_spt_v1', { length: 100 }),
  templateIdSptV2: varchar('template_id_spt_v2', { length: 100 }),
  templateIdSptjm: varchar('template_id_sptjm', { length: 100 }),
  folderIdSuratMasuk: varchar('folder_id_surat_masuk', { length: 100 }),
  folderIdSuratKeluar: varchar('folder_id_surat_keluar', { length: 100 }),
  folderIdNotulensi: varchar('folder_id_notulensi', { length: 100 }),
  folderIdSpj: varchar('folder_id_spj', { length: 100 }),
  templateIdSpj: varchar('template_id_spj', { length: 100 }),
});

// ============================================
// MASTER DATA
// ============================================
export const pegawai = pgTable('pegawai', {
  id: uuid('id').defaultRandom().primaryKey(),
  kode: varchar('kode', { length: 20 }),
  namaLengkap: varchar('nama_lengkap', { length: 200 }).notNull(),
  nip: varchar('nip', { length: 30 }).unique(),
  golongan: varchar('golongan', { length: 50 }),
  pangkatGolRuang: varchar('pangkat_gol_ruang', { length: 50 }),
  tingkatBiaya: varchar('tingkat_biaya', { length: 50 }),
  jabatan: varchar('jabatan', { length: 200 }),
  direktorat: varchar('direktorat', { length: 100 }),
  poksi: varchar('poksi', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sbm = pgTable('sbm', {
  id: serial('id').primaryKey(),
  kecKab: varchar('kec_kab', { length: 200 }).unique(),
  uangHarian: numeric('uang_harian', { precision: 12, scale: 2 }),
  uangPenginapan: numeric('uang_penginapan', { precision: 12, scale: 2 }),
  golongan: varchar('golongan', { length: 50 }),
  pesawat: boolean('pesawat').default(false),
  data: jsonb('data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// SPT (Surat Perintah Tugas)
// ============================================
export const spt = pgTable('spt', {
  id: uuid('id').defaultRandom().primaryKey(),
  no: varchar('no', { length: 100 }),
  tanggalSurat: date('tanggal_surat'),
  maksudPerjalanan: text('maksud_perjalanan'),
  kegiatan: text('kegiatan'),
  mak: varchar('mak', { length: 100 }),
  peserta: jsonb('peserta').default(sql`'[]'::jsonb`).notNull(),
  pesertaCount: smallint('peserta_count').default(0),
  timPoksi: varchar('tim_poksi', { length: 100 }).references(() => config.timPoksi).notNull(),
  fileLink: text('file_link'),
  notulensi: text('notulensi'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// SPTJM (Pakta Biaya Riil)
// ============================================
export const sptjm = pgTable('sptjm', {
  id: uuid('id').defaultRandom().primaryKey(),
  namaLengkap: varchar('nama_lengkap', { length: 200 }),
  nip: varchar('nip', { length: 30 }),
  jabatan: varchar('jabatan', { length: 200 }),
  tujuan: varchar('tujuan', { length: 200 }),
  tanggalPerjalanan: date('tanggal_perjalanan'),
  tanggalKembali: date('tanggal_kembali'),
  tiketBerangkat: numeric('tiket_berangkat', { precision: 12, scale: 2 }),
  tiketPulang: numeric('tiket_pulang', { precision: 12, scale: 2 }),
  biayaSbm: numeric('biaya_sbm', { precision: 12, scale: 2 }),
  totalBiaya: numeric('total_biaya', { precision: 12, scale: 2 }),
  tanggalTtd: date('tanggal_ttd'),
  timPoksi: varchar('tim_poksi', { length: 100 }).references(() => config.timPoksi).notNull(),
  fileLink: text('file_link'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// SURAT (Arsip Persuratan)
// ============================================
// Alias untuk mendukung ekspektasi penamaan kode legacy dan rute REST
export const arsipSurat = pgTable('surat', {
  id: uuid('id').defaultRandom().primaryKey(),
  timPoksi: varchar('tim_poksi', { length: 100 }).references(() => config.timPoksi).notNull(),
  tipeSurat: varchar('tipe_surat', { length: 20 }), // 'Masuk' or 'Keluar'
  kategoriSurat: varchar('kategori_surat', { length: 50 }),
  sifatSurat: varchar('sifat_surat', { length: 30 }),
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  tanggalMasuk: date('tanggal_masuk'),
  tanggalSurat: date('tanggal_surat'),
  asalTujuan: varchar('asal_tujuan', { length: 300 }),
  perihal: text('perihal'),
  tglAcaraMulai: date('tgl_acara_mulai'),
  tglAcaraSelesai: date('tgl_acara_selesai'),
  disposisiKe: jsonb('disposisi_ke').default(sql`'[]'::jsonb`),
  tglDisposisi: date('tgl_disposisi'),
  tindakLanjut: text('tindak_lanjut'),
  fileSurat: text('file_surat'),
  fileNotulensi: text('file_notulensi'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const surat = arsipSurat;

// ============================================
// PERJADIN / SPJ (Kwitansi Perjalanan Dinas)
// ============================================
export const perjadin = pgTable('perjadin', {
  id: uuid('id').defaultRandom().primaryKey(),
  nomorSt: varchar('nomor_st', { length: 100 }),
  asalInstansi: varchar('asal_instansi', { length: 200 }).default('Direktorat PL'),
  nip: varchar('nip', { length: 30 }),
  nama: varchar('nama', { length: 200 }),
  pangkatGol: varchar('pangkat_gol', { length: 50 }),
  gol: varchar('gol', { length: 10 }),
  maksudTujuan: text('maksud_tujuan'),
  jumlahDibayar: numeric('jumlah_dibayar', { precision: 14, scale: 2 }).default('0'),
  tujuan1: varchar('tujuan_1', { length: 255 }),
  tujuan2: varchar('tujuan_2', { length: 255 }),
  tujuan3: varchar('tujuan_3', { length: 255 }),
  lamaTugas: varchar('lama_tugas', { length: 50 }),
  tglBerangkat: date('tgl_berangkat'),
  tglKembali: date('tgl_kembali'),

  // Sub-items
  uangHarian: jsonb('uang_harian').default(sql`'[]'::jsonb`),
  penginapan: jsonb('penginapan').default(sql`'[]'::jsonb`),
  transport: jsonb('transport').default(sql`'[]'::jsonb`),
  tiketBerangkat: jsonb('tiket_berangkat').default(sql`'[]'::jsonb`),
  tiketPulang: jsonb('tiket_pulang').default(sql`'[]'::jsonb`),

  // Biaya Lain
  taksi: numeric('taksi', { precision: 12, scale: 2 }).default('0'),
  representasi: numeric('representasi', { precision: 12, scale: 2 }).default('0'),
  uangLainnya: numeric('uang_lainnya', { precision: 12, scale: 2 }).default('0'),

  // Sistem & Template
  noSpd: varchar('no_spd', { length: 100 }),
  noAkun: varchar('no_akun', { length: 100 }),
  jabatan: varchar('jabatan', { length: 200 }),
  tingkatBiaya: varchar('tingkat_biaya', { length: 50 }),
  kendaraan: varchar('kendaraan', { length: 100 }),
  tglPerintah: date('tgl_perintah'),
  timPoksi: varchar('tim_poksi', { length: 100 }).references(() => config.timPoksi).notNull(),
  fileLink: text('file_link'),
  fileBukti: text('file_bukti'),

  // Extended fields
  nomorLs: varchar('nomor_ls', { length: 100 }),
  kodeKapoksi: varchar('kode_kapoksi', { length: 100 }),
  kodeMak: varchar('kode_mak', { length: 100 }),
  uraianPembayaran: text('uraian_pembayaran'),
  noUrutSpd: varchar('no_urut_spd', { length: 50 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
