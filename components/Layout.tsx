
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2,
  PenTool,
  Library,
  Image,
  Users,
  UserCheck,
  Shield,
  Settings, 
  Puzzle,
  CreditCard,
  LogOut, 
  Menu, 
  BookOpen,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../App';

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
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin Sidebar Structure matching the screenshot
  const adminSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { label: 'Course Builder', path: '/admin/course-builder', icon: <PenTool size={20} /> },
        { label: 'Course Library', path: '/admin/courses', icon: <Library size={20} /> },
        // { label: 'Media Assets', path: '/admin/media', icon: <Image size={20} /> },
      ]
    },
    {
      title: 'User Management',
      items: [
        { label: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        // { label: 'Instructors', path: '/admin/instructors', icon: <UserCheck size={20} /> },
        // { label: 'Permissions', path: '/admin/permissions', icon: <Shield size={20} /> },
      ]
    },
    {
      title: 'Settings',
      items: [
        // { label: 'General', path: '/admin/settings', icon: <Settings size={20} /> },
        // { label: 'Integrations', path: '/admin/integrations', icon: <Puzzle size={20} /> },
        { label: 'Billing', path: '/admin/billing', icon: <CreditCard size={20} /> },
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

  const sections = user?.role === 'admin' ? adminSections : studentSections;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
             <BookOpen className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Aelgo World</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  // Check if active: exact match or starts with path (for nested routes like /admin/courses/edit)
                  // Special handling for root dashboard paths to avoid partial matching everything
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center mb-4 px-2">
              <img
                className="h-8 w-8 rounded-full ring-2 ring-gray-100"
                src={user?.avatar}
                alt="User avatar"
              />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
              </div>
           </div>
           
           <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4">
           <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-gray-900">Aelgo World</span>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
             <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {children}
                </motion.div>
             </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
