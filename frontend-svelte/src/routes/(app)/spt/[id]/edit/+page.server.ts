import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { sptSchema } from '$lib/schemas/spt';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();
	const id = params.id;

	try {
		const [sptRes, pegawaiRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/spt/${id}`, { headers: { Cookie: `eoffice_token=${token}` } }),
			fetch(`${API_BASE_URL}/api/pegawai`, { headers: { Cookie: `eoffice_token=${token}` } })
		]);

		if (!sptRes.ok) {
			throw redirect(303, '/spt');
		}

		const sptData = await sptRes.json();
		const pegawaiData = await pegawaiRes.json();

		const initialData = (sptData as any).data;
		
		// Pre-fill form
		const form = await superValidate(initialData, zod(sptSchema));

		return {
			user,
			spt: initialData,
			pegawaiList: (pegawaiData as any).data || [],
			form
		};
	} catch (error) {
		console.error('[SPT Edit Load Error]', error);
		throw redirect(303, '/spt');
	}
};

export const actions: Actions = {
	save: async ({ request, params, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');
		
		const id = params.id;

		const form = await superValidate(request, zod(sptSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/spt/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `eoffice_token=${token}`
				},
				body: JSON.stringify(form.data)
			});

			if (!res.ok) {
				const errBody = await res.text();
				console.error('[SPT Form Edit Error]', `Status: ${res.status}`, errBody);
				return fail(res.status, { form, message: 'Gagal memperbarui data SPT' });
			}
			
			const resData = await res.json() as any;
			return { form, success: true, savedData: resData.data };
		} catch (error) {
			console.error('[SPT Edit Action Error]', error);
			return fail(500, { form, message: 'Terjadi kesalahan sistem.' });
		}
	}
};
