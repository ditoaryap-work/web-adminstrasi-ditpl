import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { sptjmSchema } from '$lib/schemas/sptjm';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();

	try {
		const pegawaiRes = await fetch(`${API_BASE_URL}/api/pegawai`, { headers: { Cookie: `eoffice_token=${token}` } });
		const pegawaiData = await pegawaiRes.json();

		const sbmRes = await fetch(`${API_BASE_URL}/api/sbm`, { headers: { Cookie: `eoffice_token=${token}` } });
		const sbmData = await sbmRes.json();

		let pList = (pegawaiData as any).data || [];
		if (user.role !== 'Super Admin' && user.timPoksi) {
			pList.sort((a: any, b: any) => {
				const aPoksi = String(a.poksi || '').toLowerCase() === String(user.timPoksi).toLowerCase();
				const bPoksi = String(b.poksi || '').toLowerCase() === String(user.timPoksi).toLowerCase();
				if (aPoksi && !bPoksi) return -1;
				if (!aPoksi && bPoksi) return 1;
				return 0;
			});
		}

		return {
			user,
			pegawaiList: pList,
			pegawaiOptions: pList.map((p: any) => ({
				label: p.namaLengkap,
				value: p.id,
				subtitle: `${p.nip || 'Non NIP'} - ${p.jabatan || ''}${p.poksi ? ` [${p.poksi}]` : ''}`
			})),
			sbmList: (sbmData as any).data || [],
			sbmOptions: ((sbmData as any).data || []).map((s: any) => ({
				label: s.kecKab,
				value: s.id
			})),
			form: await superValidate(zod(sptjmSchema))
		};
	} catch (error) {
		console.error('[SPTJM Create Load Error]', error);
		return {
			user,
			pegawaiList: [],
			pegawaiOptions: [],
			sbmList: [],
			sbmOptions: [],
			form: await superValidate(zod(sptjmSchema))
		};
	}
};

export const actions: Actions = {
	save: async ({ request, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');

		const form = await superValidate(request, zod(sptjmSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/sptjm`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `eoffice_token=${token}`
				},
				body: JSON.stringify(form.data)
			});

			if (!res.ok) {
				const errBody = await res.text();
				console.error('[SPTJM Form Submit Error]', `Status: ${res.status}`, errBody);
				return fail(res.status, { form, message: 'Gagal menyimpan data SPTJM' });
			}
			
			const resData = await res.json() as any;
			return { form, success: true, savedData: resData.data };
		} catch (error) {
			console.error('[SPTJM Action Error]', error);
			return fail(500, { form, message: 'Terjadi kesalahan sistem.' });
		}
	}
};
