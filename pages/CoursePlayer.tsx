import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, Pause, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Loader2, AlertTriangle, Circle, Volume2,
  BookOpen, Headphones
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';

// Mock Component for Jupyter
const JupyterCell = () => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const MotionDiv = motion.div as any;

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
          <MotionDiv 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-200 bg-white p-4"
          >
            <span className="text-red-500 mr-2">Out [1]:</span>
            {output}
          </MotionDiv>
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
  const [isPlaying, setIsPlaying] = useState(false);
  
  // New State for Sidebar Tabs (Curriculum vs Audio)
  const [sidebarTab, setSidebarTab] = useState<'curriculum' | 'audio'>('curriculum');
  
  const MotionDiv = motion.div as any;

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
      case 'podcast':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
             {/* Podcast Player UI */}
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Header / Visualization */}
                <div className="bg-gray-900 h-64 relative flex items-center justify-center overflow-hidden">
                   {/* Abstract Background */}
                   <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-gray-900 opacity-90"></div>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   
                   {/* Animated Waveform (Fake) */}
                   <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
                      {[...Array(30)].map((_, i) => (
                          <MotionDiv 
                             key={i}
                             animate={isPlaying ? { height: [20, Math.random() * 100 + 20, 20] } : { height: 20 }}
                             transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                             className="w-2 bg-primary-400 rounded-t-full"
                          />
                      ))}
                   </div>
                   
                   <div className="relative z-10 text-center px-6 flex flex-col items-center">
                      <MotionDiv 
                        animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-lg"
                      >
                          <Mic className="text-white" size={32} />
                      </MotionDiv>
                      <h2 className="text-2xl font-bold text-white mb-1">{currentLesson.title}</h2>
                      <p className="text-primary-200 text-sm font-medium tracking-wide uppercase">Audio Episode • {currentLesson.duration || '15:00'}</p>
                   </div>
                </div>

                {/* Player Controls */}
                <div className="p-8">
                   <div className="space-y-6">
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 cursor-pointer group relative">
                         <div className="bg-primary-500 h-full w-1/3 rounded-full relative group-hover:bg-primary-600 transition-colors">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 font-mono font-medium">
                         <span>05:12</span>
                         <span>{currentLesson.duration || '15:00'}</span>
                      </div>

                      {/* Main Buttons */}
                      <div className="flex justify-center items-center gap-8">
                         <button className="text-gray-400 hover:text-primary-600 transition-colors" title="Rewind 10s">
                             <RefreshCw size={24} className="transform -scale-x-100" />
                         </button>
                         <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/40 hover:scale-105 hover:bg-primary-600 transition-all"
                         >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                         </button>
                         <button className="text-gray-400 hover:text-primary-600 transition-colors" title="Forward 10s">
                             <RefreshCw size={24} />
                         </button>
                      </div>
                      
                      <div className="flex justify-center">
                          <button className="flex items-center text-xs font-bold text-gray-400 hover:text-primary-600 uppercase tracking-wide px-3 py-1 rounded-full border border-gray-100 hover:border-primary-100 transition-colors">
                              <Volume2 size={14} className="mr-1.5" /> 1x Speed
                          </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Show Notes */}
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                   <FileText size={18} className="mr-2 text-primary-500" /> 
                   Episode Notes
                </h3>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                   <p className="mb-4">In this episode, we dive deep into the core concepts discussed in Module {course?.modules.findIndex(m => m.lessons.includes(currentLesson!))! + 1}. Listen to this while commuting or taking a break from the screen to reinforce your learning.</p>
                   <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>Understanding the theoretical underpinnings</li>
                      <li>Real-world usage examples</li>
                      <li>Interview questions related to this topic</li>
                   </ul>
                   <p className="text-xs text-gray-400 italic">Audio source: {currentLesson.contentUrl || 'Hosted internally'}</p>
                </div>
             </div>
          </div>
        );
      case 'jupyter':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Terminal className="mr-2 text-blue-500" />
                    Code Practice: {currentLesson.title}
                </h2>
                <p className="text-gray-600 mb-6">Use this Jupyter Notebook environment to practice your code. Execute the blocks to verify your solutions.</p>
                <JupyterCell />
                <JupyterCell />
             </div>
          </div>
        );
      case 'quiz':
         return (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Knowledge Check</h2>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">3 Questions</span>
             </div>
             <div className="space-y-6">
               <div className="space-y-3">
                   <p className="font-medium text-gray-800 text-lg">1. What is the primary purpose of React?</p>
                   <div className="space-y-2">
                       {['To manage databases', 'To build user interfaces', 'To handle server requests'].map((opt, i) => (
                           <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors flex items-center">
                               <div className="w-5 h-5 rounded-full border border-gray-300 mr-3"></div>
                               <span className="text-gray-600">{opt}</span>
                           </div>
                       ))}
                   </div>
               </div>
               <Button className="w-full mt-4" onClick={() => toggleComplete(currentLesson.id)}>Submit Answer & Complete</Button>
             </div>
           </div>
         );
      default:
        return (
          <div className="prose max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h1>{currentLesson.title}</h1>
            <p className="lead">Read through the material below to prepare for the next quiz.</p>
            <hr className="my-6 border-gray-100"/>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-4 text-blue-800 text-sm">
                <strong>Note:</strong> Make sure to download the attached PDF resources for a cheat sheet on this topic.
            </div>
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
  
  // Filter modules based on active tab
  const displayedModules = sidebarTab === 'audio' 
    ? course.modules.filter(m => m.isPodcast || m.lessons.some(l => l.type === 'podcast'))
    : course.modules;

  // Check if course has podcasts to show the tab at all
  const hasPodcasts = course.modules.some(m => m.isPodcast || m.lessons.some(l => l.type === 'podcast'));

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 lg:-m-8">
      {/* Player Sidebar */}
      <MotionDiv 
        initial={false}
        animate={{ width: sidebarExpanded ? 320 : 0, opacity: sidebarExpanded ? 1 : 0 }}
        className="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0 relative flex flex-col"
      >
        <div className="h-full flex flex-col w-80">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 leading-tight mb-3">{course.title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
               <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{progress}% Complete</p>
          </div>
          
          {/* Sidebar Tabs */}
          {hasPodcasts && (
              <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setSidebarTab('curriculum')}
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        sidebarTab === 'curriculum' 
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-white' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <BookOpen size={14} className="inline mr-1.5 mb-0.5" />
                    Curriculum
                </button>
                <button 
                    onClick={() => setSidebarTab('audio')}
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        sidebarTab === 'audio' 
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Headphones size={14} className="inline mr-1.5 mb-0.5" />
                    Audio Series
                </button>
              </div>
          )}
          
          <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
            {displayedModules.length > 0 ? (
                displayedModules.map((module, mIdx) => (
                <div key={module.id} className="mb-4">
                    <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider mb-1 ${module.id === 'podcast-module' || module.isPodcast ? 'text-purple-600' : 'text-gray-400'}`}>
                    {module.id === 'podcast-module' || module.isPodcast ? '🎙️ Audio Series' : `Module ${mIdx + 1}: ${module.title}`}
                    </div>
                    <div className="space-y-1">
                    {module.lessons
                        // If in audio mode, only show podcasts. If curriculum, show all (or filter out podcasts if you want separation).
                        // For now, Audio Tab = Only Podcasts. Curriculum = Everything.
                        .filter(l => sidebarTab === 'audio' ? l.type === 'podcast' : true)
                        .map((lesson) => {
                            const isActive = currentLesson && lesson.id === currentLesson.id;
                            const isCompleted = completedLessonIds.has(lesson.id);
                            
                            return (
                            <button
                                key={lesson.id}
                                onClick={() => {
                                    setCurrentLesson(lesson);
                                    // Stop audio if switching away from podcast
                                    if (lesson.type !== 'podcast') setIsPlaying(false);
                                }}
                                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all text-left group ${
                                isActive 
                                    ? 'bg-primary-50 text-primary-900 font-medium shadow-sm ring-1 ring-primary-100' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className={`mr-3 ${
                                    isCompleted ? 'text-green-500' : 
                                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                }`}>
                                {isCompleted ? <CheckCircle size={16} /> : getIcon(lesson.type)}
                                </span>
                                <span className="truncate flex-1">{lesson.title}</span>
                                <span className="text-xs text-gray-400 ml-2">{lesson.duration}</span>
                            </button>
                            )
                        })}
                    </div>
                </div>
                ))
            ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                    {sidebarTab === 'audio' ? 'No audio content in this course.' : 'No lessons found.'}
                </div>
            )}
          </div>
        </div>
      </MotionDiv>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
           <div className="max-w-5xl mx-auto">
             <div className="flex items-center justify-between mb-6">
               <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                 <ChevronLeft size={16} className="mr-1" /> Back to Course
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                 {sidebarExpanded ? 'Hide Sidebar' : 'Show Sidebar'}
               </Button>
             </div>
             
             <MotionDiv
               key={currentLesson?.id || 'loading'}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
             >
                {renderContent()}
             </MotionDiv>
           </div>
        </div>
        
        {/* Player Footer */}
        <div className="h-16 bg-white border-t border-gray-200 px-8 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
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