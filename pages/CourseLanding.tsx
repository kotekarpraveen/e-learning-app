
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BarChart, BookOpen, CheckCircle, 
  PlayCircle, Lock, ChevronDown, ChevronUp, Award,
  Users, Loader2, AlertTriangle, Mic, FileText, Terminal, HelpCircle, Headphones,
  ArrowRight, Star, Plus, Minus
} from 'lucide-react';
import { api } from '../lib/api';
import { Course } from '../types';
import { Button } from '../components/ui/Button';
import { useAuth } from '../App';
import { PaymentModal } from '../components/PaymentModal';
import { formatPrice } from '../lib/currency';

// Success Modal Component
const SuccessModal = ({ onStartLearning }: { onStartLearning: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent -z-10" />
                
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                    <CheckCircle className="text-green-600" size={40} strokeWidth={3} />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Successful!</h3>
                <p className="text-gray-500 mb-8">You now have full access to all course materials and lessons.</p>
                
                <Button onClick={onStartLearning} className="w-full h-12 text-lg shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 border-transparent">
                    Start Learning <ArrowRight size={20} className="ml-2" />
                </Button>
            </motion.div>
        </div>
    );
};

export const CourseLanding: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'active'>('none');
  
  // FAQ State
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // Review State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
      const loadCourse = async () => {
          if (!courseId) return;
          setIsLoading(true);
          const data = await api.getCourseById(courseId);
          setCourse(data);
          
          if (user) {
              const enrolled = await api.checkEnrollment(courseId, user.id);
              if (enrolled) {
                  setIsEnrolled(true);
                  setEnrollmentStatus('active');
              } else {
                  // Check for pending transactions
                  const pending = await api.checkPendingTransaction(courseId, user.id);
                  if (pending) setEnrollmentStatus('pending');
              }
          }
          
          setIsLoading(false);
      };
      loadCourse();
  }, [courseId, user]);

  const handleEnrollClick = () => {
    if (!user) {
        navigate('/login');
        return;
    }

    if (isEnrolled) {
        navigate(`/course/${courseId}`);
        return;
    }

    if (enrollmentStatus === 'pending') {
        return; // Already pending
    }

    if (course && course.price > 0) {
        setShowPaymentModal(true);
    } else {
        processFreeEnrollment();
    }
  };

  const processFreeEnrollment = async () => {
      if (!course || !user) return;
      setIsEnrolling(true);
      const success = await api.enrollUser(course.id, user.id);
      if (success) {
          setEnrollmentStatus('active');
          setIsEnrolled(true);
          setShowSuccessModal(true); // Show success instead of immediate redirect
      } else {
          alert("Enrollment failed.");
      }
      setIsEnrolling(false);
  };

  const handlePaymentSuccess = async (method: 'online' | 'offline', reference?: string) => {
      setShowPaymentModal(false);
      setIsEnrolling(true);
      
      if (!course || !user) return;

      const result = await api.processPayment({
          userId: user.id,
          userName: user.name,
          courseId: course.id,
          courseTitle: course.title,
          amount: course.price,
          method: method === 'online' ? (reference?.startsWith('UPI') ? 'UPI' : 'Credit Card') : 'Bank Transfer',
          type: method,
          referenceId: reference
      });

      if (result.success) {
          if (result.status === 'active') {
              setIsEnrolled(true);
              setEnrollmentStatus('active');
              setShowSuccessModal(true); // Show success modal
          } else {
              setEnrollmentStatus('pending');
          }
      } else {
          alert("Payment processing failed. Please try again.");
      }
      setIsEnrolling(false);
  };

  const handleSubmitReview = async () => {
      if(!courseId || !reviewInput.trim()) return;
      setIsSubmittingReview(true);
      const success = await api.addReview(courseId, ratingInput, reviewInput);
      if(success) {
          // Refresh course data to show new review
          const data = await api.getCourseById(courseId);
          setCourse(data);
          setShowReviewForm(false);
          setReviewInput('');
      } else {
          alert("Failed to submit review.");
      }
      setIsSubmittingReview(false);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
        case 'video': return <PlayCircle size={16} className="mr-3 text-gray-400" />;
        case 'podcast': return <Mic size={16} className="mr-3 text-purple-500" />;
        case 'reading': return <FileText size={16} className="mr-3 text-blue-400" />;
        case 'quiz': return <HelpCircle size={16} className="mr-3 text-orange-400" />;
        case 'jupyter': return <Terminal size={16} className="mr-3 text-gray-700" />;
        default: return <PlayCircle size={16} className="mr-3 text-gray-400" />;
    }
  };

  if (isLoading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
      );
  }

  if (!course) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <AlertTriangle className="text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
            <p className="text-gray-500 mt-2">The course you are looking for does not exist or has been removed.</p>
            <Button className="mt-6" onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      );
  }

  const hasPodcasts = course.modules.some(m => m.isPodcast || m.lessons.some(l => l.type === 'podcast'));

  return (
    <div className="-m-4 lg:-m-8 relative">
      {/* Modals */}
      <AnimatePresence>
        {showPaymentModal && (
            <PaymentModal 
                amount={course.price}
                courseTitle={course.title}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
            />
        )}
        {showSuccessModal && (
            <SuccessModal onStartLearning={() => navigate(`/course/${course.id}`)} />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-gray-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent z-10" />
         <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
         />
         
         <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 lg:py-24 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-2 text-primary-400 font-medium tracking-wide text-sm uppercase">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>{course.level}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{course.title}</h1>
                <p className="text-lg text-gray-300 max-w-2xl">{course.description}</p>
                
                <div className="flex flex-wrap gap-6 text-sm text-gray-400 pt-2">
                    <div className="flex items-center text-white font-bold">
                        <Star size={18} className="mr-2 text-yellow-400 fill-yellow-400" />
                        {course.averageRating ? course.averageRating.toFixed(1) : 'New'} 
                        <span className="text-gray-400 font-normal ml-1">({course.totalReviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center"><Users size={18} className="mr-2 text-white" /> {course.enrolledStudents?.toLocaleString()} Students</div>
                    <div className="flex items-center"><Clock size={18} className="mr-2 text-white" /> {course.totalModules * 2.5} Hours Content</div>
                </div>

                <div className="pt-6">
                    {enrollmentStatus === 'pending' ? (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 inline-flex items-center text-yellow-200">
                            <Clock size={20} className="mr-3" />
                            <div>
                                <p className="font-bold text-sm">Enrollment Pending Approval</p>
                                <p className="text-xs opacity-80">We are verifying your offline payment.</p>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            size="lg" 
                            className="px-8 py-4 text-lg font-semibold min-w-[200px]"
                            isLoading={isEnrolling}
                            onClick={handleEnrollClick}
                        >
                            {isEnrolled ? 'Go to Course' : (course.price > 0 ? `Enroll Now - ${formatPrice(course.price)}` : 'Enroll for Free')}
                        </Button>
                    )}
                    
                    {!isEnrolled && enrollmentStatus !== 'pending' && <p className="text-xs text-gray-500 mt-2 pl-2">30-day money-back guarantee</p>}
                </div>
            </div>
            
            {/* Instructor Card */}
            <div className="hidden md:block w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} alt="" className="w-12 h-12 rounded-full border-2 border-white" />
                    <div>
                        <p className="text-sm text-gray-300">Instructor</p>
                        <p className="font-bold">{course.instructor}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-300 italic">"Join me in this comprehensive course. Master the skills you need."</p>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
                {/* Learning Outcomes */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.learningOutcomes?.map((outcome, idx) => (
                            <div key={idx} className="flex items-start">
                                <CheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                                <span className="text-gray-700">{outcome}</span>
                            </div>
                        )) || <p>Comprehensive mastery of the subject matter.</p>}
                    </div>
                </div>

                {/* Syllabus */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {course.modules.length > 0 ? (
                             course.modules.map((module) => (
                                <div key={module.id} className="group">
                                    <button 
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                                            module.isPodcast || module.id === 'podcast-module' ? 'bg-purple-50/50 hover:bg-purple-50' : 'bg-gray-50/50 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`transition-transform duration-200 ${activeModule === module.id ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} className={module.isPodcast ? "text-purple-500" : "text-gray-500"} />
                                            </span>
                                            <span className={`font-semibold ${module.isPodcast || module.id === 'podcast-module' ? 'text-purple-900' : 'text-gray-800'}`}>
                                                {(module.isPodcast || module.id === 'podcast-module') ? '🎙️ ' : ''}{module.title}
                                            </span>
                                        </div>
                                        <span className={`text-sm ${module.isPodcast ? 'text-purple-600' : 'text-gray-500'}`}>
                                            {module.lessons.length} lessons
                                        </span>
                                    </button>
                                    
                                    {activeModule === module.id && (
                                        <div className="px-6 py-2 bg-white space-y-2 pb-4">
                                            {module.lessons.map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between py-2 text-sm pl-9">
                                                    <div className="flex items-center text-gray-600">
                                                        {getLessonIcon(lesson.type)}
                                                        {lesson.title}
                                                    </div>
                                                    <div className="flex items-center text-gray-400">
                                                        {isEnrolled ? (
                                                            <span className="text-green-600 text-xs font-medium">Unlocked</span>
                                                        ) : (
                                                            <Lock size={14} />
                                                        )}
                                                        <span className="ml-4 w-12 text-right">{lesson.duration || '5:00'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {module.lessons.length === 0 && (
                                                <div className="pl-9 py-2 text-sm text-gray-400 italic">No lessons available yet.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No curriculum content available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {course.faqs && course.faqs.length > 0 ? (
                            course.faqs.map(faq => (
                                <div key={faq.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <button 
                                        className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-primary-600 transition-colors py-2"
                                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                                    >
                                        {faq.question}
                                        {openFAQ === faq.id ? <Minus size={18} /> : <Plus size={18} />}
                                    </button>
                                    <AnimatePresence>
                                        {openFAQ === faq.id && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{faq.answer}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No FAQs available for this course.</p>
                        )}
                    </div>
                </div>

                {/* Ratings & Reviews */}
                <div>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                        {isEnrolled && !showReviewForm && (
                            <Button size="sm" variant="secondary" onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                        )}
                    </div>

                    {showReviewForm && (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-bold text-gray-900 mb-4">Leave your feedback</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                                {[1,2,3,4,5].map(star => (
                                    <button 
                                        key={star}
                                        type="button" 
                                        onClick={() => setRatingInput(star)}
                                        className={`${star <= ratingInput ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} transition-colors`}
                                    >
                                        <Star size={24} />
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                className="w-full p-4 rounded-lg border border-gray-300 mb-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                rows={4}
                                placeholder="Tell us what you liked or what could be improved..."
                                value={reviewInput}
                                onChange={e => setReviewInput(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSubmitReview} isLoading={isSubmittingReview}>Submit Review</Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {course.reviews && course.reviews.length > 0 ? (
                            course.reviews.map(review => (
                                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={review.userAvatar || `https://ui-avatars.com/api/?name=${review.userName}&background=random`} 
                                                alt={review.userName} 
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                                                <p className="text-xs text-gray-500">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200" : ""} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{review.review}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                <Star className="mx-auto text-gray-300 mb-3" size={32} />
                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column (Sticky Sidebar) */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">This course includes:</h3>
                    <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex items-center"><PlayCircle size={20} className="mr-3 text-primary-600" /> {course.totalModules * 5} hours on-demand video</li>
                        <li className="flex items-center"><BookOpen size={20} className="mr-3 text-primary-600" /> Downloadable resources</li>
                        {hasPodcasts && (
                             <li className="flex items-center"><Headphones size={20} className="mr-3 text-purple-600" /> Audio Series & Podcasts</li>
                        )}
                        <li className="flex items-center"><BarChart size={20} className="mr-3 text-primary-600" /> Full lifetime access</li>
                        <li className="flex items-center"><CheckCircle size={20} className="mr-3 text-primary-600" /> Assignments</li>
                        <li className="flex items-center"><Award size={20} className="mr-3 text-primary-600" /> Certificate of completion</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
