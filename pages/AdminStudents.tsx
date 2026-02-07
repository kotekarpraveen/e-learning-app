import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Edit2, Trash2, Mail,
    UserX, CheckCircle, Clock, Shield, Users, UserCheck, Plus, X, User, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Student } from '../types';

// --- Mock Data Stats (Updated Palette) ---
const STUDENT_STATS = [
    { label: 'Total Students', value: '1,847', change: '+12%', icon: <Users className="text-gray-800" size={24} />, bg: 'bg-gray-200' },
    { label: 'Active Now', value: '342', change: '+5%', icon: <UserCheck className="text-primary-700" size={24} />, bg: 'bg-primary-100' },
    { label: 'Avg. Progress', value: '68%', change: '+2%', icon: <Clock className="text-primary-600" size={24} />, bg: 'bg-primary-50' },
    { label: 'Suspended', value: '12', change: '-1%', icon: <UserX className="text-red-700" size={24} />, bg: 'bg-red-50' },
];

export const AdminStudents: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
        avatarFile: null as File | null,
        avatarPreview: '',
        bio: ''
    });

    const MotionDiv = motion.div as any;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await api.getStudents();
        setStudents(data);
        setIsLoading(false);
    };

    const handleOpenModal = (mode: 'add' | 'edit', student?: Student) => {
        setModalMode(mode);
        if (mode === 'edit' && student) {
            setSelectedStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                password: '',
                status: student.status,
                avatarFile: null,
                avatarPreview: student.avatar || '',
                bio: student.bio || ''
            });
        } else {
            setSelectedStudent(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                status: 'Active',
                avatarFile: null,
                avatarPreview: '',
                bio: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const studentId = selectedStudent?.id || `s_${Date.now()}`;

        const newStudent: Student = {
            id: studentId,
            name: formData.name.trim(),
            email: formData.email.trim(),
            status: formData.status,
            joinedDate: selectedStudent?.joinedDate || new Date().toISOString().split('T')[0],
            enrolledCourses: selectedStudent?.enrolledCourses || 0,
            averageProgress: selectedStudent?.averageProgress || 0,
            avatar: selectedStudent?.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
            bio: formData.bio
        };

        const result = await api.saveStudent(newStudent, formData.password.trim(), formData.avatarFile || undefined);

        if (result.success) {
            setIsModalOpen(false);
            // Re-fetch to see the proper DB state (especially the real UUID)
            await fetchData();
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }

        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to completely delete this student account and their login credentials?')) {
            const result = await api.deleteStudent(id);
            if (result.success) {
                await fetchData();
                alert(result.message);
            } else {
                alert(`Delete failed: ${result.message}`);
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students</h1>
                    <p className="text-gray-600">Manage student accounts, enrollment, and progress.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" icon={<UserCheck size={18} />} onClick={() => handleOpenModal('add')}>
                        Add Student
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STUDENT_STATS.map((stat, i) => (
                    <MotionDiv
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:border-primary-300 transition-colors"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            <span className="text-xs text-primary-700 font-medium bg-primary-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                                {stat.change}
                            </span>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            {stat.icon}
                        </div>
                    </MotionDiv>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <select
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-gray-700"
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-primary-100 text-primary-800' :
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
                                        {student.enrolledCourses}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${student.averageProgress > 70 ? 'bg-primary-500' :
                                                        student.averageProgress > 40 ? 'bg-primary-300' : 'bg-gray-300'
                                                        }`}
                                                    style={{ width: `${student.averageProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{student.averageProgress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {student.joinedDate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal('edit', student)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Showing {filteredStudents.length} results</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled>Previous</Button>
                        <Button variant="secondary" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <MotionDiv
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Create New Student' : 'Edit Student Details'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                                <form id="studentForm" onSubmit={handleSave} className="space-y-4">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                                {formData.avatarPreview ? (
                                                    <img src={formData.avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={40} className="text-gray-400" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-md">
                                                <Upload size={14} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFormData({
                                                                ...formData,
                                                                avatarFile: file,
                                                                avatarPreview: URL.createObjectURL(file)
                                                            });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Upload Profile Picture</p>
                                    </div>

                                    <Input
                                        label="Full Name"
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="student@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />

                                    <div className="space-y-1">
                                        <Input
                                            label={modalMode === 'add' ? "Initial Password" : "Reset Password (Optional)"}
                                            type="password"
                                            placeholder={modalMode === 'add' ? "Create a password" : "Leave blank to keep current"}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required={modalMode === 'add'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes / Bio</label>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] resize-none"
                                            placeholder="Internal notes about this student..."
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" form="studentForm">
                                    {modalMode === 'add' ? 'Create Account' : 'Save Changes'}
                                </Button>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};