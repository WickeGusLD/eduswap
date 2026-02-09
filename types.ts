export interface Course {
  id: string;
  code: string;
  title: string;
  instructor?: string;
  timeSlot?: string; // e.g., "Mon/Wed 10:00 AM"
  credits?: number;
}

export enum SwapStatus {
  PENDING = 'PENDING',
  MATCH_FOUND = 'MATCH_FOUND',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface SwapRequest {
  id: string;
  userId: string; // Anonymous Device ID
  haveCourseId: string;
  haveCourse?: Course; // Hydrated
  wantCourseId: string;
  wantCourse?: Course; // Hydrated
  status: SwapStatus;
  createdAt: string;
  matchType?: 'DIRECT' | 'CHAIN' | null;
}

export interface AnalyticsData {
  courseCode: string;
  demand: number; // "Want" count
  supply: number; // "Have" count
}
