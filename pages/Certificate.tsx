
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { Course } from '../types';
import { CertificateTemplate } from '../components/CertificateTemplate';

export const Certificate: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [date, setDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const fetch = async () => {
        if(courseId) {
            const c = await api.getCourseById(courseId);
            setCourse(c || null);
        }
    }
    fetch();
  }, [courseId]);

  if(!user || !course) return <div className="min-h-screen flex items-center justify-center text-white">Loading Certificate...</div>;

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 md:p-8 font-serif relative overflow-auto">
       {/* Actions Bar */}
       <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 print:hidden">
          <Button variant="secondary" className="bg-white/10 text-white border-none hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate(-1)}>
             <ArrowLeft size={18} className="mr-2" /> Back
          </Button>
          <div className="flex gap-2">
             <Button variant="primary" onClick={handlePrint}>
                <Download size={18} className="mr-2" /> Download PDF
             </Button>
          </div>
       </div>

       {/* Certificate Container */}
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="w-full max-w-5xl shadow-2xl print:shadow-none"
       >
          <CertificateTemplate 
            studentName={user.name}
            courseTitle={course.title}
            instructor={course.instructor}
            date={date}
            verificationId={Math.random().toString(36).substr(2, 9).toUpperCase()}
          />
       </motion.div>
    </div>
  );
};
