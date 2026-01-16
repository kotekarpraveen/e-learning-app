
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_COURSES, MOCK_INSTRUCTORS, MOCK_TEAM, MOCK_CATEGORIES } from '../constants';
import { Course, Instructor, TeamMember, Category, Student, UserRole, Transaction, PaymentRequest } from '../types';

// Mock Data for Students
let MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', enrolledCourses: 3, averageProgress: 75, status: 'Active', joinedDate: '2023-10-24', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Connor', email: 'sarah.c@example.com', enrolledCourses: 5, averageProgress: 92, status: 'Active', joinedDate: '2023-09-12', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Michael Chen', email: 'm.chen@example.com', enrolledCourses: 2, averageProgress: 30, status: 'Inactive', joinedDate: '2023-11-05', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', enrolledCourses: 1, averageProgress: 10, status: 'Active', joinedDate: '2023-12-01', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'David Kim', email: 'david.k@example.com', enrolledCourses: 4, averageProgress: 55, status: 'Suspended', joinedDate: '2023-08-15', avatar: 'https://i.pravatar.cc/150?u=5' },
];

let MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', userId: '1', userName: 'Alex Johnson', courseId: 'c1', courseTitle: 'Fullstack React Mastery', amount: 89.99, date: '2023-10-24', status: 'succeeded', method: 'Visa •••• 4242', type: 'online' },
  { id: 'tx_2', userId: '2', userName: 'Sarah Connor', courseId: 'c3', courseTitle: 'UI/UX Fundamentals', amount: 49.99, date: '2023-10-24', status: 'succeeded', method: 'Mastercard •••• 8822', type: 'online' },
  { id: 'tx_3', userId: '3', userName: 'Michael Chen', courseId: 'c2', courseTitle: 'Data Science Bootcamp', amount: 129.00, date: '2023-10-23', status: 'pending_approval', method: 'Bank Transfer', type: 'offline', referenceId: 'TXN-998877' },
];

let MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
    { id: 'pr_1', studentEmail: 'student@aelgo.com', amount: 150, description: '1-on-1 Coaching Session', status: 'pending', createdAt: '2023-12-01', paymentLink: 'https://aelgo.com/pay/pr_1' }
];

