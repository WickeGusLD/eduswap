import { SwapRequest, Course, AnalyticsData } from '../types';

const STORAGE_KEYS = {
  DEVICE_ID: 'eduswap_device_id'
};

// Frontend Service interacting with Vercel Serverless API
export const db = {
  // Keep ID generation local as it's an anonymous session token
  getUserId: (): string => {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  getAllSwaps: async (): Promise<SwapRequest[]> => {
    const res = await fetch('/api/swaps');
    if (!res.ok) throw new Error('Failed to fetch swaps');
    return res.json();
  },

  createSwap: async (userId: string, have: Partial<Course>, want: Partial<Course>): Promise<void> => {
    const res = await fetch('/api/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, have, want })
    });
    if (!res.ok) throw new Error('Failed to create swap');
  },

  getAnalytics: async (): Promise<AnalyticsData[]> => {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
