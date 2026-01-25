
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { Course, Lesson } from '../types';
import { 
  PlayCircle, Clock, Award, Flame, TrendingUp, 
  Target, BookOpen, Calendar, ArrowRight, Loader2,
  Headphones, Play
} from 'lucide-react';
import { useAuth } from '../App';

// Initial Mock Data (Fallback)
const INITIAL_STATS = {
  hoursSpent: 0,
  coursesCompleted: 0,
  certificates: 0,
  streak: 1,
  points: 0
};

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [generalAudioCourse, setGeneralAudioCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [weeklyActivity, setWeeklyActivity] = useState<{day: string, hours: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const MotionDiv = motion.div as any;

  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        
        // Parallel Fetch
        const [enrolledCourses, allCourses, userStats, activity] = await Promise.all([
            api.getEnrolledCourses(user.id),
            api.getCourses(),
            api.getStudentStats(user.id),
            api.getStudentWeeklyActivity(user.id)
        ]);

        setCourses(enrolledCourses);
        setStats(userStats);
        setWeeklyActivity(activity);

        // Find a General Audio Series course for the dashboard widget
        const audioSeries = allCourses.find(c => c.category === 'Audio Series');
        setGeneralAudioCourse(audioSeries || null);

        setIsLoading(false);
    };
    fetchData();
  }, [user]);

  // Get the most active course (first one)
  const activeCourse = courses.length > 0 ? courses[0] : null;

  // Flatten lessons from the general audio course for display
  const generalAudioEpisodes: Lesson[] = generalAudioCourse 
    ? generalAudioCourse.modules.flatMap(m => m.lessons).slice(0, 3) 
    : [];

  if (isLoading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">
               Welcome back, {user?.name.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">You've learned for <span className="font-semibold text-primary-600">{stats.hoursSpent} hours</span> total. Keep it up!</p>
         </div>
         <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-lg">
                <Flame size={18} className="mr-2 fill-orange-600" />
                <span className="font-bold">{stats.streak} Day Streak</span>
             </div>
             <div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg">
                <Target size={18} className="mr-2" />
                <span className="font-bold">{stats.points} XP</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT COLUMN - Main Learning Content */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Resume Card */}
            {activeCourse ? (
                <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/course/${activeCourse.id}`)}
                >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl group-hover:bg-primary-100 transition-colors" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 relative shadow-md">
                        <img src={activeCourse.thumbnail} alt={activeCourse.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-110 duration-300" />
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold tracking-wider text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded-md">Continue Learning</span>
                            <span className="text-xs text-gray-400">• Module 1, Lesson 1</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{activeCourse.title}</h2>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                            <span>Progress</span>
                            <span className="font-medium text-gray-900">{activeCourse.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <MotionDiv 
                                initial={{ width: 0 }}
                                animate={{ width: `${activeCourse.progress || 0}%` }}
                                className="bg-primary-600 h-full rounded-full"
                            />
                            </div>
                        </div>
                    </div>
                </div>
                </MotionDiv>
            ) : (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
                    <BookOpen size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Start Your Journey</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">You haven't enrolled in any courses yet. Browse our catalog to find your next skill.</p>
                    <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
                </div>
            )}

            {/* My Courses Grid */}
            <div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Enrolled Courses</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                     Explore New Courses <ArrowRight size={16} className="ml-1" />
                  </Button>
               </div>
               
               {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map(course => (
                        <MotionDiv 
                            key={course.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => navigate(`/course/${course.id}`)}
                        >
                            <div className="h-32 overflow-hidden relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                {course.category}
                            </div>
                            </div>
                            <div className="p-4">
                            <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{course.totalModules} Modules</span>
                                {course.progress === 100 ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/certificate/${course.id}`); }}
                                        className="flex items-center text-primary-600 font-bold hover:underline z-10 hover:text-primary-800 transition-colors"
                                    >
                                        <Award size={14} className="mr-1" /> Get Certificate
                                    </button>
                                ) : (
                                    <span>{course.progress || 0}% Done</span>
                                )}
                            </div>
                            </div>
                        </MotionDiv>
                    ))}
                </div>
               ) : (
                 <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No active enrollments found.
                 </div>
               )}
            </div>
         </div>

         {/* RIGHT COLUMN - Stats & Analytics */}
         <div className="space-y-6">
            
            {/* Stats Widgets */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                     <Clock size={18} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.hoursSpent}h</div>
                  <div className="text-xs text-gray-500">Time Learned</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                     <Award size={18} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.certificates}</div>
                  <div className="text-xs text-gray-500">Certificates</div>
               </div>
            </div>
            
            {/* Audio Series Widget (General Podcasts) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                     <Headphones size={18} className="mr-2 text-purple-600" />
                     {generalAudioCourse ? generalAudioCourse.title : 'Audio Series'}
                  </h3>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">New</span>
               </div>
               
               {generalAudioCourse && generalAudioEpisodes.length > 0 ? (
                 <div className="space-y-4">
                    {generalAudioEpisodes.map((episode, idx) => (
                        <div 
                            key={episode.id}
                            onClick={() => navigate(`/course/${generalAudioCourse.id}`)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 group-hover:scale-110 transition-transform">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{episode.title}</h4>
                                <p className="text-xs text-gray-500 truncate">Ep. {idx + 1}</p>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{episode.duration || '10:00'}</span>
                        </div>
                    ))}
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 mt-2"
                        onClick={() => navigate(`/course/${generalAudioCourse.id}`)}
                    >
                        View All Episodes
                    </Button>
                 </div>
               ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                      <Headphones className="mx-auto mb-2 opacity-20" size={32} />
                      <p>No audio series available right now.</p>
                  </div>
               )}
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center">
                     <Calendar size={18} className="mr-2 text-gray-400" />
                     Weekly Activity
                  </h3>
               </div>
               
               <div className="flex items-end justify-between h-32 gap-2">
                  {weeklyActivity.map((day, i) => (
                     <div key={day.day} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="w-full relative h-full flex items-end">
                           <div className="w-full bg-gray-100 rounded-t-md relative overflow-hidden h-full">
                               <MotionDiv 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${(day.hours / 5) * 100}%` }}
                                 transition={{ delay: i * 0.1, duration: 0.5 }}
                                 className={`w-full absolute bottom-0 rounded-t-md ${day.hours > 3 ? 'bg-primary-600' : 'bg-primary-300'} group-hover:bg-primary-500 transition-colors`}
                               />
                           </div>
                           {/* Tooltip */}
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {day.hours} hrs
                           </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{day.day}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Upcoming Goals / Motivation */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Weekly Goal</h3>
                  <p className="text-indigo-100 text-sm mb-4">You're 2.5 hours away from reaching your weekly learning goal!</p>
                  
                  <div className="flex items-center gap-3 text-sm">
                     <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-white h-full w-[75%] rounded-full"></div>
                     </div>
                     <span className="font-bold">75%</span>
                  </div>
               </div>
               
               {/* Decorative circles */}
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
               <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-xl"></div>
            </div>

         </div>
      </div>
    </div>
  );
};
