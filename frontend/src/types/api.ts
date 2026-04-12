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
