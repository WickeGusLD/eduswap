import { Course, SwapRequest, SwapStatus } from './types';

// Seed some initial community courses so the list isn't empty
export const COURSES: Course[] = [
  { id: 'c1', code: 'CS101', title: 'Intro to Computer Science', instructor: 'Dr. Smith', timeSlot: 'Mon/Wed 10:00 AM', credits: 4 },
  { id: 'c2', code: 'MATH202', title: 'Linear Algebra', instructor: 'Prof. Johnson', timeSlot: 'Tue/Thu 2:00 PM', credits: 3 },
  { id: 'c3', code: 'HIST150', title: 'World History', instructor: 'Dr. Brown', timeSlot: 'Fri 9:00 AM', credits: 3 },
  { id: 'c4', code: 'ENG102', title: 'Academic Writing', instructor: 'Prof. Davis', timeSlot: 'Mon/Wed 1:00 PM', credits: 3 },
  { id: 'c5', code: 'PHYS101', title: 'General Physics', instructor: 'Dr. Wilson', timeSlot: 'Tue/Thu 11:00 AM', credits: 4 },
];

export const MOCK_SWAPS: SwapRequest[] = [
  {
    id: 's1',
    userId: 'anon_user_1', 
    haveCourseId: 'c3', // History
    wantCourseId: 'c1', // CS
    status: SwapStatus.MATCH_FOUND,
    createdAt: '2023-10-25T10:00:00Z',
    matchType: 'DIRECT',
  },
  {
    id: 's2',
    userId: 'anon_user_2',
    haveCourseId: 'c1', // Has CS
    wantCourseId: 'c3', // Wants History
    status: SwapStatus.PENDING,
    createdAt: '2023-10-24T09:00:00Z',
  },
];
