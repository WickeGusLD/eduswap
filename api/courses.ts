import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple Select
    const result = await pool.query('SELECT * FROM courses ORDER BY code ASC');
    
    // Map snake_case db columns to camelCase
    const courses = result.rows.map((row: any) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        timeSlot: row.time_slot,
        credits: row.credits
    }));

    return res.status(200).json(courses);
  } catch (e: any) {
    console.error("Database Error in getCourses:", e);
    return res.status(500).json({ error: 'Failed to fetch courses. Check database connection.', details: e.message });
  }
}
