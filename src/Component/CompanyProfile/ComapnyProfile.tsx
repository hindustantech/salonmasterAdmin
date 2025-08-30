import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  FileText,
  CreditCard,
  Hash,
  Globe,
  Package,
  Upload,
  Save,
  Edit3,
  X,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Phone,
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';

// Type definitions
interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

interface ProductShopOptions {
  online_store: boolean;
  physical_store: boolean;
  delivery_available: boolean;
}

interface Product {
  name: string;
  category: string;
  price: string;
  description: string;
}

interface Address {
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  countryIsoCode?: string;
  stateIsoCode?: string;
}

interface CompanyProfile {
  company_name: string;
  brand: string;
  whatsapp_number: string;
  gst_number: string;
  pan_number: string;
  cin: string;
  image?: string;
  address: Address;
  social_media_links: SocialMediaLinks;
  product_shop_options: ProductShopOptions;
  products: Product[];
}


const CompanyProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CompanyProfile, string>>>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: '',
    brand: '',
    whatsapp_number: '',
    gst_number: '',
    pan_number: '',
    cin: '',
    address: {
      country: '',
      state: '',
      city: '',
      pincode: '',
      countryIsoCode: '',
      stateIsoCode: '',
    },
    social_media_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    product_shop_options: {
      online_store: false,
      physical_store: false,
      delivery_available: false,
    },
    products: [],
  });

  const token = localStorage.getItem('token');
  // Load countries on component mount
  useEffect(() => {
    const countryList = Country.getAllCountries();
    setCountries(countryList);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (profile.address?.countryIsoCode) {
      const stateList = State.getStatesOfCountry(profile.address.countryIsoCode);
      setStates(stateList);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [profile.address?.countryIsoCode]);

  // Load cities when state changes
  useEffect(() => {
    if (profile.address?.countryIsoCode && profile.address?.stateIsoCode) {
      const cityList = City.getCitiesOfState(
        profile.address.countryIsoCode,
        profile.address.stateIsoCode
      );
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [profile.address?.countryIsoCode, profile.address?.stateIsoCode]);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/compnay`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      
      if (!response.ok) {

        throw new Error(`Complete your profile.`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);

      if (data.success) {
        setProfile(data.data);
        if (data.data.image) {
          setImagePreview(data.data.image);
        }
      } else {
        setIsEditing(true); // Enable editing mode if no profile exists
        setApiError(data.message || 'No profile found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsEditing(true);
      setApiError(
        error instanceof Error ? error.message : 'Failed to fetch profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof CompanyProfile] || {}) as object),
          [child]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear form error for this field
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Address change handler
  const handleAddressChange = (field: keyof Address, value: string) => {
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  // Country change handler
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find((c) => c.isoCode === countryCode);
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country: selectedCountry?.name || '',
        countryIsoCode: countryCode,
        state: '',
        stateIsoCode: '',
        city: '',
      },
    }));
  };

  // State change handler
  const handleStateChange = (stateCode: string) => {
    const selectedState = states.find((s) => s.isoCode === stateCode);
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        state: selectedState?.name || '',
        stateIsoCode: stateCode,
        city: '',
      },
    }));
  };

  // City change handler
  const handleCityChange = (cityName: string) => {
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: cityName,
      },
    }));
  };

  // Checkbox change handler
  const handleCheckboxChange = (name: keyof ProductShopOptions, checked: boolean) => {
    setProfile((prev) => ({
      ...prev,
      product_shop_options: {
        ...prev.product_shop_options,
        [name]: checked,
      },
    }));
  };

  // Image change handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setApiError('Please upload a valid image file');
    }
  };

  // Add new product
  const addProduct = () => {
    setProfile((prev) => ({
      ...prev,
      products: [...prev.products, { name: '', category: '', price: '', description: '' }],
    }));
  };

  // Update product field
  const updateProduct = (index: number, field: keyof Product, value: string) => {
    setProfile((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  // Remove product
  const removeProduct = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CompanyProfile, string>> = {};
    let isValid = true;

    if (!profile.company_name.trim()) {
      errors.company_name = 'Company name is required';
      isValid = false;
    }
    if (!profile.brand.trim()) {
      errors.brand = 'Brand name is required';
      isValid = false;
    }

    // Validate WhatsApp number
    if (profile.whatsapp_number && !/^[0-9]{10,15}$/.test(profile.whatsapp_number)) {
      errors.whatsapp_number = 'Invalid WhatsApp number';
      isValid = false;
    }

    // Validate URLs
    const urlFields = ['facebook', 'instagram', 'twitter', 'linkedin'];
    urlFields.forEach((field) => {
      const url = profile.social_media_links[field as keyof SocialMediaLinks];
      if (url && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(url)) {
        errors.social_media_links = `Invalid URL for ${field}`;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  // Save profile
  const handleSave = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('company_name', profile.company_name);
      formData.append('brand', profile.brand);
      formData.append('whatsapp_number', profile.whatsapp_number);
      formData.append('gst_number', profile.gst_number);
      formData.append('pan_number', profile.pan_number);
      formData.append('cin', profile.cin);
      formData.append('address', JSON.stringify(profile.address));
      formData.append('social_media_links', JSON.stringify(profile.social_media_links));
      formData.append('product_shop_options', JSON.stringify(profile.product_shop_options));
      formData.append('products', JSON.stringify(profile.products));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/compnay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);

      if (data.success) {
        setSuccessMessage('Profile saved successfully!');
        setIsEditing(false);
        setSelectedFile(null);
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setApiError('');
    setSuccessMessage('');
    setImagePreview(null);
    setSelectedFile(null);
    setFormErrors({});
    fetchProfile();
  };

  return (
    <div className=" flex items-center justify-center ">
      <div className=" rounded-lg ">
        <div className=" w-full ">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">

            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  aria-label="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    aria-label="Cancel Editing"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    aria-label="Save Changes"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isLoading ? 'Saving...' : 'Save '}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6" role="alert">
              {successMessage}
            </div>
          )}
          {apiError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6" role="alert">
              {apiError}
            </div>
          )}

          {isLoading && !profile.company_name && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Profile Image */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Logo</h3>
                  <div className="text-center">
                    <div className="w-40 h-40 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="company-image"
                          aria-label="Upload Company Logo"
                        />
                        <label
                          htmlFor="company-image"
                          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="company_name"
                          value={profile.company_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-3 border ${formErrors.company_name ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100`}
                          placeholder="Enter company name"
                          aria-required="true"
                        />
                      </div>
                      {formErrors.company_name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.company_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="brand"
                          value={profile.brand}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-3 border ${formErrors.brand ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100`}
                          placeholder="Enter brand name"
                          aria-required="true"
                        />
                      </div>
                      {formErrors.brand && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.brand}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="whatsapp_number"
                          value={profile.whatsapp_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-3 border ${formErrors.whatsapp_number ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100`}
                          placeholder="WhatsApp number with country code"
                        />
                      </div>
                      {formErrors.whatsapp_number && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.whatsapp_number}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={profile.address?.countryIsoCode || ''}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 appearance-none"
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={profile.address?.stateIsoCode || ''}
                          onChange={(e) => handleStateChange(e.target.value)}
                          disabled={!isEditing || !profile.address?.countryIsoCode}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 appearance-none"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state.isoCode} value={state.isoCode}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={profile.address?.city || ''}
                          onChange={(e) => handleCityChange(e.target.value)}
                          disabled={!isEditing || !profile.address?.stateIsoCode}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 appearance-none"
                        >
                          <option value="">Select City</option>
                          {cities.map((city) => (
                            <option key={city.name} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={profile.address?.pincode || ''}
                          onChange={(e) => handleAddressChange('pincode', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Information */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="gst_number"
                          value={profile.gst_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                          placeholder="GST Number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="pan_number"
                          value={profile.pan_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                          placeholder="PAN Number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="cin"
                          value={profile.cin}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                          placeholder="CIN Number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {platform}
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="url"
                            name={`social_media_links.${platform}`}
                            value={
                              profile.social_media_links[platform as keyof SocialMediaLinks] || ''
                            }
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-3 border ${formErrors.social_media_links ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100`}
                            placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                          />
                        </div>
                      </div>
                    ))}
                    {formErrors.social_media_links && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.social_media_links}</p>
                    )}
                  </div>
                </div>

                {/* Shop Options */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Options</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'online_store', label: 'Online Store' },
                      { key: 'physical_store', label: 'Physical Store' },
                      { key: 'delivery_available', label: 'Delivery Available' },
                    ].map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            profile.product_shop_options[
                            option.key as keyof ProductShopOptions
                            ]
                          }
                          onChange={(e) =>
                            handleCheckboxChange(
                              option.key as keyof ProductShopOptions,
                              e.target.checked
                            )
                          }
                          disabled={!isEditing}
                          className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                          aria-label={option.label}
                        />
                        <span className="text-sm font-medium text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                    {isEditing && (
                      <button
                        onClick={addProduct}
                        className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        aria-label="Add Product"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {profile.products.map((product, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-800">Product {index + 1}</h4>
                          {isEditing && (
                            <button
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-800"
                              aria-label={`Remove Product ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct(index, 'name', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={product.category}
                              onChange={(e) => updateProduct(index, 'category', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                              placeholder="Category"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Price
                            </label>
                            <input
                              type="text"
                              value={product.price}
                              onChange={(e) => updateProduct(index, 'price', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                              placeholder="Price"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={product.description}
                              onChange={(e) => updateProduct(index, 'description', e.target.value)}
                              disabled={!isEditing}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                              placeholder="Product description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {profile.products.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No products added yet</p>
                        {isEditing && (
                          <p className="text-sm">Click "Add Product" to get started</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">

            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  aria-label="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    aria-label="Cancel Editing"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    aria-label="Save Changes"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isLoading ? 'Saving...' : 'Save '}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CompanyProfilePage;