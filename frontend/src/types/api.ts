export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface AdminData {
  username?: string;
  password?: string;
  namaAdmin?: string;
  timPoksi: string;
  role: string;
  lastLogin?: string;
}

export interface SptPeserta {
  namaLengkap: string;
  nip?: string;
  pangkatGol?: string;
  jabatan?: string;
  tujuan?: string;
  tanggalPelaksanaan?: string;
  [key: string]: unknown;
}

export interface SptData {
  id: string;
  no: string;
  tanggalSurat: string;
  maksudPerjalanan: string;
  kegiatan: string;
  peserta: SptPeserta[];
  pesertaCount?: number;
  timPoksi: string;
  mak: string;
  createdAt?: string;
  fileLink?: string;
}

export interface SptjmData {
  id: string;
  namaLengkap: string;
  nip: string;
  jabatan: string;
  tujuan: string;
  tanggalPerjalanan: string;
  tanggalKembali: string;
  tiketBerangkat: number;
  tiketPulang: number;
  biayaSbm: number;
  totalBiaya: number;
  tanggalTtd: string;
  timPoksi: string;
  createdAt?: string;
  fileLink?: string;
}

export interface PegawaiData {
  id?: string;
  kode?: string;
  namaLengkap: string;
  nip: string;
  pangkatGolRuang?: string;
  golongan?: string;
  jabatan?: string;
  poksi?: string;
  direktorat?: string;
  tingkatBiaya?: string;
  createdAt?: string;
}

export interface SbmData {
  id?: number;
  kecKab: string;
  uangHarian: number;
  uangPenginapan: number;
  golongan?: string;
  pesawat?: boolean;
  tujuanLengkap?: string;
  tiketBisnis?: number;
  tiketEkonomi?: number;
  taxiJakarta?: number;
  taxiDaerah?: number;
  data?: any;
}

export interface SuratData {
  id: string;
  timPoksi: string;
  tipeSurat: 'Masuk' | 'Keluar';
  kategoriSurat: string;
  sifatSurat: string;
  nomorSurat: string;
  tanggalMasuk: string;
  tanggalSurat: string;
  asalTujuan: string;
  perihal: string;
  tglAcaraMulai?: string;
  tglAcaraSelesai?: string;
  disposisiKe?: string[];
  tglDisposisi?: string;
  tindakLanjut?: string;
  fileSurat?: string;
  fileNotulensi?: string;
  createdAt?: string;
}

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
  kodeBooking: string;
  noTiket: string;
  harga: number | string;
}

export interface SpjData {
  id: string;
  nomorSt: string;
  asalInstansi: string;
  nip: string;
  nama: string;
  pangkatGol: string;
  gol: string;
  maksudTujuan: string;
  jumlahDibayar: number | string;
  tujuan1: string;
  tujuan2: string;
  tujuan3: string;
  lamaTugas: number | string;
  tglBerangkat: string;
  tglKembali: string;
  uangHarian: SpjUangHarian[];
  penginapan: SpjPenginapan[];
  transport: SpjTransport[];
  tiketBerangkat: SpjTiket[];
  tiketPulang: SpjTiket[];
  taksi: number | string;
  representasi: number | string;
  uangLainnya: number | string;
  noSpd: string;
  noUrutSpd: string;
  noAkun: string;
  kodeMak: string;
  kodeKapoksi: string;
  nomorLs: string;
  uraianPembayaran: string;
  jabatan: string;
  tingkatBiaya: string;
  kendaraan: string;
  tglPerintah: string;
  timPoksi: string;
  fileLink?: string;
  fileBukti?: string;
  createdAt?: string;
}
