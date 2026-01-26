
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, TrendingUp, Clock, Plus, Search, 
  MoreVertical, Filter, BarChart2, Upload, 
  Settings, ChevronDown, RefreshCw, FileText, CheckCircle, Database, Loader2, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { Course } from '../types';
import { useAuth } from '../App';
import { formatPrice } from '../lib/currency';

const MotionDiv = motion.div as any;

// --- Components ---

const StatCard: React.FC<{ stat: any, index: number }> = ({ stat, index }) => (
  <MotionDiv 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:border-primary-300 transition-colors"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl border border-transparent ${stat.bg}`}>
        {stat.icon}
      </div>
      {/* Trends removed for MVP Dynamic data, could add later */}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
    </div>
  </MotionDiv>
);

const ChartBar: React.FC<{ height: number, label: string, delay: number }> = ({ height, label, delay }) => (
  <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
    <div className="w-full relative h-32 flex items-end gap-1">
       {/* Enrolled Bar */}
       <MotionDiv 
         initial={{ height: 0 }}
         animate={{ height: `${height}%` }}
         transition={{ delay: delay * 0.05, duration: 0.8, type: 'spring' }}
         className="w-full bg-primary-400 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative"
       />
    </div>
    <span className="text-[10px] text-gray-400 font-medium uppercase">{label}</span>
  </div>
);

