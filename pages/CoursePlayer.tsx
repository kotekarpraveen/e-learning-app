
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, Pause, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Loader2, AlertTriangle, Circle, Volume2,
  BookOpen, Headphones, Clock, XCircle, Award, PanelLeftClose, PanelLeftOpen, Menu,
  ExternalLink, Maximize2, File, MessageSquare, Check, ArrowLeft, User, RotateCcw, X
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

// --- Mobile Optimized Quiz Player Component ---
const QuizPlayer = ({ 
    lessonId, 
    lessonTitle,
    contentData, 
    onComplete, 
    isCompleted, 
    onBack,
    isMobile 
}: { 
    lessonId: string, 
    lessonTitle?: string,
    contentData: any, 
    onComplete: (id: string) => void, 
    isCompleted: boolean, 
    onBack?: () => void,
    isMobile: boolean
}) => {
    const { user } = useAuth();
    // 1. Data Safety & Initialization
    const questions = contentData?.questions || [];
    const timeLimitMinutes = contentData?.timeLimit || 30; 
    
    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(isCompleted);
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(1);
    const MAX_ATTEMPTS = 3;

    // Timer Logic
    useEffect(() => {
        if (!isSubmitted && timeLeft > 0 && questions.length > 0) {
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
    }, [timeLeft, isSubmitted, questions.length]);

    // Format HH : MM : SS
    const formatTimeFull = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h < 10 ? '0' : ''}${h} : ${m < 10 ? '0' : ''}${m} : ${s < 10 ? '0' : ''}${s}`;
    };

    // Handlers
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

    const handleRetry = () => {
        if (attempts >= MAX_ATTEMPTS) return;
        setAttempts(prev => prev + 1);
        setUserAnswers({});
        setIsSubmitted(false);
        setScore(0);
        setTimeLeft(timeLimitMinutes * 60);
        setCurrentQuestionIndex(0);
    };

    // --- GUARD CLAUSE: Empty Data ---
    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-200">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz content unavailable</h3>
                <p className="text-gray-500">Please contact support or try again later.</p>
            </div>
        );
    }

    // --- GUARD CLAUSE: Invalid Index ---
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Error loading question {currentQuestionIndex + 1}.</p>
                <Button onClick={() => setCurrentQuestionIndex(0)} className="mt-4">Reset</Button>
            </div>
        );
    }

    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;
    
    // Circular Progress Calc
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = answeredCount / totalQuestions;
    const strokeDashoffset = circumference - progress * circumference;

    const CircularProgress = () => (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-40 md:h-40">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="#f3f4f6" // gray-100
                    strokeWidth="12"
                    fill="transparent"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="#1f2937" // gray-900
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    {answeredCount}<span className="text-gray-400 text-lg md:text-xl">/{totalQuestions}</span>
                </span>
            </div>
        </div>
    );

    // Mobile Container Logic
    const containerClasses = isMobile 
        ? "fixed inset-0 z-50 bg-white flex flex-col h-full w-full"
        : "w-full max-w-5xl mx-auto py-2 md:py-4 px-2 h-full flex flex-col";

    const cardClasses = isMobile
        ? "flex-1 flex flex-col relative overflow-hidden bg-white" // No rounding on mobile full screen
        : "bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-200 p-6 md:p-12 flex-1 flex flex-col relative overflow-hidden";

    return (
        <div className={containerClasses}>
            
            {/* Mobile Header (Close Button) */}
            {isMobile && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 flex items-center p-2 -ml-2">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{lessonTitle || "Quiz"}</h1>
                    <Button size="sm" variant="ghost" onClick={onBack} className="text-xs">Done</Button>
                </div>
            )}

            {/* Main Card Container */}
            <div className={cardClasses}>
                
                {/* 1. Quiz Header: Timer & Submit (Fixed at top inside card) */}
                <div className={`flex justify-between items-start border-b border-gray-50 shrink-0 ${isMobile ? 'p-4 pb-4' : 'mb-6 md:mb-10 pb-6'}`}>
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="mt-1">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-gray-900" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time remaining</p>
                            <p className="text-xl md:text-2xl font-mono font-bold text-gray-900 tracking-wider">
                                {formatTimeFull(timeLeft)}
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitted}
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-6 md:px-8 py-2 md:py-3 font-bold text-sm shadow-lg shadow-gray-900/20"
                    >
                        Submit
                    </Button>
                </div>

                {/* 2. Middle Content: Question & Progress (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isSubmitted ? (
                        <div className="flex flex-col items-center justify-center min-h-full py-10 animate-in fade-in zoom-in duration-300">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${score === questions.length ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                <Award size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                            <p className="text-xl text-gray-500 mb-8">
                                Score: <span className="font-bold text-gray-900">{score}</span> / {questions.length}
                            </p>
                            
                            {attempts < MAX_ATTEMPTS ? (
                                <div className="space-y-4 text-center">
                                    <Button onClick={handleRetry} className="bg-primary-600 hover:bg-primary-700 text-white px-8">
                                        <RotateCcw size={16} className="mr-2" /> Retry Quiz
                                    </Button>
                                    <p className="text-sm text-gray-400">Attempt {attempts} of {MAX_ATTEMPTS}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-red-500 font-bold">Maximum attempts reached.</p>
                            )}
                        </div>
                    ) : (
                        <div className={`flex flex-col ${isMobile ? 'px-4 pb-4' : 'md:flex-row gap-8 md:gap-12'}`}>
                            
                            {/* Left: Questions */}
                            <div className="flex-1 flex flex-col">
                                <div className="mb-6 md:mb-8">
                                    <p className="text-sm font-bold text-gray-500 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
                                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 leading-relaxed">
                                        {currentQ.question}
                                    </h2>
                                </div>

                                {/* Mobile Progress - Inserted between Question and Options */}
                                <div className="md:hidden flex justify-center mb-8 shrink-0">
                                     <CircularProgress />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {currentQ.options.map((opt: string, oIdx: number) => {
                                        const isSelected = userAnswers[currentQuestionIndex] === oIdx;
                                        const labels = ['A', 'B', 'C', 'D', 'E'];
                                        return (
                                            <div 
                                                key={oIdx} 
                                                onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
                                                className={`
                                                    flex items-center p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative
                                                    ${isSelected 
                                                        ? 'border-green-500 bg-green-50 shadow-md shadow-green-100/50' 
                                                        : 'border-gray-100 hover:border-gray-300 bg-white hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <span className={`text-xs font-bold mr-4 w-6 ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>{labels[oIdx]}.</span>
                                                <span className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Progress Circle (Desktop Only placement) */}
                            <div className="hidden md:flex flex-col items-center justify-center w-48 shrink-0 border-l border-gray-50 pl-8">
                                <CircularProgress />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Footer: Pagination (Fixed at bottom) */}
                {!isSubmitted && (
                    <div className={`border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-white ${isMobile ? 'p-4' : 'mt-auto pt-6'}`}>
                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 md:px-6 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white min-w-[80px] md:min-w-[100px]"
                        >
                            Prev
                        </button>
                        
                        <div className="flex overflow-x-auto gap-2 justify-start md:justify-center flex-1 px-2 scrollbar-hide mask-linear-fade">
                            {questions.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`w-10 h-10 flex-shrink-0 rounded-lg text-sm font-bold transition-all shadow-sm ${
                                        currentQuestionIndex === idx 
                                        ? 'bg-gray-900 text-white shadow-gray-900/20 scale-110' 
                                        : userAnswers[idx] !== undefined 
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="px-4 md:px-6 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white min-w-[80px] md:min-w-[100px]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeMobileTab, setActiveMobileTab] = useState<'content' | 'discussion'>('content');
  
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
  const MotionDiv = motion.div as any;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if(mediaRef.current) mediaRef.current.currentTime = 0;
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

  const toggleMedia = () => {
    if(!mediaRef.current) return;
    if (isPlaying) mediaRef.current.pause();
    else mediaRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if(!mediaRef.current) return;
    const current = mediaRef.current.currentTime;
    const dur = mediaRef.current.duration || 1;
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
          <div className={`bg-black overflow-hidden shadow-lg w-full relative ${isMobile ? 'aspect-video rounded-none' : 'aspect-video rounded-xl'}`}>
             <iframe 
                width="100%" height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&controls=1&origin=${window.location.origin}`} 
                title="Video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="absolute inset-0"
             ></iframe>
          </div>
        );
      case 'reading':
        const url = currentLesson.contentUrl || '';
        const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('pdf');
        const isWord = url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc');
        const isOffice = isWord || url.toLowerCase().endsWith('.pptx') || url.toLowerCase().endsWith('.xlsx');
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

        return (
          <div className={`space-y-4 max-w-5xl mx-auto h-full flex flex-col ${isMobile ? 'h-auto min-h-[50vh]' : ''}`}>
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                      <FileText size={20} />
                   </div>
                   <div>
                      <h2 className="font-bold text-gray-900 leading-none truncate max-w-[150px] md:max-w-md">{currentLesson.title}</h2>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                        {isWord ? 'Word' : isPdf ? 'PDF' : 'Reading'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {url && (
                      <a href={url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Open in New Tab">
                         <ExternalLink size={18} />
                      </a>
                   )}
                </div>
             </div>

             <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative min-h-[300px]">
                {isPdf ? (
                   <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full flex-1 border-none" title="PDF Content" />
                ) : isOffice ? (
                    <iframe src={officeViewerUrl} className="w-full flex-1 border-none" title="Word Content" frameBorder="0" />
                ) : (
                   <div className="p-6 md:p-10 prose prose-lg max-w-none overflow-y-auto custom-scrollbar">
                      {currentLesson.contentData?.text ? (
                          <div dangerouslySetInnerHTML={{ __html: currentLesson.contentData.text }} />
                      ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><File className="text-gray-400" size={32} /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h3>
                            <p className="text-gray-500 max-w-sm mb-6">{currentLesson.contentData?.description || "Content available for download."}</p>
                            {url && <Button onClick={() => window.open(url, '_blank')} variant="secondary"><Download size={18} className="mr-2" /> Download</Button>}
                          </div>
                      )}
                   </div>
                )}
             </div>
          </div>
        );
      case 'jupyter':
        return <NotebookRenderer notebook={currentLesson.contentData} />;
      case 'quiz':
        return (
            <QuizPlayer 
                lessonId={currentLesson.id} 
                lessonTitle={currentLesson.title}
                contentData={currentLesson.contentData} 
                onComplete={toggleComplete} 
                isCompleted={completedLessonIds.has(currentLesson.id)}
                onBack={() => {
                    // Navigate back logic: 
                    // On mobile, this closes the full-screen quiz overlay (by clearing active lesson)
                    // On desktop, it goes to dashboard (or course root)
                    if(isMobile) setCurrentLesson(null);
                    else navigate('/dashboard');
                }}
                isMobile={isMobile}
            />
        );
      case 'podcast':
        return (
          <div className="max-w-3xl mx-auto w-full">
             {/* Use video tag to support both audio and video formats as source, but hide visual */}
             <video 
                ref={mediaRef} 
                src={currentLesson.contentUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} 
                className="hidden" 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={() => setIsPlaying(false)} 
                playsInline
             />
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-900 h-48 md:h-64 relative flex items-center justify-center">
                   <div className="text-center px-6">
                      <Mic className="text-primary-400 mx-auto mb-4" size={48} />
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{currentLesson.title}</h2>
                   </div>
                </div>
                <div className="p-6 md:p-8">
                   <div className="space-y-6">
                      <input type="range" min="0" max="100" value={audioProgress} onChange={(e) => {
                          if(mediaRef.current) mediaRef.current.currentTime = (Number(e.target.value) / 100) * audioDuration;
                      }} className="w-full accent-primary-500" />
                      <div className="flex justify-between text-xs text-gray-500 font-mono">
                         <span>{formatTime(audioCurrentTime)}</span>
                         <span>{formatTime(audioDuration)}</span>
                      </div>
                      <div className="flex justify-center gap-8">
                         <button onClick={toggleMedia} className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. CURRICULUM SIDEBAR (Desktop: Left, Mobile: Bottom via Flex Order) */}
      <MotionDiv 
        initial={false}
        animate={!isMobile ? { width: sidebarExpanded ? 340 : 0 } : {}}
        className={`
            bg-white border-r border-gray-200 relative z-40 flex flex-col
            ${isMobile ? 'order-2 w-full flex-1 border-t border-gray-200 min-h-0' : 'order-1 h-full overflow-hidden border-r'}
            ${!isMobile && !sidebarExpanded ? 'border-none' : ''}
        `}
      >
        {/* Mobile Tabs */}
        <div className="lg:hidden flex border-b border-gray-100 bg-white shrink-0 sticky top-0 z-10">
            <button 
                onClick={() => setActiveMobileTab('content')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeMobileTab === 'content' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent'}`}
            >
                Course Content
            </button>
            <button 
                onClick={() => setActiveMobileTab('discussion')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeMobileTab === 'discussion' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent'}`}
            >
                Discussion
            </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            {(!isMobile || activeMobileTab === 'content') && (
                <>
                    {/* Desktop Sidebar Header */}
                    {!isMobile && (
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between min-w-[340px]">
                            <button onClick={() => navigate('/dashboard')} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900">
                                <ChevronLeft size={16} className="mr-1" /> BACK
                            </button>
                            <button onClick={() => setSidebarExpanded(false)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                <PanelLeftClose size={20} />
                            </button>
                        </div>
                    )}

                    {/* Modules List */}
                    <div className={`${!isMobile ? 'min-w-[340px]' : 'w-full'}`}>
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
                </>
            )}

            {isMobile && activeMobileTab === 'discussion' && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <MessageSquare size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Discussion forum is coming soon.</p>
                </div>
            )}
        </div>
      </MotionDiv>

      {/* 2. MAIN PLAYER AREA (Desktop: Right, Mobile: Top via Flex Order) */}
      <div className={`
          flex flex-col bg-gray-50 relative 
          ${isMobile 
            ? 'order-1 w-full ' + (currentLesson ? ((currentLesson.type === 'video' || currentLesson.type === 'podcast') ? 'flex-none' : 'flex-1 h-[60vh]') : 'hidden')
            : 'order-2 flex-1 h-full overflow-hidden'
          }
          ${isMobile && currentLesson?.type === 'quiz' ? '!fixed !inset-0 !z-50 !h-full !w-full' : ''} 
      `}>
        {/* Only show standard header if NOT in full screen quiz mode */}
        {!(isMobile && currentLesson?.type === 'quiz') && (
            <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
            <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                {/* On Desktop, show expand button. On Mobile, show Back button directly in header */}
                {isMobile ? (
                    <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
                        <ChevronLeft size={24} />
                    </button>
                ) : !sidebarExpanded ? (
                    <button onClick={() => setSidebarExpanded(true)} className="p-2 text-gray-500 hover:text-primary-600">
                    <Menu size={20} />
                    </button>
                ) : null}
                
                <h1 className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">{course?.title}</h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => toggleComplete(currentLesson?.id || '')} className="text-xs px-3">
                    {completedLessonIds.has(currentLesson?.id || '') ? (isMobile ? 'Done' : 'Mark Incomplete') : (isMobile ? 'Complete' : 'Mark as Done')}
                </Button>
            </div>
            </header>
        )}
        
        {/* Content Container */}
        <main className={`overflow-y-auto custom-scrollbar ${isMobile && currentLesson?.type !== 'quiz' ? 'p-0 bg-black flex-1' : 'p-0 lg:p-10 flex-1'}`}>
           <div className="max-w-6xl mx-auto h-full">
              <AnimatePresence mode="wait">
                <MotionDiv 
                  key={currentLesson?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
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
