import { Pool, PoolConfig } from 'pg';

// We use the provided connection string as a default fallback.
// This ensures the app connects immediately using your Neon credentials.
const DEFAULT_CONNECTION_STRING = "postgresql://neondb_owner:npg_jgxJf6v5ObMh@ep-summer-snow-a14v4s2x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  DEFAULT_CONNECTION_STRING;

if (!connectionString) {
  console.error("CRITICAL ERROR: No database connection string found.");
}

const poolConfig: PoolConfig = {
  connectionString,
  // Neon requires SSL. 'rejectUnauthorized: false' allows connection 
  // without manually bundling the CA certificate, which is standard for this setup.
  ssl: {
    rejectUnauthorized: false, 
  },
  max: 5, // Limit pool size to prevent exhaustion in serverless functions
  connectionTimeoutMillis: 5000, // Fail fast (5s) if DB is unreachable
  idleTimeoutMillis: 20000, // Close idle connections to free resources
};

const pool = new Pool(poolConfig);

// Handle idle client errors to prevent crash
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export default pool;