
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Terminal, Mic, CheckCircle, ArrowRight, 
  BookOpen, Code, Award, TrendingUp, Star, Users, Menu, X, Globe,
  Linkedin, Twitter, Zap, Shield, Layers, Feather, Headphones, Play, RefreshCw, Volume2, Pause,
  Database, Cloud, Cpu, Wifi, Server, Anchor
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { Course } from '../types';

// --- Interactive Hero Component ---
const HeroCodeVisual = () => {
  const [lines, setLines] = useState<string[]>(['', '', '', '']);
  const [activeLine, setActiveLine] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const fullCode = [
    "# Welcome to Aelgo Lab",
    "def master_skill(effort):",
    "    if effort > 0:",
    "        return 'Success'"
  ];

  // Typewriter Effect
  useEffect(() => {
    if (activeLine >= fullCode.length) {
      setIsTyping(false);
      setTimeout(() => runSimulation(), 500);
      return;
    }

    const currentText = fullCode[activeLine];
    const currentLength = lines[activeLine].length;

    if (currentLength < currentText.length) {
      const timeout = setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev];
          newLines[activeLine] = currentText.substring(0, currentLength + 1);
          return newLines;
        });
      }, Math.random() * 50 + 30); // Random typing speed
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setActiveLine(prev => prev + 1);
      }, 400); // Pause at end of line
      return () => clearTimeout(timeout);
    }
  }, [lines, activeLine]);

  const runSimulation = () => {
    setShowTerminal(true);
    setTerminalLogs(['> Initializing environment...']);
    
    setTimeout(() => setTerminalLogs(prev => [...prev, '> Compiling code...']), 800);
    setTimeout(() => setTerminalLogs(prev => [...prev, '> Running master_skill(100)...']), 1800);
    setTimeout(() => setTerminalLogs(prev => [...prev, '✔ Result: "Success"']), 2800);
  };

  const handleRunClick = () => {
    if (isTyping) return;
    setTerminalLogs([]);
    setShowTerminal(false);
    setTimeout(() => runSimulation(), 300);
  };

  // Syntax Highlighting Helper
  const renderLine = (text: string) => {
    if (text.startsWith('#')) return <span className="text-gray-500">{text}</span>;
    
    const parts = text.split(/('Success'|def|return|if|>)/g);
    return parts.map((part, i) => {
      if (part === 'def' || part === 'return' || part === 'if') return <span key={i} className="text-purple-400">{part}</span>;
      if (part === "'Success'") return <span key={i} className="text-green-400">{part}</span>;
      if (part.includes('master_skill')) return <span key={i} className="text-yellow-400">{part}</span>;
      return <span key={i} className="text-gray-200">{part}</span>;
    });
  };

  return (
    <div className="bg-gray-900/95 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 aspect-video relative group backdrop-blur-xl transform transition-transform hover:scale-[1.01] duration-500">
      {/* Window Header */}
      <div className="absolute top-0 w-full h-10 bg-gray-800/90 flex items-center justify-between px-4 border-b border-gray-700 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <div className="ml-4 px-3 py-1 bg-gray-900 rounded-md text-[10px] text-gray-400 font-mono flex items-center gap-2">
            <Terminal size={10} /> main.py
          </div>
        </div>
        <button 
          onClick={handleRunClick}
          disabled={isTyping}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all duration-200 border
            ${isTyping 
              ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed' 
              : 'bg-green-600 text-white border-green-500 hover:bg-green-500 hover:border-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer active:scale-95'
            }
          `}
        >
          <Play size={12} fill="currentColor" /> Run
        </button>
      </div>

      <div className="flex h-full pt-10">
        {/* Sidebar */}
        <div className="w-16 md:w-1/5 h-full border-r border-gray-800 bg-gray-900/50 p-4 hidden md:block">
           <div className="h-2 w-12 bg-gray-700/50 rounded mb-6"></div>
           <div className="space-y-3 opacity-50">
              {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-3 w-full bg-gray-800 rounded"></div>
              ))}
           </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 p-6 md:p-8 relative font-mono text-sm md:text-base">
           <div className="space-y-1">
              {lines.map((line, i) => (
                <div key={i} className="min-h-[1.5em] flex">
                   <span className="text-gray-600 mr-4 select-none w-4 text-right">{i+1}</span>
                   <div className="whitespace-pre">
                      {renderLine(line)}
                      {i === activeLine && isTyping && (
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-2 h-4 bg-primary-400 align-middle ml-1"
                        />
                      )}
                   </div>
                </div>
              ))}
           </div>

           {/* Floating Audio Widget - Restored Glassmorphism Design */}
           <motion.div 
              className="absolute top-6 right-6 z-30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
           >
              <div 
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className={`
                  relative overflow-hidden group cursor-pointer
                  flex items-center gap-3 pr-4 pl-1.5 py-1.5 
                  rounded-full border transition-all duration-300
                  ${isAudioPlaying 
                    ? 'bg-gray-900/80 border-primary-500/50 shadow-[0_0_20px_rgba(136,216,176,0.2)]' 
                    : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600'
                  }
                  backdrop-blur-md
                `}
              >
                 {/* Icon Container */}
                 <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0
                    ${isAudioPlaying ? 'bg-primary-500 text-white' : 'bg-gray-700/50 text-gray-400 group-hover:text-white'}
                 `}>
                    {isAudioPlaying ? <Pause size={12} fill="currentColor" /> : <Headphones size={14} />}
                 </div>

                 {/* Text Content */}
                 <div className="flex flex-col min-w-[90px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">
                      {isAudioPlaying ? 'Now Playing' : 'Audio Guide'}
                    </span>
                    <span className={`text-xs font-medium leading-none ${isAudioPlaying ? 'text-primary-300' : 'text-gray-200'}`}>
                      Concept Breakdown
                    </span>
                 </div>

                 {/* Equalizer (Visible when playing) */}
                 {isAudioPlaying && (
                    <div className="flex items-center gap-0.5 h-3 ml-1">
                       {[1,2,3,4].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [4, 12, 6, 10] }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 0.4, 
                              delay: i * 0.1, 
                              repeatType: "mirror",
                              ease: "easeInOut"
                            }}
                            className="w-0.5 bg-primary-400 rounded-full"
                          />
                       ))}
                    </div>
                 )}
              </div>
           </motion.div>

           {/* Terminal Drawer */}
           <AnimatePresence>
             {showTerminal && (
               <motion.div 
                 initial={{ y: '100%' }}
                 animate={{ y: 0 }}
                 exit={{ y: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-gray-700 p-4 font-mono text-xs md:text-sm text-gray-300 h-1/3 overflow-y-auto"
               >
                  <div className="flex justify-between items-center mb-2 text-gray-500 text-[10px] uppercase tracking-widest sticky top-0">
                     <span>Terminal</span>
                     <button onClick={() => setShowTerminal(false)}><X size={12} /></button>
                  </div>
                  <div className="space-y-1">
                     {terminalLogs.map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={log.includes('Success') ? 'text-green-400 font-bold' : ''}
                        >
                           {log}
                        </motion.div>
                     ))}
                     {terminalLogs.length < 3 && (
                        <motion.span 
                           animate={{ opacity: [0, 1] }} 
                           transition={{ repeat: Infinity, duration: 0.5 }}
                           className="inline-block w-1.5 h-3 bg-gray-500 ml-1"
                        />
                     )}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cast motion components for type safety in this context
  const MotionDiv = motion.div as any;

  const TRUSTED_COMPANIES = [
    { name: 'TechCorp', icon: <Terminal size={24} />, color: 'text-blue-600' },
    { name: 'DataFlow', icon: <Database size={24} />, color: 'text-purple-600' },
    { name: 'CloudScale', icon: <Cloud size={24} />, color: 'text-cyan-600' },
    { name: 'InnoSys', icon: <Cpu size={24} />, color: 'text-orange-600' },
    { name: 'CyberGuard', icon: <Shield size={24} />, color: 'text-red-600' },
    { name: 'NetLink', icon: <Wifi size={24} />, color: 'text-green-600' },
    { name: 'FutureAI', icon: <Zap size={24} />, color: 'text-yellow-600' },
    { name: 'DevOpsPro', icon: <Server size={24} />, color: 'text-indigo-600' },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
       const all = await api.getCourses();
       setCourses(all.slice(0, 3)); // Show top 3
    };
    fetchFeatured();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-gray-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 mr-3 transform group-hover:rotate-12 transition-transform duration-300">
                 <Globe className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                Aelgo World
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {['Features', 'How it Works', 'Courses', 'Stories'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} 
                  className="text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                 <Button onClick={() => navigate(user?.role !== 'student' ? '/admin' : '/dashboard')}>
                    Dashboard
                 </Button>
              ) : (
                 <>
                   <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2">
                     Log in
                   </button>
                   <Button onClick={() => navigate('/login')} className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow">
                     Get Started
                   </Button>
                 </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <motion.div 
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
          className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {['Features', 'How it Works', 'Courses', 'Stories'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} 
                className="block w-full text-left py-2 font-bold text-gray-600 hover:text-primary-600"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <Button variant="secondary" onClick={() => navigate('/login')} className="w-full justify-center">Log In</Button>
               <Button onClick={() => navigate('/login')} className="w-full justify-center">Get Started</Button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-primary-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-secondary-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-white/40 rounded-full blur-[120px] mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <MotionDiv
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
            >
               <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/80 border border-primary-100 text-primary-700 text-xs font-bold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-sm">
                 <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                 Phase-1 E-Learning Platform
               </div>
               <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
                 Master Tech Skills with <br className="hidden md:block"/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500">
                   Interactive Intelligence
                 </span>
               </h1>
               <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                 A new era of learning featuring <span className="font-semibold text-gray-800">browser-based code labs</span>, <span className="font-semibold text-gray-800">audio series</span>, and expert-led curriculum.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-primary-700 hover:bg-gray-50 h-16 px-10 text-lg border-none shadow-xl font-bold" 
                    onClick={() => navigate('/login')}
                  >
                   Start Learning Free
                 </Button>
                 <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 h-14 text-lg bg-white/80 backdrop-blur border-gray-200 hover:bg-white" icon={<PlayCircle size={20} />}>
                   Watch Demo
                 </Button>
               </div>
            </MotionDiv>
          </div>

          {/* New Interactive Hero Visual */}
          <MotionDiv 
            initial={{ opacity: 0, y: 60, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 1, type: "spring" }}
            className="relative mx-auto max-w-5xl perspective-1000"
          >
             <HeroCodeVisual />
          </MotionDiv>
        </div>
      </section>

      {/* Trusted By Strip (Animated Marquee) */}
      <div className="py-12 bg-white border-y border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Empowering learners from leading companies</p>
          </div>
          
          <div className="relative flex overflow-hidden w-full group">
              {/* Gradient Masks */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              
              <motion.div 
                  className="flex items-center gap-16 px-16 min-w-full"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
              >
                  {/* Duplicated List for Seamless Loop */}
                  {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((company, i) => (
                      <div key={i} className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer grayscale hover:grayscale-0 group flex-shrink-0">
                          <div className={`p-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all ${company.color}`}>
                              {company.icon}
                          </div>
                          <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900">{company.name}</span>
                      </div>
                  ))}
              </motion.div>
          </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Why Choose Aelgo World?</h2>
               <p className="text-lg text-gray-600 leading-relaxed">
                   We combine pedagogical expertise with modern tech stack to deliver a learning experience that actually sticks.
               </p>
            </div>

            <motion.div 
               variants={containerVariants}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
               {[
                 { 
                   title: 'Interactive Code Labs', 
                   desc: 'Practice as you learn with our built-in Jupyter-style notebooks and code editors. No local setup required.', 
                   icon: <Terminal size={28} />,
                   color: 'bg-blue-50 text-blue-600 border-blue-100'
                 },
                 { 
                   title: 'Audio Learning Series', 
                   desc: 'Turn your commute into classroom time with our exclusive, high-quality audio podcasts and lesson summaries.', 
                   icon: <Headphones size={28} />,
                   color: 'bg-purple-50 text-purple-600 border-purple-100'
                 },
                 { 
                   title: 'Project-Based Curriculum', 
                   desc: 'Build real-world applications for your portfolio. Learn by doing, not just watching videos.', 
                   icon: <Layers size={28} />,
                   color: 'bg-green-50 text-green-600 border-green-100'
                 }
               ].map((feature, i) => (
                 <MotionDiv 
                   key={i}
                   variants={itemVariants}
                   whileHover={{ y: -8 }}
                   className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                       {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                 </MotionDiv>
               ))}
            </motion.div>
         </div>
      </section>

      {/* How it Works - Stepped Visual */}
      <section id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="order-2 lg:order-1">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Learning that adapts to your lifestyle</h2>
                  <p className="text-lg text-gray-600 mb-10">Whether you have 10 minutes or 2 hours, Aelgo World has a learning mode for you.</p>
                  
                  <div className="space-y-8 relative">
                     {/* Connecting Line */}
                     <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                     {[
                       { title: 'Watch & Read', desc: 'High-quality video lessons accompanied by detailed reading materials.', icon: <BookOpen size={20} /> },
                       { title: 'Practice & Code', desc: 'Apply your knowledge immediately with interactive quizzes and code challenges.', icon: <Code size={20} /> },
                       { title: 'Listen & Review', desc: 'Reinforce concepts on the go with audio-only modes for every lesson.', icon: <Mic size={20} /> },
                     ].map((step, i) => (
                       <div key={i} className="flex gap-6 relative z-10 bg-gray-50">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-primary-100 text-primary-600 flex items-center justify-center shadow-sm">
                             {step.icon}
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                             <p className="text-gray-600">{step.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="relative order-1 lg:order-2">
                  <div className="absolute inset-0 bg-secondary-100 rounded-[2rem] transform rotate-3 scale-95 translate-y-4"></div>
                  <div className="relative rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Students learning" 
                        className="w-full object-cover h-[500px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-green-500 rounded text-xs font-bold uppercase">Live</span>
                              <span className="text-sm font-medium">1,240 students online</span>
                          </div>
                          <p className="font-bold text-lg">"The best platform for serious learners."</p>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Featured Courses (Dark Section) */}
      <section id="courses" className="py-24 bg-gray-900 text-white relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
                  <p className="text-gray-400 max-w-xl text-lg">Explore our most popular learning tracks designed by industry experts.</p>
               </div>
               <Button variant="secondary" className="bg-white/10 text-white border-transparent hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate('/login')}>
                  Explore Full Catalog <ArrowRight size={16} className="ml-2" />
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {courses.map((course, i) => (
                  <MotionDiv 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-primary-500/50 transition-all cursor-pointer h-full flex flex-col group hover:shadow-2xl hover:shadow-primary-900/20"
                    onClick={() => navigate('/login')}
                  >
                     <div className="h-52 overflow-hidden relative">
                        <img 
                           src={course.thumbnail} 
                           alt={course.title} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-primary-600 text-white shadow-lg">
                                {course.category}
                            </span>
                        </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors line-clamp-1">{course.title}</h3>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-auto">
                           <div className="flex items-center text-sm text-gray-300 font-medium">
                              <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} className="w-8 h-8 rounded-full mr-3 border border-gray-600" alt="" />
                              {course.instructor}
                           </div>
                           <span className="text-white font-bold bg-gray-700 px-3 py-1 rounded-lg">${course.price}</span>
                        </div>
                     </div>
                  </MotionDiv>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Success Stories</span>
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Loved by Students</h2>
               <p className="text-lg text-gray-600">Hear from people who transformed their careers with Aelgo World.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { name: 'Sarah Jenkins', role: 'Frontend Developer', quote: "The interactive coding labs made all the difference. I wasn't just watching videos; I was writing code from day one.", avatar: 'https://i.pravatar.cc/150?u=32' },
                 { name: 'David Chen', role: 'Data Scientist', quote: "I used the audio lessons during my commute. It's amazing how much you can learn when you turn downtime into study time.", avatar: 'https://i.pravatar.cc/150?u=12' },
                 { name: 'Elena Rodriguez', role: 'Product Designer', quote: "The project-based curriculum helped me build a portfolio that actually got me hired. Best investment ever.", avatar: 'https://i.pravatar.cc/150?u=44' },
               ].map((t, i) => (
                 <div key={i} className="bg-gray-50 p-8 rounded-3xl relative hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                    <div className="flex gap-1 mb-4 text-yellow-400">
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-gray-700 mb-8 relative z-10 italic leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center mt-auto">
                       <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-white" />
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary-600">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
         
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to launch your career?</h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Join thousands of students learning cutting-edge technologies today. No credit card required for free courses.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary-700 hover:bg-gray-50 h-16 px-10 text-lg border-none shadow-xl font-bold" 
                  onClick={() => navigate('/login')}
                >
                  Get Started for Free
               </Button>
               <Button 
                  variant="ghost" 
                  className="bg-primary-900/30 text-white border border-white/20 hover:bg-primary-900/50 h-16 px-10 text-lg backdrop-blur-sm" 
                  onClick={() => navigate('/courses')}
                >
                  Browse Curriculum
               </Button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-12 border-t border-gray-200 text-gray-600">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-6">
                     <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 text-white shadow-md">
                        <Globe size={18} />
                     </div>
                     <span className="text-xl font-bold text-gray-900">Aelgo World</span>
                  </div>
                  <p className="text-sm leading-relaxed max-w-sm mb-8 text-gray-500">
                     Empowering the next generation of tech leaders through interactive, accessible, and high-quality education.
                  </p>
                  <div className="flex space-x-4">
                     <a href="#" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Twitter size={18} /></a>
                     <a href="#" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Linkedin size={18} /></a>
                     <a href="#" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Globe size={18} /></a>
                  </div>
               </div>
               
               <div>
                  <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm">
                     <li><button onClick={() => navigate('/courses')} className="hover:text-primary-600 transition-colors">Browse Courses</button></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">For Enterprise</a></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">Mentorship</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                  <ul className="space-y-4 text-sm">
                     <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
               <p>&copy; 2025 Aelgo World Inc. All rights reserved.</p>
               <div className="flex space-x-8 mt-4 md:mt-0">
                  <button onClick={() => navigate('/privacy')} className="hover:text-gray-900 transition-colors">Privacy Policy</button>
                  <button onClick={() => navigate('/terms')} className="hover:text-gray-900 transition-colors">Terms of Service</button>
                  <button onClick={() => navigate('/cookies')} className="hover:text-gray-900 transition-colors">Cookie Settings</button>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
