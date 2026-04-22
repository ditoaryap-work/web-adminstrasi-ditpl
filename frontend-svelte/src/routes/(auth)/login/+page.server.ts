import { fail, redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas/auth';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const username = form.data.username;
		const password = form.data.password;


		try {
			// Kirim login request ke backend VPS
			const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			const result = (await response.json()) as { status: boolean; message: string; data?: any };

			if (!result.status) {
				return message(form, result.message || 'Login gagal.', { status: 401 });
			}

			// Ambil token dari response backend
			// Backend mengirim token via Set-Cookie, tapi kita juga perlu set di SvelteKit
			// Karena cookie backend hanya antara CF ↔ VPS, kita buat cookie sendiri untuk browser
			const backendCookie = response.headers.get('set-cookie');
			let token = '';

			if (backendCookie) {
				// Extract token value dari set-cookie header
				const tokenMatch = backendCookie.match(/eoffice_token=([^;]+)/);
				if (tokenMatch) {
					token = tokenMatch[1];
				}
			}

			if (token) {
				// Set cookie SvelteKit → Browser (proxy auth)
				cookies.set('eoffice_token', token, {
					path: '/',
					httpOnly: true,
					secure: false, // false untuk localhost, true di production
					sameSite: 'lax',
					maxAge: 12 * 60 * 60 // 12 jam
				});
			}

			// Simpan user data di cookie terpisah (non-httpOnly agar bisa dibaca di client)
			if (result.data) {
				cookies.set('eoffice_user', JSON.stringify(result.data), {
					path: '/',
					httpOnly: false,
					secure: false,
					sameSite: 'lax',
					maxAge: 12 * 60 * 60
				});
			}
		} catch (err) {
			console.error('[Login Error]', err);
			return message(form, 'Gagal terhubung ke server. Pastikan backend berjalan.', { status: 500 });
		}

		// Redirect ke dashboard setelah login berhasil
		throw redirect(303, '/dashboard');
	}
};
