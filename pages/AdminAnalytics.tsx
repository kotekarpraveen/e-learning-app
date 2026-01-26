
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, DollarSign, Clock, Calendar, 
  ArrowUpRight, ArrowDownRight, Download, Filter, 
  Monitor, Smartphone, Tablet, ChevronDown, ArrowLeft, Star, BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/currency';
import { api } from '../lib/api';
import { Course } from '../types';

// --- Components ---

const AreaChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = 0;
  const height = 200;
  const width = 1000; 
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;

  return (
    <div className="w-full h-[250px] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1a845" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d1a845" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1="0" y1={p * height} x2={width} y2={p * height} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        <motion.path d={areaPath} fill="url(#chartGradient)" initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
        <motion.polyline fill="none" stroke="#d1a845" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
    </div>
  );
};

export const AdminAnalytics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dateRange, setDateRange] = useState('Last 12 Months');
  
  // Default Data
  const [metrics, setMetrics] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([4500, 5200, 4800, 6100, 5900, 7200, 8500, 8100, 9500, 10200, 9800, 11500]);
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        // 1. Load Global Platform Data first (Mocked for speed here, usually API)
        const globalMetrics = [
            { label: 'Total Revenue', value: 124592, change: '+12.5%', trend: 'up', icon: <DollarSign size={22} className="text-primary-700" />, bg: 'bg-primary-100', isCurrency: true },
            { label: 'Active Students', value: '2,845', change: '+18.2%', trend: 'up', icon: <Users size={22} className="text-gray-800" />, bg: 'bg-gray-200' },
            { label: 'Course Completion', value: '68.4%', change: '-2.1%', trend: 'down', icon: <TrendingUp size={22} className="text-primary-600" />, bg: 'bg-primary-50' },
            { label: 'Avg. Session', value: '42m', change: '+5.3%', trend: 'up', icon: <Clock size={22} className="text-gray-700" />, bg: 'bg-gray-100' },
        ];
        
        // 2. If Course ID exists, fetch and override
        if (courseId) {
            const course = await api.getCourseById(courseId);
            if (course) {
                setSelectedCourse(course);
                const revenue = (course.price || 0) * (course.enrolledStudents || 0);
                
                // Override metrics for specific course
                setMetrics([
                    { label: 'Course Revenue', value: revenue, change: '+5.4%', trend: 'up', icon: <DollarSign size={22} className="text-primary-700" />, bg: 'bg-primary-100', isCurrency: true },
                    { label: 'Total Students', value: course.enrolledStudents?.toLocaleString() || '0', change: '+12%', trend: 'up', icon: <Users size={22} className="text-gray-800" />, bg: 'bg-gray-200' },
                    { label: 'Average Rating', value: course.averageRating?.toFixed(1) || '0.0', change: '+0.1', trend: 'up', icon: <Star size={22} className="text-yellow-600" />, bg: 'bg-yellow-50' },
                    { label: 'Modules', value: course.totalModules || 0, change: '0', trend: 'neutral', icon: <BookOpen size={22} className="text-gray-700" />, bg: 'bg-gray-100' },
                ]);
                
                // Generate pseudo-random chart data seeded by course price
                setChartData(Array.from({length: 12}, () => Math.floor(Math.random() * (course.price * 10 || 1000) + 1000)));
                setTopCourses([]); // Hide top courses table in detail view
                return;
            }
        } 
        
        // Fallback to Global
        setSelectedCourse(null);
        setMetrics(globalMetrics);
        setChartData([4500, 5200, 4800, 6100, 5900, 7200, 8500, 8100, 9500, 10200, 9800, 11500]);
        setTopCourses([
            { name: 'Fullstack React Mastery', revenue: 45200, students: 854, rating: 4.9, retention: '92%' },
            { name: 'Data Science with Python', revenue: 32150, students: 620, rating: 4.8, retention: '88%' },
            { name: 'UI/UX Design Fundamentals', revenue: 18400, students: 940, rating: 4.7, retention: '85%' },
        ]);
    };
    
    loadData();
  }, [courseId]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
              {selectedCourse && (
                  <button onClick={() => navigate('/admin/analytics')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <ArrowLeft size={24} />
                  </button>
              )}
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {selectedCourse ? selectedCourse.title : 'Analytics Overview'}
              </h1>
          </div>
          <p className="text-gray-600 mt-1 ml-1">
              {selectedCourse ? `Performance metrics for ${selectedCourse.category} course` : "Monitor your platform's performance and growth metrics."}
          </p>
        </div>
        
        <div className="flex gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
           <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
             <Calendar size={16} className="mr-2" /> {dateRange} <ChevronDown size={14} className="ml-2 opacity-50" />
           </Button>
           <div className="w-px bg-gray-200 my-1"></div>
           <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
             <Filter size={16} className="mr-2" /> Filter
           </Button>
           <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
             <Download size={16} className="mr-2" /> Export
           </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-xl ${metric.bg}`}>
                  {metric.icon}
               </div>
               {metric.trend === 'up' ? (
                 <span className="flex items-center text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} className="mr-1 text-green-600" /> {metric.change}
                 </span>
               ) : (
                 <span className="flex items-center text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">
                    <ArrowDownRight size={14} className="mr-1 text-red-600" /> {metric.change}
                 </span>
               )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metric.isCurrency ? formatPrice(metric.value) : metric.value}
            </h3>
            <p className="text-sm text-gray-400 font-medium capitalize">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedCourse ? 'Course Engagement & Sales' : 'Revenue Growth'}</h3>
               <p className="text-sm text-gray-500">Trends over the selected period</p>
             </div>
          </div>
          <AreaChart data={chartData} />
        </div>

        {/* Device Breakdown (Only show on Global View) */}
        {!selectedCourse && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Device Breakdown</h3>
              <div className="relative w-48 h-48 mx-auto mb-8">
                 <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#d1a845 0% 58%, #eab308 58% 90%, #9ca3af 90% 100%)` }}></div>
                 <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">58%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Desktop</span>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                     { device: 'Desktop', percentage: 58, icon: <Monitor size={16} />, color: 'bg-primary-600' },
                     { device: 'Mobile', percentage: 32, icon: <Smartphone size={16} />, color: 'bg-primary-400' },
                     { device: 'Tablet', percentage: 10, icon: <Tablet size={16} />, color: 'bg-gray-400' },
                 ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center text-sm text-gray-600 font-medium">
                          <div className={`p-1.5 rounded-md ${d.color} bg-opacity-10 mr-3 text-gray-700`}>{d.icon}</div>
                          {d.device}
                       </div>
                       <div className="flex items-center gap-3 w-1/2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percentage}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-900 w-8 text-right">{d.percentage}%</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
        )}

        {/* Student Progress (Show only on Course View) */}
        {selectedCourse && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Student Progress</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Completed</span>
                            <span className="font-bold">12%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[12%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>In Progress (>50%)</span>
                            <span className="font-bold">45%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Just Started</span>
                            <span className="font-bold">33%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-[33%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Inactive</span>
                            <span className="font-bold">10%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-400 w-[10%]"></div></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Top Courses List (Only on Global View) */}
      {!selectedCourse && (
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
                  <p className="text-sm text-gray-500">Based on revenue and student retention</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>View All</Button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                     <tr>
                        <th className="px-6 py-4 font-semibold">Course Name</th>
                        <th className="px-6 py-4 font-semibold">Revenue</th>
                        <th className="px-6 py-4 font-semibold">Students</th>
                        <th className="px-6 py-4 font-semibold">Rating</th>
                        <th className="px-6 py-4 font-semibold text-right">Retention</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {topCourses.map((course, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                           <td className="px-6 py-4 text-gray-600">{formatPrice(course.revenue)}</td>
                           <td className="px-6 py-4 text-gray-600">{course.students}</td>
                           <td className="px-6 py-4">
                              <span className="flex items-center text-gray-800 font-bold">
                                 <span className="text-primary-500 mr-1">★</span> {course.rating}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                                 parseInt(course.retention) > 90 ? 'bg-primary-100 text-primary-800' : 
                                 parseInt(course.retention) > 80 ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                              }`}>
                                 {course.retention}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};
