

import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_COURSES, MOCK_INSTRUCTORS, MOCK_TEAM, MOCK_CATEGORIES } from '../constants';
import { Course, Instructor, TeamMember, Category, Student, UserRole, Transaction, PaymentRequest, ContentAsset } from '../types';

// Mock Data for Students (Fallback)
let MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', enrolledCourses: 3, averageProgress: 75, status: 'Active', joinedDate: '2023-10-24', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Connor', email: 'sarah.c@example.com', enrolledCourses: 5, averageProgress: 92, status: 'Active', joinedDate: '2023-09-12', avatar: 'https://i.pravatar.cc/150?u=2' },
];

let MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', userId: '1', userName: 'Alex Johnson', courseId: 'c1', courseTitle: 'Fullstack React Mastery', amount: 89.99, date: '2023-10-24', status: 'succeeded', method: 'Visa •••• 4242', type: 'online' },
  { id: 'tx_2', userId: '2', userName: 'Sarah Connor', courseId: 'c3', courseTitle: 'UI/UX Fundamentals', amount: 49.99, date: '2023-10-24', status: 'succeeded', method: 'Mastercard •••• 8822', type: 'online' },
  { id: 'tx_3', userId: '3', userName: 'Michael Chen', courseId: 'c2', courseTitle: 'Data Science Bootcamp', amount: 129.00, date: '2023-10-23', status: 'pending_approval', method: 'Bank Transfer', type: 'offline', referenceId: 'TXN-998877' },
];

let MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
    { id: 'pr_1', studentEmail: 'student@aelgo.com', amount: 150, description: '1-on-1 Coaching Session', status: 'pending', createdAt: '2023-12-01', paymentLink: 'https://aelgo.com/pay/pr_1' }
];

