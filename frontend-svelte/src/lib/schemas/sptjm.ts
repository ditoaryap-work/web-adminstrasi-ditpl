import { z } from 'zod';

export const sptjmSchema = z.object({
	id: z.string().optional(),
	namaLengkap: z.string().optional(),
	nip: z.string().optional(),
	jabatan: z.string().optional(),
	tujuan: z.string().optional(),
	tanggalPerjalanan: z.string().optional(),
	tanggalKembali: z.string().optional(),
	tiketBerangkat: z.number().or(z.string()).optional(),
	tiketPulang: z.number().or(z.string()).optional(),
	biayaSbm: z.number().or(z.string()).optional(),
	totalBiaya: z.number().or(z.string()).optional(),
	tanggalTtd: z.string().optional()
});

export type SptjmSchema = z.infer<typeof sptjmSchema>;
