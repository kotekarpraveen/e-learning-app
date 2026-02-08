
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search, UserPlus, MoreVertical, Edit2, Trash2,
   CheckCircle, XCircle, BookOpen, Mail, Award, X,
   Briefcase, Calendar, ChevronRight, Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Instructor, Course } from '../types';
import { useToast } from '../context/ToastContext';
const MotionDiv = motion.div as any;

export const AdminInstructors: React.FC = () => {
   const { success, error } = useToast();
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
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      setIsLoading(true);
      const [instData, courseData] = await Promise.all([
         api.getInstructors(),
         api.getCourses()
      ]);

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
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
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
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsModalOpen(true);
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setSelectedFile(file);
         const reader = new FileReader();
         reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      const processedExpertise = expertiseInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const newInstructor: Instructor = {
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

      const res = await api.saveInstructor(newInstructor, selectedFile || undefined);

      if (res.success) {
         success(modalMode === 'add' ? 'Instructor added successfully' : 'Instructor updated successfully');
         setIsModalOpen(false);
         fetchData();
      } else {
         error("Failed to save instructor: " + res.message);
      }
   };

   const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to remove this instructor?')) {
         const res = await api.deleteInstructor(id);
         if (res.success) {
            success('Instructor removed successfully');
            setInstructors(instructors.filter(i => i.id !== id));
         } else {
            error("Failed to delete instructor: " + res.message);
         }
      }
   };

   const instructorCourses = selectedInstructor
      ? allCourses.filter(c => c.instructor === selectedInstructor.name)
      : [];

   const stats = [
      { label: 'Talent Pool', value: instructors.length, icon: <Briefcase className="text-primary-600" size={24} />, trend: '+4 this month' },
      { label: 'Active', value: instructors.filter(i => i.status === 'Active').length, icon: <CheckCircle className="text-emerald-500" size={24} />, trend: 'Healthy' },
      { label: 'Course Catalog', value: allCourses.length, icon: <BookOpen className="text-indigo-500" size={24} />, trend: 'Across 12 Categories' },
      { label: 'Rating', value: '4.9', icon: <Award className="text-amber-500" size={24} />, trend: 'Top 1% Global' },
   ];

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: { staggerChildren: 0.1, delayChildren: 0.2 }
      }
   };

   const itemVariants = {
      hidden: { opacity: 0, scale: 0.95, y: 30 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
   };

   if (isLoading) {
      return (
         <div className="flex flex-col justify-center items-center h-[70vh] gap-6">
            <div className="relative w-20 h-20">
               <MotionDiv
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-gray-100 border-t-primary-600 rounded-full"
               />
               <MotionDiv
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border-4 border-gray-100 border-b-indigo-500 rounded-full"
               />
            </div>
            <p className="text-gray-400 font-medium animate-pulse">Curating your elite talent pool...</p>
         </div>
      );
   }

   return (
      <div className="max-w-[1600px] mx-auto space-y-12 pb-32">
         {/* Minimalist Header */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className="h-0.5 w-6 bg-primary-600 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">Personnel</span>
               </div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Management</h1>
               <p className="text-gray-500 mt-1 text-base font-medium">Directory of lead instructors and subject experts.</p>
            </div>
            <div className="flex gap-3">
               <button
                  onClick={() => fetchData()}
                  className="p-4 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
               >
                  <Calendar size={20} />
               </button>
               <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-black text-white px-8 rounded-2xl shadow-2xl shadow-gray-900/20 transform hover:-translate-y-1 transition-all"
                  icon={<UserPlus size={20} />}
                  onClick={() => handleOpenModal('add')}
               >
                  Onboard Expert
               </Button>
            </div>
         </div>

         {/* Stats Widgets */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
               <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-start gap-4 group hover:shadow-xl hover:shadow-gray-200/40 transition-all cursor-default">
                  <div className="p-4 rounded-3xl bg-gray-50 group-hover:bg-primary-50 transition-colors">
                     {s.icon}
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                     <h4 className="text-lg font-black text-gray-900">{s.value}</h4>
                     <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1.5 inline-block group-hover:bg-white transition-colors">{s.trend}</span>
                  </div>
               </div>
            ))}
         </div>

         {/* Advanced Filter Bar */}
         <div className="flex flex-col md:flex-row gap-6 p-2 sticky top-6 z-40">
            <div className="flex-1 relative group">
               <div className="absolute inset-0 bg-primary-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
               <input
                  type="text"
                  placeholder="Search by specialty, name, or account..."
                  className="w-full pl-14 pr-8 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/20 focus:ring-0 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold placeholder-gray-400 relative z-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* The Talent Grid (Mosaic Layout) */}
         <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
         >
            {filteredInstructors.map(instructor => (
               <MotionDiv
                  key={instructor.id}
                  variants={itemVariants}
                  className="break-inside-avoid bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 relative flex flex-col items-center text-center p-5 hover:-translate-y-1"
               >
                  {/* Status Ring Decor */}
                  <div className={`absolute top-0 inset-x-0 h-16 bg-gradient-to-b ${instructor.status === 'Active' ? 'from-emerald-50/40' : 'from-gray-50/40'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* Vertical Identity Section */}
                  <div className="relative mt-2 mb-4">
                     <div className={`absolute inset-0 rounded-full blur-xl opacity-10 group-hover:opacity-30 transition-opacity ${instructor.status === 'Active' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                     <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-20 h-20 rounded-full border-2 border-white shadow-lg object-cover relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                     />
                     <div className={`absolute bottom-0 right-1 w-7 h-7 rounded-full border-2 border-white z-20 shadow-md flex items-center justify-center ${instructor.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}>
                        {instructor.status === 'Active' ? <CheckCircle size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
                     </div>
                  </div>

                  <div className="space-y-3 w-full">
                     <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">{instructor.name}</h3>
                        <p className="text-primary-500 font-bold uppercase tracking-widest text-[8px] mt-1 bg-primary-50 px-2.5 py-1 rounded-full inline-block">{instructor.role}</p>
                     </div>

                     <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 px-2 h-8">
                        {instructor.bio || "Mentoring the next generation of industry experts."}
                     </p>

                     {/* Compact Meter Row */}
                     <div className="grid grid-cols-2 gap-px bg-gray-50 rounded-2xl overflow-hidden mt-4 p-0.5 border border-gray-100">
                        <div className="bg-white py-2 group/stat hover:bg-gray-50 transition-colors">
                           <span className="block text-sm font-black text-gray-900">{instructor.coursesCount || 0}</span>
                           <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Courses</span>
                        </div>
                        <div className="border-l border-gray-50 bg-white py-2 group/stat hover:bg-gray-50 transition-colors">
                           <span className="block text-sm font-black text-gray-900">{instructor.totalStudents || 0}</span>
                           <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Reach</span>
                        </div>
                     </div>
                  </div>

                  {/* Hover Floating Action Bar */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                     <button
                        onClick={() => handleOpenModal('edit', instructor)}
                        className="p-2 bg-white text-gray-400 hover:text-primary-600 shadow-lg rounded-xl transition-all hover:scale-110 border border-gray-100"
                        title="Edit"
                     >
                        <Edit2 size={14} />
                     </button>
                     <button
                        onClick={() => handleDelete(instructor.id)}
                        className="p-2 bg-white text-gray-400 hover:text-red-500 shadow-lg rounded-xl transition-all hover:scale-110 border border-gray-100"
                        title="Delete"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               </MotionDiv>
            ))}
         </MotionDiv>

         {filteredInstructors.length === 0 && (
            <MotionDiv
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-40 px-6 rounded-[4rem] bg-gray-50 border-4 border-dashed border-gray-100 flex flex-col items-center justify-center"
            >
               <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-10 animate-pulse" />
                  <Search size={48} className="text-primary-200 relative z-10" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">Directory Empty</h3>
               <p className="text-gray-400 max-w-sm text-lg font-medium leading-relaxed mb-10">
                  We couldn't locate any instructors that match your current search criteria.
               </p>
               <button
                  onClick={() => setSearchTerm('')}
                  className="px-10 py-4 bg-white text-gray-900 font-black rounded-2xl shadow-xl shadow-gray-200 hover:shadow-primary-500/10 hover:text-primary-600 transition-all transform hover:-translate-y-1"
               >
                  Reset Filter
               </button>
            </MotionDiv>
         )}

         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/40 backdrop-blur-xl">
                  <MotionDiv
                     initial={{ x: '100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '100%' }}
                     transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     className="bg-white w-full max-w-2xl h-full shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col relative"
                  >
                     <div className="p-12 pb-6 flex justify-between items-start">
                        <div>
                           <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">Management</span>
                           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                              {modalMode === 'add' ? 'New Expert' : 'Refine Profile'}
                           </h2>
                        </div>
                        <button
                           onClick={() => setIsModalOpen(false)}
                           className="bg-gray-50 p-4 rounded-3xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all transform hover:rotate-90"
                        >
                           <X size={32} />
                        </button>
                     </div>

                     <div className="overflow-y-auto px-12 py-6 flex-1 custom-scrollbar space-y-12">
                        <form id="instructorForm" onSubmit={handleSave} className="space-y-12">
                           <div
                              className="flex flex-col items-center gap-6 p-8 bg-gray-50 rounded-[3rem] border-2 border-white shadow-inner relative group/avatar cursor-pointer overflow-hidden"
                              onClick={() => fileInputRef.current?.click()}
                           >
                              <img
                                 src={previewUrl || formData.avatar}
                                 alt=""
                                 className="w-48 h-48 rounded-[4rem] border-8 border-white shadow-2xl object-cover transform rotate-3 group-hover/avatar:rotate-0 transition-transform duration-500"
                              />
                              <input
                                 type="file"
                                 ref={fileInputRef}
                                 onChange={handleFileChange}
                                 className="hidden"
                                 accept="image/*"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                 <p className="text-white font-black text-xs uppercase tracking-widest">Update Photo</p>
                              </div>
                              <div className="absolute top-4 right-4 bg-primary-600 text-white p-4 rounded-[2rem] shadow-xl font-black text-xs uppercase tracking-widest leading-none z-10">
                                 Pro Verified
                              </div>
                              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tap to change identity</p>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                                 <input
                                    className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 text-sm"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                 <input
                                    type="email"
                                    className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 text-sm"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Focus</label>
                                 <input
                                    className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 text-sm"
                                    placeholder="e.g. Lead Researcher"
                                    value={formData.role || ''}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Status</label>
                                 <select
                                    className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-black text-gray-900 appearance-none cursor-pointer text-sm"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                 >
                                    <option value="Active">Verified Active</option>
                                    <option value="Inactive">Restricted Access</option>
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Narrative Biography</label>
                              <textarea
                                 className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-800 min-h-[120px] resize-none leading-relaxed text-sm"
                                 placeholder="Tell the story of their expertise..."
                                 value={formData.bio || ''}
                                 onChange={e => setFormData({ ...formData, bio: e.target.value })}
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Skill Matrix (CSV)</label>
                              <input
                                 className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 text-sm"
                                 value={expertiseInput}
                                 onChange={e => setExpertiseInput(e.target.value)}
                              />
                           </div>
                        </form>

                        {modalMode === 'edit' && (
                           <div className="pt-12 border-t border-gray-100">
                              <div className="flex justify-between items-center mb-8">
                                 <h4 className="text-lg font-black text-gray-900 tracking-tight">Active Curriculum</h4>
                                 <span className="bg-primary-50 text-primary-600 px-3 py-1.4 rounded-xl text-[9px] font-black uppercase tracking-widest">{instructorCourses.length} Artifacts</span>
                              </div>
                              <div className="grid grid-cols-1 gap-4 text-left">
                                 {instructorCourses.map(course => (
                                    <div key={course.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary-200 transition-all group/course">
                                       <div className="flex items-center gap-6">
                                          <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shadow-inner group-hover/course:shadow-xl transition-shadow">
                                             <img src={course.thumbnail} alt="" className="w-full h-full object-cover transform group-hover/course:scale-110 transition-transform" />
                                          </div>
                                          <div>
                                             <h5 className="font-black text-gray-900 group-hover/course:text-primary-600 transition-all">{course.title}</h5>
                                             <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.level} Architecture</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.enrolledStudents} Enrolled</span>
                                             </div>
                                          </div>
                                       </div>
                                       <ChevronRight size={20} className="text-gray-200 group-hover/course:text-primary-500 transform group-hover/course:translate-x-2 transition-all" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="p-12 bg-gray-50/80 backdrop-blur-md flex gap-4 border-t border-gray-100">
                        <button
                           onClick={() => setIsModalOpen(false)}
                           className="flex-1 py-4 bg-white text-gray-400 font-black uppercase tracking-widest rounded-2xl border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all text-xs"
                        >
                           Dismiss
                        </button>
                        <button
                           type="submit"
                           form="instructorForm"
                           className="flex-[2] py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-gray-900/40 hover:bg-black transform hover:-translate-y-1 transition-all text-xs"
                        >
                           Execute Changes
                        </button>
                     </div>
                  </MotionDiv>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};
