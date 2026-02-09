import { Pool, PoolConfig } from 'pg';

// 1. Determine Connection String
// Vercel + Neon often provides POSTGRES_URL.
// We also support DATABASE_URL as a fallback.
const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL ERROR: No database connection string found in environment variables (POSTGRES_URL or DATABASE_URL).");
}

// 2. Configure Pool
// Note: In serverless functions, we want to be careful with pool size.
const poolConfig: PoolConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon/Vercel to accept the self-signed-like certs often used in dev/cloud
  },
  max: 5, // Reduce max connections for serverless to prevent exhaustion
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable
  idleTimeoutMillis: 20000, // Close idle connections to free resources
};

// 3. Create Pool
const pool = new Pool(poolConfig);

// 4. Error Listener
// This prevents the process from crashing on idle client errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export default pool;