export const api = {
  /**
   * Fetch all available courses.
   */
  getCourses: async (): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_COURSES), 600);
      });
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `);

      if (error) {
        console.warn("Supabase fetch error:", error);
        return MOCK_COURSES;
      }
      
      if (!data || data.length === 0) return []; 

      // Transform Supabase data (Snake_case -> CamelCase)
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        thumbnail: d.thumbnail,
        instructor: d.instructor,
        price: d.price,
        level: d.level,
        category: d.category,
        progress: 0, // Catalog view starts at 0, user progress is overlaid elsewhere
        enrolledStudents: d.enrolled_students || 0,
        learningOutcomes: d.learning_outcomes || [],
        totalModules: d.modules?.length || 0,
        modules: d.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                duration: l.duration,
                contentUrl: l.content_url,
                completed: false
            })) || []
        })) || []
      })) as Course[];

    } catch (err) {
      console.error("API Error", err);
      return MOCK_COURSES;
    }
  },

  /**
   * Fetch a single course by ID.
   */
  getCourseById: async (id: string): Promise<Course | undefined> => {
    if (!isSupabaseConfigured()) {
       return new Promise((resolve) => {
         setTimeout(() => resolve(MOCK_COURSES.find(c => c.id === id)), 400);
       });
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) return MOCK_COURSES.find(c => c.id === id);

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        instructor: data.instructor,
        price: data.price,
        level: data.level,
        category: data.category,
        progress: 0,
        enrolledStudents: data.enrolled_students || 0,
        learningOutcomes: data.learning_outcomes || [],
        totalModules: data.modules?.length || 0,
        modules: data.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                duration: l.duration,
                contentUrl: l.content_url,
                completed: false
            })) || []
        })) || []
      } as Course;
    } catch (err) {
      return MOCK_COURSES.find(c => c.id === id);
    }
  },

  /**
   * Fetch only courses the user is enrolled in
   */
  getEnrolledCourses: async (userId: string): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
        return new Promise(resolve => setTimeout(() => resolve([MOCK_COURSES[0]]), 500));
    }

    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                course:courses (
                    *,
                    modules (
                        *,
                        lessons (*)
                    )
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;
        if (!data) return [];

        return data.map((row: any) => {
            const d = row.course;
            return {
                id: d.id,
                title: d.title,
                description: d.description,
                thumbnail: d.thumbnail,
                instructor: d.instructor,
                price: d.price,
                level: d.level,
                category: d.category,
                enrolledStudents: d.enrolled_students || 0,
                learningOutcomes: d.learning_outcomes || [],
                progress: 0, // Needs calculation logic in real app
                totalModules: d.modules?.length || 0,
                modules: d.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        duration: l.duration,
                        contentUrl: l.content_url,
                        completed: false
                    })) || []
                })) || []
            };
        }) as Course[];

    } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        return [];
    }
  },

  /**
   * NEW: Fetch Dashboard Statistics
   */
  getStudentStats: async (userId: string) => {
    if (!isSupabaseConfigured()) {
        return {
            hoursSpent: 24.5,
            coursesCompleted: 1,
            certificates: 1,
            streak: 5,
            points: 1250
        };
    }

    try {
        // 1. Get basic profile stats (XP, Streak, Hours)
        const { data: profile } = await supabase
            .from('profiles')
            .select('xp, streak, total_hours')
            .eq('id', userId)
            .single();

        return {
            hoursSpent: profile?.total_hours || 0,
            coursesCompleted: 0, // Placeholder
            certificates: 0,
            streak: profile?.streak || 1,
            points: profile?.xp || 0
        };
    } catch (error) {
        console.error(error);
        return { hoursSpent: 0, coursesCompleted: 0, certificates: 0, streak: 0, points: 0 };
    }
  },

  /**
   * Check if a user is enrolled in a specific course
   */
  checkEnrollment: async (courseId: string, userId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;
      
      const { data } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();
      
      return !!data;
  },

  /**
   * Enroll a user in a course.
   */
  enrollUser: async (courseId: string, userId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) {
          return new Promise(resolve => setTimeout(() => resolve(true), 1000));
      }
      
      const { error } = await supabase
          .from('enrollments')
          .insert({ user_id: userId, course_id: courseId });

      if (error) {
          console.error("Enrollment failed:", error);
          return false;
      }
      return true;
  },

  /**
   * Get IDs of all lessons completed by the user
   */
  getCompletedLessons: async (userId: string): Promise<string[]> => {
      if (!isSupabaseConfigured()) return [];

      const { data } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', userId);
      
      return data?.map(row => row.lesson_id) || [];
  },

  /**
   * Mark a lesson as complete or incomplete and Update XP
   */
  toggleLessonCompletion: async (userId: string, lessonId: string, completed: boolean): Promise<boolean> => {
      if (!isSupabaseConfigured()) return true;

      if (completed) {
          const { error } = await supabase
              .from('user_progress')
              .upsert({ user_id: userId, lesson_id: lessonId });
          
          if (!error) {
              // Increment XP by 10
              await supabase.rpc('increment_xp', { x: 10, user_row_id: userId });
          }
          return !error;
      } else {
          const { error } = await supabase
              .from('user_progress')
              .delete()
              .eq('user_id', userId)
              .eq('lesson_id', lessonId);
          return !error;
      }
  },

  // --- Payment & Transaction API ---

  /**
   * Create a transaction record and potentially enroll user
   */
  processPayment: async (details: { userId: string, userName: string, courseId: string, courseTitle: string, amount: number, method: string, type: 'online' | 'offline', referenceId?: string }) => {
      if (!isSupabaseConfigured()) {
          const transaction: Transaction = {
              id: `tx_${Date.now()}`,
              ...details,
              date: new Date().toISOString().split('T')[0],
              status: details.type === 'online' ? 'succeeded' : 'pending_approval'
          };
          MOCK_TRANSACTIONS.unshift(transaction);
          if (details.type === 'online') {
              await api.enrollUser(details.courseId, details.userId);
              return { success: true, status: 'active' };
          }
          return { success: true, status: 'pending' };
      }

      // Real Supabase Implementation
      try {
          const { error } = await supabase.from('transactions').insert({
              user_id: details.userId,
              course_id: details.courseId,
              amount: details.amount,
              status: details.type === 'online' ? 'succeeded' : 'pending_approval',
              method: details.method,
              type: details.type,
              reference_id: details.referenceId
          });

          if (error) throw error;

          if (details.type === 'online') {
              await api.enrollUser(details.courseId, details.userId);
              return { success: true, status: 'active' };
          }

          return { success: true, status: 'pending' };
      } catch (e) {
          console.error("Payment Process Error", e);
          return { success: false, status: 'failed' };
      }
  },

  checkPendingTransaction: async (courseId: string, userId: string) => {
      if (!isSupabaseConfigured()) {
          const pending = MOCK_TRANSACTIONS.find(t => t.courseId === courseId && t.userId === userId && t.status === 'pending_approval');
          return !!pending;
      }

      const { data } = await supabase
          .from('transactions')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', userId)
          .eq('status', 'pending_approval')
          .single();
      
      return !!data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
      if (!isSupabaseConfigured()) {
          return new Promise(resolve => setTimeout(() => resolve([...MOCK_TRANSACTIONS]), 500));
      }

      try {
          const { data, error } = await supabase
              .from('transactions')
              .select(`
                  *,
                  profiles(full_name),
                  courses(title)
              `)
              .order('created_at', { ascending: false });

          if (error) throw error;

          return data.map((t: any) => ({
              id: t.id,
              userId: t.user_id,
              userName: t.profiles?.full_name || 'Unknown User',
              courseId: t.course_id,
              courseTitle: t.courses?.title || 'Unknown Course',
              amount: t.amount,
              date: new Date(t.created_at).toLocaleDateString(),
              status: t.status,
              method: t.method,
              type: t.type,
              referenceId: t.reference_id
          }));
      } catch (e) {
          console.error("Fetch Transactions Error", e);
          return [];
      }
  },

  approveTransaction: async (txId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) {
          const tx = MOCK_TRANSACTIONS.find(t => t.id === txId);
          if (tx) {
              tx.status = 'succeeded';
              await api.enrollUser(tx.courseId, tx.userId);
              return true;
          }
          return false;
      }

      try {
          // 1. Update Transaction
          const { data: tx, error } = await supabase
              .from('transactions')
              .update({ status: 'succeeded' })
              .eq('id', txId)
              .select()
              .single();

          if (error) throw error;

          // 2. Enroll User
          if (tx) {
              await api.enrollUser(tx.course_id, tx.user_id);
          }
          return true;
      } catch (e) {
          console.error("Approve Transaction Error", e);
          return false;
      }
  },

  createPaymentRequest: async (studentEmail: string, amount: number, description: string) => {
      if (!isSupabaseConfigured()) {
          const req: PaymentRequest = {
              id: `pr_${Date.now()}`,
              studentEmail,
              amount,
              description,
              status: 'pending',
              createdAt: new Date().toISOString().split('T')[0],
              paymentLink: `https://aelgo.com/pay/pr_${Date.now()}`
          };
          MOCK_PAYMENT_REQUESTS.unshift(req);
          return true;
      }

      try {
          const { error } = await supabase.from('payment_requests').insert({
              student_email: studentEmail,
              amount,
              description,
              status: 'pending',
              payment_link: `https://aelgo.com/pay/req_${Math.random().toString(36).substring(7)}` // Mock link generation
          });
          if (error) throw error;
          return true;
      } catch (e) {
          console.error("Create Payment Request Error", e);
          return false;
      }
  },

  getPaymentRequests: async (): Promise<PaymentRequest[]> => {
      if (!isSupabaseConfigured()) {
          return new Promise(resolve => setTimeout(() => resolve([...MOCK_PAYMENT_REQUESTS]), 500));
      }

      try {
          const { data, error } = await supabase
              .from('payment_requests')
              .select('*')
              .order('created_at', { ascending: false });

          if (error) throw error;

          return data.map((r: any) => ({
              id: r.id,
              studentEmail: r.student_email,
              amount: r.amount,
              description: r.description,
              status: r.status,
              createdAt: new Date(r.created_at).toLocaleDateString(),
              paymentLink: r.payment_link
          }));
      } catch (e) {
          console.error("Fetch Payment Requests Error", e);
          return [];
      }
  },

  // --- Admin Management (Previous methods preserved) ---
  saveCourse: async (course: Course): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Saved to Mock DB' }), 1000));
  },
  
  seedDatabase: async (): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Mock seed complete.' };
  },

  getStudents: async (): Promise<Student[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_STUDENTS]), 500));
  },

  saveStudent: async (student: Student) => {
    const index = MOCK_STUDENTS.findIndex(s => s.id === student.id);
    if (index >= 0) MOCK_STUDENTS[index] = student;
    else MOCK_STUDENTS.push(student);
    return { success: true, message: 'Saved' };
  },

  deleteStudent: async (id: string) => {
    MOCK_STUDENTS = MOCK_STUDENTS.filter(s => s.id !== id);
    return { success: true, message: 'Deleted' };
  },

  getInstructors: async (): Promise<Instructor[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_INSTRUCTORS), 500));
  },

  saveInstructor: async (instructor: Instructor) => {
    return { success: true, message: 'Saved' };
  },

  deleteInstructor: async (id: string) => {
    return { success: true, message: 'Deleted' };
  },

  getTeam: async (): Promise<TeamMember[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_TEAM), 500));
  },

  saveTeamMember: async (member: TeamMember) => {
    return { success: true, message: 'Saved' };
  },

  deleteTeamMember: async (id: string) => {
    return { success: true, message: 'Deleted' };
  },

  getCategories: async (): Promise<Category[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CATEGORIES), 400));
  },

  saveCategory: async (category: Category) => {
    return { success: true, message: 'Saved' };
  },

  deleteCategory: async (id: string) => {
    return { success: true, message: 'Deleted' };
  }
};
