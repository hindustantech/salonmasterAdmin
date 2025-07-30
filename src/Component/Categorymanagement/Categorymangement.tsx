import { useState, useEffect } from 'react';
import {
    createCategory,
    deleteCategory,
    getCategories,
    toggleCategoryStatus,
    updateCategory
} from '../../services/categoryService';
import type { Category, CategoryFormValues } from '../../types/category';

const CategoryManagement = () => {
    const token = localStorage.getItem('token')
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState({
        categories: true,
        form: false,
        action: false
    });
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormValues>({
        name: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(prev => ({ ...prev, categories: true }));
                setError(null);
                
                const result = await getCategories();
                
                if (result.success && result.data) {
                    setCategories(result.data.data);
                } else {
                    setError(result.message || 'Failed to load categories');
                }
            } catch (err) {
                setError('An unexpected error occurred');
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(prev => ({ ...prev, categories: false }));
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !token) return;

        try {
            setLoading(prev => ({ ...prev, form: true }));
            setError(null);
            setFormErrors({});

            let result;
            if (currentCategory) {
                result = await updateCategory(currentCategory._id, formData, token);
            } else {
                result = await createCategory(formData, token);
            }

            if (result.success) {
                // Refresh categories after successful operation
                const refreshResult = await getCategories();
                if (refreshResult.success && refreshResult.data) {
                    setCategories(refreshResult.data.data);
                }
                setIsModalOpen(false);
            } else {
                setError(result.message || 'Operation failed');
                if (result.errors) {
                    setFormErrors(result.errors);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error submitting category:', err);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);

            const result = await deleteCategory(id, token);
            if (result.success) {
                // Refresh categories after deletion
                const refreshResult = await getCategories();
                if (refreshResult.success && refreshResult.data) {
                    setCategories(refreshResult.data.data);
                }
            } else {
                setError(result.message || 'Failed to delete category');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error deleting category:', err);
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (!token) return;
        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);

            const result = await toggleCategoryStatus(id, token);
            if (result.success && result.data) {
                // Update local state to reflect status change
                setCategories(prev =>
                    prev.map(cat => (cat._id === id ? { ...cat, isActive: result.data!.isActive } : cat))
                );
            } else {
                setError(result.message || 'Failed to toggle status');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error toggling category status:', err);
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const openEditModal = (category: Category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            isActive: category.isActive
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setCurrentCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            isActive: true
        });
        setFormErrors({});
        setError(null);
        setIsModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={loading.categories || loading.action}
                >
                    {loading.categories ? 'Loading...' : 'Add New Category'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading.categories ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2">Loading categories...</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium">{category.name}</div>
                                        {category.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {category.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(category._id)}
                                            disabled={loading.action}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            } ${loading.action ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {loading.action ? 'Processing...' : category.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(category)}
                                            disabled={loading.action}
                                            className={`text-blue-600 hover:text-blue-900 mr-4 ${loading.action ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            disabled={loading.action}
                                            className={`text-red-600 hover:text-red-900 ${loading.action ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Category Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {currentCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={loading.form}
                                />
                                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md ${formErrors.slug ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={loading.form}
                                />
                                {formErrors.slug && <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    disabled={loading.form}
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={loading.form}
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={loading.form}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                                    disabled={loading.form}
                                >
                                    {loading.form ? (
                                        <>
                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                            {currentCategory ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : currentCategory ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;