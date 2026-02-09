import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Attempt a lightweight query first to verify connection
    const result = await pool.query('SELECT * FROM courses ORDER BY code ASC');
    
    const courses = result.rows.map((row: any) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        timeSlot: row.time_slot,
        credits: row.credits
    }));

    return res.status(200).json(courses);
  } catch (e: any) {
    console.error("FULL DATABASE ERROR:", e);
    
    // Check for common specific errors
    if (e.code === '28P01') { // invalid_password
        return res.status(500).json({ error: 'Database authentication failed. Check credentials.' });
    }
    if (e.code === '3D000') { // invalid_catalog_name
        return res.status(500).json({ error: 'Database does not exist. Check connection string.' });
    }
    if (e.code === 'ECONNREFUSED') {
         return res.status(500).json({ error: 'Database connection refused. Check firewall or host.' });
    }
    
    return res.status(500).json({ 
        error: 'Database operation failed', 
        details: e.message,
        hint: "Ensure you have set POSTGRES_URL in Vercel Environment Variables and run the schema.sql"
    });
  }
}