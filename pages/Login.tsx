
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../App';
import { 
  ArrowRight, AlertCircle, GraduationCap, Briefcase, ShieldCheck, ChevronLeft, Globe
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';

// Fix: Cast motion components to avoid runtime issues
const MotionDiv = motion.div as any;

export const Login: React.FC = () => {
  const { loginType } = useParams<{ loginType: string }>();
  const navigate = useNavigate();

  // Redirect invalid login types to main login
  useEffect(() => {
    if (loginType && !['student', 'instructor', 'admin'].includes(loginType)) {
      navigate('/login');
    }
  }, [loginType, navigate]);

  // -- Portal Selection View --
  if (!loginType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-40 w-96 h-96 rounded-full bg-secondary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <Link to="/" className="inline-flex justify-center mb-6 hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Globe className="text-white" size={32} />
              </div>
            </Link>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Welcome to Aelgo World
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Select your portal to sign in and continue your journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                id: 'student', 
                title: 'Student Portal', 
                icon: <GraduationCap size={40} />, 
                color: 'text-blue-600', 
                bg: 'bg-blue-50',
                border: 'border-blue-100 group-hover:border-blue-300',
                desc: 'Access your courses, track progress, and view certificates.' 
              },
              { 
                id: 'instructor', 
                title: 'Instructor Portal', 
                icon: <Briefcase size={40} />, 
                color: 'text-purple-600', 
                bg: 'bg-purple-50',
                border: 'border-purple-100 group-hover:border-purple-300',
                desc: 'Manage your courses, view student analytics, and grade assessments.' 
              },
              { 
                id: 'admin', 
                title: 'Admin Console', 
                icon: <ShieldCheck size={40} />, 
                color: 'text-orange-600', 
                bg: 'bg-orange-50',
                border: 'border-orange-100 group-hover:border-orange-300',
                desc: 'Platform settings, user management, and financial reporting.' 
              },
            ].map((portal, idx) => (
              <MotionDiv
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  to={`/login/${portal.id}`}
                  className={`block h-full bg-white p-8 rounded-3xl shadow-sm border ${portal.border} hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${portal.bg} rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform`}></div>
                  
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${portal.bg} ${portal.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    {portal.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{portal.title}</h3>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">{portal.desc}</p>
                  
                  <div className="flex items-center text-sm font-bold text-gray-900 group-hover:translate-x-2 transition-transform">
                    Sign In <ArrowRight size={16} className="ml-2" />
                  </div>
                </Link>
              </MotionDiv>
            ))}
          </div>
          
          <div className="text-center mt-16">
             <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium inline-flex items-center transition-colors">
               <ChevronLeft size={16} className="mr-1" /> Back to Home
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // -- Login Form View --
  return <LoginForm type={loginType as 'student' | 'instructor' | 'admin'} />;
};

const LoginForm: React.FC<{ type: 'student' | 'instructor' | 'admin' }> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Configuration for distinct portal visuals
  const THEME = {
    student: {
      accent: 'text-blue-600',
      bg_accent: 'bg-blue-600 hover:bg-blue-700',
      soft_bg: 'bg-blue-50',
      icon: <GraduationCap size={24} />,
      label: 'Student Portal'
    },
    instructor: {
      accent: 'text-purple-600',
      bg_accent: 'bg-purple-600 hover:bg-purple-700',
      soft_bg: 'bg-purple-50',
      icon: <Briefcase size={24} />,
      label: 'Instructor Portal'
    },
    admin: {
      accent: 'text-orange-600',
      bg_accent: 'bg-orange-600 hover:bg-orange-700',
      soft_bg: 'bg-orange-50',
      icon: <ShieldCheck size={24} />,
      label: 'Admin Console'
    }
  }[type];

  // Set default demo credentials based on type
  useEffect(() => {
    if (!isSupabaseConfigured()) {
        if (type === 'admin') setEmail('admin@aelgo.com');
        else if (type === 'instructor') setEmail('instructor@aelgo.com');
        else setEmail('student@aelgo.com');
        setPassword('password');
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Map URL type to Role
    const role: UserRole = type === 'admin' ? 'admin' : type === 'instructor' ? 'instructor' : 'student';

    // 1. If Supabase is Configured, use Real Auth
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            navigate(role === 'student' ? '/dashboard' : '/admin');
        } catch (err: any) {
            let msg = err.message || 'Authentication failed';
            if (msg.includes('Invalid login credentials')) {
                msg = 'Invalid credentials. Please check your password.';
            } 
            setError(msg);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // 2. Fallback Mock Login
    await new Promise(resolve => setTimeout(resolve, 800));
    // For mock mode, strictly enforce the role of the portal being used
    login(email, role); 
    setIsLoading(false);
    navigate(role === 'student' ? '/dashboard' : '/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations - Tinted based on portal */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${type === 'student' ? 'bg-blue-200' : type === 'instructor' ? 'bg-purple-200' : 'bg-orange-200'}`}></div>
        <div className={`absolute top-0 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${type === 'student' ? 'bg-indigo-200' : type === 'instructor' ? 'bg-pink-200' : 'bg-yellow-200'}`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute top-6 left-6 z-20">
          <Link to="/login" className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:border-gray-300 transition-colors shadow-sm">
              <ChevronLeft size={16} className="mr-1" /> Switch Portal
          </Link>
      </div>

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 ${THEME.accent}`}>
             {THEME.icon}
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {THEME.label}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
      </MotionDiv>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden"
        >
          {/* Top colored line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${type === 'student' ? 'bg-blue-500' : type === 'instructor' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>

          {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start text-sm">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
              </div>
          )}

          {!isSupabaseConfigured() && (
             <div className={`mb-6 border rounded-lg px-4 py-3 text-xs ${THEME.soft_bg} ${type === 'student' ? 'border-blue-200 text-blue-800' : type === 'instructor' ? 'border-purple-200 text-purple-800' : 'border-orange-200 text-orange-800'}`}>
                <strong>Demo Mode:</strong> Pre-filled for {type} access.
             </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
               <Input 
                 label="Email address"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 placeholder="name@company.com"
               />
            </div>

            <div>
              <Input 
                 label="Password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
              />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${type === 'student' ? 'text-blue-600 focus:ring-blue-500' : type === 'instructor' ? 'text-purple-600 focus:ring-purple-500' : 'text-orange-600 focus:ring-orange-500'}`}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <Link to="/forgot-password" className={`font-medium hover:underline ${THEME.accent}`}>
                    Forgot password?
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className={`w-full ${THEME.bg_accent} border-transparent`} 
                isLoading={isLoading} 
                icon={<ArrowRight size={18} />}
              >
                Sign in
              </Button>
            </div>
          </form>

        </MotionDiv>
      </div>
    </div>
  );
};
