import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple Select
    const result = await pool.query('SELECT * FROM courses ORDER BY code ASC');
    
    // Map snake_case db columns to camelCase if needed, 
    // or keep as is if frontend allows.
    // Frontend types expect: id, code, title, timeSlot
    const courses = result.rows.map((row: any) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        timeSlot: row.time_slot,
        credits: row.credits
    }));

    return res.status(200).json(courses);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
