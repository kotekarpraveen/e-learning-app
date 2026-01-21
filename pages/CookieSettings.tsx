
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Cookie, Check, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Toggle Component
const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
      checked ? 'bg-primary-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
  </button>
);

export const CookieSettings: React.FC = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('aelgo_cookie_prefs');
    if (stored) {
        setPreferences(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('aelgo_cookie_prefs', JSON.stringify(preferences));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center mr-2 text-white shadow-sm">
               <Globe size={14} />
            </div>
            <span className="text-sm font-bold text-gray-900">Aelgo World</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs">
            <ArrowLeft size={12} className="mr-1" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                <Cookie size={16} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Cookie Preferences</h1>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
                When you visit our website, we store cookies on your browser to collect information. The information collected might relate to you, your preferences or your device, and is mostly used to make the site work as you expect it to and to provide a more personalized web experience. However, you can choose not to allow certain types of cookies, which may impact your experience of the site and the services we are able to offer.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Essential Cookies */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">Strictly Necessary Cookies</h3>
                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">Required</span>
                    </div>
                    <p className="text-xs text-gray-500">
                        These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Toggle checked={true} onChange={() => {}} disabled={true} />
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Analytics Cookies */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Performance & Analytics</h3>
                    <p className="text-xs text-gray-500">
                        These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Toggle 
                        checked={preferences.analytics} 
                        onChange={(v) => setPreferences({...preferences, analytics: v})} 
                    />
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Marketing Cookies */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Marketing & Targeting</h3>
                    <p className="text-xs text-gray-500">
                        These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Toggle 
                        checked={preferences.marketing} 
                        onChange={(v) => setPreferences({...preferences, marketing: v})} 
                    />
                </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
             <Button onClick={handleSave} size="sm" className="w-full sm:w-auto min-w-[140px] text-xs h-9">
                {isSaved ? <span className="flex items-center"><Check size={14} className="mr-1.5" /> Saved</span> : 'Save Preferences'}
             </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
