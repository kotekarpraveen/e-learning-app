
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, Pause, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Loader2, AlertTriangle, Circle, Volume2,
  BookOpen, Headphones, Clock, XCircle, Award, PanelLeftClose, PanelLeftOpen, Menu
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';

// Mock Component for Jupyter
const JupyterCell = ({ starterCode }: { starterCode?: string }) => {
  const [output, setOutput] = useState<string | null>(null);
  const [code, setCode] = useState(starterCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const MotionDiv = motion.div as any;

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput("Result: Success (Simulation)");
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
      <div className="p-0">
        <textarea 
            className="w-full p-4 bg-gray-50/30 font-mono text-gray-800 focus:outline-none resize-y min-h-[100px]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <AnimatePresence>
        {output && (
          <MotionDiv 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-200 bg-white p-4"
          >
            <span className="text-green-600 mr-2">Out [1]:</span>
            {output}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

// Multi-cell Notebook Renderer
const NotebookRenderer = ({ notebook }: { notebook: any }) => {
  const cells = notebook?.cells || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
       <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-bold flex items-center text-gray-800">
             <Terminal className="mr-2 text-orange-500" /> Jupyter Notebook
          </h2>
       </div>
       
       {cells.map((cell: any, idx: number) => (
          <div key={idx} className="mb-6 last:mb-0">
             {cell.cell_type === 'markdown' ? (
                <div className="prose prose-sm max-w-none p-4 bg-transparent">
                   {Array.isArray(cell.source) ? cell.source.join('').split('\n').map((line:string, i:number) => (
                      <p key={i} className="min-h-[1em] my-1">{line}</p>
                   )) : <p>{cell.source}</p>}
                </div>
             ) : (
                <div className="pl-2">
                    <JupyterCell starterCode={Array.isArray(cell.source) ? cell.source.join('') : cell.source} />
                </div>
             )}
          </div>
       ))}
       
       {cells.length === 0 && (
           <p className="text-gray-500 italic text-center py-8">Empty notebook.</p>
       )}
    </div>
  );
};

// Quiz Player Component
const QuizPlayer = ({ lessonId, contentData, onComplete, isCompleted }: { lessonId: string, contentData: any, onComplete: (id: string) => void, isCompleted: boolean }) => {
    const questions = contentData?.questions || [];
    const timeLimitMinutes = contentData?.timeLimit || 0;
    
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(isCompleted);
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (timeLimitMinutes > 0 && !isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isSubmitted, timeLimitMinutes]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionSelect = (qIdx: number, oIdx: number) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    };

    const handleSubmit = () => {
        if (isSubmitted) return;
        let correctCount = 0;
        questions.forEach((q: any, idx: number) => {
            if (userAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setIsSubmitted(true);
        onComplete(lessonId);
    };

    const answeredCount = Object.keys(userAnswers).length;
    const allAnswered = answeredCount === questions.length;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 relative">
            {timeLimitMinutes > 0 && !isSubmitted && (
                <div className={`sticky top-0 z-10 -mx-8 -mt-8 px-8 py-3 mb-6 flex justify-between items-center shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-800'}`}>
                    <div className="flex items-center font-bold">
                        <Clock size={18} className="mr-2" />
                        Time Remaining: {formatTime(timeLeft)}
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Knowledge Check</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{questions.length} Questions</span>
            </div>
            {isSubmitted ? (
                <div className="text-center py-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score === questions.length ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {score === questions.length ? <CheckCircle size={40} /> : <Award size={40} />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
                    <p className="text-lg text-gray-600 mb-6">You scored {score} / {questions.length}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {questions.map((q: any, i: number) => (
                        <div key={i} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                            <p className="font-medium text-gray-800 text-lg">{i + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt: string, optIdx: number) => (
                                    <div 
                                        key={optIdx} 
                                        onClick={() => handleOptionSelect(i, optIdx)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-center group ${
                                            userAnswers[i] === optIdx ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                                            userAnswers[i] === optIdx ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                                        }`}>
                                            {userAnswers[i] === optIdx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-gray-600">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <Button className="w-full mt-8" onClick={handleSubmit} disabled={!allAnswered}>
                        Submit Answers
                    </Button>
                </div>
            )}
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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
  const MotionDiv = motion.div as any;

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
        if (!courseId) return;
        setLoading(true);
        const data = await api.getCourseById(courseId);
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

  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    if(audioRef.current) audioRef.current.currentTime = 0;
  }, [currentLesson]);

  const toggleComplete = async (lessonId: string) => {
      if (!user) return;
      const isComplete = completedLessonIds.has(lessonId);
      const newSet = new Set(completedLessonIds);
      if (!isComplete) newSet.add(lessonId);
      else newSet.delete(lessonId);
      setCompletedLessonIds(newSet);
      await api.toggleLessonCompletion(user.id, lessonId, !isComplete);
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if(!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setAudioCurrentTime(current);
    setAudioDuration(dur);
    setAudioProgress((current / dur) * 100);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getYoutubeId = (url: string | undefined) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

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
        const videoId = getYoutubeId(currentLesson.contentUrl);
        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
             <iframe 
                width="100%" height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`} 
                title="Video player" frameBorder="0" allowFullScreen
             ></iframe>
          </div>
        );
      case 'reading':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm prose prose-lg max-w-none">
             <h1 className="text-3xl font-bold mb-6">{currentLesson.title}</h1>
             <p className="text-gray-600 leading-relaxed">Lesson content goes here. If this was a real file URL, we would render a PDF viewer or markdown.</p>
          </div>
        );
      case 'jupyter':
        return <NotebookRenderer notebook={currentLesson.contentData} />;
      case 'quiz':
        return <QuizPlayer lessonId={currentLesson.id} contentData={currentLesson.contentData} onComplete={toggleComplete} isCompleted={completedLessonIds.has(currentLesson.id)} />;
      case 'podcast':
        return (
          <div className="max-w-3xl mx-auto">
             <audio ref={audioRef} src={currentLesson.contentUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-900 h-64 relative flex items-center justify-center">
                   <div className="text-center px-6">
                      <Mic className="text-primary-400 mx-auto mb-4" size={48} />
                      <h2 className="text-2xl font-bold text-white mb-1">{currentLesson.title}</h2>
                   </div>
                </div>
                <div className="p-8">
                   <div className="space-y-6">
                      <input type="range" min="0" max="100" value={audioProgress} onChange={(e) => {
                          if(audioRef.current) audioRef.current.currentTime = (Number(e.target.value) / 100) * audioDuration;
                      }} className="w-full accent-primary-500" />
                      <div className="flex justify-between text-xs text-gray-500 font-mono">
                         <span>{formatTime(audioCurrentTime)}</span>
                         <span>{formatTime(audioDuration)}</span>
                      </div>
                      <div className="flex justify-center gap-8">
                         <button onClick={toggleAudio} className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden -m-4 lg:-m-8">
      {/* Sidebar Overlay (Mobile) */}
      {!sidebarExpanded && (
        <button 
          onClick={() => setSidebarExpanded(true)}
          className="fixed left-4 bottom-4 z-50 p-3 bg-primary-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
        >
          <PanelLeftOpen size={20} />
          <span className="text-xs font-bold mr-1">Curriculum</span>
        </button>
      )}

      {/* Course Sidebar */}
      <MotionDiv 
        initial={false}
        animate={{ width: sidebarExpanded ? 340 : 0 }}
        className="bg-white border-r border-gray-200 h-full flex flex-col relative z-40 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between min-w-[340px]">
           <button onClick={() => navigate('/dashboard')} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900">
              <ChevronLeft size={16} className="mr-1" /> BACK
           </button>
           <button onClick={() => setSidebarExpanded(false)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              <PanelLeftClose size={20} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto min-w-[340px] custom-scrollbar">
           {course?.modules.map((module, mIdx) => (
              <div key={module.id} className="border-b border-gray-50">
                 <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Module {mIdx + 1}</span>
                 </div>
                 <div className="p-2 space-y-1">
                    {module.lessons.map((lesson) => (
                       <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                             currentLesson?.id === lesson.id ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100 shadow-sm' : 'hover:bg-gray-50 text-gray-600'
                          }`}
                       >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${
                             completedLessonIds.has(lesson.id) ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-gray-200'
                          }`}>
                             {completedLessonIds.has(lesson.id) ? <CheckCircle size={14} /> : getIcon(lesson.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold truncate">{lesson.title}</p>
                             <p className="text-[10px] text-gray-400 font-medium uppercase">{lesson.type} • {lesson.duration || '5:00'}</p>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      </MotionDiv>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30">
           <div className="flex items-center gap-4">
              {!sidebarExpanded && (
                <button onClick={() => setSidebarExpanded(true)} className="p-2 text-gray-500 hover:text-primary-600">
                  <Menu size={20} />
                </button>
              )}
              <h1 className="font-bold text-gray-900 truncate max-w-md">{course?.title}</h1>
           </div>
           <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={() => toggleComplete(currentLesson?.id || '')}>
                 {completedLessonIds.has(currentLesson?.id || '') ? 'Mark Incomplete' : 'Mark as Done'}
              </Button>
           </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
           <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                <MotionDiv 
                  key={currentLesson?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                   {renderContent()}
                </MotionDiv>
              </AnimatePresence>
           </div>
        </main>
      </div>
    </div>
  );
};
