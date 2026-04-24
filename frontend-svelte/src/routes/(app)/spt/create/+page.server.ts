import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { sptSchema } from '$lib/schemas/spt';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();

	try {
		const pegawaiRes = await fetch(`${API_BASE_URL}/api/pegawai`, { headers: { Cookie: `eoffice_token=${token}` } });
		const pegawaiData = await pegawaiRes.json();

		return {
			user,
			pegawaiList: (pegawaiData as any).data || [],
			form: await superValidate(zod(sptSchema))
		};
	} catch (error) {
		console.error('[SPT Create Load Error]', error);
		return {
			user,
			pegawaiList: [],
			form: await superValidate(zod(sptSchema))
		};
	}
};

export const actions: Actions = {
	save: async ({ request, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');

		const form = await superValidate(request, zod(sptSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/spt`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `eoffice_token=${token}`
				},
				body: JSON.stringify(form.data)
			});

			if (!res.ok) {
				const errBody = await res.text();
				console.error('[SPT Form Submit Error]', `Status: ${res.status}`, errBody);
				return fail(res.status, { form, message: 'Gagal menyimpan data SPT' });
			}
			
			const resData = await res.json() as any;
			return { form, success: true, savedData: resData.data };
		} catch (error) {
			console.error('[SPT Action Error]', error);
			return fail(500, { form, message: 'Terjadi kesalahan sistem.' });
		}
	}
};
