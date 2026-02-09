import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';
import { randomUUID } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await pool.connect();

    if (req.method === 'GET') {
        try {
            // SQL Join to get course details
            const query = `
                SELECT 
                    s.id, s.user_id as "userId", s.status, s.created_at as "createdAt", s.match_type as "matchType",
                    hc.id as hc_id, hc.code as hc_code, hc.title as hc_title, hc.time_slot as hc_time_slot,
                    wc.id as wc_id, wc.code as wc_code, wc.title as wc_title, wc.time_slot as wc_time_slot
                FROM swap_requests s
                JOIN courses hc ON s.have_course_id = hc.id
                JOIN courses wc ON s.want_course_id = wc.id
                ORDER BY s.created_at DESC
            `;
            
            const result = await client.query(query);

            // Transform flat SQL rows into nested objects for frontend
            const sanitized = result.rows.map((row: any) => ({
                id: row.id,
                userId: row.userId,
                status: row.status,
                createdAt: row.createdAt,
                matchType: row.matchType,
                haveCourseId: row.hc_id,
                wantCourseId: row.wc_id,
                haveCourse: {
                    id: row.hc_id,
                    code: row.hc_code,
                    title: row.hc_title,
                    timeSlot: row.hc_time_slot
                },
                wantCourse: {
                    id: row.wc_id,
                    code: row.wc_code,
                    title: row.wc_title,
                    timeSlot: row.wc_time_slot
                }
            }));

            return res.status(200).json(sanitized);
        } finally {
            client.release();
        }
    }

    if (req.method === 'POST') {
        const { userId, have, want } = req.body;

        if (!userId || !have?.code || !want?.code) {
             return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            await client.query('BEGIN'); // Start Transaction

            // Helper to Find or Create Course
            const ensureCourse = async (course: any) => {
                // Check exist
                const checkRes = await client.query('SELECT id FROM courses WHERE code = $1', [course.code]);
                if (checkRes.rows.length > 0) {
                    return checkRes.rows[0].id;
                }
                
                // Create
                const newId = randomUUID();
                await client.query(
                    'INSERT INTO courses (id, code, title, time_slot) VALUES ($1, $2, $3, $4)',
                    [newId, course.code, course.title || 'Unknown', course.timeSlot || 'TBD']
                );
                return newId;
            };

            const haveCourseId = await ensureCourse(have);
            const wantCourseId = await ensureCourse(want);

            const swapId = randomUUID();
            await client.query(
                `INSERT INTO swap_requests 
                (id, user_id, have_course_id, want_course_id, status, created_at) 
                VALUES ($1, $2, $3, $4, 'PENDING', NOW())`,
                [swapId, userId, haveCourseId, wantCourseId]
            );

            await client.query('COMMIT'); // Commit Transaction
            return res.status(201).json({ message: 'Swap created successfully', id: swapId });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (e: any) {
    console.error("API Error:", e);
    return res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
}
