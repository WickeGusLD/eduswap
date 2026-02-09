import { Pool } from 'pg';

// Vercel/Neon usually provides DATABASE_URL or POSTGRES_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Please add DATABASE_URL to your .env file');
}

// Create a connection pool to reuse connections
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for most cloud Postgres providers
  },
});

export default pool;
