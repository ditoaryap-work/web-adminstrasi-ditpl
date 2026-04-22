import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const userCookie = cookies.get('eoffice_user');
	let user = null;

	if (userCookie) {
		try {
			user = JSON.parse(userCookie);
		} catch {
			// ignore parse error logs in dev
		}
	}

	return {
		user
	};
};
