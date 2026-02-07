
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
   Users, BookOpen, TrendingUp, Clock, Plus,
   BarChart2, ChevronDown, RefreshCw, Database, Loader2, Mic
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
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

export const AdminDashboard: React.FC = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const [isLoading, setIsLoading] = useState(true);
   const [isSeeding, setIsSeeding] = useState(false);

   // Real Data State
   const [stats, setStats] = useState<any[]>([]);
   const [recentActivity, setRecentActivity] = useState<any[]>([]);
   const [platformStats, setPlatformStats] = useState<any[]>([]);
   const [enrollmentTrends, setEnrollmentTrends] = useState<{ label: string, value: number }[]>([]);

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

      setIsLoading(false);
   };

   useEffect(() => {
      loadDashboardData();
   }, [user]);

   const handleSeedDatabase = async () => {
      if (!confirm("This will insert default mock data into your Supabase database. Continue?")) return;

      setIsSeeding(true);
      const result = await api.seedDatabase();
      setIsSeeding(false);

      if (result.success) {
         alert(result.message);
         window.location.reload();
      } else {
         alert(`Error: ${result.message}`);
      }
   };

   const isAdmin = user?.role !== 'instructor';

   if (isLoading) {
      return (
         <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin text-primary-600" size={40} />
         </div>
      );
   }

   return (
      <div className="space-y-8 pb-12">
         {/* Header Section */}
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
               {isAdmin ? 'Admin Dashboard' : 'Instructor Dashboard'}
            </h1>
            <p className="text-gray-600">
               {isAdmin ? 'Overview of platform performance and key metrics' : 'Overview of your teaching performance'}
            </p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
         </div>

         {/* Analytics & Quick Actions Split */}
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
                        <button onClick={() => navigate('/admin/course-builder?category=Audio Series')} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group">
                           <Mic className="mb-3 text-purple-600 group-hover:scale-110 transition-transform" size={24} />
                           <span className="font-bold text-gray-800 text-sm block">Create Audio Series</span>
                           <span className="text-[10px] text-gray-500">Add podcast content...</span>
                        </button>
                        <button onClick={() => navigate('/admin/courses')} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group">
                           <BookOpen className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                           <span className="font-bold text-gray-800 text-sm block">View All Courses</span>
                           <span className="text-[10px] text-gray-500">Manage catalog...</span>
                        </button>
                        <button onClick={() => navigate('/admin/analytics')} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group">
                           <Users className="mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                           <span className="font-bold text-gray-800 text-sm block">Analytics</span>
                           <span className="text-[10px] text-gray-500">Deep dive...</span>
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
