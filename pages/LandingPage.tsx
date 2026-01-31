
import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Terminal, Mic, CheckCircle, ArrowRight, 
  BookOpen, Code, Award, TrendingUp, Star, Users, Menu, X, Globe,
  Linkedin, Twitter, Zap, Shield, Layers, Feather, Headphones, Play, RefreshCw, Volume2, Pause,
  Database, Cloud, Cpu, Wifi, Server, Anchor, MousePointer2, Quote
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { Course } from '../types';
import { Hero3D } from '../components/Hero3D';
import { ScrollReveal } from '../components/ScrollReveal';

// --- 3D Tilt Card Component ---
const TiltCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const MotionDiv = motion.div as any;

    return (
        <MotionDiv
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            <div style={{ transform: "translateZ(50px)" }}>
                {children}
            </div>
        </MotionDiv>
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
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden perspective-1000">
      
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-gray-200/50 transition-all duration-300" role="navigation" aria-label="Main Navigation">
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
                  aria-label={`Scroll to ${item}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                 <Button onClick={() => navigate(user?.role !== 'student' ? '/admin' : '/dashboard')} aria-label="Go to Dashboard">
                    Dashboard
                 </Button>
              ) : (
                 <>
                   <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2" aria-label="Login">
                     Log in
                   </button>
                   <Button onClick={() => navigate('/login')} className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow" aria-label="Get Started">
                     Get Started
                   </Button>
                 </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
              >
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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-50" aria-labelledby="hero-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="text-center lg:text-left z-20"
            >
               <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white border border-gray-100 shadow-sm text-primary-700 text-xs font-bold tracking-wide uppercase mb-8 hover:shadow-md transition-shadow cursor-default">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                 </span>
                 Next-Gen E-Learning Platform
               </div>
               
               <h1 id="hero-title" className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                 Learn Faster with <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-purple-500">
                   Interactive Intelligence
                 </span>
               </h1>
               
               <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                 Master code, data, and design with our 3D immersive curriculum, browser-based coding environments, and AI-assisted pathways.
               </p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                 <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all" 
                    onClick={() => navigate('/login')}
                    aria-label="Start Learning Free"
                  >
                   Start Learning Free
                 </Button>
                 <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto px-8 h-14 text-lg bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700" 
                    icon={<PlayCircle size={20} className="text-gray-500" />}
                    aria-label="View Demo Video"
                  >
                   View Demo
                 </Button>
               </div>

               <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
                  <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                          <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt={`Active user ${i}`} />
                      ))}
                  </div>
                  <p>Joined by 2,000+ creators this week</p>
               </div>
            </motion.div>

            {/* Right Content: 3D Scene */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative h-[500px] lg:h-[600px] w-full flex items-center justify-center"
                aria-hidden="true"
            >
                {/* 3D Scene Container */}
                <div className="absolute inset-0 z-10 w-full h-full">
                    <Hero3D />
                </div>
                
                {/* Overlay Floating Stats Card */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="absolute bottom-20 left-4 lg:-left-4 z-20 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/60 max-w-xs hidden md:block"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/30">
                            <Code size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">System Check</p>
                            <p className="text-base font-bold text-gray-900">Python Kernel Active</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>Compiling...</span>
                            <span>98%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "98%" }}
                                transition={{ duration: 1.5, delay: 1.5, ease: "circOut" }}
                                className="h-full bg-green-500 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Strip (Animated Marquee) */}
      <div className="py-12 bg-white border-y border-gray-100 overflow-hidden" aria-label="Trusted by companies">
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

      {/* Features Grid with 3D Tilt Cards */}
      <section id="features" className="py-24 bg-white relative" aria-labelledby="features-title">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 id="features-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Why Choose Aelgo World?</h2>
               <p className="text-lg text-gray-600 leading-relaxed">
                   We combine pedagogical expertise with modern tech stack to deliver a learning experience that actually sticks.
               </p>
            </div>

            <motion.div 
               variants={containerVariants}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
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
                 <motion.div variants={itemVariants} key={i}>
                     <TiltCard className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 h-full group">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                           {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                     </TiltCard>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* How it Works - Stepped Visual */}
      <section id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-100" aria-labelledby="how-title">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="order-2 lg:order-1"
               >
                  <h2 id="how-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Learning that adapts to your lifestyle</h2>
                  <p className="text-lg text-gray-600 mb-10">Whether you have 10 minutes or 2 hours, Aelgo World has a learning mode for you.</p>
                  
                  <div className="space-y-8 relative">
                     {/* Connecting Line */}
                     <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                     {[
                       { title: 'Watch & Read', desc: 'High-quality video lessons accompanied by detailed reading materials.', icon: <BookOpen size={20} /> },
                       { title: 'Practice & Code', desc: 'Apply your knowledge immediately with interactive quizzes and code challenges.', icon: <Code size={20} /> },
                       { title: 'Listen & Review', desc: 'Reinforce concepts on the go with audio-only modes for every lesson.', icon: <Mic size={20} /> },
                     ].map((step, i) => (
                       <motion.div 
                         key={i} 
                         initial={{ opacity: 0, x: -20 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.2 }}
                         className="flex gap-6 relative z-10 bg-gray-50 group"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-primary-100 text-primary-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform group-hover:border-primary-400">
                             {step.icon}
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                             <p className="text-gray-600">{step.desc}</p>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </motion.div>
               
               <motion.div 
                 initial={{ opacity: 0, x: 50, rotate: 3 }}
                 whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="relative order-1 lg:order-2"
               >
                  <div className="absolute inset-0 bg-secondary-100 rounded-[2rem] transform rotate-3 scale-95 translate-y-4"></div>
                  <div className="relative rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white group">
                      <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Diverse students learning together in a modern collaborative space" 
                        className="w-full object-cover h-[500px] transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-green-500 rounded text-xs font-bold uppercase animate-pulse">Live</span>
                              <span className="text-sm font-medium">1,240 students online</span>
                          </div>
                          <p className="font-bold text-lg">"The best platform for serious learners."</p>
                      </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Featured Courses (Dark Section) */}
      <section id="courses" className="py-24 bg-gray-900 text-white relative overflow-hidden" aria-labelledby="courses-title">
         {/* Decoration */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div>
                  <h2 id="courses-title" className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
                  <p className="text-gray-400 max-w-xl text-lg">Explore our most popular learning tracks designed by industry experts.</p>
               </div>
               <Button variant="secondary" className="bg-white/10 text-white border-transparent hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate('/login')} aria-label="Explore Full Catalog">
                  Explore Full Catalog <ArrowRight size={16} className="ml-2" />
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {courses.map((course, i) => (
                  <MotionDiv 
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
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
                              <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} className="w-8 h-8 rounded-full mr-3 border border-gray-600" alt={`Instructor ${course.instructor}`} />
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

      {/* Enhanced Success Stories with ScrollReveal */}
      <section id="stories" className="py-24 bg-white relative overflow-hidden" aria-labelledby="stories-title">
         {/* Background blob for visual interest */}
         <div className="absolute -top-40 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50 to-white -z-10"></div>
         <div className="absolute top-20 right-0 w-96 h-96 bg-primary-50/50 rounded-full blur-3xl -z-10"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up" className="text-center mb-16 relative z-10">
               <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 font-bold tracking-wider uppercase text-xs mb-3">Community Success</span>
               <h2 id="stories-title" className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Loved by Students</h2>
               <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join a community of ambitious learners who have transformed their careers.
               </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { 
                   name: 'Sarah Jenkins', 
                   role: 'Frontend Developer', 
                   quote: "The interactive coding labs made all the difference. I wasn't just watching videos; I was writing code from day one.", 
                   avatar: 'https://i.pravatar.cc/150?u=32',
                   company: 'Google'
                 },
                 { 
                   name: 'David Chen', 
                   role: 'Data Scientist', 
                   quote: "I used the audio lessons during my commute. It's amazing how much you can learn when you turn downtime into study time.", 
                   avatar: 'https://i.pravatar.cc/150?u=12',
                   company: 'Amazon'
                 },
                 { 
                   name: 'Elena Rodriguez', 
                   role: 'Product Designer', 
                   quote: "The project-based curriculum helped me build a portfolio that actually got me hired. Best investment ever.", 
                   avatar: 'https://i.pravatar.cc/150?u=44',
                   company: 'Spotify'
                 },
               ].map((t, i) => (
                 <ScrollReveal key={i} animation="fade-up" delay={i * 150} className="h-full">
                    <div className="bg-white p-8 rounded-3xl relative hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col group overflow-hidden">
                       {/* Top Gradient Line */}
                       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                       
                       {/* Background Quote Icon */}
                       <Quote className="absolute top-6 right-6 text-gray-100 w-16 h-16 transform rotate-180 group-hover:text-primary-50 transition-colors duration-300" />

                       {/* Stars */}
                       <div className="flex gap-1 mb-6 text-yellow-400 relative z-10">
                           {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
                       </div>

                       {/* Quote */}
                       <blockquote className="text-gray-700 text-lg mb-8 relative z-10 leading-relaxed font-medium">
                           "{t.quote}"
                       </blockquote>

                       {/* Footer */}
                       <div className="flex items-center mt-auto pt-6 border-t border-gray-50 relative z-10">
                          <div className="relative">
                             <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full mr-4 object-cover ring-4 ring-gray-50 group-hover:ring-primary-50 transition-all" />
                             <div className="absolute -bottom-1 -right-0 bg-green-500 text-white rounded-full p-1 border-2 border-white" title="Verified Graduate">
                                <CheckCircle size={10} strokeWidth={4} />
                             </div>
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 text-base">{t.name}</h4>
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{t.role}</p>
                             <p className="text-xs font-bold text-gray-400">Works at {t.company}</p>
                          </div>
                       </div>
                    </div>
                 </ScrollReveal>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary-600" aria-label="Call to Action">
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
                  aria-label="Get Started for Free"
                >
                  Get Started for Free
               </Button>
               <Button 
                  variant="ghost" 
                  className="bg-primary-900/30 text-white border border-white/20 hover:bg-primary-900/50 h-16 px-10 text-lg backdrop-blur-sm" 
                  onClick={() => navigate('/courses')}
                  aria-label="Browse Curriculum"
                >
                  Browse Curriculum
               </Button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-12 border-t border-gray-200 text-gray-600" role="contentinfo">
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
                     <a href="#" aria-label="Twitter" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Twitter size={18} /></a>
                     <a href="#" aria-label="LinkedIn" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Linkedin size={18} /></a>
                     <a href="#" aria-label="Website" className="p-2 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-colors"><Globe size={18} /></a>
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
