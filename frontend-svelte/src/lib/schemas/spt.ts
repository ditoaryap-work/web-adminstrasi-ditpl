import { z } from 'zod';

export const sptPesertaSchema = z.object({
	namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
	nip: z.string().optional().nullable(),
	jabatan: z.string().optional().nullable(),
	pangkatGol: z.string().optional().nullable(),
	tujuan: z.string().min(1, 'Tujuan wajib diisi'),
	tanggalPelaksanaan: z.string().min(1, 'Tanggal pelaksanaan wajib diisi'),
	lamanya: z.string().optional().nullable(),
	tanggalMulai: z.string().optional().nullable(),
	tanggalSelesai: z.string().optional().nullable()
});

export const sptSchema = z.object({
	id: z.string().optional(),
	no: z.string().min(1, 'Nomor surat wajib diisi'),
	timPoksi: z.string().optional(),
	maksudPerjalanan: z.string().min(1, 'Maksud perjalanan wajib diisi'),
	kegiatan: z.string().min(1, 'Kegiatan wajib diisi'),
	mak: z.string().min(1, 'MAK wajib diisi'),
	tanggalSurat: z.string().min(1, 'Tanggal surat wajib diisi'),
	namaPenandatangan: z.string().optional().nullable(),
	nipPenandatangan: z.string().optional().nullable(),
	peserta: z.array(sptPesertaSchema).min(1, 'Minimal 1 peserta diperlukan untuk dokumen SPT'),
	fileLink: z.string().optional().nullable(),
	createdAt: z.string().optional().nullable()
});

export type SptSchema = typeof sptSchema;
export type SptPesertaSchema = typeof sptPesertaSchema;
