
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search, UserPlus, MoreVertical, Edit2, Trash2,
   CheckCircle, XCircle, BookOpen, Mail, Award, X,
   Briefcase, Calendar, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Instructor, Course } from '../types';
const MotionDiv = motion.div as any;

export const AdminInstructors: React.FC = () => {
   const [instructors, setInstructors] = useState<Instructor[]>([]);
   const [allCourses, setAllCourses] = useState<Course[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   // Modal State
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
   const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

   // Form State
   const [formData, setFormData] = useState<Partial<Instructor>>({
      name: '',
      email: '',
      role: '',
      bio: '',
      status: 'Active',
      expertise: [],
      avatar: ''
   });
   const [expertiseInput, setExpertiseInput] = useState('');

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      setIsLoading(true);
      const [instData, courseData] = await Promise.all([
         api.getInstructors(),
         api.getCourses()
      ]);

      // Augment instructor data with computed course counts if needed
      // In a real app, the backend would provide this, but we can compute it on frontend for mock
      const augmentedInstructors = instData.map(inst => ({
         ...inst,
         coursesCount: courseData.filter(c => c.instructor === inst.name).length
      }));

      setInstructors(augmentedInstructors);
      setAllCourses(courseData);
      setIsLoading(false);
   };

   const filteredInstructors = instructors.filter(i =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleOpenModal = (mode: 'add' | 'edit', instructor?: Instructor) => {
      setModalMode(mode);
      if (mode === 'edit' && instructor) {
         setSelectedInstructor(instructor);
         setFormData({
            name: instructor.name,
            email: instructor.email,
            role: instructor.role,
            bio: instructor.bio,
            status: instructor.status,
            expertise: instructor.expertise,
            avatar: instructor.avatar
         });
         setExpertiseInput(instructor.expertise.join(', '));
      } else {
         setSelectedInstructor(null);
         setFormData({
            name: '',
            email: '',
            role: '',
            bio: '',
            status: 'Active',
            expertise: [],
            avatar: `https://ui-avatars.com/api/?name=New+Instructor&background=random`
         });
         setExpertiseInput('');
      }
      setIsModalOpen(true);
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();

      // Process Expertise
      const processedExpertise = expertiseInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const newInstructor: Instructor = {
         // If it's an edit, keep ID. If add, pass undefined or null so backend handles it? 
         // Actually, our API logic checks if ID starts with 'i_' for updates. 
         // For new creates, we should probably pass a temp ID or let API ignore it.
         // The API logic 'isUpdate' checks "instructor.id && !instructor.id.startsWith('i_')". 
         // So for new ones, we can pass a dummy 'i_new' or empty string if we adjust API, 
         // but current API expects 'i_' for mock/new.
         // Wait, the API I wrote: "isUpdate = instructor.id && !instructor.id.startsWith('i_')" 
         // This means 'i_' IDs are treated as NEW (Create). Unique DB IDs (UUIDs) are updates.
         id: selectedInstructor?.id || `i_${Date.now()}`,
         name: formData.name!,
         email: formData.email!,
         role: formData.role || 'Instructor',
         bio: formData.bio || '',
         status: formData.status as 'Active' | 'Inactive',
         expertise: processedExpertise,
         avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
         joinedDate: selectedInstructor?.joinedDate || new Date().toISOString().split('T')[0],
         totalStudents: selectedInstructor?.totalStudents || 0,
         coursesCount: selectedInstructor?.coursesCount || 0
      };

      const res = await api.saveInstructor(newInstructor);

      if (res.success) {
         setIsModalOpen(false);
         fetchData(); // Reload to get real IDs and Data
      } else {
         alert("Failed to save instructor: " + res.message);
      }
   };

   const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to remove this instructor?')) {
         await api.deleteInstructor(id);
         setInstructors(instructors.filter(i => i.id !== id));
      }
   };

   // Get courses for the selected instructor (by name string match as per current architecture)
   const instructorCourses = selectedInstructor
      ? allCourses.filter(c => c.instructor === selectedInstructor.name)
      : [];

   return (
      <div className="space-y-8 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Instructors</h1>
               <p className="text-gray-500">Manage teaching staff, profiles, and assignments.</p>
            </div>
            <Button icon={<UserPlus size={18} />} onClick={() => handleOpenModal('add')}>
               Add Instructor
            </Button>
         </div>

         {/* Search Bar */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <Search className="text-gray-400" size={20} />
            <input
               type="text"
               placeholder="Search instructors by name or email..."
               className="flex-1 outline-none text-gray-700 placeholder-gray-400"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map(instructor => (
               <MotionDiv
                  key={instructor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
               >
                  <div className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <img
                              src={instructor.avatar}
                              alt={instructor.name}
                              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                           />
                           <div>
                              <h3 className="font-bold text-gray-900 text-lg">{instructor.name}</h3>
                              <p className="text-sm text-gray-500">{instructor.role}</p>
                           </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${instructor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                           }`}>
                           {instructor.status}
                        </span>
                     </div>

                     <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                           <Mail size={16} className="mr-2 text-gray-400" />
                           {instructor.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                           <Award size={16} className="mr-2 text-gray-400" />
                           {instructor.expertise.slice(0, 2).join(', ')}{instructor.expertise.length > 2 ? '...' : ''}
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm">
                        <div className="text-center">
                           <span className="block font-bold text-gray-900">{instructor.coursesCount || 0}</span>
                           <span className="text-gray-500 text-xs">Courses</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="text-center">
                           <span className="block font-bold text-gray-900">{instructor.totalStudents || 0}</span>
                           <span className="text-gray-500 text-xs">Students</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="text-center">
                           <span className="block font-bold text-gray-900">4.9</span>
                           <span className="text-gray-500 text-xs">Rating</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
                     <button
                        onClick={() => handleOpenModal('edit', instructor)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                        title="Edit Details & View Courses"
                     >
                        <Edit2 size={16} />
                     </button>
                     <button
                        onClick={() => handleDelete(instructor.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                        title="Delete"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
               </MotionDiv>
            ))}
         </div>

         {/* Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <MotionDiv
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                  >
                     <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">
                           {modalMode === 'add' ? 'Add New Instructor' : 'Edit Instructor'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                           <X size={24} />
                        </button>
                     </div>

                     <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                        <form id="instructorForm" onSubmit={handleSave} className="space-y-6">
                           <div className="flex gap-6 flex-col sm:flex-row">
                              <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                                 <img
                                    src={formData.avatar}
                                    alt="Avatar Preview"
                                    className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover"
                                 />
                                 <span className="text-xs text-gray-500">Auto-generated</span>
                              </div>
                              <div className="flex-1 space-y-4">
                                 <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                 />
                                 <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Input
                                 label="Role / Title"
                                 placeholder="e.g. Senior Developer"
                                 value={formData.role}
                                 onChange={e => setFormData({ ...formData, role: e.target.value })}
                              />
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                 <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                 >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                 </select>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                              <textarea
                                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] resize-none"
                                 value={formData.bio}
                                 onChange={e => setFormData({ ...formData, bio: e.target.value })}
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                              <Input
                                 placeholder="e.g. React, Python, Data Science (comma separated)"
                                 value={expertiseInput}
                                 onChange={e => setExpertiseInput(e.target.value)}
                              />
                           </div>
                        </form>

                        {/* Associated Courses Section (Only in Edit Mode) */}
                        {modalMode === 'edit' && (
                           <div className="mt-8 pt-6 border-t border-gray-100">
                              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                 <BookOpen size={18} className="mr-2 text-primary-600" />
                                 Assigned Courses ({instructorCourses.length})
                              </h3>

                              {instructorCourses.length > 0 ? (
                                 <div className="space-y-3">
                                    {instructorCourses.map(course => (
                                       <div key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                          <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-md object-cover mr-3" />
                                          <div className="flex-1 min-w-0">
                                             <h4 className="text-sm font-bold text-gray-900 truncate">{course.title}</h4>
                                             <p className="text-xs text-gray-500">{course.enrolledStudents} Students • {course.level}</p>
                                          </div>
                                          <ChevronRight size={16} className="text-gray-400" />
                                       </div>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm">
                                    No courses assigned to this instructor yet.
                                 </div>
                              )}
                           </div>
                        )}
                     </div>

                     <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" form="instructorForm">Save Instructor</Button>
                     </div>
                  </MotionDiv>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};
