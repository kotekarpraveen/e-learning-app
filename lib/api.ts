
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_COURSES } from '../constants';
import { Course } from '../types';

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

  /**
   * Save or Update a Course (Admin)
   */
  saveCourse: async (course: Course): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
        return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Saved to Mock DB' }), 1000));
    }

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
            enrolled_students: course.enrolledStudents,
            learning_outcomes: course.learningOutcomes
        });

        if (courseError) throw courseError;

        if (course.modules && course.modules.length > 0) {
            for (let i = 0; i < course.modules.length; i++) {
                const mod = course.modules[i];
                const { error: modError } = await supabase.from('modules').upsert({
                    id: mod.id,
                    course_id: course.id,
                    title: mod.title,
                    "order": i
                });

                if (modError) throw modError;

                if (mod.lessons && mod.lessons.length > 0) {
                    for (let j = 0; j < mod.lessons.length; j++) {
                        const lesson = mod.lessons[j];
                        const { error: lessonError } = await supabase.from('lessons').upsert({
                            id: lesson.id,
                            module_id: mod.id,
                            title: lesson.title,
                            type: lesson.type,
                            duration: lesson.duration || "5:00",
                            content_url: lesson.contentUrl || "",
                            "order": j
                        });
                        
                        if (lessonError) throw lessonError;
                    }
                }
            }
        }

        return { success: true, message: 'Course saved successfully' };
    } catch (error: any) {
        console.error("Save Course Error:", error);
        return { success: false, message: error.message };
    }
  },

  /**
   * Seed the database with Mock Data (Admin Only Utility)
   */
  seedDatabase: async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
        return { success: false, message: 'Supabase not configured' };
    }

    try {
        let createdCount = 0;
        for (const course of MOCK_COURSES) {
            const { error: courseError } = await supabase.from('courses').upsert({
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                instructor: course.instructor,
                price: course.price,
                level: course.level,
                category: course.category,
                enrolled_students: course.enrolledStudents,
                learning_outcomes: course.learningOutcomes
            });
            if (courseError) {
                console.error(`Failed to seed course ${course.title}`, courseError);
                continue;
            }
            createdCount++;
            if (course.modules) {
                for (let i = 0; i < course.modules.length; i++) {
                    const mod = course.modules[i];
                    await supabase.from('modules').upsert({
                        id: mod.id,
                        course_id: course.id,
                        title: mod.title,
                        "order": i
                    });
                    if (mod.lessons) {
                        for (let j = 0; j < mod.lessons.length; j++) {
                            const lesson = mod.lessons[j];
                            await supabase.from('lessons').upsert({
                                id: lesson.id,
                                module_id: mod.id,
                                title: lesson.title,
                                type: lesson.type,
                                duration: lesson.duration,
                                content_url: lesson.contentUrl,
                                "order": j
                            });
                        }
                    }
                }
            }
        }
        return { success: true, message: `Successfully seeded ${createdCount} courses.` };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }
};
