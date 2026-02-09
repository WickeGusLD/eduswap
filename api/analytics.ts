import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('eduswap');
    const courses = await db.collection('courses').find({}).toArray();
    const swaps = await db.collection('swaps').find({ status: { $ne: 'CANCELLED' } }).toArray();

    const analytics = courses.map((course: any) => {
        const demand = swaps.filter((s: any) => s.wantCourseId.toString() === course._id.toString()).length;
        const supply = swaps.filter((s: any) => s.haveCourseId.toString() === course._id.toString()).length;
        return {
            courseCode: course.code,
            demand,
            supply
        };
    }).filter(a => a.demand > 0 || a.supply > 0);

    return res.status(200).json(analytics);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
