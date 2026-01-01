
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Loader2, AlertTriangle, Circle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';

// Mock Component for Jupyter
const JupyterCell = () => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput("Result: [1, 1, 2, 3, 5, 8, 13, 21]");
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden font-mono text-sm bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-gray-500">In [1]:</span>
        <Button size="sm" variant="secondary" onClick={runCode} isLoading={isRunning} className="text-xs h-7 px-2">
          <Play size={12} className="mr-1" /> Run
        </Button>
      </div>
      <div className="p-4 bg-gray-50/30">
        <div className="text-green-600">def fibonacci(n):</div>
        <div className="pl-4 text-gray-800">if n &lt;= 0: return []</div>
        <div className="pl-4 text-gray-800">elif n == 1: return [0]</div>
        <div className="pl-4 text-gray-800"># ... implementation</div>
        <div className="text-gray-800 mt-2">print(fibonacci(8))</div>
      </div>
      <AnimatePresence>
        {output && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-200 bg-white p-4"
          >
            <span className="text-red-500 mr-2">Out [1]:</span>
            {output}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
        if (!courseId) return;
        setLoading(true);
        
        // 1. Fetch Course Data
        const data = await api.getCourseById(courseId);
        
        // 2. Fetch User Progress if logged in
        if (data && user) {
            const completedIds = await api.getCompletedLessons(user.id);
            setCompletedLessonIds(new Set(completedIds));
        }

        if (data) {
            setCourse(data);
            const firstLesson = data.modules?.[0]?.lessons?.[0];
            if (firstLesson) setCurrentLesson(firstLesson);
        }
        setLoading(false);
    };
    fetchCourseAndProgress();
  }, [courseId, user]);

  const toggleComplete = async (lessonId: string) => {
      if (!user) return;
      
      const isComplete = completedLessonIds.has(lessonId);
      const newStatus = !isComplete;
      
      // Optimistic Update
      const newSet = new Set(completedLessonIds);
      if (newStatus) newSet.add(lessonId);
      else newSet.delete(lessonId);
      setCompletedLessonIds(newSet);

      // API Call
      await api.toggleLessonCompletion(user.id, lessonId, newStatus);
  };

  // Flatten lessons for easy navigation
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play size={16} />;
      case 'reading': return <FileText size={16} />;
      case 'quiz': return <HelpCircle size={16} />;
      case 'jupyter': return <Terminal size={16} />;
      case 'podcast': return <Mic size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const renderContent = () => {
    if (!currentLesson) return <div className="p-8 text-center text-gray-500">Select a lesson to start</div>;

    switch (currentLesson.type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
             <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${currentLesson.contentUrl}?modestbranding=1&rel=0`} 
                title="Video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
             ></iframe>
          </div>
        );
      case 'jupyter':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Code Practice: {currentLesson.title}</h2>
                <p className="text-gray-600 mb-6">Use this Jupyter Notebook environment to practice your code. Execute the blocks to verify your solutions.</p>
                <JupyterCell />
                <JupyterCell />
             </div>
          </div>
        );
      case 'quiz':
         return (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
             <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
             <div className="space-y-4">
               <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
                 <div className="font-medium mb-2">What is the primary purpose of React?</div>
                 <div className="text-sm text-gray-500">Select one answer</div>
               </div>
               <Button className="w-full mt-4" onClick={() => toggleComplete(currentLesson.id)}>Submit Answer & Complete</Button>
             </div>
           </div>
         );
      default:
        return (
          <div className="prose max-w-none bg-white p-8 rounded-xl shadow-sm">
            <h1>{currentLesson.title}</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        );
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
      );
  }

  if (!course) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <AlertTriangle className="text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      );
  }

  const progress = Math.round((completedLessonIds.size / allLessons.length) * 100) || 0;

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 lg:-m-8">
      {/* Player Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarExpanded ? 320 : 0, opacity: sidebarExpanded ? 1 : 0 }}
        className="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0 relative"
      >
        <div className="h-full overflow-y-auto w-80">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">{course.title}</h2>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
               <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% Complete</p>
          </div>
          
          <div className="p-2">
            {course.modules.map((module, mIdx) => (
              <div key={module.id} className="mb-4">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Module {mIdx + 1}: {module.title}
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isActive = currentLesson && lesson.id === currentLesson.id;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`mr-3 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                          {isCompleted ? <CheckCircle size={16} /> : getIcon(lesson.type)}
                        </span>
                        <span className="truncate flex-1">{lesson.title}</span>
                        <span className="text-xs text-gray-400 ml-2">{lesson.duration}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           <div className="max-w-5xl mx-auto">
             <div className="flex items-center justify-between mb-6">
               <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                 <ChevronLeft size={16} className="mr-1" /> Back to Course
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                 {sidebarExpanded ? 'Hide Sidebar' : 'Show Sidebar'}
               </Button>
             </div>
             
             <motion.div
               key={currentLesson?.id || 'loading'}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
             >
                {renderContent()}
             </motion.div>
           </div>
        </div>
        
        {/* Player Footer */}
        <div className="h-16 bg-white border-t border-gray-200 px-8 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
                 <Button 
                    variant="ghost" 
                    disabled={!currentLesson || allLessons.indexOf(currentLesson) === 0}
                    onClick={() => {
                        if (currentLesson) {
                            const idx = allLessons.indexOf(currentLesson);
                            if (idx > 0) setCurrentLesson(allLessons[idx - 1]);
                        }
                    }}
                >
                Previous
                </Button>
                
                {currentLesson && (
                    <button 
                        onClick={() => toggleComplete(currentLesson.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            completedLessonIds.has(currentLesson.id)
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {completedLessonIds.has(currentLesson.id) ? (
                            <><CheckCircle size={16} /> <span>Completed</span></>
                        ) : (
                            <><Circle size={16} /> <span>Mark as Complete</span></>
                        )}
                    </button>
                )}
            </div>

            <Button 
              variant="primary" 
              icon={<ChevronRight size={16} />} 
              className="flex-row-reverse"
              disabled={!currentLesson || allLessons.indexOf(currentLesson) === allLessons.length - 1}
              onClick={() => {
                if (currentLesson) {
                    const idx = allLessons.indexOf(currentLesson);
                    if (idx < allLessons.length - 1) {
                         // Auto complete when moving next? Optional. 
                         // toggleComplete(currentLesson.id); 
                         setCurrentLesson(allLessons[idx + 1]);
                    }
                }
              }}
            >
               Next Lesson
            </Button>
        </div>
      </div>
    </div>
  );
};
