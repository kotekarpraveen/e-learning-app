
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Download, Mail, 
  UserX, CheckCircle, Clock, Shield, Users, UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Mock Data ---
const STUDENT_STATS = [
  { label: 'Total Students', value: '1,847', change: '+12%', icon: <Users className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
  { label: 'Active Now', value: '342', change: '+5%', icon: <UserCheck className="text-green-600" size={24} />, bg: 'bg-green-50' },
  { label: 'Avg. Progress', value: '68%', change: '+2%', icon: <Clock className="text-orange-600" size={24} />, bg: 'bg-orange-50' },
  { label: 'Suspended', value: '12', change: '-1%', icon: <UserX className="text-red-600" size={24} />, bg: 'bg-red-50' },
];

const STUDENTS_DATA = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', enrolled: 3, progress: 75, status: 'Active', joined: 'Oct 24, 2023', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Connor', email: 'sarah.c@example.com', enrolled: 5, progress: 92, status: 'Active', joined: 'Sep 12, 2023', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Michael Chen', email: 'm.chen@example.com', enrolled: 2, progress: 30, status: 'Inactive', joined: 'Nov 05, 2023', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', enrolled: 1, progress: 10, status: 'Active', joined: 'Dec 01, 2023', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'David Kim', email: 'david.k@example.com', enrolled: 4, progress: 55, status: 'Suspended', joined: 'Aug 15, 2023', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', name: 'Lisa Wang', email: 'lisa.w@example.com', enrolled: 6, progress: 88, status: 'Active', joined: 'Jul 22, 2023', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', name: 'James Wilson', email: 'j.wilson@example.com', enrolled: 2, progress: 45, status: 'Inactive', joined: 'Oct 30, 2023', avatar: 'https://i.pravatar.cc/150?u=7' },
];

export const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredStudents = STUDENTS_DATA.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students</h1>
            <p className="text-gray-500">Manage student accounts, enrollment, and progress.</p>
         </div>
         <div className="flex gap-3">
             <Button variant="secondary" icon={<Download size={18} />}>
                Export CSV
             </Button>
             <Button variant="primary" icon={<Mail size={18} />}>
                Invite Student
             </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STUDENT_STATS.map((stat, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
                <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                   <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {stat.change}
                   </span>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                   {stat.icon}
                </div>
            </motion.div>
        ))}
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
           <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search by name or email..." 
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <select 
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                 <option value="All">All Status</option>
                 <option value="Active">Active</option>
                 <option value="Inactive">Inactive</option>
                 <option value="Suspended">Suspended</option>
              </select>
              <Button variant="secondary" className="px-3">
                 <Filter size={18} />
              </Button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Enrolled Courses</th>
                        <th className="px-6 py-4">Avg. Progress</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={student.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                                    <div>
                                        <div className="font-semibold text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    student.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    student.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {student.status === 'Active' && <CheckCircle size={12} className="mr-1" />}
                                    {student.status === 'Inactive' && <Clock size={12} className="mr-1" />}
                                    {student.status === 'Suspended' && <Shield size={12} className="mr-1" />}
                                    {student.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">
                                {student.enrolled}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                                student.progress > 70 ? 'bg-green-500' : 
                                                student.progress > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} 
                                            style={{ width: `${student.progress}%` }} 
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{student.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {student.joined}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                No students found matching your filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing 1 to {filteredStudents.length} of {filteredStudents.length} results</span>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled>Previous</Button>
                <Button variant="secondary" size="sm" disabled>Next</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