const CourseCard: React.FC<{ course: Course; onDelete: (id: string) => void }> = ({ course, onDelete }) => {
  const navigate = useNavigate();
  return (
    <MotionDiv 
      layout
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group hover:border-primary-300"
    >
      <div className="h-40 overflow-hidden relative">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${course.published ? 'bg-primary-500 text-white' : 'bg-gray-500 text-white'}`}>
            {course.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
           <span className="flex items-center"><Users size={14} className="mr-1 text-primary-500" /> {course.enrolledStudents || 0} enrolled</span>
           <span className="flex items-center font-bold text-green-600">{formatPrice(course.price)}</span>
        </div>

        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             size="sm" 
             className="flex-1 text-xs border-gray-200" 
             onClick={() => navigate(`/admin/course-builder?courseId=${course.id}`)}
           >
              Edit
           </Button>
           <Button variant="secondary" size="sm" className="flex-1 text-xs border-gray-200">
              <BarChart2 size={14} className="mr-1" /> Analytics
           </Button>
           <Button 
             variant="danger" 
             size="sm" 
             className="px-3" 
             onClick={() => onDelete(course.id)}
             title="Delete Course"
           >
              <Trash2 size={16} />
           </Button>
        </div>
      </div>
    </MotionDiv>
  );
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Real Data State
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<{label: string, value: number}[]>([]);

  const loadDashboardData = async () => {
        setIsLoading(true);
        
        // 1. Fetch Aggregated Stats
        const dashStats = await api.getAdminDashboardStats();
        setStats([
            { 
                label: 'Total Courses', 
                value: dashStats.totalCourses.toString(), 
                icon: <BookOpen className="text-primary-600" size={24} />, 
                bg: 'bg-primary-50'
            },
            { 
                label: 'Active Students', 
                value: dashStats.totalStudents.toLocaleString(), 
                icon: <Users className="text-gray-700" size={24} />, 
                bg: 'bg-gray-100'
            },
            { 
                label: 'Total Revenue', 
                value: formatPrice(dashStats.totalRevenue), 
                icon: <TrendingUp className="text-primary-500" size={24} />, 
                bg: 'bg-primary-50'
            },
            { 
                label: 'Avg. Engagement', 
                value: 'Active', 
                icon: <Clock className="text-gray-600" size={24} />, 
                bg: 'bg-gray-100'
            }
        ]);

        // 2. Fetch Recent Activity
        const activity = await api.getRecentActivity();
        setRecentActivity(activity);

        // 3. Fetch Platform Stats
        setPlatformStats([
            { label: 'Total Revenue', value: formatPrice(dashStats.totalRevenue) },
            { label: 'Total Students', value: dashStats.totalStudents.toLocaleString() },
            { label: 'Total Courses', value: dashStats.totalCourses.toString() },
        ]);

        // 4. Fetch Enrollment Trends
        const trends = await api.getEnrollmentTrends();
        setEnrollmentTrends(trends);

        // 5. Fetch Courses
        const courseData = await api.getCourses();
        if (user?.role === 'instructor') {
            const myCourses = courseData.filter(c => c.instructor === user.name);
            setCourses(myCourses);
        } else {
            setCourses(courseData);
        }

        setIsLoading(false);
    };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleSeedDatabase = async () => {
      if(!confirm("This will insert default mock data into your Supabase database. Continue?")) return;
      
      setIsSeeding(true);
      const result = await api.seedDatabase();
      setIsSeeding(false);
      
      if(result.success) {
          alert(result.message);
          window.location.reload(); 
      } else {
          alert(`Error: ${result.message}`);
      }
  };

  const handleDeleteCourse = async (id: string) => {
      if(confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
          setIsLoading(true);
          const result = await api.deleteCourse(id);
          if (result.success) {
              setCourses(prev => prev.filter(c => c.id !== id));
              // Refresh full data to update stats
              loadDashboardData();
          } else {
              alert("Failed to delete course: " + result.message);
              setIsLoading(false);
          }
      }
  };

  const filteredCourses = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' 
          || (statusFilter === 'Published' && course.published) 
          || (statusFilter === 'Drafts' && !course.published);
      return matchesSearch && matchesStatus;
  });

  const isAdmin = user?.role !== 'instructor';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isAdmin ? 'Admin Dashboard' : 'Instructor Dashboard'}
         </h1>
         <p className="text-gray-600">
            {isAdmin ? 'Manage courses, monitor student progress, and analyze platform performance' : 'Manage your courses and content library'}
         </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
      </div>

      {/* Course Management Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                  {isAdmin ? 'Course Management' : 'My Courses'}
              </h2>
              <p className="text-sm text-gray-500">
                  {isAdmin ? 'View and manage all courses on the platform' : 'Create and manage your specific courses'}
              </p>
           </div>
           <Button icon={<Plus size={18} />} onClick={() => navigate('/admin/course-builder')} className="shadow-lg shadow-primary-500/20">
             Create Course
           </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search courses by title..." 
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                 <select 
                    className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                 >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Drafts">Drafts</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <Button 
                variant="secondary" 
                className="px-3 border-gray-200 bg-gray-50 hover:bg-gray-100"
                onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                title="Reset Filters"
              >
                 <RefreshCw size={18} className="text-gray-500" />
              </Button>
           </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
             <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onDelete={handleDeleteCourse} />
            ))}
            {filteredCourses.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {courses.length === 0 
                        ? (user?.role === 'instructor' 
                            ? "You haven't created any courses yet."
                            : "No courses found in the database.")
                        : "No courses match your search criteria."
                    }
                </div>
            )}
            </div>
        )}
      </section>

      {/* Analytics & Quick Actions Split - Only show extensive analytics for admins */}
      {isAdmin && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Enrollment Trends */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Student Enrollment Trends</h3>
                  <p className="text-sm text-gray-500">New enrollments over the last 12 months</p>
               </div>
               <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  Last 12 Months <ChevronDown size={14} className="ml-1" />
               </Button>
            </div>
            
            <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
               {enrollmentTrends.length > 0 ? enrollmentTrends.map((t, i) => (
                  <ChartBar 
                    key={t.label} 
                    // Normalize height relative to max value or 1 if empty
                    height={t.value > 0 ? (t.value / (Math.max(...enrollmentTrends.map(x => x.value)) || 1)) * 90 : 5} 
                    label={t.label} 
                    delay={i} 
                  />
               )) : (
                   <p className="w-full text-center text-gray-400 text-sm">No trend data available.</p>
               )}
            </div>
            <div className="flex justify-center gap-6 mt-6">
               <div className="flex items-center text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-primary-400 mr-2"></span> New Enrollments
               </div>
            </div>
         </div>

         {/* Quick Actions */}
         <div className="space-y-6">
            <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 h-full">
               <h3 className="font-bold text-gray-900 mb-1">Quick Actions</h3>
               <p className="text-sm text-gray-500 mb-6">Common administrative tasks</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => navigate('/admin/course-builder')} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group">
                     <Plus className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                     <span className="font-bold text-gray-800 text-sm block">Create New Course</span>
                     <span className="text-[10px] text-gray-500">Start building...</span>
                  </button>
                  <button className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group">
                     <BookOpen className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                     <span className="font-bold text-gray-800 text-sm block">View All Courses</span>
                     <span className="text-[10px] text-gray-500">Manage catalog...</span>
                  </button>
                  <button className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group">
                     <Users className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                     <span className="font-bold text-gray-800 text-sm block">Student Analytics</span>
                     <span className="text-[10px] text-gray-500">Monitor engagement...</span>
                  </button>
                  {/* Seed DB Button (Only if Supabase is connected) */}
                  {isSupabaseConfigured() && (
                      <button 
                        onClick={handleSeedDatabase}
                        disabled={isSeeding}
                        className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group"
                      >
                         {isSeeding ? (
                            <RefreshCw className="mb-3 text-primary-600 animate-spin" size={24} />
                         ) : (
                            <Database className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                         )}
                         <span className="font-bold text-gray-800 text-sm block">Seed Database</span>
                         <span className="text-[10px] text-gray-500">Populate dummy data...</span>
                      </button>
                  )}
               </div>
            </div>
         </div>
      </div>
      )}

      {/* Bottom Section: Activity & Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Recent Activity */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-sm text-gray-500 mb-6">Latest platform updates and user actions</p>
            
            <div className="space-y-6">
               {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                     {item.avatar ? (
                        <img src={item.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                           <Users size={16} className="text-primary-600" />
                        </div>
                     )}
                     <div className="flex-1">
                        <p className="text-sm text-gray-800">
                           <span className="font-bold">{item.user}</span> {item.action}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                     </div>
                  </div>
               )) : (
                   <p className="text-gray-500 text-sm italic">No recent activity.</p>
               )}
            </div>
         </div>

         {/* Platform Statistics */}
         <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-1">
                {isAdmin ? 'Platform Statistics' : 'Your Statistics'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">Key performance indicators</p>
            
            <div className="space-y-0 divide-y divide-gray-200">
               {platformStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                     <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
                     <span className="font-bold text-gray-900">{stat.value}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
