import { Hono } from 'hono';
import { db } from '../db';
import { spt, sptjm, pegawai, config, users, sbm } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';

const legacyRouter = new Hono<{ Variables: { user: JwtPayload } }>();

legacyRouter.use('/*', authMiddleware);

legacyRouter.post('/', async (c) => {
    const { action, ...payload } = await c.req.json();
    const user = c.get('user');

    console.log(`[Legacy Bridge] Action: ${action}`, payload);

    try {
        switch (action) {
            case 'GET_SPT_LIST': {
                const query = db.select().from(spt).orderBy(desc(spt.createdAt));
                if (user.role !== 'Super Admin') {
                    query.where(eq(spt.timPoksi, user.timPoksi));
                }
                const data = await query;
                return c.json({ status: true, data });
            }

            case 'GET_SPTJM_LIST': {
                const query = db.select().from(sptjm).orderBy(desc(sptjm.createdAt));
                if (user.role !== 'Super Admin') {
                    query.where(eq(sptjm.timPoksi, user.timPoksi));
                }
                const data = await query;
                return c.json({ status: true, data });
            }

            case 'GET_PEGAWAI': {
                const data = await db.select().from(pegawai);
                return c.json({ status: true, data });
            }

            case 'GET_SBM': {
                const data = await db.select().from(sbm);
                return c.json({ status: true, data });
            }

            case 'GET_CONFIGS': {
                const data = await db.select().from(config);
                return c.json({ status: true, data });
            }

            case 'GET_ADMINS': {
                const list = await db.select({
                    username: users.username,
                    nama_admin: users.nama,
                    tim_poksi: users.timPoksi,
                    role: users.role,
                    last_login: users.lastLogin
                }).from(users);
                return c.json({ status: true, data: list });
            }

            case 'SAVE_SPTJM': {
                const { data } = payload;
                const { sptjm } = await import('../db/schema');
                // Persist to DB
                let result;
                if (data.id_sptjm) {
                    result = await db.update(sptjm).set({ ...data, updatedAt: new Date() }).where(eq(sptjm.id, data.id_sptjm)).returning();
                } else {
                    result = await db.insert(sptjm).values({ ...data, timPoksi: user.timPoksi }).returning();
                }
                return c.json({ status: true, message: 'Data SPTJM berhasil disimpan', data: result[0] });
            }

            case 'DELETE_SPTJM': {
                const { id } = payload;
                const { sptjm } = await import('../db/schema');
                await db.delete(sptjm).where(eq(sptjm.id, id));
                return c.json({ status: true, message: 'Data SPTJM berhasil dihapus' });
            }

            default:
                return c.json({ status: false, message: `Action '${action}' not supported by legacy bridge.` }, 400);
        }
    } catch (error: any) {
        console.error(`[Legacy Bridge Error - ${action}]:`, error);
        return c.json({ status: false, message: error.message }, 500);
    }
});

export default legacyRouter;
