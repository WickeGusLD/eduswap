import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // We want a list of courses with supply (have count) and demand (want count)
    // We can do this with a single complex query or multiple simple ones.
    // Let's do it efficiently with SQL.
    
    const query = `
        SELECT 
            c.code,
            COUNT(CASE WHEN s.want_course_id = c.id AND s.status != 'CANCELLED' THEN 1 END) as demand,
            COUNT(CASE WHEN s.have_course_id = c.id AND s.status != 'CANCELLED' THEN 1 END) as supply
        FROM courses c
        LEFT JOIN swap_requests s ON c.id = s.want_course_id OR c.id = s.have_course_id
        GROUP BY c.id, c.code
        HAVING 
            COUNT(CASE WHEN s.want_course_id = c.id AND s.status != 'CANCELLED' THEN 1 END) > 0 
            OR 
            COUNT(CASE WHEN s.have_course_id = c.id AND s.status != 'CANCELLED' THEN 1 END) > 0
    `;

    const result = await pool.query(query);

    const analytics = result.rows.map((row: any) => ({
        courseCode: row.code,
        demand: parseInt(row.demand),
        supply: parseInt(row.supply)
    }));

    return res.status(200).json(analytics);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
