
export type UserRole = 'student' | 'super_admin' | 'admin' | 'sub_admin' | 'viewer' | 'approver' | 'instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[]; // List of permission codes
}

export interface Student {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joinedDate: string;
  lastLogin?: string;
  enrolledCourses: number;
  averageProgress: number;
  avatar: string;
  bio?: string;
}

export type PermissionCode = 
  | 'manage_users'
  | 'manage_team'
  | 'create_course'
  | 'edit_course'
  | 'delete_course'
  | 'manage_library'
  | 'approve_content'
  | 'view_analytics'
  | 'manage_billing'
  | 'manage_settings';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  permissions: PermissionCode[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number; // Number of courses using this
}

export type LessonType = 'video' | 'reading' | 'quiz' | 'jupyter' | 'podcast';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string; // e.g., "10 min"
  contentUrl?: string; // YouTube ID or PDF URL
  contentData?: any; // JSON Object for Quizzes, Code Configs, etc.
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isPodcast?: boolean;
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

export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: string; // e.g., "Senior Developer"
  avatar: string;
  status: 'Active' | 'Inactive';
  expertise: string[];
  joinedDate: string;
  totalStudents?: number;
  coursesCount?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// --- Content Assets ---
export interface ContentAsset {
  id: string;
  title: string;
  type: string; // 'Video Content' | 'Reading Material' | 'Code Practice' | ...
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  date?: string;
  status?: 'ready' | 'processing';
  metadata?: {
    url?: string;
    description?: string;
    starterCode?: string;
    solutionCode?: string;
    questions?: any[];
  };
}

// --- Payment Types ---

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'processing' | 'failed' | 'refunded' | 'pending_approval';
  method: string; // e.g. "Visa 4242" or "Bank Transfer"
  type: 'online' | 'offline';
  referenceId?: string; // For offline payments
}

export interface PaymentRequest {
  id: string;
  studentEmail: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  dueDate?: string;
  paymentLink: string;
}
