
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Download, Mail, 
  UserX, CheckCircle, Clock, Shield, Users, UserCheck, X, Check, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';

// --- Mock Data ---
const STUDENT_STATS = [
  { label: 'Total Students', value: '1,847', change: '+12%', icon: <Users className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
  { label: 'Active Now', value: '342', change: '+5%', icon: <UserCheck className="text-green-600" size={24} />, bg: 'bg-green-50' },
  { label: 'Avg. Progress', value: '68%', change: '+2%', icon: <Clock className="text-orange-600" size={24} />, bg: 'bg-orange-50' },
  { label: 'Suspended', value: '12', change: '-1%', icon: <UserX className="text-red-600" size={24} />, bg: 'bg-red-50' },
];

const INITIAL_STUDENTS_DATA = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', enrolled: 3, progress: 75, status: 'Active', joined: 'Oct 24, 2023', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Connor', email: 'sarah.c@example.com', enrolled: 5, progress: 92, status: 'Active', joined: 'Sep 12, 2023', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Michael Chen', email: 'm.chen@example.com', enrolled: 2, progress: 30, status: 'Inactive', joined: 'Nov 05, 2023', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@example.com', enrolled: 1, progress: 10, status: 'Active', joined: 'Dec 01, 2023', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'David Kim', email: 'david.k@example.com', enrolled: 4, progress: 55, status: 'Suspended', joined: 'Aug 15, 2023', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', name: 'Lisa Wang', email: 'lisa.w@example.com', enrolled: 6, progress: 88, status: 'Active', joined: 'Jul 22, 2023', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', name: 'James Wilson', email: 'j.wilson@example.com', enrolled: 2, progress: 45, status: 'Inactive', joined: 'Oct 30, 2023', avatar: 'https://i.pravatar.cc/150?u=7' },
];

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border ${
        type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
    }`}
  >
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    </div>
    <div>
        <h4 className="font-bold text-sm text-gray-900">{type === 'success' ? 'Success' : 'Error'}</h4>
        <p className="text-gray-500 text-xs">{message}</p>
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
      <X size={16} />
    </button>
  </motion.div>
);

// --- Invite Modal Component ---
const InviteStudentModal = ({ isOpen, onClose, onInvite }: { isOpen: boolean; onClose: () => void; onInvite: (name: string, email: string) => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onInvite(name, email);
        setIsLoading(false);
        setName('');
        setEmail('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-lg">Invite New Student</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-gray-500 mb-2">
                        Enter the details below to send an invitation email. The student will be prompted to set a password upon joining.
                    </p>
                    <Input 
                        label="Full Name" 
                        placeholder="e.g. John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input 
                        label="Email Address" 
                        type="email" 
                        placeholder="john@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>Send Invitation</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [students, setStudents] = useState(INITIAL_STUDENTS_DATA);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInvite = async (name: string, email: string) => {
      const result = await api.createStudent({ name, email });
      
      if (result.success) {
          // Add temporary mock entry
          const newStudent = {
              id: `temp_${Date.now()}`,
              name: name,
              email: email,
              enrolled: 0,
              progress: 0,
              status: 'Active', // or 'Invited'
              joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
          };
          setStudents([newStudent, ...students]);
          setToast({ message: `Invitation sent to ${email}`, type: 'success' });
          setIsInviteModalOpen(false);
      } else {
          setToast({ message: result.message, type: 'error' });
      }
      
      setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
            <InviteStudentModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setIsInviteModalOpen(false)} 
                onInvite={handleInvite} 
            />
        )}
      </AnimatePresence>

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
             <Button variant="primary" icon={<Mail size={18} />} onClick={() => setIsInviteModalOpen(true)}>
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
