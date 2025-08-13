import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Package,
  Upload,
  X,
  DollarSign,
  Tag,
  ImageIcon,
  Save,
  ArrowLeft,

} from 'lucide-react';

interface ProductData {
  name: string;
  slug: string;
  originalPrice: string;
  discountPercent: string;
  description: string;
  shortDescription: string;
  category: string;
  trackQuantity: boolean;
  quantity: string;
  tags: string;
  status: string;
}

interface Category {
  _id: string;
  name: string;
}

const AddProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [productData, setProductData] = useState<ProductData>({
    name: '',
    slug: '',
    originalPrice: '',
    discountPercent: '0',
    description: '',
    shortDescription: '',
    category: '',
    trackQuantity: true,
    quantity: '0',
    tags: '',
    status: 'draft'
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseurl}/api/v1/category`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [baseurl]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setProductData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: checked,
      quantity: !checked ? '0' : prev.quantity
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const maxImages = 10;

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, and WEBP are allowed.`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`File too large (max 5MB): ${file.name}`);
        return false;
      }

      return true;
    });

    const remainingSlots = maxImages - images.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      toast.warning(`You can only upload up to ${maxImages} images. ${remainingSlots} slots remaining.`);
    }

    const previews = filesToAdd.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setImages(prev => [...prev, ...filesToAdd]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const validateForm = (): boolean => {
    if (!productData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }

    if (!productData.originalPrice || parseFloat(productData.originalPrice) <= 0) {
      toast.error('Valid original price is required');
      return false;
    }

    if (!productData.description.trim()) {
      toast.error('Description is required');
      return false;
    }

    if (!productData.category) {
      toast.error('Category is required');
      return false;
    }

    if (productData.trackQuantity && (!productData.quantity || parseInt(productData.quantity) < 0)) {
      toast.error('Valid quantity is required when tracking is enabled');
      return false;
    }

    if (images.length === 0) {
      toast.error('At least one image is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();

      formData.append('name', productData.name);
      formData.append('slug', productData.slug);
      formData.append('originalPrice', productData.originalPrice);
      formData.append('discountPercent', productData.discountPercent);
      formData.append('description', productData.description);
      formData.append('shortDescription', productData.shortDescription);
      formData.append('category', productData.category);
      formData.append('trackQuantity', String(productData.trackQuantity));
      formData.append('quantity', productData.quantity);
      formData.append('status', productData.status);

      if (productData.tags) {
        const tagsArray = productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      }

      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await axios.post(`${baseurl}/api/v1/product/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status == 201 && response.data.success == 'true') {

        toast.success('Product created successfully!');
        navigate('/ProductList'); // Navigate to products page after success
      }

    } catch (error) {
      console.error('Product creation error:', error);

      let errorMessage = 'Failed to create product';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;

        if (error.response?.status === 400) {
          if (error.response.data.errors) {
            errorMessage = error.response.data.errors.map((err: any) => err.msg).join(', ');
          }
        } else if (error.response?.status === 401) {
          errorMessage = 'Unauthorized - Please login again';
          navigate('/login');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    const original = parseFloat(productData.originalPrice) || 0;
    const discount = parseFloat(productData.discountPercent) || 0;
    return original - (original * discount / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Products</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-indigo-600" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={productData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="product-slug"
                    required
                    pattern="^[a-z0-9-]+$"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    disabled={categoryLoading}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoryLoading && (
                    <p className="text-sm text-slate-500">Loading categories...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={productData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Pricing
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Original Price *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="originalPrice"
                      value={productData.originalPrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discountPercent"
                      value={productData.discountPercent}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 font-medium">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {productData.originalPrice && productData.discountPercent && parseFloat(productData.discountPercent) > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Final Price:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500 line-through">₹{parseFloat(productData.originalPrice).toFixed(2)}</span>
                      <span className="text-lg font-bold text-green-600">₹{calculateDiscountedPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Inventory
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="trackQuantity"
                  checked={productData.trackQuantity}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label className="text-sm font-medium text-slate-700">
                  Track quantity for this product
                </label>
              </div>

              {productData.trackQuantity && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={productData.quantity}
                    onChange={handleChange}
                    className="w-full max-w-xs px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="0"
                    min="0"
                    required={productData.trackQuantity}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-purple-600" />
                Description & Tags
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Product Description *
                </label>
                <textarea
                  rows={5}
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Detailed product description..."
                  maxLength={2000}
                  required
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Detailed description of your product</span>
                  <span>{productData.description.length}/2000</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  name="shortDescription"
                  value={productData.shortDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Brief product summary..."
                  maxLength={250}
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Brief summary for product listings</span>
                  <span>{productData.shortDescription.length}/250</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={productData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="electronics, smartphone, apple, iphone"
                />
                <p className="text-sm text-slate-500">Separate tags with commas (max 30 characters each)</p>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-orange-600" />
                Product Images *
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 transition-colors">
                <div className="p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <div className="space-y-2">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Images
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageChange}
                        disabled={images.length >= 10}
                      />
                    </label>
                    <p className="text-sm text-slate-500">
                      or drag and drop images here
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    PNG, JPG, WEBP up to 5MB each • {10 - images.length} slots remaining
                  </p>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Image Previews ({imagePreviews.length}/10)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;