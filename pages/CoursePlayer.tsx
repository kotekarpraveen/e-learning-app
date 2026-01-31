
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, Pause, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download, RefreshCw, Loader2, AlertTriangle, Circle, Volume2,
  BookOpen, Headphones, Clock, XCircle, Award, PanelLeftClose, PanelLeftOpen, Menu,
  ExternalLink, Maximize2, File, MessageSquare, Check, ArrowLeft, User, RotateCcw, X, FileCode
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';

// Declare global Pyodide types
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
    pyodide: any;
  }
}

// Singleton Pyodide Loader to prevent re-initializing
let pyodideInstance: any = null;
let pyodideLoadPromise: Promise<any> | null = null;

const initPyodide = async () => {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadPromise) return pyodideLoadPromise;

  pyodideLoadPromise = (async () => {
    if (!window.loadPyodide) {
        // Fallback if script is missing
        console.warn("Pyodide script not loaded in index.html");
        throw new Error("Pyodide runtime not available");
    }
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
    // Load micropip for package installation
    await pyodide.loadPackage("micropip");
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoadPromise;
};

// Real Jupyter Cell with Pyodide Execution
const JupyterCell = ({ starterCode }: { starterCode?: string }) => {
  const [output, setOutput] = useState<string | null>(null);
  const [code, setCode] = useState(starterCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MotionDiv = motion.div as any;

  // Initialize Pyodide on mount
  useEffect(() => {
      const loadRuntime = async () => {
          try {
              setStatusMessage("Initializing Python runtime...");
              await initPyodide();
              setIsPyodideReady(true);
              setStatusMessage("");
          } catch (err) {
              console.error("Pyodide failed to load", err);
              setStatusMessage("Error loading Python runtime.");
          }
      };
      loadRuntime();
  }, []);

  // Update local state if prop changes
  useEffect(() => {
      setCode(starterCode || '');
      setOutput(null);
  }, [starterCode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const runCode = async () => {
    if (!isPyodideReady || !pyodideInstance) return;
    
    setIsRunning(true);
    setOutput(null);
    setStatusMessage("Analyzing code...");

    try {
        // 1. Install packages if imported (Auto-detect)
        await pyodideInstance.loadPackagesFromImports(code);
        
        // 2. Setup Stdout Capture
        let stdoutBuffer = "";
        pyodideInstance.setStdout({ batched: (msg: string) => {
             stdoutBuffer += msg + "\n";
        }});

        setStatusMessage("Running...");
        
        // 3. Execute
        const result = await pyodideInstance.runPythonAsync(code);
        
        // 4. Format Output
        let finalOutput = stdoutBuffer;
        if (result !== undefined) {
            finalOutput += String(result);
        }
        
        setOutput(finalOutput || "Done (No output)");
        setStatusMessage("");
    } catch (err: any) {
        setOutput(String(err));
    } finally {
        setIsRunning(false);
        setStatusMessage("");
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden font-mono text-sm bg-white shadow-sm my-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md group">
      {/* Cell Toolbar */}
      <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-2.5 border-b border-gray-200 flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
            {/* Kernel Indicator */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                isPyodideReady 
                ? 'bg-white border-gray-200 text-gray-700' 
                : 'bg-yellow-50 border-yellow-100 text-yellow-700'
            }`}>
                <span className={`w-2 h-2 rounded-full ${isPyodideReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                Python 3
            </div>
            {/* Status Text */}
            {statusMessage && (
                <span className="text-xs text-gray-500 animate-pulse flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> {statusMessage}
                </span>
            )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-sans hidden sm:inline-block font-medium">Ctrl+Enter to run</span>
            <Button 
                size="sm" 
                variant="secondary" 
                onClick={runCode} 
                disabled={!isPyodideReady || isRunning}
                className={`h-8 px-3 text-xs font-bold border-gray-200 transition-all ${
                    isRunning 
                    ? 'opacity-80' 
                    : 'hover:border-primary-300 hover:text-primary-700 hover:bg-white hover:shadow-sm'
                }`}
            >
            {isRunning ? (
                <>
                    <Loader2 size={12} className="animate-spin mr-1.5" /> Running...
                </>
            ) : (
                <>
                    <Play size={12} className="mr-1.5 fill-current" /> Run Cell
                </>
            )}
            </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-0 relative bg-[#f8fafc] group-focus-within:bg-white transition-colors">
        <textarea 
            ref={textareaRef}
            className="w-full p-4 bg-transparent font-mono text-gray-800 text-[13px] leading-relaxed focus:outline-none resize-none overflow-hidden min-h-[120px]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder={isPyodideReady ? "Write your python code here..." : "Loading Python environment..."}
            onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    runCode();
                }
            }}
        />
        {/* Left Accent Line on Focus */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
      </div>

      {/* Output Area */}
      <AnimatePresence>
        {output && (
          <MotionDiv 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Terminal size={10} /> Console Output
                </span>
                <button onClick={() => setOutput(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-200 rounded">
                    <X size={12} />
                </button>
            </div>
            <div className="p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                {output}
            </div>
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
       <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center text-gray-800">
             <Terminal className="mr-2 text-orange-500" /> Jupyter Notebook
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded font-medium">Interactive Mode</span>
       </div>
       
       {cells.map((cell: any, idx: number) => (
          <div key={idx} className="mb-6 last:mb-0">
             {cell.cell_type === 'markdown' ? (
                <div className="prose prose-sm max-w-none p-4 bg-transparent text-gray-700">
                   {Array.isArray(cell.source) ? cell.source.join('').split('\n').map((line:string, i:number) => (
                      <p key={i} className="min-h-[1em] my-1">{line}</p>
                   )) : <p>{cell.source}</p>}
                </div>
             ) : (
                <div className="pl-0 md:pl-2">
                    <JupyterCell starterCode={Array.isArray(cell.source) ? cell.source.join('') : cell.source} />
                </div>
             )}
          </div>
       ))}
       
       {cells.length === 0 && (
           <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCode className="text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 italic">This notebook has no content to display.</p>
           </div>
       )}
    </div>
  );
};

// --- Mobile Optimized Quiz Player Component ---
const QuizPlayer = ({ lesson, onComplete }: { lesson: Lesson, onComplete: (score: number) => void }) => {
    const questions = lesson.contentData?.questions || [];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Quiz Unavailable</h3>
                <p className="text-gray-500">No questions found for this quiz.</p>
            </div>
        );
    }

    const handleSelect = (idx: number) => {
        if (isSubmitted) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentIdx] = idx;
        setSelectedAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        const score = questions.reduce((acc: number, q: any, i: number) => {
            return acc + (selectedAnswers[i] === q.correctAnswer ? 1 : 0);
        }, 0);
        const percentage = Math.round((score / questions.length) * 100);
        onComplete(percentage);
    };

    const currentQ = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {!isSubmitted ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded uppercase tracking-wide">
                            Question {currentIdx + 1} of {questions.length}
                        </span>
                        <div className="flex gap-1">
                            {questions.map((_: any, i: number) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === currentIdx ? 'bg-primary-600' : selectedAnswers[i] !== -1 ? 'bg-primary-200' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-6">{currentQ.question}</h3>

                    <div className="space-y-3 mb-8">
                        {currentQ.options.map((opt: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                                    selectedAnswers[currentIdx] === i 
                                    ? 'border-primary-500 bg-primary-50/50 text-primary-900' 
                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <span className="font-medium">{opt}</span>
                                {selectedAnswers[currentIdx] === i && (
                                    <CheckCircle size={20} className="text-primary-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between pt-6 border-t border-gray-100">
                        <Button 
                            variant="ghost" 
                            disabled={currentIdx === 0} 
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        {isLast ? (
                            <Button onClick={handleSubmit} disabled={selectedAnswers.includes(-1)}>
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                disabled={selectedAnswers[currentIdx] === -1}
                            >
                                Next Question
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                    <p className="text-gray-500 mb-6">You answered {questions.reduce((acc:number, q:any, i:number) => acc + (selectedAnswers[i] === q.correctAnswer ? 1 : 0), 0)} out of {questions.length} correctly.</p>
                    
                    <div className="space-y-4 text-left max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                        {questions.map((q: any, i: number) => {
                            const isCorrect = selectedAnswers[i] === q.correctAnswer;
                            return (
                                <div key={i} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                                    <p className="font-bold text-sm mb-2 text-gray-800">{q.question}</p>
                                    <div className="text-xs flex items-center gap-2">
                                        <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                            Your answer: {q.options[selectedAnswers[i]]}
                                        </span>
                                        {!isCorrect && (
                                            <span className="text-gray-500">
                                                (Correct: {q.options[q.correctAnswer]})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Button onClick={() => { setIsSubmitted(false); setCurrentIdx(0); setSelectedAnswers(new Array(questions.length).fill(-1)); }}>
                        <RotateCcw size={16} className="mr-2" /> Retry Quiz
                    </Button>
                </div>
            )}
        </div>
    );
};

// --- Main Course Player Component ---
export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Flattened list for navigation
  const allLessons = course?.modules.flatMap(m => m.lessons) || [];

  useEffect(() => {
    const loadCourse = async () => {
        if (!courseId) return;
        setLoading(true);
        const data = await api.getCourseById(courseId);
        if (data) {
            setCourse(data);
            // Auto-select first lesson if none selected
            if (!currentLesson && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
                setCurrentLesson(data.modules[0].lessons[0]);
            }
            
            // Load progress
            if (user) {
                const completed = await api.getCompletedLessons(user.id);
                setCompletedLessons(new Set(completed));
            }
        }
        setLoading(false);
    };
    loadCourse();
  }, [courseId, user]);

  const handleLessonSelect = (lesson: Lesson) => {
      setCurrentLesson(lesson);
      // Auto scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = async (lessonId: string) => {
      if (!user) return;
      
      const isComplete = completedLessons.has(lessonId);
      const newStatus = !isComplete;
      
      const success = await api.toggleLessonCompletion(user.id, lessonId, newStatus);
      if (success) {
          const newSet = new Set(completedLessons);
          if (newStatus) newSet.add(lessonId);
          else newSet.delete(lessonId);
          setCompletedLessons(newSet);
          
          // Auto advance if completing
          if (newStatus) {
              const idx = allLessons.findIndex(l => l.id === lessonId);
              if (idx !== -1 && idx < allLessons.length - 1) {
                  // Optional: Small delay or toast before moving
                  setTimeout(() => handleLessonSelect(allLessons[idx + 1]), 1000);
              } else if (idx === allLessons.length - 1) {
                  // Course Complete!
                  // Ideally show confetti
              }
          }
      }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;
  }

  if (!course) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold mb-4">Course Not Found</h2>
              <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
          </div>
      );
  }

  const isCurrentComplete = currentLesson ? completedLessons.has(currentLesson.id) : false;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
        {/* Top Bar */}
        <header className="bg-gray-900 text-white h-16 flex items-center justify-between px-4 z-30 flex-shrink-0 shadow-md">
            <div className="flex items-center">
                <button 
                    onClick={() => navigate(`/course/${courseId}/details`)} 
                    className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col">
                    <span className="font-bold text-sm md:text-base leading-tight">{course.title}</span>
                    <span className="text-xs text-gray-400 hidden md:block">
                        {completedLessons.size} / {allLessons.length} lessons completed ({Math.round((completedLessons.size / allLessons.length) * 100)}%)
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <Button 
                    size="sm" 
                    variant={isCurrentComplete ? "secondary" : "primary"}
                    onClick={() => currentLesson && handleMarkComplete(currentLesson.id)}
                    className="hidden md:flex"
                    icon={isCurrentComplete ? <Check size={16} /> : undefined}
                >
                    {isCurrentComplete ? "Completed" : "Mark Complete"}
                </Button>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                >
                    {isSidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Curriculum) */}
            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.aside 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0 hidden md:block custom-scrollbar"
                    >
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Curriculum</h3>
                            <div className="space-y-6">
                                {course.modules.map((module) => (
                                    <div key={module.id}>
                                        <h4 className="font-bold text-gray-900 text-sm mb-2 px-2 flex items-center">
                                            {module.isPodcast && <Headphones size={14} className="mr-2 text-purple-600" />}
                                            {module.title}
                                        </h4>
                                        <div className="space-y-1">
                                            {module.lessons.map((lesson) => {
                                                const isActive = currentLesson?.id === lesson.id;
                                                const isDone = completedLessons.has(lesson.id);
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        className={`w-full flex items-center px-2 py-2.5 rounded-lg text-sm transition-all group ${
                                                            isActive 
                                                            ? 'bg-white shadow-sm ring-1 ring-gray-200 text-primary-700 font-medium' 
                                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className={`mr-3 flex-shrink-0 ${isDone ? 'text-green-500' : isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                                                            {isDone ? <CheckCircle size={16} /> : 
                                                             lesson.type === 'video' ? <Play size={16} /> :
                                                             lesson.type === 'quiz' ? <HelpCircle size={16} /> :
                                                             lesson.type === 'jupyter' ? <Terminal size={16} /> :
                                                             <FileText size={16} />
                                                            }
                                                        </div>
                                                        <span className="truncate flex-1 text-left">{lesson.title}</span>
                                                        <span className="text-xs text-gray-400 ml-2 group-hover:text-gray-500">{lesson.duration || '5m'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
                {currentLesson ? (
                    <div className="max-w-5xl mx-auto p-4 md:p-8">
                        {/* Lesson Header */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="uppercase tracking-wide font-bold text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {currentLesson.type}
                                </span>
                                <span>•</span>
                                <span>{currentLesson.duration || '10 min'}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{currentLesson.title}</h1>
                        </div>

                        {/* Content Renderers */}
                        <div className="min-h-[400px]">
                            {/* VIDEO PLAYER */}
                            {currentLesson.type === 'video' && (
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg relative group">
                                    {currentLesson.contentUrl ? (
                                        currentLesson.contentUrl.includes('youtube') ? (
                                            <iframe 
                                                src={`https://www.youtube.com/embed/${currentLesson.contentUrl.split('v=')[1] || currentLesson.contentUrl}`}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title="Video Player"
                                            />
                                        ) : (
                                            <video 
                                                src={currentLesson.contentUrl} 
                                                controls 
                                                className="w-full h-full"
                                                poster={course.thumbnail}
                                            />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-white/50">
                                            <Play size={64} className="mb-4 opacity-50" />
                                            <p>Video content unavailable.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* JUPYTER / CODE */}
                            {(currentLesson.type === 'jupyter' || currentLesson.type === 'Code Practice') && (
                                <div>
                                    {currentLesson.contentData?.notebook ? (
                                        <NotebookRenderer notebook={currentLesson.contentData.notebook} />
                                    ) : (
                                        // Fallback manual code cell if no notebook JSON
                                        <div className="space-y-6">
                                            <div className="prose max-w-none mb-6">
                                                <h3>Interactive Coding Exercise</h3>
                                                <p>{currentLesson.contentData?.description || "Write Python code to solve the problem below."}</p>
                                            </div>
                                            <JupyterCell starterCode={currentLesson.contentData?.starterCode || "# print('Hello World')"} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* QUIZ */}
                            {currentLesson.type === 'quiz' && (
                                <QuizPlayer 
                                    lesson={currentLesson} 
                                    onComplete={(score) => {
                                        if (score >= (currentLesson.contentData?.passingScore || 70)) {
                                            handleMarkComplete(currentLesson.id);
                                        }
                                    }} 
                                />
                            )}

                            {/* READING / TEXT */}
                            {currentLesson.type === 'reading' && (
                                <div className="prose prose-lg max-w-none text-gray-700">
                                    {currentLesson.contentUrl?.endsWith('.pdf') ? (
                                        <div className="bg-gray-100 p-12 rounded-xl text-center border-2 border-dashed border-gray-300">
                                            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                            <h3 className="font-bold text-gray-900 mb-2">PDF Document</h3>
                                            <p className="mb-6 text-gray-500">View this document in a new tab to read.</p>
                                            <Button onClick={() => window.open(currentLesson.contentUrl, '_blank')}>
                                                <ExternalLink size={16} className="mr-2" /> Open PDF
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="lead">
                                                This lesson contains reading material. In a real application, the full markdown or HTML content would be rendered here.
                                            </p>
                                            <hr className="my-8" />
                                            <p>
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                            </p>
                                            <h3>Key Concepts</h3>
                                            <ul>
                                                <li>Concept A: Fundamental principles.</li>
                                                <li>Concept B: Advanced application.</li>
                                                <li>Concept C: Real-world examples.</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PODCAST */}
                            {currentLesson.type === 'podcast' && (
                                <div className="max-w-2xl mx-auto bg-purple-50 rounded-3xl p-8 text-center border border-purple-100 shadow-sm">
                                    <div className="w-32 h-32 mx-auto bg-white rounded-2xl shadow-md mb-6 flex items-center justify-center">
                                        <Headphones size={48} className="text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-purple-900 mb-2">{currentLesson.title}</h3>
                                    <p className="text-purple-600 mb-8 font-medium">Audio Episode</p>
                                    
                                    <audio 
                                        controls 
                                        className="w-full" 
                                        src={currentLesson.contentUrl}
                                        onEnded={() => handleMarkComplete(currentLesson.id)}
                                    >
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                            <div className="flex gap-4">
                                {/* Prev Button Logic could be added here */}
                            </div>
                            
                            <Button 
                                size="lg" 
                                onClick={() => {
                                    // Find next lesson index
                                    const idx = allLessons.findIndex(l => l.id === currentLesson.id);
                                    if (idx < allLessons.length - 1) {
                                        handleLessonSelect(allLessons[idx + 1]);
                                    } else {
                                        navigate('/dashboard');
                                    }
                                }}
                                className="group"
                            >
                                {allLessons.findIndex(l => l.id === currentLesson.id) === allLessons.length - 1 ? 'Finish Course' : 'Next Lesson'}
                                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p>Select a lesson from the sidebar to start.</p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};
