
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Mail, ArrowLeft, CheckCircle, AlertCircle, KeyRound, Globe 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fix: Cast motion components to avoid runtime issues
const MotionDiv = motion.div as any;

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // 1. Supabase Logic
    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/#/reset-password`, // Hash router compatible redirect
            });
            
            if (error) throw error;
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send reset link.');
        }
        return;
    }

    // 2. Mock Logic
    setTimeout(() => {
        if (email.includes('@')) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage('Please enter a valid email address.');
        }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 rounded-full bg-secondary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Home Link */}
        <div className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Globe className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">Aelgo World</span>
            </Link>
        </div>

        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

          {status === 'success' ? (
             <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-500 mb-8">
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
                <Link to="/login">
                    <Button variant="secondary" className="w-full" icon={<ArrowLeft size={16} />}>
                        Return to Login
                    </Button>
                </Link>
             </div>
          ) : (
             <>
                <div className="mb-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-600">
                        <KeyRound size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {status === 'error' && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start text-sm">
                        <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{errorMessage}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input 
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        icon={<Mail size={18} />}
                    />

                    <Button 
                        type="submit" 
                        className="w-full" 
                        isLoading={status === 'loading'}
                    >
                        Send Reset Link
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
             </>
          )}
        </MotionDiv>
      </div>
    </div>
  );
};
