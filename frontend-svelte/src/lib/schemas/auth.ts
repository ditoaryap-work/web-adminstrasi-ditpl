import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(1, { message: 'Username wajib diisi.' }).max(100),
	password: z.string().min(1, { message: 'Password wajib diisi.' })
});

export type LoginSchema = typeof loginSchema;
