
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, Upload, Layout as LayoutIcon, Settings, Eye, ChevronLeft, Plus, 
  Video, FileText, Mic, Terminal, ClipboardList, Trash2, 
  GripVertical, ChevronDown, ChevronUp, Calendar,
  HelpCircle, Play, BookOpen, X, Loader2, Check, File,
  Link2, Info, Code, CheckCircle, AlertCircle, Headphones, Music, Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Course, Category, ContentAsset } from '../types';

type Tab = 'info' | 'structure' | 'content' | 'settings' | 'preview';

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
    
    // Code Practice State
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
    }[]>([
        { id: 'q1', question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);

    const isVideo = type.title === 'Video Content';
    const isPodcast = type.title === 'Podcast/Audio';
    const isCodePractice = type.title === 'Code Practice';
    const isReading = type.title === 'Reading Material';
    const isQuiz = type.title === 'Quiz/Assessment';
    
    let acceptType = '*';
    let label = 'File';
    if (isReading) {
        acceptType = '.pdf';
        label = 'PDF';
    }

    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { id: `q${Date.now()}`, question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const updated = [...quizQuestions];
        if (field === 'question') updated[index].question = value;
        else if (field === 'correctAnswer') updated[index].correctAnswer = value;
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

    const startUpload = async () => {
      if (!title) return; // Title is mandatory for everything now

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
                      questions: quizQuestions
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
                  fileName: 'Coding Challenge',
                  fileSize: 'Code',
                  metadata: {
                      description: codeExercise.description,
                      starterCode: codeExercise.starterCode,
                      solutionCode: codeExercise.solutionCode
                  }
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
          className={`bg-white rounded-2xl shadow-2xl w-full ${isCodePractice || isQuiz ? 'max-w-4xl' : 'max-w-lg'} relative z-10 overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col`}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               {type.icon}
               <span>{isQuiz ? 'Create Quiz' : isCodePractice ? 'Create Code Challenge' : `Add ${type.title}`}</span>
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
               <X size={20} />
             </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {uploadState === 'idle' ? (
              <div className="space-y-6">
                
                {/* GLOBAL TITLE INPUT FOR ALL TYPES */}
                <Input 
                    label="Content Title" 
                    placeholder={`e.g. ${isQuiz ? 'Module 1 Assessment' : isVideo ? 'Intro to React' : 'Chapter 1 Notes'}`}
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
                             <Info size={18} className="mt-0.5 mr-3 flex-shrink-0 text-blue-600" />
                             <p>
                                 {isPodcast 
                                    ? "Provide a direct link to an MP3 or audio stream. We'll load it into the custom audio player."
                                    : "Paste a video link. We'll automatically fetch the thumbnail and embed it for seamless playback."
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
                                    // Auto-fill title if empty
                                    if(!title) setTitle(e.target.files[0].name.split('.')[0]);
                                }
                            }}
                        />
                    </div>
                )}

                {/* --- QUIZ BUILDER --- */}
                {isQuiz && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {quizQuestions.map((q, qIdx) => (
                                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Question {qIdx + 1}</label>
                                        {quizQuestions.length > 1 && (
                                            <button onClick={() => handleRemoveQuestion(qIdx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <Input 
                                        placeholder="Enter the question here..."
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                                        className="mb-4 bg-white"
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input 
                                                    type="radio" 
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctAnswer === oIdx}
                                                    onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <input 
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={handleAddQuestion} className="w-full border-dashed border-2 border-gray-300 hover:border-primary-500 hover:text-primary-600">
                            <Plus size={16} className="mr-2" /> Add Another Question
                        </Button>
                    </div>
                )}

                {/* --- CODE PRACTICE --- */}
                {isCodePractice && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                            <textarea 
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] text-sm resize-y"
                                placeholder="Describe the problem the student needs to solve..."
                                value={codeExercise.description}
                                onChange={e => setCodeExercise({...codeExercise, description: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col h-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Code size={14} className="text-gray-500" /> Starter Code (Visible)
                                </label>
                                <textarea 
                                    className="w-full flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[200px] font-mono text-xs bg-gray-50 text-gray-800 leading-relaxed"
                                    value={codeExercise.starterCode}
                                    onChange={e => setCodeExercise({...codeExercise, starterCode: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col h-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2 text-green-700">
                                    <Check size={14} /> Reference Solution (Hidden)
                                </label>
                                <textarea 
                                    className="w-full flex-1 px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[200px] font-mono text-xs bg-green-50/30 text-gray-800 leading-relaxed"
                                    value={codeExercise.solutionCode}
                                    onChange={e => setCodeExercise({...codeExercise, solutionCode: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                 {uploadState === 'uploading' ? (
                   <div className="w-full max-w-xs text-center">
                     <div className="mb-6 relative w-20 h-20 mx-auto">
                        <Loader2 className="w-full h-full animate-spin text-primary-600 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-primary-700 text-sm">
                           {Math.round(progress)}%
                        </div>
                     </div>
                     <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {isVideo || isPodcast ? 'Verifying Link...' : isCodePractice || isQuiz ? 'Saving Content...' : 'Uploading File...'}
                     </h4>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200">
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
                <Button 
                    onClick={startUpload} 
                    disabled={
                        !title || 
                        (isCodePractice && !codeExercise.description) ||
                        ((isVideo || isPodcast) && !url) ||
                        (isReading && !selectedFile)
                    }
                    className="w-full sm:w-auto min-w-[120px]"
                >
                    {isCodePractice || isQuiz ? 'Save Content' : (isVideo || isPodcast) ? 'Add Link' : 'Start Upload'}
                </Button>
            </div>
          )}
        </MotionDiv>
      </div>
    );
};

// ... InfoTab, StructureTab (Reuse logic) ...

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

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, GIF)');
            return;
        }

        setIsUploadingThumb(true);
        try {
            const result = await api.uploadFileToStorage(file);
            if (result) {
                setCourseInfo({ ...courseInfo, thumbnail: result.url });
            }
        } catch (error) {
            console.error("Thumbnail upload failed", error);
            alert("Failed to upload thumbnail");
        } finally {
            setIsUploadingThumb(false);
        }
    };

    return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
       <div className="border-b border-gray-100 pb-6">
         <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Course Information</h2>
         </div>
         <p className="text-gray-500">Basic details about your course that will appear on the landing page.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Thumbnail Upload */}
         <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Course Thumbnail</label>
            <div className="relative aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden group hover:border-primary-500 transition-colors">
                {courseInfo.thumbnail ? (
                    <img src={courseInfo.thumbnail} alt="Course Thumbnail" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon size={32} className="mb-2" />
                        <span className="text-xs">No image selected</span>
                    </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-gray-50 flex items-center transition-transform hover:scale-105">
                        {isUploadingThumb ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload size={16} className="mr-2" />}
                        {isUploadingThumb ? 'Uploading...' : 'Change Image'}
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleThumbnailUpload} />
                    </label>
                    <p className="text-white/80 text-[10px] mt-2 font-medium">Supports JPG, PNG, GIF</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recommended size: 1280x720 pixels.</p>
         </div>

         {/* Right Column: Form Fields */}
         <div className="lg:col-span-2 space-y-6">
            <Input 
                label="Course Title *" 
                placeholder="e.g., Complete React Development Bootcamp" 
                value={courseInfo.title}
                onChange={e => setCourseInfo({...courseInfo, title: e.target.value})}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                {!showNewCatInput ? (
                    <div className="flex gap-2">
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white transition-shadow"
                            value={courseInfo.category}
                            onChange={e => setCourseInfo({...courseInfo, category: e.target.value})}
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => setShowNewCatInput(true)}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                            title="Create New Category"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            className="w-full px-4 py-2 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="New Category Name"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            autoFocus
                        />
                        <button 
                            onClick={handleCreate}
                            disabled={isCreatingCat}
                            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {isCreatingCat ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button 
                            onClick={() => setShowNewCatInput(false)}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level *</label>
                <select 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white transition-shadow"
                    value={courseInfo.level}
                    onChange={e => setCourseInfo({...courseInfo, level: e.target.value})}
                >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Duration (hours)" 
                    placeholder="e.g., 40" 
                    value={courseInfo.duration}
                    onChange={e => setCourseInfo({...courseInfo, duration: e.target.value})}
                />
                <Input 
                    label="Price (USD)" 
                    placeholder="e.g., 99.99" 
                    value={courseInfo.price}
                    onChange={e => setCourseInfo({...courseInfo, price: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Description *</label>
                <textarea 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[150px] transition-shadow"
                placeholder="Provide a comprehensive description of what students will learn..."
                value={courseInfo.description}
                onChange={e => setCourseInfo({...courseInfo, description: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What You'll Learn</label>
                <textarea 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[120px] transition-shadow"
                placeholder="• Master React fundamentals&#10;• Build real-world applications"
                value={courseInfo.learningOutcomes}
                onChange={e => setCourseInfo({...courseInfo, learningOutcomes: e.target.value})}
                />
            </div>
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
    // ... (This component remains the same as before, no logic change needed for edit)
    const standardModules = modules.filter(m => m.id !== 'podcast-module');
    const podcastModule = modules.find(m => m.id === 'podcast-module');

    const handleAddPodcastEpisode = () => {
        if (!podcastModule) {
            setModules([...modules, {
                id: 'podcast-module',
                title: 'Audio Companion & Podcast',
                description: 'Audio-only content for screen-off learning',
                isExpanded: true,
                isPodcast: true,
                lessons: [{ id: `l${Date.now()}`, title: 'New Episode', type: 'podcast' }]
            }]);
        } else {
            setModules(modules.map(m => {
                if (m.id === 'podcast-module') {
                    return {
                        ...m,
                        lessons: [...m.lessons, { id: `l${Date.now()}`, title: 'New Episode', type: 'podcast' }]
                    };
                }
                return m;
            }));
        }
    };

    const updatePodcastLesson = (lessonId: string, title: string) => {
        setModules(modules.map(m => {
            if (m.id === 'podcast-module') {
                return {
                    ...m,
                    lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title } : l)
                };
            }
            return m;
        }));
    };

    const deletePodcastLesson = (lessonId: string) => {
        setModules(modules.map(m => {
            if (m.id === 'podcast-module') {
                return {
                    ...m,
                    lessons: m.lessons.filter(l => l.id !== lessonId)
                };
            }
            return m;
        }));
    };

    const getAvailableContent = (lessonType: string) => {
        switch(lessonType) {
            case 'video': return contentLibrary.filter(c => c.type === 'Video Content');
            case 'reading': return contentLibrary.filter(c => c.type === 'Reading Material');
            case 'podcast': return contentLibrary.filter(c => c.type === 'Podcast/Audio');
            case 'jupyter': return contentLibrary.filter(c => c.type === 'Code Practice');
            case 'quiz': return contentLibrary.filter(c => c.type === 'Quiz/Assessment');
            default: return [];
        }
    };

    return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {!isAudioSeries && (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                <div className="flex items-center space-x-2 mb-1">
                    <LayoutIcon className="text-primary-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                </div>
                <p className="text-gray-500">Organize your main video and reading content.</p>
                </div>
                <Button onClick={addModule} icon={<Plus size={16} />}>Add Module</Button>
            </div>

            <div className="space-y-4">
                {standardModules.map((module, idx) => (
                <MotionDiv 
                    key={module.id} 
                    layout 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="p-4 bg-gray-50 flex items-center gap-4 border-b border-gray-100">
                    <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 cursor-move hover:text-gray-600">
                        <GripVertical size={20} />
                    </div>
                    
                    <div className="flex-1">
                        <div className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">
                        Module {idx + 1}
                        </div>
                        <input 
                        value={module.title}
                        onChange={(e) => {
                            const newModules = modules.map((m) => 
                                m.id === module.id ? { ...m, title: e.target.value } : m
                            );
                            setModules(newModules);
                        }}
                        className="font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0 w-full text-lg placeholder-gray-400"
                        placeholder="Module Title"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 mr-2">
                        {module.lessons.length} Lessons
                        </span>
                        <button onClick={() => deleteModule(module.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                        </button>
                        <button onClick={() => toggleModule(module.id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        {module.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                    </div>

                    <AnimatePresence>
                    {module.isExpanded && (
                        <MotionDiv 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-6 space-y-4"
                        >
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Description</label>
                            <textarea 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px] text-sm resize-none"
                                placeholder="Brief overview of what this module covers..."
                                value={module.description}
                                onChange={(e) => {
                                    const newModules = modules.map((m) => 
                                    m.id === module.id ? { ...m, description: e.target.value } : m
                                    );
                                    setModules(newModules);
                                }}
                            />
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-700 text-sm flex items-center"><BookOpen size={16} className="mr-2" /> Lessons</h4>
                            <Button size="sm" variant="secondary" onClick={() => addLesson(module.id)} icon={<Plus size={14} />} className="text-xs h-8">
                                Add Lesson
                            </Button>
                            </div>
                            <div className="space-y-3">
                            {module.lessons.map((lesson, lIdx) => {
                                const availableContent = getAvailableContent(lesson.type);
                                
                                return (
                                <div key={lesson.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 group hover:border-primary-200 transition-colors shadow-sm">
                                    <div className="flex items-center mb-3">
                                        <GripVertical className="text-gray-300 mr-3 cursor-move" size={16} />
                                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mr-3 shadow-sm flex-shrink-0 ${
                                            lesson.type === 'podcast' 
                                                ? 'bg-purple-100 text-purple-600 border-purple-200' 
                                                : 'bg-white border-gray-200 text-primary-600'
                                        }`}>
                                            {lesson.type === 'video' && <Video size={16} />}
                                            {lesson.type === 'reading' && <FileText size={16} />}
                                            {lesson.type === 'quiz' && <HelpCircle size={16} />}
                                            {lesson.type === 'jupyter' && <Terminal size={16} />}
                                            {lesson.type === 'podcast' && <Mic size={16} />}
                                        </div>
                                        <input 
                                            value={lesson.title}
                                            onChange={(e) => {
                                                const newModules = modules.map(m => {
                                                    if(m.id === module.id) {
                                                        const newLessons = [...m.lessons];
                                                        newLessons[lIdx] = { ...newLessons[lIdx], title: e.target.value };
                                                        return { ...m, lessons: newLessons };
                                                    }
                                                    return m;
                                                });
                                                setModules(newModules);
                                            }}
                                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-800 w-full placeholder-gray-400"
                                            placeholder="Lesson Title"
                                        />
                                        <button 
                                            onClick={() => {
                                                const newModules = modules.map(m => {
                                                    if(m.id === module.id) {
                                                        return { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) };
                                                    }
                                                    return m;
                                                });
                                                setModules(newModules);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Lesson Type</label>
                                            <select 
                                                className="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-primary-500 focus:border-primary-500"
                                                value={lesson.type}
                                                onChange={(e) => {
                                                    const newModules = modules.map(m => {
                                                        if(m.id === module.id) {
                                                            const newLessons = [...m.lessons];
                                                            newLessons[lIdx] = { ...newLessons[lIdx], type: e.target.value as any, contentId: undefined };
                                                            return { ...m, lessons: newLessons };
                                                        }
                                                        return m;
                                                    });
                                                    setModules(newModules);
                                                }}
                                            >
                                                <option value="video">Video Lesson</option>
                                                <option value="reading">Reading Material</option>
                                                <option value="quiz">Quiz / Assessment</option>
                                                <option value="jupyter">Code Practice</option>
                                                <option value="podcast">Podcast / Audio</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                                <LinkIcon size={12} className="mr-1" /> Linked Content
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className={`w-full text-xs px-2 py-2 border rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 ${!lesson.contentId ? 'border-orange-300 text-orange-600' : 'border-gray-200 text-gray-600'}`}
                                                    value={lesson.contentId || ""}
                                                    onChange={(e) => {
                                                        const newModules = modules.map(m => {
                                                            if(m.id === module.id) {
                                                                const newLessons = [...m.lessons];
                                                                newLessons[lIdx] = { ...newLessons[lIdx], contentId: e.target.value };
                                                                return { ...m, lessons: newLessons };
                                                            }
                                                            return m;
                                                        });
                                                        setModules(newModules);
                                                    }}
                                                >
                                                    <option value="">-- Select {lesson.type} content --</option>
                                                    {availableContent.map(content => (
                                                        <option key={content.id} value={content.id}>
                                                            {content.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                            </div>
                        </div>
                        </MotionDiv>
                    )}
                    </AnimatePresence>
                </MotionDiv>
                ))}
            </div>
        </div>
      )}

      {/* Podcast / Audio Series Section */}
      <div className="space-y-6 pt-8 border-t border-gray-100">
         <div className="flex justify-between items-start">
            <div>
               <div className="flex items-center space-x-2 mb-1">
                  <Headphones className="text-purple-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">{isAudioSeries ? 'Audio Series Content' : 'Audio Companion & Podcast'}</h2>
               </div>
               <p className="text-gray-500 max-w-2xl">
                  {isAudioSeries 
                    ? 'Manage your audio episodes. These will be the primary content for this course.'
                    : 'Add a dedicated audio section for students to listen on the go. Great for recaps or interviews.'}
               </p>
            </div>
            {!podcastModule && !isAudioSeries && (
                <Button onClick={handleAddPodcastEpisode} variant="secondary" className="border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100">
                    Enable Podcast Section
                </Button>
            )}
         </div>

         {(podcastModule || isAudioSeries) && (
             <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 overflow-hidden shadow-sm">
                <div className="p-4 bg-purple-100/50 border-b border-purple-100 flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center">
                        <Music size={18} className="mr-2" /> 
                        {isAudioSeries ? 'Series Episodes' : 'Audio Only Modules'}
                    </span>
                    <Button size="sm" onClick={handleAddPodcastEpisode} className="bg-purple-600 hover:bg-purple-700 text-white border-none h-8 text-xs">
                        <Plus size={14} className="mr-1" /> Add Episode
                    </Button>
                </div>
                
                <div className="p-4 space-y-3">
                    {podcastModule?.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic">No episodes added yet.</div>
                    ) : (
                        podcastModule?.lessons.map((lesson) => {
                            const audioContent = contentLibrary.filter(c => c.type === 'Podcast/Audio');
                            return (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 shadow-sm group">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Mic size={18} />
                                </div>
                                <div className="flex-1">
                                    <input 
                                        className="w-full font-semibold text-gray-800 bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                                        value={lesson.title}
                                        onChange={(e) => updatePodcastLesson(lesson.id, e.target.value)}
                                        placeholder="Episode Title"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <select
                                        className={`w-full text-xs px-2 py-1.5 border rounded bg-gray-50 focus:ring-purple-500 focus:border-purple-500 ${!lesson.contentId ? 'border-orange-300 text-orange-600' : 'border-gray-200 text-gray-600'}`}
                                        value={lesson.contentId || ""}
                                        onChange={(e) => {
                                            // Manual update logic for podcast module
                                            const newModules = modules.map(m => {
                                                if(m.id === 'podcast-module') {
                                                    const newLessons = m.lessons.map(l => 
                                                        l.id === lesson.id ? { ...l, contentId: e.target.value } : l
                                                    );
                                                    return { ...m, lessons: newLessons };
                                                }
                                                return m;
                                            });
                                            setModules(newModules);
                                        }}
                                    >
                                        <option value="">-- Select Audio File --</option>
                                        {audioContent.map(content => (
                                            <option key={content.id} value={content.id}>
                                                {content.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={() => deletePodcastLesson(lesson.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )})
                    )}
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
    // ... (This component remains the same)
    const MotionDiv = motion.div as any;
    return (
    <div className="max-w-6xl mx-auto space-y-10">
       <div>
         <div className="flex items-center space-x-2 mb-2">
            <Upload className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Content Upload</h2>
         </div>
         <p className="text-gray-500 mb-8 max-w-2xl">
           Add multimedia learning materials to your library. You can attach these files to specific lessons in the Structure tab later.
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Video Content', desc: 'Add YouTube link for embedded playback', icon: <Video size={28} />, color: 'text-blue-500 bg-blue-50 border-blue-100' },
             { title: 'Reading Material', desc: 'Upload PDF documents', icon: <FileText size={28} />, color: 'text-green-500 bg-green-50 border-green-100' },
             { title: 'Podcast/Audio', desc: 'Add Link to MP3 or Audio file', icon: <Mic size={28} />, color: 'text-purple-500 bg-purple-50 border-purple-100' },
             { title: 'Code Practice', desc: 'Create interactive coding challenges', icon: <Terminal size={28} />, color: 'text-orange-500 bg-orange-50 border-orange-100' },
             { title: 'Quiz/Assessment', desc: 'Create interactive quizzes', icon: <ClipboardList size={28} />, color: 'text-red-500 bg-red-50 border-red-100' },
           ].map((item, i) => (
             <MotionDiv 
               key={i}
               whileHover={{ y: -5, scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => setActiveUploadType(item)}
               className={`p-6 rounded-2xl border bg-white hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group relative overflow-hidden`}
             >
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                 {item.icon}
               </div>
               <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
               <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
             </MotionDiv>
           ))}
         </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Content Library</h3>
              <p className="text-xs text-gray-500 mt-1">Manage all your uploaded assets</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
              {contentLibrary.length} Assets
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Size/Link</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contentLibrary.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-4 font-medium text-gray-900 flex items-center max-w-sm">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-4 text-gray-500 flex-shrink-0 border border-gray-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {item.type === 'Video Content' ? <Link2 size={18} /> : item.type === 'Code Practice' ? <Code size={18} /> : item.type === 'Podcast/Audio' ? <Mic size={18} /> : item.type === 'Quiz/Assessment' ? <ClipboardList size={18} /> : <File size={18} />}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="truncate font-semibold text-gray-800" title={item.fileName || item.title}>
                            {item.title}
                        </span>
                        <span className="text-xs text-gray-400">ID: {item.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs max-w-[150px] truncate">{item.fileSize || item.fileUrl}</td>
                    <td className="px-6 py-4 text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteContent(item.id, item.fileUrl)}
                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Asset"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {contentLibrary.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No content uploaded yet.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
       </div>
    </div>
    );
};

// ... SettingsTab (No changes needed) ...
const SettingsTab: React.FC<{ settings: any, setSettings: any }> = ({ settings, setSettings }) => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-10">
      <div className="border-b border-gray-100 pb-6">
         <div className="flex items-center space-x-2 mb-2">
            <Settings className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Course Settings</h2>
         </div>
         <p className="text-gray-500">Fine-tune how your course behaves and who can access it.</p>
       </div>
       
       <div className="space-y-6">
         <h3 className="font-bold text-gray-900 pb-2 flex items-center"><Eye size={18} className="mr-2 text-gray-400" /> Visibility & Access</h3>
         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
           <label className="block text-sm font-bold text-gray-800 mb-2">Course Visibility</label>
           <select 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white mb-2"
              value={settings.visibility}
              onChange={e => setSettings({...settings, visibility: e.target.value})}
           >
             <option value="public">Public - Anyone can enroll</option>
             <option value="private">Private - Invitation only</option>
             <option value="unlisted">Unlisted - Accessible via link</option>
           </select>
           <p className="text-xs text-gray-500">Control who can discover and enroll in this course.</p>
         </div>
       </div>
    </div>
);

// --- Main Component ---

export const CourseBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get('courseId');

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeLessonUpload, setActiveLessonUpload] = useState<{moduleId: string, lessonId: string} | null>(null);
  const [contentLibrary, setContentLibrary] = useState<ContentAsset[]>([]);
  const [activeUploadType, setActiveUploadType] = useState<{title: string, icon: React.ReactNode, color: string} | null>(null);

  // --- Form State ---
  const [courseInfo, setCourseInfo] = useState({
    id: `c${Date.now()}`,
    title: '',
    category: '',
    level: '',
    duration: '',
    price: '',
    description: '',
    learningOutcomes: '',
    prerequisites: '',
    thumbnail: 'https://picsum.photos/800/600'
  });

  const [modules, setModules] = useState<ModuleState[]>([
    {
      id: `m${Date.now()}`,
      title: 'Introduction to the Course',
      description: 'Overview of what we will learn',
      isExpanded: true,
      lessons: [
        { id: `l${Date.now()}`, title: 'Welcome Video', type: 'video' }
      ]
    }
  ]);

  const [settings, setSettings] = useState({
    visibility: 'public',
    enrollmentLimit: 'Unlimited',
    enrollmentDeadline: '',
    enableDiscussion: false
  });

  // Load Categories & Content Library
  useEffect(() => {
      const loadData = async () => {
          setIsInitializing(true);
          const [cats, assets] = await Promise.all([
              api.getCategories(),
              api.getContentLibrary()
          ]);
          setCategories(cats);
          setContentLibrary(assets);
          setIsInitializing(false);
      };
      loadData();
  }, []);

  // Load Existing Course for Editing
  useEffect(() => {
      if (!editCourseId) return;
      if (contentLibrary.length === 0 && !isInitializing) {
          // If library is empty but we finished initializing, we might miss linking. 
          // But usually library loads fast. Let's just wait for logic.
      }

      const fetchCourse = async () => {
          setIsLoading(true);
          const data = await api.getCourseById(editCourseId);
          if (data) {
              setCourseInfo({
                  id: data.id,
                  title: data.title,
                  category: data.category,
                  level: data.level,
                  duration: data.duration || '',
                  price: data.price.toString(),
                  description: data.description,
                  learningOutcomes: data.learningOutcomes?.join('\n') || '',
                  prerequisites: '',
                  thumbnail: data.thumbnail
              });

              // Map Modules & Lessons
              const mappedModules: ModuleState[] = data.modules.map(m => ({
                  id: m.id,
                  title: m.title,
                  description: m.description || '',
                  isExpanded: false,
                  isPodcast: m.isPodcast,
                  lessons: m.lessons.map(l => {
                      // Attempt to reverse lookup contentId from URL if possible
                      // This is a heuristic since we don't store contentId in the Lesson table directly in this simple schema
                      // In a real app, Lesson table would FK to ContentAsset.
                      // Here we try to match by fileUrl or exact metadata match.
                      const libraryItem = contentLibrary.find(asset => 
                          (asset.fileUrl && asset.fileUrl === l.contentUrl) || 
                          (asset.metadata?.url && asset.metadata.url === l.contentUrl)
                      );

                      return {
                          id: l.id,
                          title: l.title,
                          type: l.type as any,
                          contentId: libraryItem?.id
                      };
                  })
              }));
              
              setModules(mappedModules);
              setSettings(prev => ({ ...prev, visibility: data.published ? 'public' : 'unlisted' })); // Simple mapping
          }
          setIsLoading(false);
      };

      if (!isInitializing) {
          fetchCourse();
      }
  }, [editCourseId, isInitializing, contentLibrary.length]); // Re-run when library loads to ensure linking works

  const handleCreateCategory = async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: Category = {
          id: `cat_${Date.now()}`,
          name,
          slug,
          count: 0
      };
      await api.saveCategory(newCat);
      setCategories([...categories, newCat]);
      setCourseInfo({ ...courseInfo, category: name }); // Auto select
      setToast({ message: 'Category created successfully', type: 'success' });
  };

  const handleSave = async (shouldPublish: boolean = false) => {
    setIsLoading(true);
    
    // Construct Course Object from State
    const courseData: Course = {
        id: courseInfo.id,
        title: courseInfo.title || "Untitled Course",
        description: courseInfo.description || "No description provided.",
        thumbnail: courseInfo.thumbnail,
        instructor: 'Admin User',
        price: parseFloat(courseInfo.price) || 0,
        level: (courseInfo.level as any) || 'Beginner',
        category: courseInfo.category || 'Development',
        progress: 0,
        totalModules: modules.length,
        enrolledStudents: 0,
        learningOutcomes: courseInfo.learningOutcomes.split('\n').filter(s => s.trim().length > 0),
        published: shouldPublish,
        duration: courseInfo.duration, // Persist Duration
        modules: modules.map(m => ({
            id: m.id,
            title: m.title,
            isPodcast: m.isPodcast,
            lessons: m.lessons.map(l => {
                let resolvedContentUrl = undefined;
                let resolvedContentData = undefined;

                if (l.contentId) {
                    const contentItem = contentLibrary.find(c => c.id === l.contentId);
                    if (contentItem) {
                        if (contentItem.type === 'Video Content' || contentItem.type === 'Podcast/Audio' || contentItem.type === 'Reading Material') {
                            resolvedContentUrl = contentItem.fileUrl || contentItem.metadata?.url || contentItem.fileName;
                        } else {
                            // For complex types like Quiz or Code, store the metadata structure
                            resolvedContentData = contentItem.metadata;
                        }
                    }
                }

                return {
                    id: l.id,
                    title: l.title,
                    type: l.type,
                    completed: false,
                    duration: '10 min', // Default placeholder if not set
                    contentUrl: resolvedContentUrl,
                    contentData: resolvedContentData
                };
            })
        }))
    };

    const result = await api.saveCourse(courseData);
    setIsLoading(false);

    if (result.success) {
        const msg = shouldPublish ? 'Course published successfully!' : 'Draft saved successfully.';
        setToast({ message: msg, type: 'success' });
        if (shouldPublish) {
             setTimeout(() => navigate('/admin/courses'), 2000);
        }
    } else {
        setToast({ message: 'Error saving course: ' + result.message, type: 'error' });
    }
  };

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  const addModule = () => {
    setModules([
      ...modules, 
      { 
        id: `m${Date.now()}`, 
        title: 'Untitled Module', 
        description: '', 
        isExpanded: true, 
        lessons: [] 
      }
    ]);
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, { id: `l${Date.now()}`, title: 'Untitled Lesson', type: 'video' }]
        };
      }
      return m;
    }));
  };

  const handleUploadComplete = (newItem: ContentAsset) => {
    setContentLibrary([newItem, ...contentLibrary]);
    
    if (activeLessonUpload) {
        setModules(prevModules => prevModules.map(m => {
            if (m.id === activeLessonUpload.moduleId) {
                return {
                    ...m,
                    lessons: m.lessons.map(l => 
                        l.id === activeLessonUpload.lessonId 
                            ? { ...l, contentId: newItem.id, title: l.title === 'New Episode' ? newItem.title : l.title } 
                            : l
                    )
                };
            }
            return m;
        }));
        setToast({ message: `Uploaded & linked to lesson.`, type: 'success' });
        setActiveLessonUpload(null);
    } else {
        setToast({ message: `${newItem.title} added to library.`, type: 'success' });
    }
    
    setActiveUploadType(null);
  };

  const handleDeleteContent = async (id: string, fileUrl?: string) => {
    const success = await api.deleteContentAsset(id, fileUrl);
    if (success) {
        setContentLibrary(contentLibrary.filter(c => c.id !== id));
        setToast({ message: 'Item removed from library.', type: 'success' });
    } else {
        setToast({ message: 'Failed to delete item.', type: 'error' });
    }
  };

  const openUploadForLesson = (type: any, lessonId: string, moduleId: string) => {
      setActiveLessonUpload({ lessonId, moduleId });
      setActiveUploadType(type);
  };

  const isAudioSeries = courseInfo.category === 'Audio Series';

  const MotionDiv = motion.div as any;

  if (isLoading && isInitializing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
           <Button variant="ghost" className="mr-4 text-gray-500 hover:text-gray-900" onClick={() => navigate('/admin/courses')}>
             <ChevronLeft size={22} />
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{editCourseId ? 'Edit Course' : 'Create Course'}</h1>
             <p className="text-xs text-gray-500 font-medium mt-0.5">{editCourseId ? 'Editing existing content' : 'Draft • Last saved just now'}</p>
           </div>
        </div>
        <div className="flex space-x-3">
           <Button 
             variant="secondary" 
             icon={<Save size={18} />} 
             onClick={() => handleSave(false)} 
             isLoading={isLoading}
             className="border-gray-300 shadow-sm"
            >
             Save Draft
           </Button>
           <Button 
             variant="primary" 
             icon={<Upload size={18} />} 
             onClick={() => handleSave(true)} 
             isLoading={isLoading}
             className="shadow-md shadow-primary-500/20"
            >
             Publish Course
           </Button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
         <div className="flex justify-center mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 inline-flex relative z-10">
            {[
                { id: 'info', label: 'Info', icon: <BookOpen size={18} /> },
                { id: 'structure', label: 'Structure', icon: <LayoutIcon size={18} /> },
                { id: 'content', label: 'Content', icon: <Upload size={18} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
                { id: 'preview', label: 'Preview', icon: <Eye size={18} /> },
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                    activeTab === tab.id 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                >
                <span className="mr-2.5">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                   <MotionDiv 
                     className="absolute inset-0 border-2 border-primary-100 rounded-xl pointer-events-none"
                     initial={false}
                   />
                )}
                </button>
            ))}
            </div>
         </div>

         <div>
            {activeTab === 'info' && (
                <InfoTab 
                    courseInfo={courseInfo} 
                    setCourseInfo={setCourseInfo} 
                    categories={categories}
                    onCreateCategory={handleCreateCategory}
                />
            )}
            
            {activeTab === 'structure' && (
                <StructureTab 
                    modules={modules} 
                    setModules={setModules} 
                    addModule={addModule} 
                    deleteModule={deleteModule} 
                    toggleModule={toggleModule} 
                    addLesson={addLesson} 
                    contentLibrary={contentLibrary}
                    onOpenUpload={openUploadForLesson}
                    isAudioSeries={isAudioSeries}
                />
            )}
            
            {activeTab === 'content' && (
                <ContentTab 
                    contentLibrary={contentLibrary} 
                    setActiveUploadType={setActiveUploadType} 
                    handleDeleteContent={handleDeleteContent} 
                />
            )}
            
            {activeTab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings} />}
            
            {activeTab === 'preview' && (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                  <Play className="text-gray-400" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Preview Mode</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Experience the course exactly as your students will see it. Test quizzes, watch videos, and review lessons.</p>
                <Button 
                  size="lg" 
                  onClick={async () => {
                    await handleSave(false);
                    navigate(`/course/${courseInfo.id}`);
                  }} 
                  className="px-8 py-4 text-lg"
                  isLoading={isLoading}
                >
                  Launch Student View
                </Button>
              </div>
            )}
         </div>

         <AnimatePresence>
            {activeUploadType && (
                <UploadModal 
                  type={activeUploadType} 
                  onClose={() => { setActiveUploadType(null); setActiveLessonUpload(null); }} 
                  onComplete={handleUploadComplete}
                />
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};
