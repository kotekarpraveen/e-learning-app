
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Terminal, Mic, CheckCircle, ArrowRight, 
  BookOpen, Code, Award, TrendingUp, Star, Users, Menu, X, Globe,
  Linkedin, Twitter, Zap, Shield, Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { api } from '../lib/api';
import { Course } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cast motion components for type safety in this context
  const MotionDiv = motion.div as any;
  const MotionSection = motion.section as any;
  const MotionH2 = motion.h2 as any;
  const MotionP = motion.p as any;

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg mr-3 transform -rotate-3 hover:rotate-0 transition-transform">
                 <Globe className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                Aelgo World
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">How it Works</button>
              <button onClick={() => scrollToSection('courses')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">Courses</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">Stories</button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                 <Button onClick={() => navigate(user?.role !== 'student' ? '/admin' : '/dashboard')}>
                    Go to Dashboard
                 </Button>
              ) : (
                 <>
                   <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                     Log in
                   </button>
                   <Button onClick={() => navigate('/login')} className="shadow-lg shadow-primary-500/20">
                     Get Started
                   </Button>
                 </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-900">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <MotionDiv 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-lg"
          >
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 font-medium text-gray-600">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 font-medium text-gray-600">How it Works</button>
            <button onClick={() => scrollToSection('courses')} className="block w-full text-left py-2 font-medium text-gray-600">Courses</button>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <Button variant="secondary" onClick={() => navigate('/login')} className="w-full justify-center">Log In</Button>
               <Button onClick={() => navigate('/login')} className="w-full justify-center">Get Started</Button>
            </div>
          </MotionDiv>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl opacity-20 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-secondary-100 rounded-full blur-3xl opacity-20 mix-blend-multiply animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <MotionDiv
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
            >
               <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-wide uppercase mb-6 border border-primary-100">
                 🚀 Phase-1 E-Learning Platform
               </span>
               <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                 Master Tech Skills with <br className="hidden md:block"/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                   Interactive Learning
                 </span>
               </h1>
               <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                 Experience a new way of learning with video lessons, in-browser coding environments, and expert-led podcast series.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg shadow-xl shadow-primary-500/30" onClick={() => navigate('/login')}>
                   Start Learning Now
                 </Button>
                 <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg border-2" icon={<PlayCircle size={20} />}>
                   View Demo
                 </Button>
               </div>
            </MotionDiv>
          </div>

          {/* Hero Visual */}
          <MotionDiv 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative mx-auto max-w-5xl"
          >
             <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 aspect-video relative group">
                <div className="absolute top-0 w-full h-8 bg-gray-800 flex items-center px-4 space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-1 flex h-full pt-8">
                   <div className="w-1/4 h-full border-r border-gray-800 p-4 hidden sm:block">
                      <div className="h-4 w-3/4 bg-gray-800 rounded mb-4"></div>
                      <div className="h-3 w-1/2 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 w-2/3 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-800 rounded mb-2"></div>
                   </div>
                   <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Code size={64} className="text-gray-700 mb-6 group-hover:text-primary-500 transition-colors duration-500" />
                      <h3 className="text-2xl font-bold text-white mb-2">Interactive Code Environments</h3>
                      <p className="text-gray-400">Write, run, and test code directly in your browser.</p>
                   </div>
                </div>
             </div>
             
             {/* Floating Badges */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute -top-12 -left-12 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <CheckCircle size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">Course Completed</p>
                      <p className="text-xs text-gray-500">Just now</p>
                   </div>
                </div>
             </motion.div>

             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute -bottom-8 -right-8 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <Mic size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">New Podcast</p>
                      <p className="text-xs text-gray-500">Listen on the go</p>
                   </div>
                </div>
             </motion.div>
          </MotionDiv>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: 'Active Students', value: '10k+', icon: <Users size={20} /> },
                 { label: 'Expert Instructors', value: '50+', icon: <Award size={20} /> },
                 { label: 'Course Library', value: '120+', icon: <BookOpen size={20} /> },
                 { label: 'Completion Rate', value: '94%', icon: <TrendingUp size={20} /> },
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                       <span className="mr-1.5 text-primary-500">{stat.icon}</span> {stat.label}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Aelgo World?</h2>
               <p className="text-lg text-gray-600">We combine cutting-edge technology with pedagogical expertise to deliver a learning experience that sticks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   title: 'Interactive Code Labs', 
                   desc: 'Practice as you learn with our built-in Jupyter-style notebooks and code editors. No setup required.', 
                   icon: <Terminal size={32} />,
                   color: 'bg-blue-50 text-blue-600'
                 },
                 { 
                   title: 'Audio Learning Series', 
                   desc: 'Turn your commute into classroom time with our exclusive, high-quality audio podcasts and lesson summaries.', 
                   icon: <Mic size={32} />,
                   color: 'bg-purple-50 text-purple-600'
                 },
                 { 
                   title: 'Project-Based Curriculum', 
                   desc: 'Build real-world applications for your portfolio. Learn by doing, not just watching.', 
                   icon: <Layers size={32} />,
                   color: 'bg-green-50 text-green-600'
                 }
               ].map((feature, i) => (
                 <MotionDiv 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300"
                 >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                       {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                 </MotionDiv>
               ))}
            </div>
         </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Learning that adapts to your lifestyle</h2>
                  <p className="text-lg text-gray-600 mb-8">Whether you have 10 minutes or 2 hours, Aelgo World has a learning mode for you.</p>
                  
                  <div className="space-y-8">
                     {[
                       { title: 'Watch & Read', desc: 'High-quality video lessons accompanied by detailed reading materials.', icon: '01' },
                       { title: 'Practice & Code', desc: 'Apply your knowledge immediately with interactive quizzes and code challenges.', icon: '02' },
                       { title: 'Listen & Review', desc: 'Reinforce concepts on the go with audio-only modes for every lesson.', icon: '03' },
                     ].map((step, i) => (
                       <div key={i} className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
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
               
               <div className="relative">
                  <div className="absolute inset-0 bg-primary-100 rounded-3xl transform rotate-3 scale-105"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Students learning" 
                    className="relative rounded-3xl shadow-2xl w-full object-cover h-[500px]"
                  />
                  
                  {/* Floating card */}
                  <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg border border-white/50 max-w-xs">
                     <div className="flex items-center mb-2">
                        <div className="flex -space-x-2 mr-3">
                           {[1, 2, 3].map(i => (
                              <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                           ))}
                        </div>
                        <span className="text-sm font-bold text-gray-700">+2k joined this week</span>
                     </div>
                     <p className="text-xs text-gray-500">Join a global community of learners.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24 bg-gray-900 text-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
               <div>
                  <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
                  <p className="text-gray-400">Explore our most popular learning tracks.</p>
               </div>
               <Button variant="secondary" className="hidden sm:flex bg-white/10 text-white border-transparent hover:bg-white/20" onClick={() => navigate('/login')}>View All Courses</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {courses.map((course, i) => (
                  <MotionDiv 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-800 rounded-2xl overflow-hidden group hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer h-full flex flex-col"
                    onClick={() => navigate('/login')}
                  >
                     <div className="h-48 overflow-hidden relative">
                        <img 
                           src={course.thumbnail} 
                           alt={course.title} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                           {course.category}
                        </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">{course.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                           <div className="flex items-center text-sm text-gray-300">
                              <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} className="w-6 h-6 rounded-full mr-2" alt="" />
                              {course.instructor}
                           </div>
                           <span className="text-primary-400 font-bold">${course.price}</span>
                        </div>
                     </div>
                  </MotionDiv>
               ))}
            </div>
            
            <div className="mt-12 text-center sm:hidden">
               <Button variant="secondary" className="w-full bg-white/10 text-white border-transparent" onClick={() => navigate('/login')}>View All Courses</Button>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Stories</h2>
               <p className="text-lg text-gray-600">Hear from people who transformed their careers with Aelgo World.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { name: 'Sarah Jenkins', role: 'Frontend Developer', quote: "The interactive coding labs made all the difference. I wasn't just watching videos; I was writing code from day one.", avatar: 'https://i.pravatar.cc/150?u=32' },
                 { name: 'David Chen', role: 'Data Scientist', quote: "I used the audio lessons during my commute. It's amazing how much you can learn when you turn downtime into study time.", avatar: 'https://i.pravatar.cc/150?u=12' },
                 { name: 'Elena Rodriguez', role: 'Product Designer', quote: "The project-based curriculum helped me build a portfolio that actually got me hired. Best investment ever.", avatar: 'https://i.pravatar.cc/150?u=44' },
               ].map((t, i) => (
                 <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                    <div className="text-primary-300 absolute top-6 right-8 text-6xl font-serif opacity-50">"</div>
                    <p className="text-gray-600 mb-6 relative z-10 italic">{t.quote}</p>
                    <div className="flex items-center">
                       <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                       <div>
                          <h4 className="font-bold text-gray-900">{t.name}</h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary-600">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         </div>
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to start your journey?</h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Join thousands of students learning cutting-edge technologies today. Start your free trial now.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-50 h-14 px-8 text-lg" onClick={() => navigate('/login')}>Get Started for Free</Button>
               <Button variant="secondary" className="bg-primary-700 text-white border-transparent hover:bg-primary-800 h-14 px-8 text-lg" onClick={() => navigate('/courses')}>Browse Curriculum</Button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-6 text-white">
                     <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                        <Globe size={18} />
                     </div>
                     <span className="text-xl font-bold">Aelgo World</span>
                  </div>
                  <p className="text-sm leading-relaxed max-w-sm mb-6">
                     Empowering the next generation of tech leaders through interactive, accessible, and high-quality education.
                  </p>
                  <div className="flex space-x-4">
                     <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Twitter size={18} /></a>
                     <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Linkedin size={18} /></a>
                     <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Globe size={18} /></a>
                  </div>
               </div>
               
               <div>
                  <h4 className="text-white font-bold mb-6">Platform</h4>
                  <ul className="space-y-3 text-sm">
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Browse Courses</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">For Enterprise</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Mentorship</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Company</h4>
                  <ul className="space-y-3 text-sm">
                     <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs">
               <p>&copy; 2025 Aelgo World Inc. All rights reserved.</p>
               <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a href="#" className="hover:text-white">Cookie Settings</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
