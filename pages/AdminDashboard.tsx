
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, TrendingUp, Clock, Plus, Search, 
  MoreVertical, Filter, BarChart2, Upload, 
  Settings, ChevronDown, RefreshCw, FileText, CheckCircle, Database, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { Course } from '../types';

// --- Mock Data ---
const STATS = [
  { 
    label: 'Total Courses', 
    value: '24', 
    change: '+12%', 
    trend: 'up', 
    icon: <BookOpen className="text-blue-600" size={24} />, 
    bg: 'bg-blue-50',
    color: 'text-blue-600' 
  },
  { 
    label: 'Active Students', 
    value: '1,847', 
    change: '+23%', 
    trend: 'up', 
    icon: <Users className="text-emerald-600" size={24} />, 
    bg: 'bg-emerald-50',
    color: 'text-emerald-600'
  },
  { 
    label: 'Completion Rate', 
    value: '78%', 
    change: '+5%', 
    trend: 'up', 
    icon: <TrendingUp className="text-orange-600" size={24} />, 
    bg: 'bg-orange-50',
    color: 'text-orange-600'
  },
  { 
    label: 'Avg. Engagement', 
    value: '4.2h', 
    change: '-3%', 
    trend: 'down', 
    icon: <Clock className="text-rose-600" size={24} />, 
    bg: 'bg-rose-50',
    color: 'text-rose-600'
  }
];

const RECENT_ACTIVITY = [
  { user: 'Sarah Johnson', action: 'enrolled in "Introduction to React Development"', time: '5 min ago', avatar: 'https://i.pravatar.cc/150?u=1' },
  { user: 'Michael Chen', action: 'finished "Advanced JavaScript Patterns" with 95% score', time: '12 min ago', avatar: 'https://i.pravatar.cc/150?u=2' },
  { user: 'System', action: 'Added 3 video lessons to "Python for Data Science"', time: '1 hour ago', icon: <Upload size={16} className="text-primary-600" /> },
  { user: 'System', action: 'Modified quiz questions in "UI/UX Design Fundamentals"', time: '2 hours ago', icon: <Settings size={16} className="text-orange-600" /> },
];

const PLATFORM_STATS = [
  { label: 'Total Revenue', value: '$47,892' },
  { label: 'New Signups', value: '234' },
  { label: 'Course Completions', value: '1,456' },
  { label: 'Avg. Session Time', value: '42 min' },
  { label: 'Student Satisfaction', value: '4.8/5.0' },
];

// --- Components ---

const StatCard: React.FC<{ stat: typeof STATS[0], index: number }> = ({ stat, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${stat.bg}`}>
        {stat.icon}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {stat.change}
      </span>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
    </div>
  </motion.div>
);

const ChartBar: React.FC<{ height: number, label: string, delay: number }> = ({ height, label, delay }) => (
  <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
    <div className="w-full relative h-32 flex items-end gap-1">
       {/* Enrolled Bar */}
       <motion.div 
         initial={{ height: 0 }}
         animate={{ height: `${height}%` }}
         transition={{ delay: delay * 0.05, duration: 0.8, type: 'spring' }}
         className="w-1/2 bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative"
       >
         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
           {Math.round(height * 5)} Students
         </div>
       </motion.div>
       
       {/* Completed Bar */}
       <motion.div 
         initial={{ height: 0 }}
         animate={{ height: `${height * 0.6}%` }}
         transition={{ delay: (delay * 0.05) + 0.1, duration: 0.8, type: 'spring' }}
         className="w-1/2 bg-blue-600 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative"
       />
    </div>
    <span className="text-[10px] text-gray-400 font-medium uppercase">{label}</span>
  </div>
);

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      layout
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group"
    >
      <div className="h-40 overflow-hidden relative">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Published
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
           <span className="flex items-center"><Users size={14} className="mr-1" /> {course.enrolledStudents || 120} enrolled</span>
           <span className="flex items-center"><CheckCircle size={14} className="mr-1" /> {Math.floor(Math.random() * 40 + 60)}% completed</span>
        </div>

        <div className="mb-5">
           <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">Course Progress</span>
              <span className="text-gray-900 font-bold">{course.progress || 42}%</span>
           </div>
           <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${course.progress || 42}%` }}></div>
           </div>
        </div>

        <div className="flex gap-2">
           <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => navigate('/admin/course-builder')}>
              Edit
           </Button>
           <Button variant="secondary" size="sm" className="flex-1 text-xs">
              <BarChart2 size={14} className="mr-1" /> Analytics
           </Button>
           <Button variant="primary" size="sm" className="text-xs bg-gray-900 hover:bg-black">
              Unpublish
           </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
        setIsLoading(true);
        const data = await api.getCourses();
        setCourses(data);
        setIsLoading(false);
    };
    fetchCourses();
  }, []);

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

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
         <p className="text-gray-500">Manage courses, monitor student progress, and analyze platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
      </div>

      {/* Course Management Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Course Management</h2>
              <p className="text-sm text-gray-500">View and manage all courses on the platform</p>
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
                 placeholder="Search courses by title, instructor, or topic..." 
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
           </div>
           <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                 <select className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    <option>All Courses</option>
                    <option>Published</option>
                    <option>Drafts</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative min-w-[160px]">
                 <select className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    <option>Most Recent</option>
                    <option>Popularity</option>
                    <option>Completion Rate</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <Button variant="secondary" className="px-3 border-gray-200 bg-gray-50 hover:bg-gray-100">
                 <RefreshCw size={18} className="text-gray-500" />
              </Button>
              <Button variant="primary" className="px-6">
                 Apply Filters
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
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
            {courses.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    No courses found. Try seeding the database if this is a fresh install.
                </div>
            )}
            </div>
        )}
      </section>

      {/* Analytics & Quick Actions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Enrollment Trends */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Student Enrollment Trends</h3>
                  <p className="text-sm text-gray-500">Monthly enrollment and completion statistics</p>
               </div>
               <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  Last 12 Months <ChevronDown size={14} className="ml-1" />
               </Button>
            </div>
            
            <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
               {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <ChartBar key={m} height={Math.random() * 60 + 20} label={m} delay={i} />
               ))}
            </div>
            <div className="flex justify-center gap-6 mt-6">
               <div className="flex items-center text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Enrolled Students
               </div>
               <div className="flex items-center text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span> Completed Courses
               </div>
            </div>
         </div>

         {/* Quick Actions */}
         <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-full">
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
                        className="bg-white p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                      >
                         {isSeeding ? (
                            <RefreshCw className="mb-3 text-emerald-600 animate-spin" size={24} />
                         ) : (
                            <Database className="mb-3 text-emerald-600 group-hover:scale-110 transition-transform" size={24} />
                         )}
                         <span className="font-bold text-gray-800 text-sm block">Seed Database</span>
                         <span className="text-[10px] text-gray-500">Populate dummy data...</span>
                      </button>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Section: Activity & Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Recent Activity */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-sm text-gray-500 mb-6">Latest platform updates and user actions</p>
            
            <div className="space-y-6">
               {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                     {item.avatar ? (
                        <img src={item.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                           {item.icon}
                        </div>
                     )}
                     <div className="flex-1">
                        <p className="text-sm text-gray-800">
                           <span className="font-bold">{item.user}</span> {item.action}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Platform Statistics */}
         <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-1">Platform Statistics</h3>
            <p className="text-sm text-gray-500 mb-6">Key performance indicators for December 2025</p>
            
            <div className="space-y-0 divide-y divide-gray-200">
               {PLATFORM_STATS.map((stat, i) => (
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