let MOCK_ASSETS: ContentAsset[] = [
    { id: 'c1', title: 'Intro Slide Deck', type: 'Reading Material', fileName: 'intro_slides.pdf', fileSize: '2.4 MB', date: '2023-10-15', status: 'ready' }
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

      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        thumbnail: d.thumbnail,
        instructor: d.instructor,
        price: d.price,
        level: d.level,
        category: d.category,
        progress: 0,
        enrolledStudents: d.enrolled_students || 0,
        learningOutcomes: d.learning_outcomes || [],
        totalModules: d.modules?.length || 0,
        published: d.published,
        duration: d.duration,
        modules: d.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            isPodcast: m.is_podcast,
            lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                duration: l.duration,
                contentUrl: l.content_url,
                contentData: l.content_data,
                completed: false
            })) || []
        })) || []
      })) as Course[];

    } catch (err) {
      console.error("API Error", err);
      return MOCK_COURSES;
    }
  },

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
        published: data.published,
        duration: data.duration,
        modules: data.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            isPodcast: m.is_podcast,
            lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                duration: l.duration,
                contentUrl: l.content_url,
                contentData: l.content_data,
                completed: false
            })) || []
        })) || []
      } as Course;
    } catch (err) {
      return MOCK_COURSES.find(c => c.id === id);
    }
  },

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
                progress: 0,
                totalModules: d.modules?.length || 0,
                published: d.published,
                duration: d.duration,
                modules: d.modules?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    isPodcast: m.is_podcast,
                    lessons: m.lessons?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        duration: l.duration,
                        contentUrl: l.content_url,
                        contentData: l.content_data,
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

  getStudentStats: async (userId: string) => {
    if (!isSupabaseConfigured()) {
        return { hoursSpent: 24.5, coursesCompleted: 1, certificates: 1, streak: 5, points: 1250 };
    }
    try {
        const { data: profile } = await supabase.from('profiles').select('xp, streak, total_hours').eq('id', userId).single();
        return {
            hoursSpent: profile?.total_hours || 0,
            coursesCompleted: 0,
            certificates: 0,
            streak: profile?.streak || 1,
            points: profile?.xp || 0
        };
    } catch (error) {
        return { hoursSpent: 0, coursesCompleted: 0, certificates: 0, streak: 0, points: 0 };
    }
  },

  getStudentWeeklyActivity: async (userId: string) => {
    if (!isSupabaseConfigured()) {
        return [
            { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 1.0 }, { day: 'Wed', hours: 0 },
            { day: 'Thu', hours: 3.5 }, { day: 'Fri', hours: 2.0 }, { day: 'Sat', hours: 4.0 }, { day: 'Sun', hours: 1.5 },
        ];
    }
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data } = await supabase.from('user_progress').select('completed_at').eq('user_id', userId).gte('completed_at', sevenDaysAgo.toISOString());
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const count = data?.filter(row => {
                const rowDate = new Date(row.completed_at);
                return rowDate.getDate() === d.getDate() && rowDate.getMonth() === d.getMonth();
            }).length || 0;
            result.push({ day: days[d.getDay()], hours: count * 0.5 }); 
        }
        return result;
    } catch (e) { return []; }
  },

  getAdminDashboardStats: async () => {
    if (!isSupabaseConfigured()) {
      return { totalCourses: 24, totalStudents: 1847, totalRevenue: 47892, avgEngagement: 4.2 };
    }
    try {
      const [courses, students, transactions] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('transactions').select('amount').eq('status', 'succeeded')
      ]);
      const totalRevenue = transactions.data?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0;
      return { totalCourses: courses.count || 0, totalStudents: students.count || 0, totalRevenue: totalRevenue, avgEngagement: 0 };
    } catch (e) { return { totalCourses: 0, totalStudents: 0, totalRevenue: 0, avgEngagement: 0 }; }
  },

  getRecentActivity: async () => {
    if (!isSupabaseConfigured()) {
      return [
        { user: 'Sarah Johnson', action: 'enrolled in "React Mastery"', time: '5 min ago', avatar: '' },
        { user: 'Michael Chen', action: 'completed "Python Basics"', time: '1 hour ago', avatar: '' }
      ];
    }
    try {
      const { data } = await supabase.from('transactions').select(`*, profiles(full_name, avatar), courses(title)`).order('created_at', { ascending: false }).limit(5);
      return data?.map((t: any) => ({
        user: t.profiles?.full_name || 'Unknown User',
        action: `enrolled in "${t.courses?.title}"`,
        time: new Date(t.created_at).toLocaleDateString(),
        avatar: t.profiles?.avatar,
        isSystem: false
      })) || [];
    } catch (e) { return []; }
  },

  getEnrollmentTrends: async () => {
      if (!isSupabaseConfigured()) {
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ label: m, value: Math.random() * 60 + 20 }));
      }
      try {
          const { data } = await supabase.from('enrollments').select('enrolled_at').gte('enrolled_at', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString());
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const counts = new Array(12).fill(0);
          data?.forEach(row => {
              const d = new Date(row.enrolled_at);
              counts[d.getMonth()]++;
          });
          return months.map((m, i) => ({ label: m, value: counts[i] }));
      } catch (e) { return []; }
  },

  checkEnrollment: async (courseId: string, userId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;
      const { data } = await supabase.from('enrollments').select('course_id').eq('user_id', userId).eq('course_id', courseId).single();
      return !!data;
  },

  enrollUser: async (courseId: string, userId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve(true), 1000));
      const { error } = await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId });
      if (error) return false;
      const { data: course } = await supabase.from('courses').select('enrolled_students').eq('id', courseId).single();
      if(course) {
          await supabase.from('courses').update({ enrolled_students: (course.enrolled_students || 0) + 1 }).eq('id', courseId);
      }
      return true;
  },

  getCompletedLessons: async (userId: string): Promise<string[]> => {
      if (!isSupabaseConfigured()) return [];
      const { data } = await supabase.from('user_progress').select('lesson_id').eq('user_id', userId);
      return data?.map(row => row.lesson_id) || [];
  },

  toggleLessonCompletion: async (userId: string, lessonId: string, completed: boolean): Promise<boolean> => {
      if (!isSupabaseConfigured()) return true;
      if (completed) {
          const { error } = await supabase.from('user_progress').upsert({ user_id: userId, lesson_id: lessonId });
          if (!error) await supabase.rpc('increment_xp', { x: 10, user_row_id: userId });
          return !error;
      } else {
          const { error } = await supabase.from('user_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId);
          return !error;
      }
  },

  getContentLibrary: async (): Promise<ContentAsset[]> => {
      if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve([...MOCK_ASSETS]), 500));
      try {
          const { data, error } = await supabase.from('content_assets').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return data.map((d: any) => ({
              id: d.id, title: d.title, type: d.type, fileName: d.file_name, fileUrl: d.file_url, fileSize: d.file_size,
              date: new Date(d.created_at).toISOString().split('T')[0], status: 'ready', metadata: d.metadata
          }));
      } catch (err) { return []; }
  },

  uploadFileToStorage: async (file: File): Promise<{ url: string, path: string } | null> => {
      if (!isSupabaseConfigured()) return { url: 'https://fake-url.com/file.pdf', path: 'fake/path' };
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error } = await supabase.storage.from('course-content').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-content').getPublicUrl(filePath);
      return { url: publicUrl, path: filePath };
  },

  createContentAsset: async (asset: any): Promise<ContentAsset | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isSupabaseConfigured()) return { id: `c_${Date.now()}`, ...asset, date: new Date().toISOString().split('T')[0], status: 'ready' };
      try {
          const { data, error } = await supabase.from('content_assets').insert({
              title: asset.title, type: asset.type, file_name: asset.fileName, file_url: asset.fileUrl,
              file_size: asset.fileSize, metadata: asset.metadata, created_by: user?.id
          }).select().single();
          if (error) throw error;
          return {
              id: data.id, title: data.title, type: data.type, fileName: data.file_name, fileUrl: data.file_url, fileSize: data.file_size,
              date: new Date(data.created_at).toISOString().split('T')[0], status: 'ready', metadata: data.metadata
          };
      } catch (err) { return null; }
  },

  deleteContentAsset: async (id: string, fileUrl?: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return true;
      try {
          const { error } = await supabase.from('content_assets').delete().eq('id', id);
          if (error) throw error;
          if (fileUrl && fileUrl.includes('course-content')) {
              const path = fileUrl.split('course-content/').pop();
              if (path) await supabase.storage.from('course-content').remove([path]);
          }
          return true;
      } catch (e) { return false; }
  },

  processPayment: async (details: any) => {
      if (!isSupabaseConfigured()) return { success: true, status: details.type === 'online' ? 'active' : 'pending' };
      try {
          const { error } = await supabase.from('transactions').insert({
              user_id: details.userId, course_id: details.courseId, amount: details.amount,
              status: details.type === 'online' ? 'succeeded' : 'pending_approval', method: details.method, type: details.type, reference_id: details.referenceId
          });
          if (error) throw error;
          if (details.type === 'online') {
              await api.enrollUser(details.courseId, details.userId);
              return { success: true, status: 'active' };
          }
          return { success: true, status: 'pending' };
      } catch (e) { return { success: false, status: 'failed' }; }
  },

  checkPendingTransaction: async (courseId: string, userId: string) => {
      if (!isSupabaseConfigured()) return false;
      const { data } = await supabase.from('transactions').select('id').eq('course_id', courseId).eq('user_id', userId).eq('status', 'pending_approval').single();
      return !!data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
      if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve([]), 500));
      try {
          const { data, error } = await supabase.from('transactions').select(`*, profiles(full_name), courses(title)`).order('created_at', { ascending: false });
          if (error) throw error;
          return data.map((t: any) => ({
              id: t.id, userId: t.user_id, userName: t.profiles?.full_name || 'Unknown User', courseId: t.course_id, courseTitle: t.courses?.title || 'Unknown Course',
              amount: t.amount, date: new Date(t.created_at).toLocaleDateString(), status: t.status, method: t.method, type: t.type, referenceId: t.reference_id
          }));
      } catch (e) { return []; }
  },

  approveTransaction: async (txId: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) return true;
      try {
          const { data: tx, error } = await supabase.from('transactions').update({ status: 'succeeded' }).eq('id', txId).select().single();
          if (error) throw error;
          if (tx) await api.enrollUser(tx.course_id, tx.user_id);
          return true;
      } catch (e) { return false; }
  },

  createPaymentRequest: async (studentEmail: string, amount: number, description: string) => {
      if (!isSupabaseConfigured()) return true;
      try {
          const { error } = await supabase.from('payment_requests').insert({ student_email: studentEmail, amount, description, status: 'pending', payment_link: `https://aelgo.com/pay/req_${Math.random().toString(36).substring(7)}` });
          return !error;
      } catch (e) { return false; }
  },

  getPaymentRequests: async (): Promise<PaymentRequest[]> => {
      if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve([]), 500));
      try {
          const { data, error } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return data.map((r: any) => ({
              id: r.id, studentEmail: r.student_email, amount: r.amount, description: r.description, status: r.status, createdAt: new Date(r.created_at).toLocaleDateString(), paymentLink: r.payment_link
          }));
      } catch (e) { return []; }
  },

  getCategories: async (): Promise<Category[]> => {
    if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve(MOCK_CATEGORIES), 400));
    try {
        const { data } = await supabase.from('categories').select('*').order('name');
        return data || [];
    } catch (err) { return []; }
  },

  saveCategory: async (category: Category) => {
    if (!isSupabaseConfigured()) return { success: true, message: 'Saved' };
    try {
        const { error } = await supabase.from('categories').upsert({ id: category.id, name: category.name, slug: category.slug, description: category.description, count: category.count });
        return { success: !error, message: error ? error.message : 'Category saved' };
    } catch (err: any) { return { success: false, message: err.message }; }
  },

  deleteCategory: async (id: string) => {
    if (!isSupabaseConfigured()) return { success: true, message: 'Deleted' };
    try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        return { success: !error, message: error ? error.message : 'Category deleted' };
    } catch (err: any) { return { success: false, message: err.message }; }
  },

  saveCourse: async (course: Course): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Saved to Mock DB' }), 1000));
    try {
        const { error: courseError } = await supabase.from('courses').upsert({ 
            id: course.id, 
            title: course.title, 
            description: course.description, 
            thumbnail: course.thumbnail, 
            instructor: course.instructor, 
            price: course.price, 
            level: course.level, 
            category: course.category, 
            learning_outcomes: course.learningOutcomes, 
            total_modules: course.totalModules, 
            published: course.published ?? false, 
            duration: course.duration, // Persist duration
            updated_at: new Date() 
        });
        if (courseError) throw courseError;
        for (let i = 0; i < course.modules.length; i++) {
            const m = course.modules[i];
            const { error: moduleError } = await supabase.from('modules').upsert({ 
                id: m.id, 
                course