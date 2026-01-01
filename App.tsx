
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { BrowseCourses } from './pages/BrowseCourses';
import { CourseLanding } from './pages/CourseLanding';
import { AdminDashboard } from './pages/AdminDashboard';
import { CourseBuilder } from './pages/CourseBuilder';
import { CoursePlayer } from './pages/CoursePlayer';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { AdminStudents } from './pages/AdminStudents';
import { AdminAnalytics } from './pages/AdminAnalytics'; // Added import
import { LandingPage } from './pages/LandingPage';
import { Layout } from './components/Layout';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN } from './constants';
import { User, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map Supabase User to App User
  const mapSupabaseUser = (sbUser: any): User => {
    // 1. Supabase 'role' is always 'authenticated' for logged in users.
    // 2. We check 'user_metadata.role' for our App's 'admin' | 'student' role.
    // 3. Fallback: Check email pattern if metadata is missing.
    const metadataRole = sbUser.user_metadata?.role;
    const emailRole = sbUser.email?.includes('admin') ? 'admin' : 'student';
    const finalRole: UserRole = (metadataRole === 'admin' || metadataRole === 'student') 
        ? metadataRole 
        : emailRole;

    return {
        id: sbUser.id,
        email: sbUser.email!,
        name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
        role: finalRole,
        avatar: sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email}`
    };
  };

  useEffect(() => {
    // 1. Check if Supabase is actually configured with keys
    if (!isSupabaseConfigured()) {
       // Fallback to local storage mock auth
       const stored = localStorage.getItem('lumina_user');
       if (stored) setUser(JSON.parse(stored));
       setLoading(false);
       return;
    }

    // 2. Real Supabase Auth Logic
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
          setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, role: UserRole) => {
    // If Supabase is NOT configured, use Mock logic
    if (!isSupabaseConfigured()) {
        const mockUser = role === 'admin' ? MOCK_USER_ADMIN : MOCK_USER_STUDENT;
        setUser(mockUser);
        localStorage.setItem('lumina_user', JSON.stringify(mockUser));
        return;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
    } else {
        localStorage.removeItem('lumina_user');
        setUser(null);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Protected Routes ---
const ProtectedRoute = ({ allowedRole }: { allowedRole?: UserRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; 
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/dashboard" replace />;
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<StudentDashboard />} />
             <Route path="/courses" element={<BrowseCourses />} />
             <Route path="/course/:courseId/details" element={<CourseLanding />} />
             <Route path="/course/:courseId" element={<CoursePlayer />} />
             <Route path="/profile" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/admin/analytics" element={<AdminAnalytics />} />
             <Route path="/admin/courses" element={<AdminDashboard />} />
             <Route path="/admin/course-builder" element={<CourseBuilder />} />
             <Route path="/admin/students" element={<AdminStudents />} /> 
             <Route path="/admin/settings" element={<Settings />} />
             <Route path="/admin/billing" element={<Billing />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
