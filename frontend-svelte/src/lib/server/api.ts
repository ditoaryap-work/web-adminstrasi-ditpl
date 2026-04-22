import { API_BASE_URL } from '$env/static/private';

/**
 * Server-side API wrapper untuk komunikasi SvelteKit → VPS Backend.
 * File ini HANYA bisa dipakai di +page.server.ts, +layout.server.ts, hooks.server.ts
 */

interface ApiOptions {
	method?: string;
	body?: unknown;
	token?: string;
	headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
	status: boolean;
	message: string;
	data?: T;
	errors?: unknown;
}

/**
 * Fetch data dari backend VPS.
 * Otomatis menambahkan Authorization header jika token tersedia.
 */
export async function api<T = unknown>(
	endpoint: string,
	options: ApiOptions = {}
): Promise<ApiResponse<T>> {
	const { method = 'GET', body, token, headers = {} } = options;

	const url = `${API_BASE_URL}${endpoint}`;

	const fetchHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers
	};

	if (token) {
		fetchHeaders['Authorization'] = `Bearer ${token}`;
	}

	const fetchOptions: RequestInit = {
		method,
		headers: fetchHeaders
	};

	if (body && method !== 'GET') {
		fetchOptions.body = JSON.stringify(body);
	}

	const response = await fetch(url, fetchOptions);
	const result: ApiResponse<T> = await response.json();

	return result;
}

/**
 * Shortcut untuk GET request
 */
export async function apiGet<T = unknown>(endpoint: string, token?: string) {
	return api<T>(endpoint, { token });
}

/**
 * Shortcut untuk POST request
 */
export async function apiPost<T = unknown>(endpoint: string, body: unknown, token?: string) {
	return api<T>(endpoint, { method: 'POST', body, token });
}

/**
 * Shortcut untuk PUT request
 */
export async function apiPut<T = unknown>(endpoint: string, body: unknown, token?: string) {
	return api<T>(endpoint, { method: 'PUT', body, token });
}

/**
 * Shortcut untuk DELETE request
 */
export async function apiDelete<T = unknown>(endpoint: string, token?: string) {
	return api<T>(endpoint, { method: 'DELETE', token });
}
