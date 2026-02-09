import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('eduswap');
    const collection = db.collection('swaps');
    const coursesCollection = db.collection('courses');

    if (req.method === 'GET') {
        // Aggregate to join course details
        const swaps = await collection.aggregate([
          {
            $lookup: {
              from: 'courses',
              localField: 'haveCourseId',
              foreignField: '_id',
              as: 'haveCourse'
            }
          },
          { $unwind: '$haveCourse' },
          {
            $lookup: {
              from: 'courses',
              localField: 'wantCourseId',
              foreignField: '_id',
              as: 'wantCourse'
            }
          },
          { $unwind: '$wantCourse' },
          { $sort: { createdAt: -1 } }
        ]).toArray();

        // Transform _id to id for frontend compatibility
        const sanitized = swaps.map((s: any) => ({
          ...s,
          id: s._id.toString(),
          haveCourse: { ...s.haveCourse, id: s.haveCourse._id.toString() },
          wantCourse: { ...s.wantCourse, id: s.wantCourse._id.toString() }
        }));

        return res.status(200).json(sanitized);
    }

    if (req.method === 'POST') {
        const { userId, have, want } = req.body;

        if (!userId || !have?.code || !want?.code) {
             return res.status(400).json({ error: 'Missing required fields' });
        }

        // Helper to find or create a course
        const getOrCreateCourseId = async (courseData: any) => {
            const existing = await coursesCollection.findOne({ code: courseData.code });
            if (existing) {
                return existing._id;
            }
            const result = await coursesCollection.insertOne({
                ...courseData,
                // Ensure default fields
                title: courseData.title || 'Unknown Title',
                timeSlot: courseData.timeSlot || 'TBD' 
            });
            return result.insertedId;
        };

        // 1. Get/Create Course IDs
        const haveCourseId = await getOrCreateCourseId(have);
        const wantCourseId = await getOrCreateCourseId(want);

        // 2. Create Swap
        const newSwap = {
          userId,
          haveCourseId: new ObjectId(haveCourseId),
          wantCourseId: new ObjectId(wantCourseId),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          matchType: null
        };

        await collection.insertOne(newSwap);

        return res.status(201).json({ message: 'Swap created successfully' });
    }

    // Handle unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (e: any) {
    console.error("API Error:", e);
    return res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
}
