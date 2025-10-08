import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FormData {
  fullName: string;
  idDetails: string;
  phoneNumber: string;
  email: string;
  shopName: string;
  status: string;
  heading: string;
  description: string;
  short_description: string;
  address: string;
  advertisementDetails: string;
  termsAccepted: boolean;
  advertisementImages: File[];
  listingType: 'training' | 'franchise' | 'seller';
}

const CreateListingPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const base_url = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    idDetails: '',
    phoneNumber: '',
    email: '',
    shopName: '',
    status: 'active',
    heading: '',
    description: '',
    short_description: '',
    address: '',
    advertisementDetails: '',
    termsAccepted: false,
    advertisementImages: [],
    listingType: 'training',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const maxImages = formData.listingType === 'seller' ? 5 : 4;

      if (files.length > maxImages) {
        setError(`You can only upload up to ${maxImages} images for ${formData.listingType} listings.`);
        e.target.value = '';
        return;
      }

      // Clean up old previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

      setFormData((prev) => ({
        ...prev,
        advertisementImages: files,
      }));

      // Create new previews
      const previews: string[] = [];
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const objectUrl = URL.createObjectURL(file);
          previews.push(objectUrl);
        }
      });
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    const newImages = formData.advertisementImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setFormData((prev) => ({ ...prev, advertisementImages: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !formData.fullName ||
      !formData.idDetails ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.shopName ||
      !formData.status ||
      !formData.heading ||
      !formData.termsAccepted
    ) {
      setError('All required fields must be filled and terms must be accepted.');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'advertisementImages') {
          value.forEach((file: File) => formDataToSend.append('advertisementImages', file));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const endpoint =
        formData.listingType === 'training'
          ? `${base_url}/api/v1/listing/training-list`
          : formData.listingType === 'franchise'
          ? `${base_url}/api/v1/listing/franchise-list`
          : `${base_url}/api/v1/sallerroute/createSellerListing`;

      const response = await axios.post(endpoint, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);

      // Clean up image previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setImagePreviews([]);

      setFormData({
        fullName: '',
        idDetails: '',
        phoneNumber: '',
        email: '',
        shopName: '',
        status: 'active',
        heading: '',
        description: '',
        short_description: '',
        address: '',
        advertisementDetails: '',
        termsAccepted: false,
        advertisementImages: [],
        listingType: 'training',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const getListingTypeColor = () => {
    switch (formData.listingType) {
      case 'training':
        return 'from-blue-600 to-blue-700';
      case 'franchise':
        return 'from-purple-600 to-purple-700';
      case 'seller':
        return 'from-green-600 to-green-700';
      default:
        return 'from-indigo-600 to-indigo-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-gradient-to-r ${getListingTypeColor()} rounded-t-2xl p-8 text-white shadow-lg`}>
          <h1 className="text-4xl font-bold mb-2">Create New Listing</h1>
          <p className="text-blue-100 text-lg">
            Fill in the details to create your {formData.listingType} listing
          </p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Listing Type</h2>
              <div className="grid grid-cols-3 gap-4">
                {(['training', 'franchise', 'seller'] as const).map((type) => (
                  <label
                    key={type}
                    className={`relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.listingType === type
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="listingType"
                      value={type}
                      checked={formData.listingType === type}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span
                      className={`font-medium capitalize ${
                        formData.listingType === type ? 'text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  1
                </span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="idDetails" className="block text-sm font-medium text-gray-700 mb-2">
                    ID Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="idDetails"
                    name="idDetails"
                    type="text"
                    value={formData.idDetails}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="ID number or document"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="+91 1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  2
                </span>
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop/Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter business name"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  3
                </span>
                Listing Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
                    Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="heading"
                    name="heading"
                    type="text"
                    value={formData.heading}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter a catchy heading"
                  />
                </div>

                <div>
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    placeholder="Brief description (1-2 sentences)"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    placeholder="Provide detailed information about your listing"
                  />
                </div>

                <div>
                  <label htmlFor="advertisementDetails" className="block text-sm font-medium text-gray-700 mb-2">
                    Advertisement Details
                  </label>
                  <textarea
                    id="advertisementDetails"
                    name="advertisementDetails"
                    value={formData.advertisementDetails}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    placeholder="Additional promotional information"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  4
                </span>
                Images
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition">
                <input
                  id="advertisementImages"
                  name="advertisementImages"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="advertisementImages" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Upload Images</p>
                  <p className="text-sm text-gray-500">
                    Click to upload up to {formData.listingType === 'seller' ? 5 : 4} images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Selected Images ({imagePreviews.length}/{formData.listingType === 'seller' ? 5 : 4})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-contain p-2"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            title="Remove image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          Image {index + 1}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded text-gray-700 truncate">
                          {formData.advertisementImages[index]?.name || 'Image'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <label className="flex items-start space-x-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  I accept the{' '}
                  <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                    terms and conditions
                  </span>{' '}
                  and confirm that all information provided is accurate.
                </span>
              </label>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${getListingTypeColor()} text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Listing...
                  </span>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;