
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
import { AdminInstructors } from './pages/AdminInstructors';
import { AdminTeam } from './pages/AdminTeam';
import { AdminCategories } from './pages/AdminCategories';
import { AdminAnalytics } from './pages/AdminAnalytics'; 
import { LandingPage } from './pages/LandingPage'; 
import { Layout } from './components/Layout';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN } from './constants';
import { User, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { loadTheme } from './lib/theme';

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
    const metadataRole = sbUser.user_metadata?.role;
    const emailRole = sbUser.email?.includes('admin') ? 'admin' : 'student';
    let finalRole: UserRole = 'student';
    
    if (['super_admin', 'admin', 'sub_admin', 'viewer', 'approver', 'instructor'].includes(metadataRole)) {
        finalRole = metadataRole;
    } else if (emailRole === 'admin') {
        finalRole = 'admin'; 
    }

    return {
        id: sbUser.id,
        email: sbUser.email!,
        name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
        role: finalRole,
        avatar: sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email}`,
        permissions: sbUser.user_metadata?.permissions || []
    };
  };

  useEffect(() => {
    // Initialize Theme
    loadTheme();

    // Check Auth
    if (!isSupabaseConfigured()) {
       const stored = localStorage.getItem('aelgo_user');
       if (stored) setUser(JSON.parse(stored));
       setLoading(false);
       return;
    }

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
    if (!isSupabaseConfigured()) {
        const mockUser = (role.includes('admin') || role === 'instructor') ? MOCK_USER_ADMIN : MOCK_USER_STUDENT;
        mockUser.role = role;
        setUser(mockUser);
        localStorage.setItem('aelgo_user', JSON.stringify(mockUser));
        return;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
    } else {
        localStorage.removeItem('aelgo_user');
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
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; 
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     if (user.role === 'student') return <Navigate to="/dashboard" replace />;
     return <Navigate to="/admin" replace />;
  }
  
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
          <Route path="/login/:loginType" element={<Login />} />
          
          {/* Student Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<StudentDashboard />} />
             <Route path="/courses" element={<BrowseCourses />} />
             <Route path="/course/:courseId/details" element={<CourseLanding />} />
             <Route path="/course/:courseId" element={<CoursePlayer />} />
             <Route path="/profile" element={<Settings />} />
          </Route>

          {/* Admin & Instructor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'sub_admin', 'viewer', 'approver', 'instructor']} />}>
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/admin/analytics" element={<AdminAnalytics />} />
             <Route path="/admin/courses" element={<AdminDashboard />} />
             <Route path="/admin/course-builder" element={<CourseBuilder />} />
             <Route path="/admin/students" element={<AdminStudents />} /> 
             <Route path="/admin/instructors" element={<AdminInstructors />} />
             <Route path="/admin/team" element={<AdminTeam />} />
             <Route path="/admin/categories" element={<AdminCategories />} />
             <Route path="/admin/settings" element={<Settings />} />
             <Route path="/admin/billing" element={<Billing />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
