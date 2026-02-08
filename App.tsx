
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { BrowseCourses } from './pages/BrowseCourses';
import { CourseLanding } from './pages/CourseLanding';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCourses } from './pages/AdminCourses';
import { CourseBuilder } from './pages/CourseBuilder';
import { CoursePlayer } from './pages/CoursePlayer';
import { Certificate } from './pages/Certificate';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { AdminStudents } from './pages/AdminStudents';
import { AdminInstructors } from './pages/AdminInstructors';
import { AdminTeam } from './pages/AdminTeam';
import { AdminCategories } from './pages/AdminCategories';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookieSettings } from './pages/CookieSettings';
import { Layout } from './components/Layout';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN } from './constants';
import { User, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { loadTheme, applyTheme } from './lib/theme';
import { setCurrency } from './lib/currency';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';


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
  // Roles
  const adminRoles: UserRole[] = ['super_admin', 'admin', 'sub_admin'];
  const instructorRoles: UserRole[] = ['super_admin', 'admin', 'sub_admin', 'instructor'];

  // State to force re-render on currency change
  const [currencyTick, setCurrencyTick] = useState(0);

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrencyTick(prev => prev + 1);
    };
    window.addEventListener('currency-change', handleCurrencyChange);
    return () => window.removeEventListener('currency-change', handleCurrencyChange);
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        {/* Key on Router forces remount of routes, ensuring all components re-render and call formatPrice again */}
        <Router key={currencyTick}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/:loginType" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookieSettings />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/courses" element={<BrowseCourses />} />
              <Route path="/course/:courseId/details" element={<CourseLanding />} />
              <Route path="/course/:courseId" element={<CoursePlayer />} />
              <Route path="/certificate/:courseId" element={<Certificate />} />
              <Route path="/profile" element={<Settings />} />
            </Route>

            {/* Instructor & Admin Shared Routes */}
            <Route element={<ProtectedRoute allowedRoles={instructorRoles} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/course-builder" element={<CourseBuilder />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            {/* Pure Admin Routes (Hidden from Instructors) */}
            <Route element={<ProtectedRoute allowedRoles={adminRoles} />}>
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/instructors" element={<AdminInstructors />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/billing" element={<Billing />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
