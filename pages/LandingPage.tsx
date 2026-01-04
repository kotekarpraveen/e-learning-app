
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Terminal, Mic, CheckCircle, ArrowRight, 
  BookOpen, Code, Award, TrendingUp, Star, Users, Menu, X, Globe,
  Linkedin, Twitter
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
      <nav className="fixed w-full bg-gray-50/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg mr-3">
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
              <button onClick={() => scrollToSection('team')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">Team</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">Stories</button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                 <Button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}>
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
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4"
          >
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 font-medium text-gray-600">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 font-medium text-gray-600">How it Works</button>
            <button onClick={() => scrollToSection('courses')} className="block w-full text-left py-2 font-medium text-gray-600">Courses</button>
            <button onClick={() => scrollToSection('team')} className="block w-full text-left py-2 font-medium text-gray-600">Team</button>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <Button variant="secondary" onClick={() => navigate('/login')} className="w-full justify-center">Log In</Button>
               <Button onClick={() => navigate('/login')} className="w-full justify-center">Get Started</Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-secondary-300 rounded-full blur-3xl opacity-20 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-primary-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
            >
               <span className="inline-block py-1 px-3 rounded-full bg-secondary-100 text-secondary-800 text-sm font-bold tracking-wide mb-6 border border-secondary-200">
                 🚀 Launch your tech career today
               </span>
               <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                 Learn. Build. Grow with <span className="text-primary-500">Aelgo World</span>
               </h1>
               <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                 Master the skills of tomorrow through interactive lessons, hands-on coding environments, and expert-led mentorship. Your journey to mastery starts here.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button size="lg" className="px-8 py-4 text-lg w-full sm:w-auto" onClick={() => navigate('/login')}>
                   Get Started <ArrowRight className="ml-2" size={20} />
                 </Button>
                 <Button size="lg" variant="secondary" className="px-8 py-4 text-lg w-full sm:w-auto" onClick={() => scrollToSection('courses')}>
                   Explore Courses
                 </Button>
               </div>
            </motion.div>
          </div>

          {/* Hero Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative mx-auto max-w-5xl rounded-2xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10"
          >
             <div className="rounded-xl overflow-hidden bg-gray-800 aspect-[16/9] relative">
                {/* Abstract Dashboard UI Representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="p-8 grid grid-cols-12 gap-6 h-full">
                        <div className="col-span-3 bg-gray-700/30 rounded-lg h-full animate-pulse"></div>
                        <div className="col-span-9 flex flex-col gap-6">
                            <div className="h-32 bg-gray-700/30 rounded-lg w-full"></div>
                            <div className="flex-1 grid grid-cols-2 gap-6">
                                <div className="bg-gray-700/30 rounded-lg h-full"></div>
                                <div className="bg-gray-700/30 rounded-lg h-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={80} className="text-white opacity-80 drop-shadow-lg" />
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-bold text-primary-600 tracking-wide uppercase">Why Choose Aelgo World</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A Complete Learning Ecosystem
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We combine traditional learning with cutting-edge interactive tools to ensure you truly master the material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <PlayCircle size={32} />, title: "Video Learning", desc: "High-quality video lessons broken down into digestible chunks for easy consumption." },
              { icon: <Terminal size={32} />, title: "Hands-on Coding", desc: "Practice immediately with our in-browser Jupyter notebooks and code editors." },
              { icon: <CheckCircle size={32} />, title: "Interactive Quizzes", desc: "Test your knowledge after every module to ensure retention and understanding." },
              { icon: <Mic size={32} />, title: "Expert Podcasts", desc: "Listen to industry leaders and gain insights into real-world applications." },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Your Path to Mastery</h2>
             <p className="text-lg text-gray-500">A proven 4-step framework designed for rapid skill acquisition.</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
               {[
                 { step: "01", title: "Learn", icon: <BookOpen />, desc: "Watch video tutorials and read curated materials." },
                 { step: "02", title: "Practice", icon: <Code />, desc: "Solve real-world coding challenges in the browser." },
                 { step: "03", title: "Assess", icon: <Award />, desc: "Pass quizzes and assignments to verify skills." },
                 { step: "04", title: "Grow", icon: <TrendingUp />, desc: "Earn certificates and build your professional portfolio." },
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-gray-50 p-6 text-center relative"
                 >
                    <div className="w-20 h-20 mx-auto bg-white border-4 border-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-6 relative shadow-sm z-10">
                       {item.icon}
                       <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                         {item.step}
                       </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section id="courses" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
               <div>
                 <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Popular Courses</h2>
                 <p className="text-lg text-gray-500">Explore our highest-rated learning paths.</p>
               </div>
               <Button variant="ghost" onClick={() => navigate('/courses')} className="hidden sm:flex">
                  View All Courses <ArrowRight size={18} className="ml-2" />
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {courses.length > 0 ? courses.map((course, i) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
                    onClick={() => navigate(`/course/${course.id}/details`)}
                  >
                     <div className="h-48 overflow-hidden relative">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                           {course.category}
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                           <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium">{course.level}</span>
                           <span>•</span>
                           <span className="flex items-center"><Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" /> 4.9</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                           {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                           <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                 <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} alt="" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{course.instructor}</span>
                           </div>
                           <span className="font-bold text-primary-600">${course.price}</span>
                        </div>
                     </div>
                  </motion.div>
               )) : (
                 <div className="col-span-3 text-center py-12 text-gray-500">Loading courses...</div>
               )}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Button variant="secondary" onClick={() => navigate('/courses')} className="w-full">View All Courses</Button>
            </div>
         </div>
      </section>

      {/* NEW: Team Section */}
      <section id="team" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-20 -left-20 w-72 h-72 bg-secondary-200 rounded-full blur-3xl opacity-20"></div>
           <div className="absolute bottom-20 -right-20 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16">
              <h2 className="text-base font-bold text-primary-600 tracking-wide uppercase">Our Experts</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Meet the Minds Behind the Curriculum
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Our content is crafted by industry veterans and academic leaders to ensure you get the best learning experience.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Profile 1: Head of Content */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/40 relative group hover:border-primary-200 transition-colors"
              >
                  <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Dr. Sarah Mitchell" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                     <div className="mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Dr. Sarah Mitchell</h3>
                        <p className="text-primary-600 font-bold text-sm tracking-wide uppercase flex items-center justify-center md:justify-start gap-2">
                          <Award size={16} /> Head of Content
                        </p>
                     </div>
                     <p className="text-gray-500 leading-relaxed text-sm mb-4">
                        Former CS Professor with 15 years of experience in EdTech. Sarah ensures every course meets rigorous academic standards while remaining practical for industry needs.
                     </p>
                     <div className="flex gap-3 justify-center md:justify-start">
                         <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Ph.D. Computer Science</span>
                         <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Ex-Google</span>
                     </div>
                  </div>
              </motion.div>

              {/* Profile 2: Lead Content Developer */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/40 relative group hover:border-primary-200 transition-colors"
              >
                  <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                     <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="James Anderson" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                     <div className="mb-2">
                        <h3 className="text-xl font-bold text-gray-900">James Anderson</h3>
                        <p className="text-blue-600 font-bold text-sm tracking-wide uppercase flex items-center justify-center md:justify-start gap-2">
                          <Code size={16} /> Lead Content Developer
                        </p>
                     </div>
                     <p className="text-gray-500 leading-relaxed text-sm mb-4">
                        Senior Full Stack Engineer turned educator. James builds the interactive coding environments and hands-on projects that bridge the gap between theory and real-world application.
                     </p>
                     <div className="flex gap-3 justify-center md:justify-start">
                         <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Full Stack Expert</span>
                         <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Open Source Contributor</span>
                     </div>
                  </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-16">Loved by Students</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { name: "Sarah J.", role: "Frontend Developer", text: "Aelgo World changed my career trajectory. The interactive coding environments made learning React so much easier than watching static videos." },
                 { name: "Mark T.", role: "Data Analyst", text: "The Jupyter integration is a game changer. Being able to run Python code right in the lesson helped me grasp data science concepts faster." },
                 { name: "Elena R.", role: "UX Designer", text: "I love the community aspect. The quizzes and peer discussions helped me validate my learning and gain confidence." },
               ].map((t, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative"
                 >
                    <div className="flex text-yellow-400 mb-4">
                       {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-gray-600 italic mb-6">"{t.text}"</p>
                    <div className="flex items-center">
                       <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center font-bold text-primary-800 mr-3">
                          {t.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                          <span className="text-xs text-gray-500">{t.role}</span>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center mb-6">
                     <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-2">
                        <Globe className="text-white" size={18} />
                     </div>
                     <span className="text-xl font-bold">Aelgo World</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     Empowering the next generation of builders, creators, and innovators through world-class interactive education.
                  </p>
               </div>
               
               <div>
                  <h4 className="font-bold text-lg mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm text-gray-400">
                     <li><a href="#" className="hover:text-white transition-colors">Browse Courses</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Mentorship</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">For Business</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-lg mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-400">
                     <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-lg mb-6">Legal</h4>
                  <ul className="space-y-4 text-sm text-gray-400">
                     <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  </ul>
               </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
               <p>&copy; 2025 Aelgo World Inc. All rights reserved.</p>
               <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" className="hover:text-white transition-colors">Instagram</a>
               </div>
            </div>
         </div>
      </footer>

    </div>
  );
};
