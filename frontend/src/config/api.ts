import axios from 'axios';
import { ApiResponse } from '../types/api';

/**
 * Konfigurasi URL Dinamis (Environment Variables Vite)
 * Mengambil dari file .env (e.g. VITE_API_URL=https://api.domain.web.id)
 * Jika tidak ditemukan, fallback ke localhost untuk development Bun backend.
 */
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Cleanup: Hapus trailing slash atau akhiran /api agar tidak terjadi double path
if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);
if (rawUrl.endsWith('/api')) rawUrl = rawUrl.slice(0, -4);

export const BASE_URL = rawUrl;

// 1. Inisialisasi Instance Axios
const api = axios.create({
  baseURL: BASE_URL,
  // INSTRUKSI KRITIS: Harus bernilai true agar Browser mengizinkan 
  // pengiriman Cookie JWT (HttpOnly) lintas origin (CORS) ke backend Bun.
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 2. Global Interceptor Handler
api.interceptors.response.use(
  (response) => {
    // Lolos tanpa masalah
    return response;
  },
  (error) => {
    // [INSTRUKSI KRITIS 4]: Global 401 Interceptor
    // Menangkap penolakan JWT Token kedaluwarsa atau tidak valid secara otomatis dari seluruh komponen Vue.
    if (error.response && error.response.status === 401) {
      console.warn('Sesi keamanan kedaluwarsa (401 Unauthorized). Mengamankan state dan menendang keluar sesi...');
      
      // Bersihkan Session Local / State
      localStorage.removeItem('adminData');
      
      // Hard redirect memutus state history memori SPA (Pinia/Router) dan memaksa fresh login state
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * 3. Migration Wrapper (Backward Compatibility Pattern)
 * Memungkinkan frontend lama Anda yang belum diubah dari `fetchApi('ACTION')`
 * menggunakan mesin Axios dan keamanan CORS baru secara otomatis, selama
 * proses migrasi file-file komponen `.vue` ke struktur RESTful dilakukan.
 */
export async function fetchApi<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  try {
    // Pada masa transisi, data action diarahkan ke instance backend
    // Idealnya Anda akan merefaktor frontend memanggil api.get('/api/spt') secara bertahap.
    const response = await api.post<ApiResponse<T>>('/api/legacy-handler', { action, ...payload });
    
    return {
      status: response.data.status || false,
      message: response.data.message || '',
      data: response.data.data
    };
  } catch (error: any) {
    console.error(`[Axios API Error - ${action}]:`, error);
    
    // Mengekstrak metadata errorMessage asli dari Drizzle/Hono fallback
    const serverMessage = error.response?.data?.message;
    
    return {
      status: false,
      message: serverMessage || error.message || "Gagal menghubungi server",
    };
  }
}

export default api;
