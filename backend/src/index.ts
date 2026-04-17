import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { apiLimiter } from './middleware/rateLimiter';
import { customErrorHandler } from './middleware/errorHandler';
import uploadRouter from './routes/upload';
import authRouter from './routes/auth';
import pegawaiRouter from './routes/pegawai';
import configRouter from './routes/config';
import sbmRouter from './routes/sbm';
import sptRouter from './routes/spt';
import sptjmRouter from './routes/sptjm';
import suratRouter from './routes/surat';
import spjRouter from './routes/spj';
import templateRouter from './routes/template';
import adminRouter from './routes/admin';
import syncRouter from './routes/sync';
import legacyRouter from './routes/legacy';

const app = new Hono();

// Global Error Handler
app.onError(customErrorHandler);

// Security & Global Middleware
app.use('*', logger());
app.use('/api/*', apiLimiter); // Apply rate limiting to all API routes
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Route pendaftaran
app.route('/api/auth', authRouter);
app.route('/api/pegawai', pegawaiRouter);
app.route('/api/config', configRouter);
app.route('/api/sbm', sbmRouter);
app.route('/api/spt', sptRouter);
app.route('/api/sptjm', sptjmRouter);
app.route('/api/surat', suratRouter);
app.route('/api/spj', spjRouter);
app.route('/api/upload', uploadRouter);
app.route('/api/templates', templateRouter);
app.route('/api/admin', adminRouter);
app.route('/api/sync', syncRouter);
app.route('/api/legacy-handler', legacyRouter);

// Route dasar
app.get('/', (c) => c.json({ status: 'ok', message: 'E-Office API is running' }));

export default {
  port: parseInt(process.env.PORT || '3000'),
  fetch: app.fetch,
};
