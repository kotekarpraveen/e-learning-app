
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Lesson, Course } from '../types';
import { 
  Play, Pause, FileText, HelpCircle, Terminal, Mic, CheckCircle, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Loader2, AlertTriangle, Circle, Volume2,
  BookOpen, Headphones, Clock, XCircle, Award
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

// New: Multi-cell Notebook Renderer
const NotebookRenderer = ({ notebook }: { notebook: any }) => {
  // Safe check for cells
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
                   {/* Simple line rendering for Markdown source array */}
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
  )
}

// New: Quiz Player Component
const QuizPlayer = ({ lessonId, contentData, onComplete, isCompleted }: { lessonId: string, contentData: any, onComplete: (id: string) => void, isCompleted: boolean }) => {
    const questions = contentData?.questions || [];
    const timeLimitMinutes = contentData?.timeLimit || 0; // 0 means no limit
    
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(isCompleted); // If re-visiting a completed lesson, start as submitted
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60); // Convert to seconds
    const [score, setScore] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (timeLimitMinutes > 0 && !isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit
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
        onComplete(lessonId); // Mark lesson as complete in DB
    };

    // Calculate progress for enabling submit button
    const answeredCount = Object.keys(userAnswers).length;
    const allAnswered = answeredCount === questions.length;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 relative">
            {/* Sticky Timer Header */}
            {timeLimitMinutes > 0 && !isSubmitted && (
                <div className={`sticky top-0 z-10 -mx-8 -mt-8 px-8 py-3 mb-6 flex justify-between items-center shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-800'}`}>
                    <div className="flex items-center font-bold">
                        <Clock size={18} className="mr-2" />
                        Time Remaining: {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider">
                        {timeLeft < 60 ? 'Hurry up!' : 'Time Bound Quiz'}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Knowledge Check</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{questions.length} Questions</span>
            </div>

            {isSubmitted ? (
                <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score === questions.length ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {score === questions.length ? <CheckCircle size={40} /> : <Award size={40} />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
                    <p className="text-lg text-gray-600 mb-6">
                        You scored <span className="font-bold text-gray-900">{score}</span> out of <span className="font-bold text-gray-900">{questions.length}</span>
                    </p>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-4">
                        <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-200 pb-2">Review:</h4>
                        {questions.map((q: any, i: number) => {
                            const isCorrect = userAnswers[i] === q.correctAnswer;
                            return (
                                <div key={i} className="text-sm">
                                    <p className="font-medium text-gray-800 mb-1">
                                        {i + 1}. {q.question}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {isCorrect ? (
                                            <span className="text-green-600 flex items-center text-xs font-bold"><CheckCircle size={12} className="mr-1"/> Correct</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center text-xs font-bold"><XCircle size={12} className="mr-1"/> Incorrect (Your answer: {q.options[userAnswers[i]] || 'None'})</span>
                                        )}
                                    </div>
                                    {!isCorrect && (
                                        <p className="text-xs text-gray-500 mt-1 pl-4 border-l-2 border-green-200">
                                            Correct Answer: {q.options[q.correctAnswer]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
                                            userAnswers[i] === optIdx 
                                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
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

                    <Button 
                        className="w-full mt-8" 
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        title={!allAnswered ? "Please answer all questions to submit" : "Submit Quiz"}
                    >
                        {!allAnswered ? `Answer all questions (${answeredCount}/${questions.length})` : 'Submit Answers & Complete'}
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
  
  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
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

  // Reset audio when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    if(audioRef.current) {
        audioRef.current.currentTime = 0;
    }
  }, [currentLesson]);

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

  // --- Audio Handlers ---
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if (isPlaying) {
        audioRef.current.pause();
    } else {
        audioRef.current.play();
    }
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!audioRef.current) return;
    const manualChange = Number(e.target.value);
    const dur = audioRef.current.duration || 1;
    audioRef.current.currentTime = (manualChange / 100) * dur;
    setAudioProgress(manualChange);
  };

  const skipAudio = (seconds: number) => {
    if(!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getValidAudioUrl = (url?: string) => {
      // Return a demo track if the URL is a placeholder or missing to ensure player works in demo
      if (!url || url === 'audio_url' || url === 'url' || !url.startsWith('http')) {
          return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 
      }
      return url;
  };

  const getYoutubeId = (url: string | undefined) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  // Check if a URL is actually a YouTube link
  const isYoutubeUrl = (url: string) => {
      return url.includes('youtube.com') || url.includes('youtu.be');
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
        const videoId = getYoutubeId(currentLesson.contentUrl);
        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
             <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&iv_load_policy=3`} 
                title="Video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
             ></iframe>
          </div>
        );
      case 'podcast':
        const url = currentLesson.contentUrl || '';
        
        // Handle YouTube Podcast logic
        if (isYoutubeUrl(url)) {
            const ytId = getYoutubeId(url);
            return (
              <div className="max-w-3xl mx-auto space-y-8">
                 <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`} 
                        title="Podcast Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                     ></iframe>
                 </div>
                 <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                       <FileText size={18} className="mr-2 text-primary-500" /> 
                       Episode Notes
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                       <p>This podcast is hosted on YouTube. Watch the episode above.</p>
                       <p className="text-xs text-gray-400 italic">Source: {url}</p>
                    </div>
                 </div>
              </div>
            );
        }

        // Standard Audio Player for MP3s
        return (
          <div className="max-w-3xl mx-auto space-y-8">
             {/* Hidden Audio Element */}
             <audio 
                ref={audioRef}
                src={getValidAudioUrl(currentLesson.contentUrl)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
             />

             {/* Podcast Player UI */}
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Header / Visualization */}
                <div className="bg-gray-900 h-64 relative flex items-center justify-center overflow-hidden">
                   {/* Abstract Background */}
                   <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-gray-900 opacity-90"></div>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   
                   {/* Animated Waveform (Fake Visualization of Active State) */}
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
                      <p className="text-primary-200 text-sm font-medium tracking-wide uppercase">Audio Episode • {formatTime(audioDuration)}</p>
                   </div>
                </div>

                {/* Player Controls */}
                <div className="p-8">
                   <div className="space-y-6">
                      {/* Progress Bar (Interactive) */}
                      <div className="w-full relative group">
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={audioProgress || 0} 
                            onChange={handleSeek}
                            className="absolute z-20 w-full h-1.5 opacity-0 cursor-pointer"
                         />
                         <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-primary-500 h-full rounded-full transition-all duration-100" 
                                style={{ width: `${audioProgress}%` }}
                            ></div>
                         </div>
                         <div 
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${audioProgress}%`, transform: `translate(-50%, -50%)` }}
                         ></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 font-mono font-medium">
                         <span>{formatTime(audioCurrentTime)}</span>
                         <span>{formatTime(audioDuration)}</span>
                      </div>

                      {/* Main Buttons */}
                      <div className="flex justify-center items-center gap-8">
                         <button 
                            onClick={() => skipAudio(-10)}
                            className="text-gray-400 hover:text-primary-600 transition-colors" title="Rewind 10s"
                         >
                             <RefreshCw size={24} className="transform -scale-x-100" />
                         </button>
                         <button 
                            onClick={toggleAudio}
                            className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/40 hover:scale-105 hover:bg-primary-600 transition-all"
                         >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                         </button>
                         <button 
                            onClick={() => skipAudio(10)}
                            className="text-gray-400 hover:text-primary-600 transition-colors" title="Forward 10s"
                         >
                             <RefreshCw size={24} />
                         </button>
                      </div>
                      
                      <div className="flex justify-center">
                          <button 
                            onClick={() => {
                                if(audioRef.current) {
                                    const rates = [1, 1.25, 1.5, 2];
                                    const nextRate = rates[(rates.indexOf(audioRef.current.playbackRate) + 1) % rates.length] || 1;
                                    audioRef.current.playbackRate = nextRate;
                                }
                            }}
                            className="flex items-center text-xs font-bold text-gray-400 hover:text-primary-600 uppercase tracking-wide px-3 py-1 rounded-full border border-gray-100 hover:border-primary-100 transition-colors"
                          >
                              <Volume2 size={14} className="mr-1.5" /> 
                              {audioRef.current?.playbackRate || 1}x Speed
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
                   <p className="text-xs text-gray-400 italic">Audio source: {getValidAudioUrl(currentLesson.contentUrl)}</p>
                </div>
             </div>
          </div>
        );
      case 'jupyter':
        const contentData = currentLesson.contentData;
        
        // CHECK: Is this a full imported notebook?
        if (contentData && contentData.notebook) {
            return <NotebookRenderer notebook={contentData.notebook} />;
        }

        // Fallback: Manual Code Exercise
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Terminal className="mr-2 text-blue-500" />
                    Code Practice: {currentLesson.title}
                </h2>
                <p className="text-gray-600 mb-6">{contentData?.description || "Practice coding by completing the cells below."}</p>
                <JupyterCell starterCode={contentData?.starterCode} />
             </div>
          </div>
        );
      case 'quiz':
         // Use the new QuizPlayer component for enhanced logic
         return (
            <QuizPlayer 
                lessonId={currentLesson.id}
                contentData={currentLesson.contentData}
                onComplete={(id) => toggleComplete(id)}
                isCompleted={completedLessonIds.has(currentLesson.id)}
            />
         );
      default:
        return (
          <div className="prose max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h1>{currentLesson.title}</h1>
            <p className="lead">Read through the material below to prepare for the next quiz.</p>
            <hr className="my-6 border-gray-100"/>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-4 text-blue-800 text-sm">
                <strong>Note:</strong> Make sure to download the attached PDF resources for a cheat sheet on this topic.
            </div>
            {currentLesson.contentUrl && (
                <div className="mt-6">
                    <Button variant="secondary" icon={<Download size={16} />} onClick={() => window.open(currentLesson.contentUrl, '_blank')}>
                        Download PDF Resource
                    </Button>
                </div>
            )}
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
                        // If in audio mode, only show podcasts. If curriculum, show all.
                        .filter(l => sidebarTab === 'audio' ? l.type === 'podcast' : true)
                        .map((lesson) => {
                            const isActive = currentLesson && lesson.id === currentLesson.id;
                            const isCompleted = completedLessonIds.has(lesson.id);
                            
                            return (
                            <button
                                key={lesson.id}
                                onClick={() => {
                                    setCurrentLesson(lesson);
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
                
                {/* For non-quiz lessons, allow manual completion toggle */}
                {currentLesson && currentLesson.type !== 'quiz' && (
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
