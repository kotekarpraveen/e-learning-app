
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type LessonType = 'video' | 'reading' | 'quiz' | 'jupyter' | 'podcast';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string; // e.g., "10 min"
  contentUrl?: string; // YouTube ID or text content
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  progress: number; // 0-100
  totalModules: number;
  modules: Module[];
  // New Fields for Landing Page
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  learningOutcomes?: string[];
  enrolledStudents?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
