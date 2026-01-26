
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, User as UserIcon, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Course } from '../types';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/currency';

export const BrowseCourses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  // Intersection Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCourseElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isFetching, hasMore]);

  const MotionDiv = motion.div as any;

  const categories = ['All', 'Development', 'Design', 'Data Science', 'Business'];

  // Reset pagination when filters change
  useEffect(() => {
    setCourses([]);
    setPage(1);
    setHasMore(true);
  }, [searchTerm, selectedCategory]);

  // Fetch Courses Effect
  useEffect(() => {
    const loadCourses = async () => {
      setIsFetching(true);
      const limit = 6; // Items per page
      
      const data = await api.getCourses({
          page: page,
          limit: limit,
          search: searchTerm,
          category: selectedCategory
      });

      setCourses(prev => {
          // If page 1, replace. Else append.
          return page === 1 ? data : [...prev, ...data];
      });
      
      setHasMore(data.length === limit);
      setIsFetching(false);
    };

    // Debounce search a bit if desired, but here we just run it.
    const timer = setTimeout(() => {
        loadCourses();
    }, 300); // 300ms debounce for typing

    return () => clearTimeout(timer);
  }, [page, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl" />
        <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Courses</h1>
            <p className="text-gray-600 max-w-2xl">Discover new skills with our premium course catalog. From coding to design, find the perfect course to advance your career.</p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for Python, React, Design..." 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Mobile Category Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === cat 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
            // Attach ref to the last element
            const isLast = index === courses.length - 1;
            
            return (
            <MotionDiv
                ref={isLast ? lastCourseElementRef : null}
                key={`${course.id}-${index}`} // Ensure unique key if items somehow duplicate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} // Reduced staggering for infinite scroll smoothness
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                        {course.category}
                    </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{course.description}</p>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                        <div className="flex items-center">
                            <UserIcon size={14} className="mr-1" />
                            {course.instructor}
                        </div>
                        <div className="flex items-center">
                            <Star size={14} className="mr-1 text-yellow-400 fill-yellow-400" />
                            4.8
                        </div>
                        <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {course.totalModules * 2}h
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                        <span className="text-lg font-bold text-primary-600">
                            {course.price === 0 ? 'Free' : formatPrice(course.price)}
                        </span>
                        <Button 
                            size="sm" 
                            onClick={() => navigate(`/course/${course.id}/details`)}
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            </MotionDiv>
            );
        })}
      </div>

      {/* Loading & Empty States */}
      <div className="w-full py-8 flex justify-center">
          {isFetching && <Loader2 className="animate-spin text-primary-600" size={32} />}
          {!isFetching && courses.length === 0 && (
                <div className="text-center py-10">
                    <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                </div>
          )}
          {!isFetching && courses.length > 0 && !hasMore && (
              <p className="text-sm text-gray-400 italic">You've reached the end of the list.</p>
          )}
      </div>
    </div>
  );
};
