import { z } from 'zod';

export const suratSchema = z.object({
	id: z.string().optional().nullable(),
	tipeSurat: z.enum(['Masuk', 'Keluar']),
	kategoriSurat: z.string().min(1, 'Kategori surat wajib diisi'),
	sifatSurat: z.string().min(1, 'Sifat surat wajib diisi'),
	nomorSurat: z.string().min(1, 'Nomor surat wajib diisi'),
	tanggalMasuk: z.string().min(1, 'Tanggal masuk wajib diisi'),
	tanggalSurat: z.string().min(1, 'Tanggal surat wajib diisi'),
	asalTujuan: z.string().min(1, 'Asal/Tujuan wajib diisi'),
	perihal: z.string().min(1, 'Perihal wajib diisi'),
	tglAcaraMulai: z.string().optional().nullable(),
	tglAcaraSelesai: z.string().optional().nullable(),
	disposisiKe: z.array(z.string()).optional().nullable(),
	tglDisposisi: z.string().optional().nullable(),
	tindakLanjut: z.string().optional().nullable(),
	fileSurat: z.custom<File>().optional().nullable(),
	fileNotulensi: z.custom<File>().optional().nullable()
});

export type SuratSchema = typeof suratSchema;
