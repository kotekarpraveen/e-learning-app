
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, CreditCard, Camera, Save, 
  Check, Shield, Mail, AlertCircle, X, Palette, RefreshCw, Type, Monitor,
  Plus, Upload, Globe, Link as LinkIcon, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../App';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { applyTheme, loadTheme, resetTheme, DEFAULT_THEME, CustomFont } from '../lib/theme';

type Tab = 'profile' | 'security' | 'notifications' | 'billing' | 'appearance';

// --- Toast Component (Local) ---
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className="fixed bottom-6 right-6 z-50 px-6 py-4 bg-gray-900 text-white rounded-xl shadow-2xl flex items-center space-x-3"
  >
    <div className="p-1 bg-green-500 rounded-full text-white">
      <Check size={14} strokeWidth={3} />
    </div>
    <span className="font-medium text-sm">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">
      <X size={16} />
    </button>
  </motion.div>
);

// --- Toggle Switch Component ---
const Toggle = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        checked ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// --- Color Picker Helper ---
const ColorPicker = ({ label, value, onChange, desc }: { label: string, value: string, onChange: (val: string) => void, desc: string }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                <input 
                    type="color" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-16 h-16 -top-2 -left-2 cursor-pointer border-none p-0"
                />
            </div>
            <div className="flex-1">
                <Input 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-sm"
                />
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{desc}</p>
    </div>
);

