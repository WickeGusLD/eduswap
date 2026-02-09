import { Pool } from 'pg';

// Vercel's Neon integration typically sets POSTGRES_URL. 
// We check that first, then fall back to DATABASE_URL.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  // We don't throw immediately to allow build step to pass, but connection will fail at runtime
  console.warn('WARNING: POSTGRES_URL or DATABASE_URL environment variable is not set.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL; this setting trusts the server certificate
  },
  max: 10, // Limit connection pool size for serverless environment
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export default pool;
