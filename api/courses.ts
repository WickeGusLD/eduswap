import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('eduswap');
    
    // Get unique courses that are actually involved in active swaps if preferred,
    // or just all courses in the catalog.
    const courses = await db.collection('courses').find({}).toArray();

    const sanitized = courses.map((c: any) => ({
      ...c,
      id: c._id.toString()
    }));

    return res.status(200).json(sanitized);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
