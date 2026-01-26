
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart2, Trash2, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { Course } from '../types';
import { formatPrice } from '../lib/currency';

const MotionDiv = motion.div as any;

export const AdminCourseCard: React.FC<{ course: Course; onDelete: (id: string) => void }> = ({ course, onDelete }) => {
  const navigate = useNavigate();
  return (
    <MotionDiv 
      layout
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group hover:border-primary-300"
    >
      <div className="h-40 overflow-hidden relative">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${course.published ? 'bg-primary-500 text-white' : 'bg-gray-500 text-white'}`}>
            {course.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-3">
           <span className="flex items-center"><Users size={14} className="mr-1 text-primary-500" /> {course.enrolledStudents || 0}</span>
           <span className="flex items-center"><Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" /> {course.averageRating?.toFixed(1) || '0.0'}</span>
           <span className="flex items-center font-bold text-green-600 ml-auto">{formatPrice(course.price)}</span>
        </div>

        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             size="sm" 
             className="flex-1 text-xs border-gray-200" 
             onClick={() => navigate(`/admin/course-builder?courseId=${course.id}`)}
           >
              Edit
           </Button>
           <Button 
             variant="secondary" 
             size="sm" 
             className="flex-1 text-xs border-gray-200"
             onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/admin/analytics?courseId=${course.id}`);
             }}
           >
              <BarChart2 size={14} className="mr-1" /> Analytics
           </Button>
           <Button 
             variant="danger" 
             size="sm" 
             className="px-3" 
             onClick={(e) => {
                 e.stopPropagation();
                 onDelete(course.id);
             }}
             title="Delete Course"
           >
              <Trash2 size={16} />
           </Button>
        </div>
      </div>
    </MotionDiv>
  );
};
