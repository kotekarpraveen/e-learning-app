
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, 
  Folder, BookOpen, X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Category } from '../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await api.getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  const handleOpenModal = (mode: 'add' | 'edit', category?: Category) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
      // Auto-generate slug from name if in add mode or slug is empty
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({
          ...prev,
          name: val,
          slug: modalMode === 'add' ? slug : prev.slug
      }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCategory: Category = {
        id: selectedCategory?.id || `cat_${Date.now()}`,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        count: selectedCategory?.count || 0
    };

    const result = await api.saveCategory(newCategory);
    
    if (result.success) {
        if (modalMode === 'add') {
            setCategories([...categories, newCategory]);
        } else {
            setCategories(categories.map(c => c.id === newCategory.id ? newCategory : c));
        }
        setIsModalOpen(false);
    } else {
        alert("Failed to save category: " + result.message);
    }
  };

  const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this category?")) {
          const result = await api.deleteCategory(id);
          if (result.success) {
              setCategories(categories.filter(c => c.id !== id));
          } else {
              alert("Failed to delete category: " + result.message);
          }
      }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categories</h1>
            <p className="text-gray-500">Organize your course catalog with topics and tags.</p>
         </div>
         <Button icon={<Plus size={18} />} onClick={() => handleOpenModal('add')}>
            Add Category
         </Button>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50">
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
                type="text" 
                placeholder="Search categories..." 
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-gray-700"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-center">Courses</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <Folder size={16} />
                                    </div>
                                    <span className="font-bold text-gray-900">{cat.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                {cat.slug}
                            </td>
                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                {cat.description || '-'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    <BookOpen size={12} className="mr-1" />
                                    {cat.count || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleOpenModal('edit', cat)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                No categories found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
               >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h2 className="text-xl font-bold text-gray-900">
                        {modalMode === 'add' ? 'Create Category' : 'Edit Category'}
                     </h2>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <div className="p-6">
                     <form id="categoryForm" onSubmit={handleSave} className="space-y-4">
                        <Input 
                            label="Name" 
                            placeholder="e.g. Web Development"
                            value={formData.name} 
                            onChange={e => handleNameChange(e.target.value)}
                            required
                        />
                        <Input 
                            label="Slug" 
                            placeholder="e.g. web-development"
                            value={formData.slug} 
                            onChange={e => setFormData({...formData, slug: e.target.value})}
                            required
                        />
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                           <textarea 
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] resize-none"
                              placeholder="Describe this category..."
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                           />
                        </div>
                     </form>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                     <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                     <Button type="submit" form="categoryForm">Save Category</Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
