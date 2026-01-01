
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../App';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('student@alego.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isAdminSetupError, setIsAdminSetupError] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    setIsAdminSetupError(false);
    setNeedsEmailConfirmation(false);
    setIsLoading(true);
    
    // Determine Role based on email (Simple logic for Phase 1 Demo)
    const role = email.includes('admin') ? 'admin' : 'student';

    // 1. If Supabase is Configured, use Real Auth
    if (isSupabaseConfigured()) {
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role, // Metadata to store role
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
                    navigate(role === 'admin' ? '/admin' : '/dashboard');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Double check role for redirection
                const userRole = data.session?.user?.user_metadata?.role || role;
                navigate(userRole === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err: any) {
            let msg = err.message || 'Authentication failed';
            
            // Helpful error mapping
            if (msg.includes('Invalid login credentials')) {
                // Specific help for Admin Setup
                if (email.includes('admin')) {
                    setIsAdminSetupError(true);
                    msg = 'Admin account not found.';
                } else {
                    msg = 'Invalid credentials. If this is your first time, please switch to "Create Account" below.';
                }
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

    // 2. Fallback Mock Login (If no API keys)
    await new Promise(resolve => setTimeout(resolve, 800));
    login(email, role); // Calls the context mock login
    setIsLoading(false);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 rounded-full bg-purple-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
             <span className="text-white font-bold text-2xl">A</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {!isSignUp && (
             <>Or <button onClick={() => { setIsSignUp(true); setError(null); setIsAdminSetupError(false); setNeedsEmailConfirmation(false); }} className="font-medium text-primary-600 hover:text-primary-500">create a new account</button></>
          )}
          {isSignUp && (
             <>Already have an account? <button onClick={() => { setIsSignUp(false); setError(null); setIsAdminSetupError(false); setNeedsEmailConfirmation(false); }} className="font-medium text-primary-600 hover:text-primary-500">Sign in</button></>
          )}
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
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
                  <div className="flex-1">
                      <p className="font-medium">{error}</p>
                      {isAdminSetupError && (
                          <button 
                            onClick={() => { setIsSignUp(true); setError(null); }}
                            className="mt-2 text-xs bg-white border border-red-200 px-2 py-1 rounded shadow-sm hover:bg-red-50 font-bold"
                          >
                            Click here to Create Admin Account
                          </button>
                      )}
                  </div>
              </div>
          )}

          {!isSupabaseConfigured() && (
             <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-xs">
                <strong>Demo Mode:</strong> Supabase API keys not found. Using mock authentication.
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
               {!isSupabaseConfigured() && !isSignUp && (
                   <p className="text-xs text-gray-500 mt-2">Try: <b>student@alego.com</b> or <b>admin@alego.com</b></p>
               )}
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

            {!isSignUp && (
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

                <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                    </a>
                </div>
                </div>
            )}

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading} icon={isSignUp ? undefined : <ArrowRight size={18} />}>
                {isSignUp ? (email.includes('admin') ? 'Create Admin Account' : 'Create Account') : 'Sign in'}
              </Button>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
};
