import { fail, redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();

	try {
		// Fetch SPTJM only
		const sptjmRes = await fetch(`${API_BASE_URL}/api/sptjm`, { headers: { Cookie: `eoffice_token=${token}` } });
		const sptjmData = await sptjmRes.json();

		return {
			user,
			sptjmList: (sptjmData as any).data || []
		};
	} catch (error) {
		console.error('[SPTJM Load Error]', error);
		return {
			user,
			sptjmList: []
		};
	}
};

export const actions: Actions = {
	delete: async ({ request, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'ID SPTJM tidak valid' });
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/sptjm/${id}`, {
				method: 'DELETE',
				headers: {
					Cookie: `eoffice_token=${token}`
				}
			});

			if (!res.ok) {
				return fail(res.status, { message: 'Gagal menghapus SPTJM' });
			}

			return { success: true, message: 'SPTJM berhasil dihapus' };
		} catch (error) {
			return fail(500, { message: 'Terjadi kesalahan saat menghapus SPTJM' });
		}
	}
};
