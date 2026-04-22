import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Hapus cookie sesi aplikasi
		cookies.delete('eoffice_token', { path: '/' });
		cookies.delete('eoffice_user', { path: '/' });

		// Redirect kembali ke login
		throw redirect(303, '/login');
	}
};
