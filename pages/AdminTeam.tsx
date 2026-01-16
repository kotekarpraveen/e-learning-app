
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, UserPlus, MoreVertical, Edit2, Trash2, 
  Shield, CheckCircle, Lock, X, AlertTriangle, ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { TeamMember, PermissionCode, UserRole } from '../types';

const PERMISSION_GROUPS: { label: string; permissions: { code: PermissionCode; label: string }[] }[] = [
    {
        label: 'User Management',
        permissions: [
            { code: 'manage_users', label: 'Create & Manage Students' },
            { code: 'manage_team', label: 'Create & Manage Team Members' },
        ]
    },
    {
        label: 'Content & Courses',
        permissions: [
            { code: 'create_course', label: 'Create New Courses' },
            { code: 'edit_course', label: 'Edit Existing Courses' },
            { code: 'delete_course', label: 'Delete Courses' },
            { code: 'manage_library', label: 'Manage Media Library' },
            { code: 'approve_content', label: 'Approve Content for Publish' },
        ]
    },
    {
        label: 'Platform',
        permissions: [
            { code: 'view_analytics', label: 'View Analytics Dashboards' },
            { code: 'manage_billing', label: 'Manage Billing & Payouts' },
            { code: 'manage_settings', label: 'Platform Settings' },
        ]
    }
];

const ROLE_PRESETS: Record<string, PermissionCode[]> = {
    super_admin: [
        'manage_users', 'manage_team', 'create_course', 'edit_course', 'delete_course', 
        'manage_library', 'approve_content', 'view_analytics', 'manage_billing', 'manage_settings'
    ],
    admin: [
        'manage_users', 'create_course', 'edit_course', 'delete_course', 
        'manage_library', 'approve_content', 'view_analytics'
    ],
    sub_admin: [
        'manage_users', 'create_course', 'edit_course', 'manage_library'
    ],
    approver: [
        'approve_content', 'view_analytics'
    ],
    viewer: [
        'view_analytics'
    ]
};

export const AdminTeam: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sub_admin' as UserRole,
    permissions: [] as PermissionCode[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await api.getTeam();
    setTeam(data);
    setIsLoading(false);
  };

  const handleRoleChange = (role: UserRole) => {
      setFormData(prev => ({
          ...prev,
          role,
          // Auto-select permissions based on role preset
          permissions: role === 'student' ? [] : ROLE_PRESETS[role] || []
      }));
  };

  const togglePermission = (code: PermissionCode) => {
      // Super Admin permissions are locked
      if (formData.role === 'super_admin') return;

      setFormData(prev => {
          const has = prev.permissions.includes(code);
          return {
              ...prev,
              permissions: has 
                ? prev.permissions.filter(p => p !== code) 
                : [...prev.permissions, code]
          };
      });
  };

  const handleOpenModal = (mode: 'add' | 'edit', member?: TeamMember) => {
    setModalMode(mode);
    if (mode === 'edit' && member) {
      setSelectedMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        permissions: member.permissions
      });
    } else {
      setSelectedMember(null);
      // Default to Sub Admin
      setFormData({
        name: '',
        email: '',
        role: 'sub_admin',
        permissions: ROLE_PRESETS['sub_admin']
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: TeamMember = {
        id: selectedMember?.id || `t_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: selectedMember?.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
        status: 'Active',
        lastActive: 'Never',
        permissions: formData.permissions
    };

    await api.saveTeamMember(newMember);
    
    // Optimistic Update
    if (modalMode === 'add') {
        setTeam([...team, newMember]);
    } else {
        setTeam(team.map(t => t.id === newMember.id ? newMember : t));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to remove this team member? This action cannot be undone.")) {
          await api.deleteTeamMember(id);
          setTeam(team.filter(t => t.id !== id));
      }
  };

  const filteredTeam = team.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team & Roles</h1>
            <p className="text-gray-500">Manage administrative access and permissions.</p>
         </div>
         <Button icon={<UserPlus size={18} />} onClick={() => handleOpenModal('add')}>
            Add Member
         </Button>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50">
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
                type="text" 
                placeholder="Search team members..." 
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-gray-700"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Last Active</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredTeam.map(member => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={member.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                                    <div>
                                        <div className="font-bold text-gray-900">{member.name}</div>
                                        <div className="text-xs text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                    member.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                    member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {member.role === 'super_admin' && <Shield size={12} className="mr-1" />}
                                    {member.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    member.status === 'Active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
                                }`}>
                                    {member.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>}
                                    {member.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {member.lastActive}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleOpenModal('edit', member)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {member.role !== 'super_admin' && (
                                    <button 
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Permission Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
               >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h2 className="text-xl font-bold text-gray-900">
                        {modalMode === 'add' ? 'Add Team Member' : 'Edit Access'}
                     </h2>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                     <form id="teamForm" onSubmit={handleSave} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Full Name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <Input 
                                label="Email Address" 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>

                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3">Role</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {[
                                    { id: 'super_admin', label: 'Super Admin', desc: 'Full Access' },
                                    { id: 'admin', label: 'Admin', desc: 'Standard Ops' },
                                    { id: 'sub_admin', label: 'Sub Admin', desc: 'Limited Ops' },
                                    { id: 'approver', label: 'Approver', desc: 'Content Review' },
                                    { id: 'viewer', label: 'Viewer', desc: 'Read Only' }
                                ].map(roleOpt => (
                                    <div 
                                        key={roleOpt.id}
                                        onClick={() => handleRoleChange(roleOpt.id as UserRole)}
                                        className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                                            formData.role === roleOpt.id 
                                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`text-sm font-bold mb-1 ${formData.role === roleOpt.id ? 'text-primary-700' : 'text-gray-700'}`}>
                                            {roleOpt.label}
                                        </div>
                                        <div className="text-xs text-gray-500">{roleOpt.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Permissions Checklist */}
                        <div className="border rounded-xl border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-sm">Access Permissions</h3>
                                {formData.role === 'super_admin' && (
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium border border-amber-100 flex items-center">
                                        <Lock size={12} className="mr-1" /> Super Admin has all permissions
                                    </span>
                                )}
                            </div>
                            
                            <div className="divide-y divide-gray-100">
                                {PERMISSION_GROUPS.map((group, idx) => (
                                    <div key={idx} className="p-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{group.label}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {group.permissions.map(perm => {
                                                const isChecked = formData.permissions.includes(perm.code);
                                                const isDisabled = formData.role === 'super_admin';
                                                
                                                return (
                                                    <label 
                                                        key={perm.code}
                                                        className={`flex items-start p-2 rounded-lg transition-colors ${
                                                            isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center h-5">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isChecked}
                                                                disabled={isDisabled}
                                                                onChange={() => togglePermission(perm.code)}
                                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
                                                            />
                                                        </div>
                                                        <div className="ml-3 text-sm">
                                                            <span className={`font-medium ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                {perm.label}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </form>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                     <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                     <Button type="submit" form="teamForm">
                         {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                     </Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
