import { SwapRequest, Course, SwapStatus, AnalyticsData } from '../types';
import { COURSES, MOCK_SWAPS } from '../constants';

const STORAGE_KEYS = {
  SWAPS: 'eduswap_swaps',
  COURSES: 'eduswap_courses',
  DEVICE_ID: 'eduswap_device_id'
};

// Helper to seed data if empty
const initDB = () => {
  if (typeof window === 'undefined') return; 
  
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(COURSES));
  }
  // Allow user to clear swaps if they want a fresh start, but seed if empty
  if (!localStorage.getItem(STORAGE_KEYS.SWAPS)) {
    const cleanSwaps = MOCK_SWAPS.map(({ haveCourse, wantCourse, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEYS.SWAPS, JSON.stringify(cleanSwaps));
  }
};

try {
  initDB();
} catch (e) {
  console.warn("LocalStorage unavailable", e);
}

// Database Service
export const db = {
  // Get or Create Anonymous User ID
  getUserId: (): string => {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },

  getCourses: async (): Promise<Course[]> => {
    await new Promise(r => setTimeout(r, 100)); 
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
  },

  // Get all swaps (for marketplace)
  getAllSwaps: async (): Promise<SwapRequest[]> => {
    await new Promise(r => setTimeout(r, 300));
    const swapsRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPS) || '[]');
    const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');

    return swapsRaw.map((s: any) => ({
      ...s,
      haveCourse: courses.find((c: Course) => c.id === s.haveCourseId),
      wantCourse: courses.find((c: Course) => c.id === s.wantCourseId),
    })).filter((s: SwapRequest) => s.haveCourse && s.wantCourse)
      .sort((a: SwapRequest, b: SwapRequest) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Helper to ensure a course exists
  ensureCourse: async (courseData: Partial<Course>): Promise<string> => {
     const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
     
     // Simple fuzzy match on Code
     let existing = courses.find(c => c.code.toLowerCase() === courseData.code?.toLowerCase());
     
     if (existing) {
         return existing.id;
     }

     const newCourse: Course = {
         id: 'c_' + Math.random().toString(36).substr(2, 9),
         code: courseData.code || 'UNKNOWN',
         title: courseData.title || courseData.code || 'Unknown Course',
         timeSlot: courseData.timeSlot || 'TBD',
         instructor: courseData.instructor || 'Unknown',
         credits: courseData.credits || 3
     };

     courses.push(newCourse);
     localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
     return newCourse.id;
  },

  createSwap: async (userId: string, have: Partial<Course>, want: Partial<Course>): Promise<void> => {
    await new Promise(r => setTimeout(r, 200));
    
    // Ensure courses exist
    const haveId = await db.ensureCourse(have);
    const wantId = await db.ensureCourse(want);

    const swaps = JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPS) || '[]');
    
    const newSwap: any = {
        id: 's_' + Date.now(),
        userId: userId,
        haveCourseId: haveId,
        wantCourseId: wantId,
        status: SwapStatus.PENDING,
        createdAt: new Date().toISOString(),
        matchType: null
    };
    
    swaps.unshift(newSwap);
    localStorage.setItem(STORAGE_KEYS.SWAPS, JSON.stringify(swaps));
  },

  getAnalytics: async (): Promise<AnalyticsData[]> => {
    await new Promise(r => setTimeout(r, 400));
    const swaps: SwapRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPS) || '[]');
    const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');

    return courses.map(course => {
        const demand = swaps.filter(s => s.wantCourseId === course.id && s.status !== SwapStatus.CANCELLED).length;
        const supply = swaps.filter(s => s.haveCourseId === course.id && s.status !== SwapStatus.CANCELLED).length;
        return {
            courseCode: course.code,
            demand,
            supply
        };
    }).filter(a => a.demand > 0 || a.supply > 0); // Only show relevant courses
  }
};
