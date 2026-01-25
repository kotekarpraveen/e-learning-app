
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, Upload, Layout as LayoutIcon, Settings, Eye, ChevronLeft, Plus, 
  Video, FileText, Mic, Terminal, ClipboardList, Trash2, 
  GripVertical, ChevronDown, ChevronUp, Calendar,
  HelpCircle, Play, BookOpen, X, Loader2, Check, File,
  Link2, Info, Code, CheckCircle, AlertCircle, Headphones, Music, Link as LinkIcon,
  Image as ImageIcon, FileCode, Clock, PlusCircle, Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Course, Category, ContentAsset } from '../types';
import { CertificateTemplate } from '../components/CertificateTemplate';
import { useAuth } from '../App';
import { formatPrice, getCurrency } from '../lib/currency';

type Tab = 'info' | 'structure' | 'content' | 'settings' | 'certificate' | 'preview';

interface ModuleState {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
  lessons: LessonState[];
  isPodcast?: boolean;
}

interface LessonState {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'jupyter' | 'podcast';
  contentId?: string;
}

// --- Helper Components ---
const MotionDiv = motion.div as any;

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border ${
        type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
      }`}
    >
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div>
        <h4 className={`font-bold text-sm ${type === 'success' ? 'text-gray-900' : 'text-gray-900'}`}>
          {type === 'success' ? 'Success' : 'Error'}
        </h4>
        <p className="text-gray-500 text-xs">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
        <X size={16} />
      </button>
    </MotionDiv>
  );
};

const UploadModal = ({ type, onClose, onComplete }: { type: {title: string, icon: React.ReactNode}, onClose: () => void, onComplete: (item: ContentAsset) => void }) => {
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
    const [progress, setProgress] = useState(0);
    
    // Generic State
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Jupyter State
    const [jupyterMode, setJupyterMode] = useState<'upload' | 'manual'>('upload');
    const [notebookData, setNotebookData] = useState<any>(null); // Stores parsed .ipynb JSON

    // Code Practice State (Manual)
    const [codeExercise, setCodeExercise] = useState({
        description: '',
        starterCode: '# Write your code here\n\ndef solution():\n    pass',
        solutionCode: 'def solution():\n    return "Correct"'
    });

    // Quiz Builder State
    const [quizQuestions, setQuizQuestions] = useState<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
    }[]>([
        { id: 'q1', question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);
    const [quizTimeLimit, setQuizTimeLimit] = useState<number | ''>(''); // Minutes
    const [passingScore, setPassingScore] = useState<number>(70); // Default 70%

    const isVideo = type.title === 'Video Content';
    const isPodcast = type.title === 'Podcast/Audio';
    const isJupyter = type.title === 'Jupyter Notebook'; 
    const isCodePractice = type.title === 'Code Practice';
    const isReading = type.title === 'Reading Material';
    const isQuiz = type.title === 'Quiz/Assessment';
    
    let acceptType = '*';
    let label = 'File';
    if (isReading) {
        acceptType = '.pdf';
        label = 'PDF';
    }
    if (isJupyter && jupyterMode === 'upload') {
        acceptType = '.ipynb';
        label = 'Jupyter Notebook (.ipynb)';
    }

    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { id: `q${Date.now()}`, question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const updated = [...quizQuestions];
        (updated[index] as any)[field] = value;
        setQuizQuestions(updated);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...quizQuestions];
        updated[qIndex].options[oIndex] = value;
        setQuizQuestions(updated);
    };

    const handleRemoveQuestion = (index: number) => {
        if (quizQuestions.length > 1) {
            setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
        }
    };

    // Jupyter File Handler
    const handleJupyterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.name.endsWith('.ipynb')) {
            alert('Please select a valid .ipynb file');
            return;
        }

        setSelectedFile(file);
        if(!title) setTitle(file.name.replace('.ipynb', ''));

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setNotebookData(json);
            } catch (err) {
                console.error("Invalid Notebook File", err);
                alert("Could not parse Jupyter Notebook file.");
                setSelectedFile(null);
            }
        };
        reader.readAsText(file);
    };

    const startUpload = async () => {
      if (!title) return; // Title is mandatory

      setUploadState('uploading');
      setProgress(20);

      try {
          // --- QUIZ LOGIC ---
          if (isQuiz) {
              const newAsset = await api.createContentAsset({
                  title: title,
                  type: type.title,
                  fileName: 'Interactive Quiz',
                  fileSize: `${quizQuestions.length} Qs`,
                  metadata: {
                      questions: quizQuestions,
                      timeLimit: quizTimeLimit === '' ? 0 : Number(quizTimeLimit),
                      passingScore: passingScore
                  }
              });
              if(newAsset) finalize(newAsset);
              return;
          }

          // --- CODE PRACTICE LOGIC ---
          if (isCodePractice) {
              const newAsset = await api.createContentAsset({
                  title: title,
                  type: type.title,
                  fileName: 'Code Challenge',
                  fileSize: 'Interactive',
                  metadata: {
                      description: codeExercise.description,
                      starterCode: codeExercise.starterCode,
                      solutionCode: codeExercise.solutionCode
                  }
              });
              if(newAsset) finalize(newAsset);
              return;
          }

          // --- JUPYTER / CODE LOGIC ---
          if (isJupyter) {
              let metadata;
              let fileName;
              let fileSize;

              if (jupyterMode === 'manual') {
                  metadata = {
                      description: codeExercise.description,
                      starterCode: codeExercise.starterCode,
                      solutionCode: codeExercise.solutionCode
                  };
                  fileName = 'Manual Exercise';
                  fileSize = 'Code';
              } else {
                  // Upload Mode
                  if (!notebookData) throw new Error("No notebook data");
                  metadata = {
                      notebook: notebookData 
                  };
                  fileName = selectedFile?.name || 'Notebook.ipynb';
                  fileSize = selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '0 KB';
              }

              const newAsset = await api.createContentAsset({
                  title: title,
                  type: type.title,
                  fileName: fileName,
                  fileSize: fileSize,
                  metadata: metadata
              });
              if(newAsset) finalize(newAsset);
              return;
          }

          // --- VIDEO & PODCAST LOGIC (URL BASED) ---
          if (isVideo || isPodcast) {
            if (!url) return;
            const newAsset = await api.createContentAsset({
                title: title,
                type: type.title,
                fileName: url,
                fileUrl: url,
                fileSize: 'Link',
                metadata: { url: url }
            });
            if(newAsset) finalize(newAsset);
            return;
          }

          // --- READING MATERIAL (FILE UPLOAD) ---
          if (isReading) {
              if (!selectedFile) return;
              
              setProgress(40);
              const uploadResult = await api.uploadFileToStorage(selectedFile);
              
              if (!uploadResult) throw new Error("Upload failed");
              setProgress(80);

              const newAsset = await api.createContentAsset({
                  title: title,
                  type: type.title,
                  fileName: selectedFile.name,
                  fileUrl: uploadResult.url,
                  fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
              });

              if(newAsset) finalize(newAsset);
          }

      } catch (err) {
          console.error(err);
          alert("Upload failed. Please try again.");
          setUploadState('idle');
      }
    };

    const finalize = (asset: ContentAsset) => {
        setProgress(100);
        setUploadState('success');
        setTimeout(() => {
            onComplete(asset);
        }, 800);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`bg-white rounded-2xl shadow-2xl w-full ${isJupyter || isQuiz || isCodePractice ? 'max-w-4xl' : 'max-w-lg'} relative z-10 overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col`}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               {type.icon}
               <span>
                 {isQuiz ? 'Create Quiz' : 
                  isJupyter ? 'Jupyter Notebook' : 
                  isCodePractice ? 'Create Code Challenge' :
                  `Add ${type.title}`}
               </span>
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
               <X size={20} />
             </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {uploadState === 'idle' ? (
              <div className="space-y-6">
                
                {/* GLOBAL TITLE INPUT */}
                <Input 
                    label="Content Title" 
                    placeholder={`e.g. ${isQuiz ? 'Module 1 Assessment' : isVideo ? 'Intro to React' : 'Practice Exercise'}`}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                />

                {/* --- VIDEO & PODCAST (URL) --- */}
                {(isVideo || isPodcast) && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{isPodcast ? 'Podcast/Audio URL' : 'Video URL (YouTube/Vimeo)'}</label>
                            <Input 
                                placeholder={isPodcast ? "https://site.com/episode.mp3" : "https://www.youtube.com/watch?v=..."}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start border border-blue-100">
                             <p>
                                 {isPodcast 
                                    ? "Provide a direct link to an MP3 or audio stream."
                                    : "Paste a video link. We'll automatically fetch the thumbnail and embed it."
                                 }
                             </p>
                        </div>
                    </div>
                )}

                {/* --- READING MATERIAL (FILE) --- */}
                {isReading && (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-primary-500 transition-all cursor-pointer relative group bg-gray-50/50">
                        <div className="w-16 h-16 bg-white text-primary-600 rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-gray-100">
                            <Upload size={28} />
                        </div>
                        <p className="font-semibold text-gray-900 text-lg">
                            {selectedFile ? selectedFile.name : `Click to browse or drag ${label} here`}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Accepts {acceptType} files up to 50MB</p>
                        <input 
                            type="file" 
                            accept={acceptType}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setSelectedFile(e.target.files[0]);
                                    if(!title) setTitle(e.target.files[0].name.split('.')[0]);
                                }
                            }}
                        />
                    </div>
                )}

                {/* --- QUIZ BUILDER --- */}
                {isQuiz && (
                    <div className="space-y-6">
                        {/* Quiz Configuration Panel */}
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 mb-6">
                            <div className="flex items-center gap-2 mb-4 text-orange-800">
                                <Settings size={18} />
                                <h4 className="font-bold text-sm uppercase tracking-wide">Quiz Settings</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Time Limit */}
                                <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md shadow-sm text-orange-600">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Time Limit</label>
                                            <p className="text-[10px] text-gray-500">0 = No Limit</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="0" 
                                            value={quizTimeLimit} 
                                            onChange={e => setQuizTimeLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                                            className="w-20 text-center font-bold text-lg bg-white h-10"
                                            min="0"
                                        />
                                        <span className="text-sm font-bold text-gray-500">min</span>
                                    </div>
                                </div>

                                {/* Passing Score */}
                                <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md shadow-sm text-green-600">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Passing Score</label>
                                            <p className="text-[10px] text-gray-500">Required %</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="70" 
                                            value={passingScore} 
                                            onChange={e => setPassingScore(parseInt(e.target.value))}
                                            className="w-20 text-center font-bold text-lg bg-white h-10"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-sm font-bold text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {quizQuestions.map((q, qIdx) => (
                                <div key={q.id} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative group mb-4 transition-all hover:shadow-md">
                                    {/* Header with Delete */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Question {qIdx + 1}</span>
                                        </div>
                                        {quizQuestions.length > 1 && (
                                            <button onClick={() => handleRemoveQuestion(qIdx)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Question Input */}
                                    <Input 
                                        placeholder="What is the main concept of...?"
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                                        className="mb-6 font-medium text-lg border-gray-300 focus:border-primary-500"
                                    />

                                    {/* Options */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Answer Options (Select Correct One)</label>
                                        {q.options.map((opt, oIdx) => (
                                            <div 
                                                key={oIdx} 
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                                    q.correctAnswer === oIdx 
                                                    ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500' 
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                                onClick={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="radio" 
                                                        name={`correct-${q.id}`}
                                                        checked={q.correctAnswer === oIdx} 
                                                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                        className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-green-500 checked:bg-green-500 transition-all cursor-pointer"
                                                    />
                                                    <Check size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
                                                </div>
                                                
                                                <input 
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400" 
                                                    placeholder={`Option ${oIdx + 1}`} 
                                                    value={opt} 
                                                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} 
                                                />
                                                
                                                {q.correctAnswer === oIdx && (
                                                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide px-2">Correct</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explanation / Feedback Field */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                            <Info size={12} /> Explanation / Feedback (For Learner)
                                        </label>
                                        <textarea 
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[80px] resize-y transition-all"
                                            placeholder="Explain why the answer is correct (optional)..."
                                            value={q.explanation || ''}
                                            onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={handleAddQuestion} className="w-full border-dashed border-2">
                            <Plus size={16} className="mr-2" /> Add Another Question
                        </Button>
                    </div>
                )}

                {/* --- CODE PRACTICE --- */}
                {isCodePractice && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-2 flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                                <Code size={18} />
                            </div>
                            <p className="text-sm text-indigo-900 leading-relaxed pt-1">
                                Create a coding challenge for students. They will write code in an embedded editor to match your solution.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Problem Description</label>
                            <textarea 
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="Describe the coding problem..." 
                                value={codeExercise.description} 
                                onChange={e => setCodeExercise({...codeExercise, description: e.target.value})} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Starter Code (Student sees this)</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 min-h-[300px] font-mono text-sm bg-gray-900 text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={codeExercise.starterCode} 
                                    onChange={e => setCodeExercise({...codeExercise, starterCode: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Solution Code (For validation)</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-green-200 min-h-[300px] font-mono text-sm bg-gray-50 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" 
                                    value={codeExercise.solutionCode} 
                                    onChange={e => setCodeExercise({...codeExercise, solutionCode: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- JUPYTER --- */}
                {isJupyter && (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 relative hover:bg-orange-50/30 transition-colors">
                            <FileCode size={28} className="text-orange-600 mb-4" />
                            <p className="font-semibold text-gray-900 text-lg">{selectedFile ? selectedFile.name : `Drop Jupyter Notebook (.ipynb) here`}</p>
                            <input type="file" accept=".ipynb" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleJupyterFile} />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Upload a standard Jupyter Notebook file to render as interactive content.
                        </p>
                    </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                 {uploadState === 'uploading' ? (
                   <div className="w-full max-w-xs text-center">
                     <div className="mb-6 relative w-20 h-20 mx-auto">
                        <Loader2 className="w-full h-full animate-spin text-primary-600 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-primary-700 text-sm">{Math.round(progress)}%</div>
                     </div>
                     <h4 className="text-lg font-bold text-gray-900 mb-2">Processing...</h4>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center">
                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                       <Check size={40} strokeWidth={3} />
                     </div>
                     <h4 className="text-2xl font-bold text-gray-900 mb-2">Success!</h4>
                   </div>
                 )}
              </div>
            )}
          </div>
          
          {uploadState === 'idle' && (
             <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button onClick={startUpload} className="w-full sm:w-auto min-w-[120px]">
                    {isJupyter || isQuiz || isCodePractice ? 'Save Content' : 'Start Upload'}
                </Button>
            </div>
          )}
        </MotionDiv>
      </div>
    );
};

const InfoTab: React.FC<{ 
    courseInfo: any, 
    setCourseInfo: any,
    categories: Category[],
    onCreateCategory: (name: string) => Promise<void>
}> = ({ courseInfo, setCourseInfo, categories, onCreateCategory }) => {
    
    const [showNewCatInput, setShowNewCatInput] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [isCreatingCat, setIsCreatingCat] = useState(false);
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const currency = getCurrency();

    // Local state to handle editing price in selected currency
    const [localPrice, setLocalPrice] = useState(() => {
        const p = parseFloat(courseInfo.price);
        return isNaN(p) ? '' : (p * currency.rate).toFixed(2);
    });

    const handleCreate = async () => {
        if (!newCatName.trim()) return;
        setIsCreatingCat(true);
        await onCreateCategory(newCatName);
        setNewCatName('');
        setShowNewCatInput(false);
        setIsCreatingCat(false);
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        setIsUploadingThumb(true);
        try {
            const result = await api.uploadFileToStorage(file);
            if (result) setCourseInfo({ ...courseInfo, thumbnail: result.url });
        } catch (error) { alert("Failed to upload thumbnail"); } 
        finally { setIsUploadingThumb(false); }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalPrice(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            // Convert to USD for storage
            const usd = (num / currency.rate).toFixed(2);
            setCourseInfo({ ...courseInfo, price: usd });
        } else {
            setCourseInfo({ ...courseInfo, price: '' });
        }
    };

    return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
       <div className="border-b border-gray-100 pb-6">
         <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Course Information</h2>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Course Thumbnail</label>
            <div className="relative aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden group">
                {courseInfo.thumbnail ? (
                    <img src={courseInfo.thumbnail} alt="Course Thumbnail" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon size={32} />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                        {isUploadingThumb ? 'Uploading...' : 'Change Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                    </label>
                </div>
            </div>
         </div>

         <div className="lg:col-span-2 space-y-6">
            <Input label="Course Title *" value={courseInfo.title} onChange={e => setCourseInfo({...courseInfo, title: e.target.value})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                {!showNewCatInput ? (
                    <div className="flex gap-2">
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={courseInfo.category} onChange={e => setCourseInfo({...courseInfo, category: e.target.value})}>
                            <option value="">Select category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <button onClick={() => setShowNewCatInput(true)} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg"><Plus size={18} /></button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input className="w-full px-4 py-2 rounded-lg border border-primary-300" placeholder="New Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} autoFocus />
                        <button onClick={handleCreate} disabled={isCreatingCat} className="px-3 py-2 bg-primary-600 text-white rounded-lg"><Check size={18} /></button>
                        <button onClick={() => setShowNewCatInput(false)} className="px-3 py-2 bg-gray-100 rounded-lg"><X size={18} /></button>
                    </div>
                )}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level *</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={courseInfo.level} onChange={e => setCourseInfo({...courseInfo, level: e.target.value})}>
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Duration (hours)" value={courseInfo.duration} onChange={e => setCourseInfo({...courseInfo, duration: e.target.value})} />
                <Input 
                    label={`Price (${currency.code})`} 
                    type="number" 
                    value={localPrice} 
                    onChange={handlePriceChange} 
                    step="0.01" 
                />
            </div>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 min-h-[150px]" placeholder="Course Description..." value={courseInfo.description} onChange={e => setCourseInfo({...courseInfo, description: e.target.value})} />
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 min-h-[120px]" placeholder="What You'll Learn..." value={courseInfo.learningOutcomes} onChange={e => setCourseInfo({...courseInfo, learningOutcomes: e.target.value})} />
         </div>
       </div>
    </div>
    );
};

const StructureTab: React.FC<{ 
    modules: ModuleState[], 
    setModules: any, 
    addModule: any, 
    deleteModule: any, 
    toggleModule: any, 
    addLesson: any,
    contentLibrary: ContentAsset[],
    onOpenUpload: (type: any, lessonId: string, moduleId: string) => void,
    isAudioSeries: boolean
}> = ({ 
    modules, setModules, addModule, deleteModule, toggleModule, addLesson, contentLibrary, onOpenUpload, isAudioSeries 
}) => {
    const standardModules = modules.filter(m => m.id !== 'podcast-module');
    const podcastModule = modules.find(m => m.id === 'podcast-module');

    const handleAddPodcastEpisode = () => {
        if (!podcastModule) {
            setModules([...modules, {
                id: 'podcast-module',
                title: 'Audio Companion & Podcast',
                description: 'Audio-only content',
                isExpanded: true,
                isPodcast: true,
                lessons: [{ id: `l${Date.now()}`, title: 'New Episode', type: 'podcast' }]
            }]);
        } else {
            setModules(modules.map(m => {
                if (m.id === 'podcast-module') {
                    return { ...m, lessons: [...m.lessons, { id: `l${Date.now()}`, title: 'New Episode', type: 'podcast' }] };
                }
                return m;
            }));
        }
    };

    const getAvailableContent = (lessonType: string) => {
        switch(lessonType) {
            case 'video': return contentLibrary.filter(c => c.type === 'Video Content');
            case 'reading': return contentLibrary.filter(c => c.type === 'Reading Material');
            case 'podcast': return contentLibrary.filter(c => c.type === 'Podcast/Audio');
            case 'jupyter': return contentLibrary.filter(c => c.type === 'Jupyter Notebook' || c.type === 'Code Practice');
            case 'quiz': return contentLibrary.filter(c => c.type === 'Quiz/Assessment');
            default: return [];
        }
    };

    const getAssetTypeObject = (lessonType: string) => {
        switch(lessonType) {
            case 'video': return { title: 'Video Content', icon: <Video size={28} /> };
            case 'reading': return { title: 'Reading Material', icon: <FileText size={28} /> };
            case 'podcast': return { title: 'Podcast/Audio', icon: <Mic size={28} /> };
            case 'jupyter': return { title: 'Jupyter Notebook', icon: <Terminal size={28} /> }; // 'Code Practice' handled implicitly via generic 'jupyter' lesson type logic or add explicit type if needed
            case 'quiz': return { title: 'Quiz/Assessment', icon: <ClipboardList size={28} /> };
            default: return { title: 'Video Content', icon: <Video size={28} /> };
        }
    };

    return (
    <div className="max-w-4xl mx-auto space-y-10">
      {!isAudioSeries && (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                </div>
                <Button onClick={addModule} icon={<Plus size={16} />}>Add Module</Button>
            </div>

            <div className="space-y-4">
                {standardModules.map((module, idx) => (
                <MotionDiv key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 flex items-center gap-4">
                        <GripVertical className="text-gray-400" />
                        <input className="font-semibold bg-transparent border-none focus:ring-0 p-0 w-full text-lg" value={module.title} onChange={e => setModules(modules.map(m => m.id === module.id ? { ...m, title: e.target.value } : m))} />
                        <button onClick={() => deleteModule(module.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                        <button onClick={() => toggleModule(module.id)} className="p-2">{module.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
                    </div>

                    <AnimatePresence>
                    {module.isExpanded && (
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700 text-sm">Lessons</h4>
                                <Button size="sm" variant="secondary" onClick={() => addLesson(module.id)} icon={<Plus size={14} />}>Add Lesson</Button>
                            </div>
                            <div className="space-y-3">
                            {module.lessons.map((lesson, lIdx) => (
                                <div key={lesson.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center mr-3 bg-white">
                                            {lesson.type === 'video' && <Video size={16} />}
                                            {lesson.type === 'reading' && <FileText size={16} />}
                                            {lesson.type === 'quiz' && <HelpCircle size={16} />}
                                            {lesson.type === 'jupyter' && <Terminal size={16} />}
                                            {lesson.type === 'podcast' && <Mic size={16} />}
                                        </div>
                                        <input className="bg-transparent border-none text-sm font-bold w-full" value={lesson.title} onChange={e => setModules(modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) } : m))} />
                                        <button onClick={() => setModules(modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m))}><Trash2 size={16} /></button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-11">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                                            <select className="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg bg-white" value={lesson.type} onChange={e => setModules(modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, type: e.target.value as any, contentId: undefined } : l) } : m))}>
                                                <option value="video">Video</option>
                                                <option value="reading">Reading</option>
                                                <option value="quiz">Quiz</option>
                                                <option value="jupyter">Jupyter / Code</option>
                                                <option value="podcast">Podcast</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Linked Asset</label>
                                            <select className="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg bg-white" value={lesson.contentId || ""} onChange={e => setModules(modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, contentId: e.target.value } : l) } : m))}>
                                                <option value="">-- Select existing --</option>
                                                {getAvailableContent(lesson.type).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="w-full text-xs border-dashed"
                                                onClick={() => onOpenUpload(getAssetTypeObject(lesson.type), lesson.id, module.id)}
                                                icon={<PlusCircle size={14} />}
                                            >
                                                {lesson.contentId ? 'Update Content' : 'Add Content'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                    </AnimatePresence>
                </MotionDiv>
                ))}
            </div>
        </div>
      )}

      {/* Podcast Section */}
      <div className="space-y-6 pt-8 border-t border-gray-100">
         <div className="flex justify-between items-start">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Audio Companion</h2>
            </div>
            {!podcastModule && !isAudioSeries && (
                <Button onClick={handleAddPodcastEpisode} variant="secondary">Enable Podcast Section</Button>
            )}
         </div>

         {(podcastModule || isAudioSeries) && (
             <div className="bg-white rounded-xl border border-purple-100 overflow-hidden">
                <div className="p-4 bg-purple-50 flex items-center justify-between">
                    <span className="font-bold text-purple-900">Episodes</span>
                    <Button size="sm" onClick={handleAddPodcastEpisode}><Plus size={14} /> Add Episode</Button>
                </div>
                <div className="p-4 space-y-3">
                    {podcastModule?.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                            <Mic size={18} className="text-purple-600" />
                            <input className="flex-1 font-semibold focus:outline-none" value={lesson.title} onChange={e => setModules(modules.map(m => m.id === 'podcast-module' ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) } : m))} />
                            <select className="text-xs border rounded p-1" value={lesson.contentId || ""} onChange={e => setModules(modules.map(m => m.id === 'podcast-module' ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, contentId: e.target.value } : l) } : m))}>
                                <option value="">-- Link Audio --</option>
                                {contentLibrary.filter(c => c.type === 'Podcast/Audio').map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            <Button size="sm" variant="ghost" onClick={() => onOpenUpload(getAssetTypeObject('podcast'), lesson.id, 'podcast-module')}><PlusCircle size={16} /></Button>
                            <button onClick={() => setModules(modules.map(m => m.id === 'podcast-module' ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m))}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
             </div>
         )}
      </div>
    </div>
    );
};

const ContentTab: React.FC<{ contentLibrary: ContentAsset[], setActiveUploadType: any, handleDeleteContent: any }> = ({ 
    contentLibrary, setActiveUploadType, handleDeleteContent 
}) => {
    return (
    <div className="max-w-6xl mx-auto space-y-10">
       <div>
         <h2 className="text-2xl font-bold text-gray-900">Content Library</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
           {[
             { title: 'Video Content', icon: <Video size={28} />, color: 'text-blue-500 bg-blue-50' },
             { title: 'Reading Material', icon: <FileText size={28} />, color: 'text-green-500 bg-green-50' },
             { title: 'Podcast/Audio', icon: <Mic size={28} />, color: 'text-purple-500 bg-purple-50' },
             { title: 'Code Practice', icon: <Code size={28} />, color: 'text-indigo-500 bg-indigo-50' },
             { title: 'Jupyter Notebook', icon: <Terminal size={28} />, color: 'text-orange-500 bg-orange-50' },
             { title: 'Quiz/Assessment', icon: <ClipboardList size={28} />, color: 'text-red-500 bg-red-50' },
           ].map((item, i) => (
             <div key={i} onClick={() => setActiveUploadType(item)} className="p-6 rounded-2xl border bg-white hover:shadow-xl transition-all cursor-pointer flex flex-col items-center hover:border-primary-200">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>{item.icon}</div>
               <h3 className="font-bold text-gray-900">{item.title}</h3>
             </div>
           ))}
         </div>
       </div>

       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr><th className="px-8 py-4">Name</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Size/Link</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contentLibrary.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-8 py-4 font-medium text-gray-900 flex items-center">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3">{item.type === 'Video Content' ? <Link2 size={16} /> : <File size={16} />}</div>
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.type}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs max-w-[150px] truncate">{item.fileSize || item.fileUrl}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteContent(item.id, item.fileUrl)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
    );
};

const SettingsTab: React.FC<{ settings: any, setSettings: any }> = ({ settings, setSettings }) => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
       <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Settings</h2>
       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
         <label className="block text-sm font-bold text-gray-800 mb-2">Visibility</label>
         <select className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white" value={settings.visibility} onChange={e => setSettings({...settings, visibility: e.target.value})}>
           <option value="public">Public</option>
           <option value="private">Private</option>
           <option value="unlisted">Unlisted</option>
         </select>
       </div>
    </div>
);

const CertificateTab: React.FC<{ courseInfo: any, instructorName: string }> = ({ courseInfo, instructorName }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
            <p className="text-gray-500">This is how the certificate will look for students upon completion.</p>
          </div>
          <Button variant="secondary" onClick={() => window.print()}>
             Print Preview
          </Button>
       </div>

       <div className="border border-gray-200 shadow-xl rounded-xl overflow-hidden">
          <CertificateTemplate 
             studentName="[Student Name]"
             courseTitle={courseInfo.title || "Untitled Course"}
             instructor={instructorName || "Instructor Name"}
             date={new Date().toLocaleDateString()}
             verificationId="SAMPLE-ID-12345"
          />
       </div>
    </div>
  );
}

const PreviewTab: React.FC<{ courseInfo: any, modules: ModuleState[] }> = ({ courseInfo, modules }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mock Landing Page Header */}
        <div className="relative h-64 bg-gray-900">
            <img src={courseInfo.thumbnail} className="w-full h-full object-cover opacity-50" alt="Preview" />
            <div className="absolute inset-0 flex items-end p-8">
                <div className="text-white">
                    <span className="bg-primary-600 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">{courseInfo.category || 'Category'}</span>
                    <h1 className="text-3xl font-bold mb-2">{courseInfo.title || 'Untitled Course'}</h1>
                    <p className="max-w-2xl opacity-90 line-clamp-2">{courseInfo.description || 'No description provided.'}</p>
                </div>
            </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {modules.map(m => (
                            <div key={m.id} className="bg-gray-50">
                                <div className="px-6 py-4 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800">{m.title}</h4>
                                    <span className="text-xs text-gray-500">{m.lessons.length} lessons</span>
                                </div>
                                <div className="bg-white px-6 py-2 space-y-2 pb-4">
                                    {m.lessons.map(l => (
                                        <div key={l.id} className="flex items-center text-sm text-gray-600">
                                            {l.type === 'video' ? <Video size={14} className="mr-2" /> : <FileText size={14} className="mr-2" />}
                                            {l.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{formatPrice(courseInfo.price)}</div>
                    <Button className="w-full mt-4">Enroll Now</Button>
                    <div className="mt-4 text-xs text-gray-500 space-y-2">
                        <div className="flex justify-between"><span>Level</span> <span className="font-bold">{courseInfo.level}</span></div>
                        <div className="flex justify-between"><span>Duration</span> <span className="font-bold">{courseInfo.duration}h</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export const CourseBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const editCourseId = searchParams.get('courseId');

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentLibrary, setContentLibrary] = useState<ContentAsset[]>([]);
  const [activeUploadType, setActiveUploadType] = useState<{title: string, icon: React.ReactNode} | null>(null);
  const [activeLessonUpload, setActiveLessonUpload] = useState<{moduleId: string, lessonId: string} | null>(null);

  const [courseInfo, setCourseInfo] = useState({ id: `c${Date.now()}`, title: '', category: '', level: '', duration: '', price: '', description: '', learningOutcomes: '', prerequisites: '', thumbnail: 'https://picsum.photos/800/600', instructor: '' });
  const [modules, setModules] = useState<ModuleState[]>([{ id: `m${Date.now()}`, title: 'Module 1', description: '', isExpanded: true, lessons: [{ id: `l${Date.now()}`, title: 'Lesson 1', type: 'video' }] }]);
  const [settings, setSettings] = useState({ visibility: 'public', enrollmentLimit: 'Unlimited', enrollmentDeadline: '', enableDiscussion: false });

  useEffect(() => {
      const loadData = async () => {
          setIsInitializing(true);
          const [cats, assets] = await Promise.all([ api.getCategories(), api.getContentLibrary() ]);
          setCategories(cats);
          setContentLibrary(assets);
          setIsInitializing(false);
      };
      loadData();
  }, []);

  useEffect(() => {
      if (!editCourseId) return;
      const fetchCourse = async () => {
          setIsLoading(true);
          const data = await api.getCourseById(editCourseId);
          if (data) {
              setCourseInfo({ id: data.id, title: data.title, category: data.category, level: data.level, duration: data.duration || '', price: data.price.toString(), description: data.description, learningOutcomes: data.learningOutcomes?.join('\n') || '', prerequisites: '', thumbnail: data.thumbnail, instructor: data.instructor });
              setModules(data.modules.map(m => ({ id: m.id, title: m.title, description: m.description || '', isExpanded: false, isPodcast: m.isPodcast, lessons: m.lessons.map(l => {
                const libraryItem = contentLibrary.find(asset => (asset.fileUrl && asset.fileUrl === l.contentUrl) || (asset.metadata?.url && asset.metadata.url === l.contentUrl));
                return { id: l.id, title: l.title, type: l.type as any, contentId: libraryItem?.id };
              }) })));
          }
          setIsLoading(false);
      };
      if (!isInitializing) fetchCourse();
  }, [editCourseId, isInitializing, contentLibrary.length]);

  const handleCreateCategory = async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: Category = { id: `cat_${Date.now()}`, name, slug, count: 0 };
      await api.saveCategory(newCat);
      setCategories([...categories, newCat]);
      setCourseInfo({ ...courseInfo, category: name });
      setToast({ message: 'Category created', type: 'success' });
  };

  const handleSave = async (shouldPublish: boolean = false) => {
    setIsLoading(true);
    const courseData: Course = {
        id: courseInfo.id, title: courseInfo.title || "Untitled", description: courseInfo.description || "", thumbnail: courseInfo.thumbnail, 
        instructor: courseInfo.instructor || user?.name || 'Admin', 
        price: parseFloat(courseInfo.price) || 0, level: (courseInfo.level as any) || 'Beginner', category: courseInfo.category || 'Other', progress: 0, totalModules: modules.length, enrolledStudents: 0, learningOutcomes: courseInfo.learningOutcomes.split('\n').filter(s => s.trim().length > 0), published: shouldPublish, duration: courseInfo.duration,
        modules: modules.map(m => ({
            id: m.id, title: m.title, isPodcast: m.isPodcast,
            lessons: m.lessons.map(l => {
                const contentItem = contentLibrary.find(c => c.id === l.contentId);
                return { id: l.id, title: l.title, type: l.type, completed: false, duration: '10 min', contentUrl: contentItem?.fileUrl || contentItem?.metadata?.url, contentData: contentItem?.metadata };
            })
        }))
    };
    const result = await api.saveCourse(courseData);
    setIsLoading(false);
    if (result.success) {
        setToast({ message: shouldPublish ? 'Course published!' : 'Saved successfully', type: 'success' });
        if (shouldPublish) setTimeout(() => navigate('/admin/courses'), 2000);
    } else { setToast({ message: 'Error: ' + result.message, type: 'error' }); }
  };

  const handleUploadComplete = (newItem: ContentAsset) => {
    setContentLibrary([newItem, ...contentLibrary]);
    if (activeLessonUpload) {
        setModules(prev => prev.map(m => m.id === activeLessonUpload.moduleId ? {
            ...m, lessons: m.lessons.map(l => l.id === activeLessonUpload.lessonId ? {
                ...l, contentId: newItem.id, title: l.title.includes('Lesson') || l.title.includes('Episode') ? newItem.title : l.title
            } : l)
        } : m));
        setActiveLessonUpload(null);
    }
    setToast({ message: `${newItem.title} added.`, type: 'success' });
    setActiveUploadType(null);
  };

  const openUploadForLesson = (type: any, lessonId: string, moduleId: string) => {
      setActiveLessonUpload({ lessonId, moduleId });
      setActiveUploadType(type);
  };

  const handleDeleteContent = async (id: string, fileUrl?: string) => {
    if (await api.deleteContentAsset(id, fileUrl)) {
        setContentLibrary(contentLibrary.filter(c => c.id !== id));
        setToast({ message: 'Deleted.', type: 'success' });
    }
  };

  if (isLoading && isInitializing) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8 py-4 flex justify-between shadow-sm">
        <div className="flex items-center">
           <Button variant="ghost" onClick={() => navigate('/admin/courses')}><ChevronLeft /></Button>
           <h1 className="text-2xl font-bold ml-4">{editCourseId ? 'Edit Course' : 'Create Course'}</h1>
        </div>
        <div className="flex space-x-3">
           <Button variant="secondary" onClick={() => handleSave(false)} isLoading={isLoading}>Save Draft</Button>
           <Button variant="primary" onClick={() => handleSave(true)} isLoading={isLoading}>Publish</Button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
         <div className="flex justify-center mb-10">
            <div className="bg-white rounded-2xl shadow-sm border p-1.5 inline-flex overflow-x-auto max-w-full">
                {[
                    { id: 'info', label: 'Info', icon: <BookOpen size={18} /> }, 
                    { id: 'structure', label: 'Structure', icon: <LayoutIcon size={18} /> }, 
                    { id: 'content', label: 'Library', icon: <Upload size={18} /> }, 
                    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }, 
                    { id: 'certificate', label: 'Certificate', icon: <Award size={18} /> },
                    { id: 'preview', label: 'Preview', icon: <Eye size={18} /> }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex items-center px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === t.id ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <span className="mr-2">{t.icon}</span>{t.label}
                    </button>
                ))}
            </div>
         </div>

         {activeTab === 'info' && <InfoTab courseInfo={courseInfo} setCourseInfo={setCourseInfo} categories={categories} onCreateCategory={handleCreateCategory} />}
         {activeTab === 'structure' && <StructureTab modules={modules} setModules={setModules} addModule={() => setModules([...modules, { id: `m${Date.now()}`, title: 'Untitled Module', description: '', isExpanded: true, lessons: [] }])} deleteModule={id => setModules(modules.filter(m => m.id !== id))} toggleModule={id => setModules(modules.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m))} addLesson={mid => setModules(modules.map(m => m.id === mid ? { ...m, lessons: [...m.lessons, { id: `l${Date.now()}`, title: `Lesson ${m.lessons.length+1}`, type: 'video' }] } : m))} contentLibrary={contentLibrary} onOpenUpload={openUploadForLesson} isAudioSeries={courseInfo.category === 'Audio Series'} />}
         {activeTab === 'content' && <ContentTab contentLibrary={contentLibrary} setActiveUploadType={setActiveUploadType} handleDeleteContent={handleDeleteContent} />}
         {activeTab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings} />}
         {activeTab === 'certificate' && <CertificateTab courseInfo={courseInfo} instructorName={courseInfo.instructor || user?.name || 'Instructor Name'} />}
         {activeTab === 'preview' && <PreviewTab courseInfo={courseInfo} modules={modules} />}

         <AnimatePresence>
            {activeUploadType && <UploadModal type={activeUploadType} onClose={() => { setActiveUploadType(null); setActiveLessonUpload(null); }} onComplete={handleUploadComplete} />}
         </AnimatePresence>
      </div>
    </div>
  );
};
