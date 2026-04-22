import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { suratSchema } from '$lib/schemas/surat';
import { API_BASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('eoffice_token');
	if (!token) throw redirect(303, '/login');

	const { user } = await parent();

	try {
		// Fetch Surat & Pegawai
		const [suratRes, pegawaiRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/surat`, { headers: { Cookie: `eoffice_token=${token}` } }),
			fetch(`${API_BASE_URL}/api/pegawai`, { headers: { Cookie: `eoffice_token=${token}` } })
		]);
		
		const [suratData, pegawaiData] = await Promise.all([suratRes.json(), pegawaiRes.json()]);

		return {
			user,
			suratList: (suratData as any).data || [],
			pegawaiList: (pegawaiData as any).data || [],
			form: await superValidate(zod(suratSchema))
		};
	} catch (error) {
		console.error('[Arsip Surat Load Error]', error);
		return {
			user,
			suratList: [],
			pegawaiList: [],
			form: await superValidate(zod(suratSchema))
		};
	}
};

export const actions: Actions = {
	save: async ({ request, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		
		// Parse SvelteKit formData as normal superValidate object, ignoring Files (validated client-side)
		const form = await superValidate(formData, zod(suratSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// Proxy this formData to Hono backend.
		// Hono backend expects { data: JSON.stringify({...}), fileSurat: File, fileNotulensi: File }
		const backendFormData = new FormData();
		backendFormData.append('data', JSON.stringify(form.data));

		const fileSurat = formData.get('fileSurat') as File | null;
		if (fileSurat && fileSurat.size > 0 && fileSurat.name !== 'undefined') {
			backendFormData.append('fileSurat', fileSurat);
		}

		const fileNotulensi = formData.get('fileNotulensi') as File | null;
		if (fileNotulensi && fileNotulensi.size > 0 && fileNotulensi.name !== 'undefined') {
			backendFormData.append('fileNotulensi', fileNotulensi);
		}

		try {
			// Backend menangani Update dan Create dalam 1 rute POST melalui pengecekan field id
			const response = await fetch(`${API_BASE_URL}/api/surat`, {
				method: 'POST',
				headers: { Cookie: `eoffice_token=${token}` },
				body: backendFormData
			});

			const res: any = await response.json();
			if (!res.status) {
				return fail(400, { form, message: res.message });
			}

			// return without redirect since superforms handles client invalidation automatically (enhance)
			return { form, success: true, message: form.data.id ? 'Surat diperbarui' : 'Surat disimpan' };
		} catch (e: any) {
			console.error('Save Surat Error', e);
			return fail(500, { form, message: 'Server error' });
		}
	},
	
	delete: async ({ request, cookies, fetch }) => {
		const token = cookies.get('eoffice_token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) return fail(400, { message: 'ID diperlukan' });

		try {
			const response = await fetch(`${API_BASE_URL}/api/surat/${id}`, {
				method: 'DELETE',
				headers: { Cookie: `eoffice_token=${token}` }
			});

			const res: any = await response.json();
			if (!res.status) {
				return fail(400, { message: res.message });
			}
			return { deleteSuccess: true, message: 'Arsip dihapus' };
		} catch (e) {
			return fail(500, { message: 'Server error saat menghapus' });
		}
	}
};
