import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../App';
import { 
  Lock, Mail, ArrowRight, AlertCircle, RefreshCw, 
  GraduationCap, Briefcase, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { loginType } = useParams<{ loginType: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

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
          <div className="absolute top-0 -right-40 w-96 h-96 rounded-full bg-secondary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-white font-bold text-3xl">A</span>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Welcome to Aelgo World
            </h2>
            <p className="text-lg text-gray-600">Choose your portal to sign in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'student', title: 'Student', icon: <GraduationCap size={32} />, color: 'bg-blue-50 text-blue-600 border-blue-200', desc: 'Access your courses and learning path.' },
              { id: 'instructor', title: 'Instructor', icon: <Briefcase size={32} />, color: 'bg-purple-50 text-purple-600 border-purple-200', desc: 'Manage courses, students, and content.' },
              { id: 'admin', title: 'Admin', icon: <ShieldCheck size={32} />, color: 'bg-orange-50 text-orange-600 border-orange-200', desc: 'Platform settings and user management.' },
            ].map((portal) => (
              <Link 
                key={portal.id}
                to={`/login/${portal.id}`}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group text-center flex flex-col items-center"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${portal.color} group-hover:scale-110 transition-transform duration-300`}>
                  {portal.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{portal.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{portal.desc}</p>
                <span className="mt-auto inline-flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  Login <ArrowRight size={16} className="ml-1" />
                </span>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
               &larr; Back to Home
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const MotionDiv = motion.div as any;

  // Set default demo credentials based on type
  useEffect(() => {
    if (!isSupabaseConfigured()) {
        if (type === 'admin') setEmail('admin@aelgo.com');
        else if (type === 'instructor') setEmail('instructor@aelgo.com');
        else setEmail('student@aelgo.com');
        setPassword('password');
    }
  }, [type]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
        await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } catch (err) {
        console.error("Error resending email", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsEmailConfirmation(false);
    setIsLoading(true);
    
    // Map URL type to Role
    const role: UserRole = type === 'admin' ? 'admin' : type === 'instructor' ? 'instructor' : 'student';

    // 1. If Supabase is Configured, use Real Auth
    if (isSupabaseConfigured()) {
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role, 
                            full_name: email.split('@')[0]
                        }
                    }
                });
                if (error) throw error;
                if (data.user) {
                    if (!data.session) {
                       setNeedsEmailConfirmation(true);
                       setIsLoading(false);
                       return;
                    }
                    navigate(role === 'student' ? '/dashboard' : '/admin');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // For demo simplicity, we trust the login matches the portal intent.
                // In production, check data.session?.user?.user_metadata?.role vs current 'type'
                
                navigate(role === 'student' ? '/dashboard' : '/admin');
            }
        } catch (err: any) {
            let msg = err.message || 'Authentication failed';
            if (msg.includes('Invalid login credentials')) {
                msg = 'Invalid credentials. Please check your password.';
            } else if (msg.includes('Email not confirmed')) {
                setNeedsEmailConfirmation(true);
                setIsLoading(false);
                return;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // 2. Fallback Mock Login
    await new Promise(resolve => setTimeout(resolve, 800));
    login(email, role); 
    setIsLoading(false);
    navigate(role === 'student' ? '/dashboard' : '/admin');
  };

  const getPortalDetails = () => {
      switch(type) {
          case 'admin': return { title: 'Admin Console', icon: <ShieldCheck size={24} className="text-orange-600" />, color: 'text-orange-600' };
          case 'instructor': return { title: 'Instructor Portal', icon: <Briefcase size={24} className="text-purple-600" />, color: 'text-purple-600' };
          default: return { title: 'Student Login', icon: <GraduationCap size={24} className="text-blue-600" />, color: 'text-blue-600' };
      }
  };

  const portal = getPortalDetails();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 rounded-full bg-secondary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="absolute top-6 left-6 z-20">
          <Link to="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
              <ChevronLeft size={16} className="mr-1" /> Switch Portal
          </Link>
      </div>

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-4">
             {portal.icon}
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {portal.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? `Create your ${type} account` : 'Sign in to your account'}
          </p>
        </div>
      </MotionDiv>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100"
        >
          {needsEmailConfirmation && (
             <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Mail className="text-blue-600 mt-0.5 mr-3" size={20} />
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-blue-900">Check your inbox</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            We sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account.
                        </p>
                        <button 
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className={`mt-3 text-xs font-semibold flex items-center ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                            <RefreshCw size={12} className={`mr-1 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                            {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Confirmation Email'}
                        </button>
                    </div>
                </div>
             </div>
          )}

          {error && !needsEmailConfirmation && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start text-sm">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
              </div>
          )}

          {!isSupabaseConfigured() && (
             <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-xs">
                <strong>Demo Mode:</strong> Auto-filled credentials for {type}.
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
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                    </label>
                </div>

                {!isSignUp && (
                    <div className="text-sm">
                        <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                        Forgot password?
                        </a>
                    </div>
                )}
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full" isLoading={isLoading} icon={isSignUp ? undefined : <ArrowRight size={18} />}>
                {isSignUp ? 'Create Account' : 'Sign in'}
              </Button>
              
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
              </div>

              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setNeedsEmailConfirmation(false); }}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2 rounded-lg border border-transparent hover:bg-gray-50 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : `Create new ${type} account`}
              </button>
            </div>
          </form>

        </MotionDiv>
      </div>
    </div>
  );
};