import { fail, redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();

	try {
		// Fetch SPT only
		const sptRes = await fetch(`${API_BASE_URL}/api/spt`, { headers: { Cookie: `eoffice_token=${token}` } });
		const sptData = await sptRes.json();

		return {
			user,
			sptList: (sptData as any).data || []
		};
	} catch (error) {
		console.error('[SPT Load Error]', error);
		return {
			user,
			sptList: []
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
			return fail(400, { message: 'ID SPT tidak valid' });
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/spt/${id}`, {
				method: 'DELETE',
				headers: {
					Cookie: `eoffice_token=${token}`
				}
			});

			if (!res.ok) {
				return fail(res.status, { message: 'Gagal menghapus SPT' });
			}

			return { success: true, message: 'SPT berhasil dihapus' };
		} catch (error) {
			return fail(500, { message: 'Terjadi kesalahan saat menghapus SPT' });
		}
	}
};
