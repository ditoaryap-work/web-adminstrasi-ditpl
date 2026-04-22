import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) {
		throw redirect(303, '/login');
	}

	const { user } = await parent();

	try {
		// Fetch SPT & SPTJM secara paralel
		const [sptRes, sptjmRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/spt`, {
				headers: { Cookie: `eoffice_token=${token}` }
			}),
			fetch(`${API_BASE_URL}/api/sptjm`, {
				headers: { Cookie: `eoffice_token=${token}` }
			})
		]);

		const [sptData, sptjmData]: [any, any] = await Promise.all([
			sptRes.json(),
			sptjmRes.json()
		]);

		return {
			user,
			sptList: sptData.data || [],
			sptjmList: sptjmData.data || []
		};
	} catch (error) {
		console.error('[Dashboard Load Error]', error);
		return {
			user,
			sptList: [],
			sptjmList: []
		};
	}
};
