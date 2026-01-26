
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { Course } from '../types';
import { useAuth } from '../App';
import { AdminCourseCard } from '../components/AdminCourseCard';

export const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    setIsLoading(true);
    const courseData = await api.getCourses();
    if (user?.role === 'instructor') {
        const myCourses = courseData.filter(c => c.instructor === user.name);
        setCourses(myCourses);
    } else {
        setCourses(courseData);
    }
    setIsLoading(false);
  };

  const handleDeleteCourse = async (id: string) => {
      // Use window.confirm to ensure browser API is called
      if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
          // Optimistically update UI to feel faster, or wait for loading. 
          // Here we wait but maybe don't block the whole UI if possible, 
          // but for safety we re-use isLoading to prevent interactions.
          setIsLoading(true);
          try {
              const result = await api.deleteCourse(id);
              if (result.success) {
                  setCourses(prev => prev.filter(c => c.id !== id));
              } else {
                  alert("Failed to delete course: " + result.message);
              }
          } catch (error) {
              console.error("Delete failed", error);
              alert("An unexpected error occurred.");
          } finally {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Library</h1>
            <p className="text-gray-600">
               {isAdmin ? 'Manage all courses available on the platform.' : 'Manage and update your created courses.'}
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
              <AdminCourseCard key={course.id} course={course} onDelete={handleDeleteCourse} />
          ))}
          {filteredCourses.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  {courses.length === 0 
                      ? "No courses found. Click 'Create Course' to get started."
                      : "No courses match your search criteria."
                  }
              </div>
          )}
          </div>
      )}
    </div>
  );
};
