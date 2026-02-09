import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = await clientPromise;
  const db = client.db('eduswap');
  const collection = db.collection('swaps');
  const coursesCollection = db.collection('courses');

  if (req.method === 'GET') {
    try {
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
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, have, want } = req.body;

      // 1. Upsert Have Course
      const haveResult = await coursesCollection.findOneAndUpdate(
        { code: have.code },
        { $setOnInsert: have },
        { upsert: true, returnDocument: 'after' }
      );
      const haveCourseId = haveResult?.value?._id || haveResult?.lastErrorObject?.upserted || (await coursesCollection.findOne({code: have.code}))?._id;

      // 2. Upsert Want Course
      const wantResult = await coursesCollection.findOneAndUpdate(
        { code: want.code },
        { $setOnInsert: want },
        { upsert: true, returnDocument: 'after' }
      );
      const wantCourseId = wantResult?.value?._id || wantResult?.lastErrorObject?.upserted || (await coursesCollection.findOne({code: want.code}))?._id;

      // 3. Create Swap
      const newSwap = {
        userId,
        haveCourseId: new ObjectId(haveCourseId),
        wantCourseId: new ObjectId(wantCourseId),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        matchType: null
      };

      await collection.insertOne(newSwap);

      return res.status(201).json({ message: 'Swap created' });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }
}
