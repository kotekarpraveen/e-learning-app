
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  PenTool,
  Library,
  Users,
  UserCheck,
  Shield,
  CreditCard,
  LogOut,
  Menu,
  BookOpen,
  User as UserIcon,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin Sidebar Structure
  const adminSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
      ]
    },
    {
      title: 'Content',
      items: [
        { label: 'Course Builder', path: '/admin/course-builder', icon: <PenTool size={20} /> },
        { label: 'Course Library', path: '/admin/courses', icon: <Library size={20} /> },
        { label: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
      ]
    },
    {
      title: 'Users',
      items: [
        { label: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { label: 'Instructors', path: '/admin/instructors', icon: <UserCheck size={20} /> },
        { label: 'Team', path: '/admin/team', icon: <Shield size={20} /> },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Billing', path: '/admin/billing', icon: <CreditCard size={20} /> },
        { label: 'Platform Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ];

  // Instructor Sidebar Structure
  const instructorSections: NavSection[] = [
    {
      title: 'Instructor Workspace',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Course Builder', path: '/admin/course-builder', icon: <PenTool size={20} /> },
        { label: 'My Library', path: '/admin/courses', icon: <Library size={20} /> },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ];

  // Student Sidebar Structure
  const studentSections: NavSection[] = [
    {
      title: 'Learning',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'My Courses', path: '/courses', icon: <BookOpen size={20} /> },
        { label: 'Profile', path: '/profile', icon: <UserIcon size={20} /> },
      ]
    }
  ];

  let sections: NavSection[] = studentSections;

  if (user?.role === 'instructor') {
    sections = instructorSections;
  } else if (user?.role && user.role !== 'student') {
    sections = adminSections;
  }

  const MotionDiv = motion.div as any;
  const MotionAside = motion.aside as any;
  const MotionSpan = motion.span as any;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <MotionAside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 256,
          transition: { duration: 0.3, ease: "easeInOut" }
        }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-sidebar border-r border-gray-200 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hidden lg:flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors z-50 focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Logo */}
        <div className={`h-16 flex items-center border-b border-gray-200/50 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <BookOpen className="text-white" size={18} />
          </div>
          <MotionSpan
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="ml-3 text-xl font-bold text-gray-900 tracking-tight overflow-hidden whitespace-nowrap"
          >
            Aelgo World
          </MotionSpan>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden px-3">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <div className={`text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 h-0' : 'px-4 opacity-100'}`}>
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      title={isCollapsed ? item.label : ''}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`}>
                        {item.icon}
                      </span>
                      <MotionSpan
                        initial={false}
                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </MotionSpan>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200/50 bg-sidebar">
          <div className={`flex items-center mb-4 transition-all duration-300 ${isCollapsed ? 'justify-center bg-transparent border-none shadow-none p-0' : 'px-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200'}`}>
            <img
              className="h-9 w-9 rounded-full ring-2 ring-gray-100 flex-shrink-0"
              src={user?.avatar}
              alt="User avatar"
            />
            <MotionDiv
              initial={false}
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </MotionDiv>
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : ""}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={18} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
            <MotionSpan
              initial={false}
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
              className="whitespace-nowrap overflow-hidden"
            >
              Sign Out
            </MotionSpan>
          </button>
        </div>
      </MotionAside>

      {/* Main Content - Using bg-gray-50 (Cream) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Mobile Header - Uses dynamic sidebar background for consistency */}
        <div className="lg:hidden bg-sidebar border-b border-gray-200 h-16 flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-gray-900">Aelgo World</span>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence>
              <MotionDiv
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full"
              >
                {children}
              </MotionDiv>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