// --- Font Management Component ---
const FontManager = ({ currentFonts, onAddFont, onDeleteFont }: { currentFonts: CustomFont[], onAddFont: (f: CustomFont) => void, onDeleteFont: (id: string) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [method, setMethod] = useState<'google' | 'file'>('google');
    const [newFont, setNewFont] = useState({ name: '', value: '' });
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for local storage safety
            alert("File is too large. Please use a file under 2MB.");
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewFont({ ...newFont, value: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleAdd = () => {
        if (!newFont.name || !newFont.value) return;
        
        onAddFont({
            id: `font_${Date.now()}`,
            name: newFont.name,
            type: method === 'google' ? 'google' : 'upload',
            value: newFont.value
        });
        
        setNewFont({ name: '', value: '' });
        setFileName('');
        setIsAdding(false);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900 text-sm">Custom Fonts</h4>
                {!isAdding && (
                    <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)} icon={<Plus size={14} />}>
                        Add Font
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4 mb-4 border-b border-gray-100 pb-2">
                        <button 
                            onClick={() => setMethod('google')}
                            className={`text-xs font-bold pb-2 border-b-2 transition-colors ${method === 'google' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-500'}`}
                        >
                            Google Fonts URL
                        </button>
                        <button 
                            onClick={() => setMethod('file')}
                            className={`text-xs font-bold pb-2 border-b-2 transition-colors ${method === 'file' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-500'}`}
                        >
                            Upload File / URL
                        </button>
                    </div>

                    <div className="space-y-3">
                        <Input 
                            label="Font Family Name" 
                            placeholder="e.g. My Custom Font"
                            value={newFont.name}
                            onChange={e => setNewFont({...newFont, name: e.target.value})}
                            className="text-sm"
                        />
                        
                        {method === 'google' ? (
                            <Input 
                                label="Google Fonts CSS URL" 
                                placeholder="https://fonts.googleapis.com/css2?family=..."
                                value={newFont.value}
                                onChange={e => setNewFont({...newFont, value: e.target.value})}
                                className="text-sm"
                            />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Font File (TTF, WOFF, WOFF2)</label>
                                <div className="flex gap-2">
                                    <label className="flex-1 flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Upload size={16} className="mr-2 text-gray-500" />
                                        <span className="text-sm text-gray-600 truncate">{fileName || 'Choose file...'}</span>
                                        <input type="file" accept=".ttf,.woff,.woff2,.otf" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <div className="text-center my-2 text-xs text-gray-400 font-bold">- OR -</div>
                                <Input 
                                    placeholder="Paste direct URL to font file..."
                                    value={newFont.value.startsWith('data:') ? '' : newFont.value}
                                    onChange={e => {
                                        setFileName('');
                                        setNewFont({...newFont, value: e.target.value});
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAdd} disabled={!newFont.name || !newFont.value}>Add Font</Button>
                        </div>
                    </div>
                </div>
            )}

            {currentFonts.length > 0 ? (
                <div className="space-y-2">
                    {currentFonts.map(font => (
                        <div key={font.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded text-gray-500">
                                    {font.type === 'google' ? <Globe size={14} /> : <Upload size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{font.name}</p>
                                    <p className="text-xs text-gray-400 max-w-[150px] truncate">{font.type === 'upload' ? 'Local File' : font.value}</p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteFont(font.id)} className="text-gray-400 hover:text-red-500 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-500 text-center py-2 italic">No custom fonts added yet.</p>
            )}
        </div>
    );
};

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  // Theme State
  const [themeData, setThemeData] = useState(DEFAULT_THEME);

  // Load Profile & Theme Data
  useEffect(() => {
    const loadProfile = async () => {
        if (!user || !isSupabaseConfigured()) return;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, bio')
                .eq('id', user.id)
                .single();
                
            if (data && !error) {
                setFormData(prev => ({
                    ...prev,
                    name: data.full_name || prev.name,
                    email: data.email || prev.email,
                    bio: data.bio || ''
                }));
            }
        } catch (e) {
            console.warn("Could not fetch profile", e);
        }
    };
    
    // Load current theme from storage
    const currentTheme = loadTheme();
    setThemeData(currentTheme);

    loadProfile();
  }, [user]);

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    courseAnnouncements: true,
    marketing: false,
    securityAlerts: true
  });

  const handleThemeChange = (key: keyof typeof DEFAULT_THEME, value: any) => {
      const newTheme = { ...themeData, [key]: value };
      setThemeData(newTheme);
      applyTheme(newTheme);
  };

  const handleAddCustomFont = (font: CustomFont) => {
      const newFonts = [...(themeData.customFonts || []), font];
      const newTheme = { ...themeData, customFonts: newFonts, fontFamily: font.name };
      setThemeData(newTheme);
      applyTheme(newTheme);
  };

  const handleDeleteCustomFont = (id: string) => {
      const newFonts = themeData.customFonts.filter(f => f.id !== id);
      // Revert to Inter if deleted font was active
      const activeFontDeleted = themeData.customFonts.find(f => f.id === id)?.name === themeData.fontFamily;
      const newTheme = { 
          ...themeData, 
          customFonts: newFonts,
          fontFamily: activeFontDeleted ? 'Inter' : themeData.fontFamily
      };
      setThemeData(newTheme);
      applyTheme(newTheme);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Theme Saving logic is immediate via applyTheme, but we simulate a "Save" action
    if (activeTab === 'appearance') {
        applyTheme(themeData);
    }
    
    if (activeTab === 'profile' && isSupabaseConfigured() && user) {
        const updates: any = {
            id: user.id,
            full_name: formData.name,
            updated_at: new Date(),
        };
        if (formData.bio) updates.bio = formData.bio;
        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) {
            alert("Error: " + error.message);
            setIsLoading(false);
            return;
        }
    } else {
        await new Promise(r => setTimeout(r, 800));
    }
    
    setIsLoading(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetTheme = () => {
      const def = resetTheme();
      setThemeData(def);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ...(user?.role.includes('admin') ? [
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> }
    ] : [])
  ];

  const standardFonts = ['Inter', 'Roboto', 'Lato', 'Poppins', 'Montserrat', 'Open Sans'];
  const allFonts = [
      ...standardFonts,
      ...(themeData.customFonts || []).map(f => f.name)
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile information and account preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-6 border-b border-gray-100 pb-8">
                    <div className="relative group cursor-pointer">
                      <img 
                        src={user?.avatar} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50 group-hover:opacity-75 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white drop-shadow-md" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                      <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. Max size of 800K</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" size="sm" className="text-xs">Upload New</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:bg-red-50 hover:text-red-600">Delete</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <Input 
                      label="Email Address" 
                      value={formData.email} 
                      disabled // Email change logic is complex
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                       <textarea 
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] resize-none"
                          value={formData.bio}
                          onChange={e => setFormData({...formData, bio: e.target.value})}
                       />
                       <p className="text-xs text-gray-500 mt-1">Brief description for your profile.</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* ... (Security and Notification tabs remain same, omitted for brevity) ... */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                   <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-1">Password</h3>
                     <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>
                     
                     <div className="space-y-4 max-w-md">
                        <Input 
                          label="Current Password" 
                          type="password"
                          value={formData.currentPassword} 
                          onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        />
                        <Input 
                          label="New Password" 
                          type="password"
                          value={formData.newPassword} 
                          onChange={e => setFormData({...formData, newPassword: e.target.value})}
                        />
                     </div>
                   </div>
                   <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>
                      Update Security
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                   <div className="divide-y divide-gray-100">
                      <Toggle label="Course Updates" description="Receive updates about your enrolled courses." checked={notifications.courseAnnouncements} onChange={v => setNotifications({...notifications, courseAnnouncements: v})} />
                      <Toggle label="Marketing Emails" description="Receive tips and offers." checked={notifications.marketing} onChange={v => setNotifications({...notifications, marketing: v})} />
                   </div>
                   <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>Save Preferences</Button>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                  <div className="space-y-10">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Portal Customization</h3>
                          <p className="text-sm text-gray-500">Customize the look and feel of the application.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                          {/* Color Settings */}
                          <ColorPicker 
                             label="Primary Brand Color" 
                             value={themeData.primaryColor} 
                             onChange={(v) => handleThemeChange('primaryColor', v)}
                             desc="Used for primary buttons, links, and active states."
                          />
                          <ColorPicker 
                             label="Secondary Brand Color" 
                             value={themeData.secondaryColor} 
                             onChange={(v) => handleThemeChange('secondaryColor', v)}
                             desc="Used for accents and secondary button variants."
                          />
                          <ColorPicker 
                             label="Page Background" 
                             value={themeData.backgroundColor} 
                             onChange={(v) => handleThemeChange('backgroundColor', v)}
                             desc="Main background color for the application."
                          />
                          <ColorPicker 
                             label="Sidebar Background" 
                             value={themeData.sidebarBackgroundColor} 
                             onChange={(v) => handleThemeChange('sidebarBackgroundColor', v)}
                             desc="Background color for the navigation sidebar."
                          />
                          <ColorPicker 
                             label="Card Background" 
                             value={themeData.cardBackgroundColor} 
                             onChange={(v) => handleThemeChange('cardBackgroundColor', v)}
                             desc="Background color for cards and content containers."
                          />
                      </div>

                      <div className="border-t border-gray-100 my-6"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                          {/* Typography Settings */}
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                  <Type size={16} className="mr-2 text-gray-400" /> Active Font Family
                              </label>
                              <select 
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 bg-white"
                                  value={themeData.fontFamily}
                                  onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                              >
                                  {allFonts.map(fontName => (
                                      <option key={fontName} value={fontName}>{fontName}</option>
                                  ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-2">Select active font for the interface.</p>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                  <Monitor size={16} className="mr-2 text-gray-400" /> Display Scale
                              </label>
                              <div className="flex items-center gap-4">
                                  <input 
                                      type="range" 
                                      min="75" 
                                      max="125" 
                                      step="5"
                                      value={themeData.scale}
                                      onChange={(e) => handleThemeChange('scale', parseInt(e.target.value))}
                                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                  />
                                  <span className="text-sm font-mono font-bold w-12 text-right">{themeData.scale}%</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Adjust the base size of text and elements.</p>
                          </div>
                      </div>

                      {/* Font Manager */}
                      <FontManager 
                          currentFonts={themeData.customFonts || []} 
                          onAddFont={handleAddCustomFont}
                          onDeleteFont={handleDeleteCustomFont}
                      />

                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-4">Live Preview</h4>
                          <div className="flex flex-wrap gap-4 items-center">
                              <Button>Primary Button</Button>
                              <Button variant="accent">Secondary/Accent</Button>
                              <Button variant="secondary">Neutral Button</Button>
                              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex-1 min-w-[200px]">
                                  <h5 className="font-bold text-gray-900">Card Title</h5>
                                  <p className="text-sm text-gray-500">This is how content looks.</p>
                              </div>
                          </div>
                      </div>

                      <div className="pt-4 flex justify-between border-t border-gray-100">
                        <Button variant="ghost" onClick={handleResetTheme} className="text-gray-500 hover:text-gray-900">
                            <RefreshCw size={16} className="mr-2" /> Reset Defaults
                        </Button>
                        <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>
                            Save Appearance
                        </Button>
                      </div>
                  </div>
              )}

              {activeTab === 'billing' && (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <CreditCard className="text-gray-400" size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                   <p className="text-gray-500 mb-6">You have no saved payment methods.</p>
                   <Button variant="secondary">Add Payment Method</Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <Toast 
            message="Settings saved successfully" 
            onClose={() => setShowToast(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
