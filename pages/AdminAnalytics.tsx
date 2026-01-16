
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, Clock, Calendar, 
  ArrowUpRight, ArrowDownRight, Download, Filter, 
  MoreHorizontal, MapPin, Smartphone, Monitor, Tablet,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Mock Data ---

const METRICS = [
  { 
    label: 'Total Revenue', 
    value: '$124,592', 
    change: '+12.5%', 
    trend: 'up', 
    period: 'vs last month',
    icon: <DollarSign size={22} className="text-primary-700" />,
    bg: 'bg-primary-100'
  },
  { 
    label: 'Active Students', 
    value: '2,845', 
    change: '+18.2%', 
    trend: 'up', 
    period: 'vs last month',
    icon: <Users size={22} className="text-gray-800" />,
    bg: 'bg-gray-200'
  },
  { 
    label: 'Course Completion', 
    value: '68.4%', 
    change: '-2.1%', 
    trend: 'down', 
    period: 'vs last month',
    icon: <TrendingUp size={22} className="text-primary-600" />,
    bg: 'bg-primary-50'
  },
  { 
    label: 'Avg. Session', 
    value: '42m 15s', 
    change: '+5.3%', 
    trend: 'up', 
    period: 'vs last month',
    icon: <Clock size={22} className="text-gray-700" />,
    bg: 'bg-gray-100'
  },
];

const REVENUE_DATA = [4500, 5200, 4800, 6100, 5900, 7200, 8500, 8100, 9500, 10200, 9800, 11500];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TOP_COURSES = [
  { name: 'Fullstack React Mastery', revenue: '$45,200', students: 854, rating: 4.9, retention: '92%' },
  { name: 'Data Science with Python', revenue: '$32,150', students: 620, rating: 4.8, retention: '88%' },
  { name: 'UI/UX Design Fundamentals', revenue: '$18,400', students: 940, rating: 4.7, retention: '85%' },
  { name: 'Advanced Node.js Patterns', revenue: '$12,800', students: 310, rating: 4.9, retention: '95%' },
  { name: 'Digital Marketing 101', revenue: '$8,500', students: 450, rating: 4.5, retention: '78%' },
];

const DEVICE_STATS = [
  { device: 'Desktop', percentage: 58, icon: <Monitor size={16} />, color: 'bg-primary-600' },
  { device: 'Mobile', percentage: 32, icon: <Smartphone size={16} />, color: 'bg-primary-400' },
  { device: 'Tablet', percentage: 10, icon: <Tablet size={16} />, color: 'bg-gray-400' },
];

// --- Components ---

const AreaChart = () => {
  // Simple SVG Area Chart generation
  const max = Math.max(...REVENUE_DATA);
  const min = 0;
  const height = 200;
  const width = 1000; // viewbox units
  
  const points = REVENUE_DATA.map((val, i) => {
    const x = (i / (REVENUE_DATA.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;

  return (
    <div className="w-full h-[250px] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1a845" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d1a845" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i} 
            x1="0" 
            y1={p * height} 
            x2={width} 
            y2={p * height} 
            stroke="#e5e7eb" 
            strokeWidth="1" 
          />
        ))}

        {/* The Area */}
        <motion.path
          d={areaPath}
          fill="url(#chartGradient)"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* The Line */}
        <motion.polyline
          fill="none"
          stroke="#d1a845"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Hover Points (Interactive) */}
        {REVENUE_DATA.map((val, i) => {
           const x = (i / (REVENUE_DATA.length - 1)) * width;
           const y = height - ((val - min) / (max - min)) * height;
           return (
             <g key={i} className="group">
               <circle cx={x} cy={y} r="6" fill="#fff" stroke="#d1a845" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
               <rect x={x - 40} y={y - 45} width="80" height="35" rx="6" fill="#1f2937" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <text x={x} y={y - 22} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
                 ${val}
               </text>
             </g>
           )
        })}
      </svg>
      
      {/* X Axis Labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium px-2">
        {MONTHS.map(m => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
};

export const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 12 Months');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Overview</h1>
          <p className="text-gray-600">Monitor your platform's performance and growth metrics.</p>
        </div>
        
        <div className="flex gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
           <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
             <Calendar size={16} className="mr-2" />
             {dateRange}
             <ChevronDown size={14} className="ml-2 opacity-50" />
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
        {METRICS.map((metric, i) => (
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
            <p className="text-sm text-gray-400 font-medium capitalize">{metric.label} <span className="text-gray-300 font-normal ml-1">({metric.period})</span></p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
               <p className="text-sm text-gray-500">Monthly income from subscriptions and course sales</p>
             </div>
             <div className="flex items-center gap-2">
                <span className="flex items-center text-xs font-medium text-gray-500">
                   <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span> Current Period
                </span>
                <span className="flex items-center text-xs font-medium text-gray-500 ml-4">
                   <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span> Previous Period
                </span>
             </div>
          </div>
          <AreaChart />
        </div>

        {/* Device & Demographics */}
        <div className="space-y-6">
           {/* Device Breakdown */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Device Breakdown</h3>
              <div className="relative w-48 h-48 mx-auto mb-8">
                 {/* CSS Conic Gradient Pie Chart approximation */}
                 <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#d1a845 0% 58%, #eab308 58% 90%, #9ca3af 90% 100%)` }}></div>
                 <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">58%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Desktop</span>
                 </div>
              </div>
              
              <div className="space-y-4">
                 {DEVICE_STATS.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center text-sm text-gray-600 font-medium">
                          <div className={`p-1.5 rounded-md ${d.color} bg-opacity-10 mr-3 text-gray-700`}>
                             {d.icon}
                          </div>
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
      </div>

      {/* Top Courses & Geography Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Top Performing Courses */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
                  <p className="text-sm text-gray-500">Based on revenue and student retention</p>
               </div>
               <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">View All</Button>
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
                     {TOP_COURSES.map((course, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                           <td className="px-6 py-4 text-gray-600">{course.revenue}</td>
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

         {/* Geography Placeholder */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">User Geography</h3>
            <div className="space-y-6">
                {[
                  { country: 'United States', users: '45%', flag: '🇺🇸' },
                  { country: 'India', users: '22%', flag: '🇮🇳' },
                  { country: 'United Kingdom', users: '12%', flag: '🇬🇧' },
                  { country: 'Germany', users: '8%', flag: '🇩🇪' },
                  { country: 'Canada', users: '6%', flag: '🇨🇦' },
                  { country: 'Others', users: '7%', flag: '🌍' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center">
                        <span className="text-xl mr-3">{c.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{c.country}</span>
                     </div>
                     <span className="text-sm font-bold text-gray-900">{c.users}</span>
                  </div>
                ))}
            </div>
            
            <div className="mt-8 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
               <MapPin className="mx-auto text-primary-500 mb-2" size={24} />
               <p className="text-xs text-gray-500">Interactive map data is loading...</p>
            </div>
         </div>
      </div>
    </div>
  );
};
