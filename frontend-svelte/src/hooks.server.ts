import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/**
 * SvelteKit Server Hook — berjalan di SETIAP request.
 * Fungsi utama:
 * 1. Baca token dari cookie browser
 * 2. Simpan token di locals (agar bisa diakses di +page.server.ts)
 * 3. Proteksi route yang butuh auth
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Ambil token dari cookie browser (cookie yang di-set SvelteKit, bukan backend)
	const token = event.cookies.get('eoffice_token');

	// Simpan token di locals agar bisa diakses oleh load functions
	event.locals.token = token || '';

	// Daftar path publik yang tidak butuh auth
	const publicPaths = ['/login', '/api'];

	const isPublicPath = publicPaths.some((path) => event.url.pathname.startsWith(path));

	// Redirect ke login jika tidak ada token dan bukan public path
	if (!token && !isPublicPath) {
		throw redirect(303, '/login');
	}

	// Redirect ke dashboard jika sudah login tapi akses halaman login
	if (token && event.url.pathname === '/login') {
		throw redirect(303, '/dashboard');
	}

	const response = await resolve(event);
	return response;
};
