import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/eoffice';

/**
 * Limit connection pool agar tidak membebani Memori VPS
 * PostgreSQL diset max 30 connection, aplikasi di max 10
 */
const client = postgres(connectionString, { max: 10 }); 

export const db = drizzle(client, { schema });
