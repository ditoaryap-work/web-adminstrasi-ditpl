export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface AdminData {
  username?: string;
  password?: string;
  nama_admin?: string;
  tim_poksi: string;
  profile_image_url?: string;
  role: string;
}

export interface SptPeserta {
  nama_lengkap: string;
  nip?: string;
  pangkat_gol?: string;
  jabatan?: string;
  tujuan?: string;
  tanggal_pelaksanaan?: string;
  [key: string]: unknown;
}

export interface SptData {
  id_spt: string;
  no: string;
  tanggal_surat: string;
  maksud_perjalanan: string;
  peserta: SptPeserta[];
  peserta_count?: number;
  tim_poksi: string;
  mak: string;
  created_at?: string;
  file_link?: string;
}

export interface SptjmData {
  id_sptjm: string;
  nama_lengkap: string;
  nip: string;
  jabatan: string;
  tujuan: string;
  tanggal_perjalanan: string;
  tanggal_kembali: string;
  tiket_berangkat: number;
  tiket_pulang: number;
  biaya_sbm: number;
  total_biaya: number;
  tanggal_ttd: string;
  tim_poksi: string;
  created_at?: string;
  file_link?: string;
}

export interface PegawaiData {
  row_number?: number;
  nama_lengkap: string;
  nip: string;
  pangkat_gol_ruang?: string;
  golongan?: string;
  jabatan?: string;
  poksi?: string;
  direktorat?: string;
  tingkat_biaya?: string;
}

export interface SbmData {
  ibu_kota: string;
  tujuan_lengkap: string;
  uang_harian: number;
  tiket_bisnis: number;
  tiket_ekonomi: number;
  taxi_jakarta: number;
  taxi_daerah: number;
}

export interface SuratData {
  id_surat: string;
  tim_poksi: string;
  tipe_surat: 'Masuk' | 'Keluar';
  kategori_surat: string;
  sifat_surat: string;
  nomor_surat: string;
  tanggal_masuk: string;
  tanggal_surat: string;
  asal_tujuan: string;
  perihal: string;
  tgl_acara_mulai?: string;
  tgl_acara_selesai?: string;
  disposisi_ke?: string[];
  tgl_disposisi?: string;
  tindak_lanjut?: string;
  file_surat?: string;
  file_notulensi?: string;
  created_at?: string;
}

// ===== Kwitansi SPJ — Struktur BPK 119 kolom =====

export interface SpjUangHarian {
  perhari: number | string;
  hari: number | string;
  total: number | string;
}

export interface SpjPenginapan {
  nama: string;
  perhari: number | string;
  hari: number | string;
  total: number | string;
}

export interface SpjTransport {
  perhari: number | string;
  hari: number | string;
  total: number | string;
}

export interface SpjTiket {
  tgl: string;
  dari: string;
  ke: string;
  maskapai: string;
  kode_booking: string;
  no_tiket: string;
  harga: number | string;
}

export interface SpjData {
  id_perjadin: string;
  // BPK Identitas
  nomor_st: string;
  asal_instansi: string;
  nip: string;
  nama: string;
  pangkat_gol: string;
  gol: string;
  maksud_tujuan: string;
  jumlah_dibayar: number | string;
  // BPK Tujuan & Waktu
  tujuan_1: string;
  tujuan_2: string;
  tujuan_3: string;
  lama_tugas: number | string;
  tgl_berangkat: string;
  tgl_kembali: string;
  // Sub-items
  uang_harian: SpjUangHarian[];
  penginapan: SpjPenginapan[];
  transport: SpjTransport[];
  tiket_berangkat: SpjTiket[];
  tiket_pulang: SpjTiket[];
  // Biaya lain
  taksi: number | string;
  representasi: number | string;
  uang_lainnya: number | string;
  // Sistem / Template
  no_spd: string;
  no_urut_spd: string; // 3 digit urutan SPD (001, dst)
  no_akun: string;
  kode_mak: string; // Kode MAK
  kode_kapoksi: string;
  nomor_ls: string;
  uraian_pembayaran: string;
  jabatan: string;
  tingkat_biaya: string;
  kendaraan: string;
  tgl_perintah: string;
  tim_poksi: string;
  file_link?: string;
  file_bukti?: string;
  created_at?: string;
}
