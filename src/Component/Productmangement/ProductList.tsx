import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Grid3X3,
  List,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  X,
  Minus,
  Plus as PlusIcon,
} from 'lucide-react';
import type { JSX } from "react";

// Define environment variable type
interface Env {
  VITE_BASE_URL?: string;
}

// Define types for product and related data
interface Category {
  _id?: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  originalPrice: number;
  discountPercent: number;
  price: number;
  category?: Category;
  tags: string[];
  trackQuantity: boolean;
  quantity: number;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  images: string[];
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

interface ApiResponse {
  data: Product[];
  pagination: Pagination;
}

interface NewProduct {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  originalPrice: string;
  discountPercent: number;
  category: string;
  tags: string[];
  trackQuantity: boolean;
  quantity: number;
  status: 'draft' | 'active' | 'archived';
  images: File[];
}

// API base URL
const API_BASE_URL: string = (import.meta.env as Env).VITE_BASE_URL || 'http://localhost:5000';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    originalPrice: '',
    discountPercent: 0,
    category: '',
    tags: [],
    trackQuantity: true,
    quantity: 0,
    status: 'draft',
    images: [],
  });

  const token = localStorage.getItem('token') || '';

  // Fetch products
  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
      };

      const { data } = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/v1/product/vendor`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (): Promise<void> => {
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (key === 'images') {
          value.forEach((image: File) => {
            formData.append('images', image);
          });
        } else if (key === 'tags') {
          formData.append('tags', JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      await axios.post(`${API_BASE_URL}/api/v1/product/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowCreateModal(false);
      resetNewProduct();
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  // Update product
  const updateProduct = async (): Promise<void> => {
    if (!selectedProduct) return;
    try {
      const { _id, ...updateData } = selectedProduct;
      await axios.put(`${API_BASE_URL}/api/v1/product/${_id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Update inventory
  const updateInventory = async (productId: string, action: 'increment' | 'decrement', quantity: number): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/product/${productId}/inventory`, { action, quantity }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  // Update status
  const updateStatus = async (productId: string, status: Product['status']): Promise<void> => {
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/product/${productId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Delete product
  const deleteProduct = async (productId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetNewProduct = (): void => {
    setNewProduct({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      originalPrice: '',
      discountPercent: 0,
      category: '',
      tags: [],
      trackQuantity: true,
      quantity: 0,
      status: 'draft',
      images: [],
    });
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getStatusColor = (status: Product['status']): string => {
    const colors: Record<Product['status'], string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: Product['status']): JSX.Element => {
    const icons: Record<Product['status'], JSX.Element> = {
      active: <CheckCircle className="w-4 h-4" />,
      draft: <Clock className="w-4 h-4" />,
      archived: <Archive className="w-4 h-4" />,
      out_of_stock: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    if (newProduct.name) {
      setNewProduct((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [newProduct.name]);

  // Table View Component
  const TableView: React.FC = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventory
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
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={product.images[0] || '/api/placeholder/100/100'}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.category?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                  {product.discountPercent > 0 && (
                    <div className="text-xs text-gray-500 line-through">₹{product.originalPrice}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{product.quantity}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updateInventory(product._id, 'decrement', 1)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateInventory(product._id, 'increment', 1)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select
                      value={product.status}
                      onChange={(e) => updateStatus(product._id, e.target.value as Product['status'])}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${getStatusColor(product.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img
              src={product.images[0] || '/api/placeholder/300/200'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className={`absolute top-2 right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
              {getStatusIcon(product.status)}
              <span className="ml-1 capitalize">{product.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.shortDescription}</p>

            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                {product.discountPercent > 0 && (
                  <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Stock: {product.quantity}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">{product.category?.name}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => updateInventory(product._id, 'decrement', 1)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateInventory(product._id, 'increment', 1)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowEditModal(true);
                }}
                className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Create Product Modal
  const CreateProductModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Product</h2>
          <button onClick={() => setShowCreateModal(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={newProduct.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProduct((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewProduct((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                value={newProduct.originalPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewProduct((prev) => ({ ...prev, originalPrice: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                value={newProduct.discountPercent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewProduct((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={newProduct.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewProduct((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newProduct.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewProduct((prev) => ({ ...prev, status: e.target.value as NewProduct['status'] }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProduct((prev) => ({
                  ...prev,
                  images: e.target.files ? Array.from(e.target.files) : [],
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={createProduct}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Product
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Product Modal
  const EditProductModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <button onClick={() => setShowEditModal(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedProduct((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={selectedProduct.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSelectedProduct((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                <input
                  type="number"
                  value={selectedProduct.originalPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedProduct((prev) => (prev ? { ...prev, originalPrice: Number(e.target.value) } : prev))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                <input
                  type="number"
                  value={selectedProduct.discountPercent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedProduct((prev) => (prev ? { ...prev, discountPercent: Number(e.target.value) } : prev))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={selectedProduct.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedProduct((prev) => (prev ? { ...prev, quantity: Number(e.target.value) } : prev))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedProduct.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedProduct((prev) => (prev ? { ...prev, status: e.target.value as Product['status'] } : prev))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={updateProduct}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Update Product
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your products, inventory, and pricing</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
                <option value="price">Price Low-High</option>
                <option value="-price">Price High-Low</option>
              </select>
            </div>

            {/* View Toggle and Create Button */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Product List */}
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first product.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Product
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? <TableView /> : <CardView />}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Modals */}
        {showCreateModal && <CreateProductModal />}
        {showEditModal && <EditProductModal />}
      </div>
    </div>
  );
};

export default ProductList;