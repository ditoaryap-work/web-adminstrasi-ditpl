import type { ErrorHandler } from 'hono';

export const customErrorHandler: ErrorHandler = (err, c) => {
  // Hanya log error ke sisi server (console) agar tidak membocorkan stack trace ke client public
  console.error(`[Error] ${c.req.method} ${c.req.url}:`, err);
  
  // Sanitasi pesan error
  return c.json({
    status: false,
    message: 'Terjadi kesalahan sistem internal. Silakan coba lagi atau hubungi administrator.',
    ...(process.env.NODE_ENV === 'development' && { devError: err.message })
  }, 500);
};
