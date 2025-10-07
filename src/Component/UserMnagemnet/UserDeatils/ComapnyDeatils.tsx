import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, toggleUserSuspension, deleteUser } from '../../services/userService';
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

interface UserData {
  _id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  domain_type: string;
  isSuspended: boolean;
  createdAt: string;
}

interface CompanyProfile {
  _id: string;
  user_id: string;
  unique_name?: string;
  company_name?: string;
  brand?: string;
  whatsapp_number?: string;
  gst_number?: string;
  pan_number?: string;
  cin?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    countryIsoCode?: string;
    stateIsoCode?: string;
  };
  image?: string;
  social_media_links?: { [key: string]: string };
  product_shop_options?: string[];
  products?: string[];
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userForm, setUserForm] = useState<Partial<UserData>>({});
  const [profileForm, setProfileForm] = useState<Partial<CompanyProfile>>({
    social_media_links: {},
    product_shop_options: [],
    products: [],
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getUserById(id);
        if (response?.success) {
          const { user: fetchedUser, domainProfile } = response?.data;
          setUser(fetchedUser);
          setProfile(domainProfile);
          setUserForm(fetchedUser);
          setProfileForm({
            ...domainProfile,
            social_media_links: domainProfile?.social_media_links || {},
            product_shop_options: domainProfile?.product_shop_options || [],
            products: domainProfile?.products || [],
          });
        } else {
          setError(response?.message || 'Unknown error');
        }
      } catch (err) {
        setError('Failed to fetch company details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !user) return;
    try {
      const data = {
        userData: userForm,
        domainData: profileForm,
      };
      const response = await updateUser(id, data);
      if (response?.success) {
        setUser(response?.data?.user);
        setProfile(response?.data?.domainProfile);
        setIsEditing(false);
        toast.success('Company profile updated successfully');
      } else {
        toast.error(response?.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to update company profile');
      console.error(err);
    }
  };

  const handleToggleSuspension = async () => {
    if (!id || !user) return;
    const newSuspended = !user?.isSuspended;
    try {
      const response = await toggleUserSuspension(id, newSuspended);
      if (response?.success) {
        setUser(response?.data);
        toast.success(`User ${newSuspended ? 'suspended' : 'activated'} successfully`);
      } else {
        toast.error(response?.message || 'Toggle suspension failed');
      }
    } catch (err) {
      toast.error('Failed to toggle suspension');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      const response = await deleteUser(id);
      if (response?.success) {
        toast.success('Company deleted successfully');
        navigate('/users');
      } else {
        toast.error(response?.message || 'Deletion failed');
      }
    } catch (err) {
      toast.error('Failed to delete company');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: 'user' | 'profile') => {
    const setForm = formType === 'user' ? setUserForm : setProfileForm;
    const form = formType === 'user' ? userForm : profileForm;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (section: keyof CompanyProfile, field: string, value: any) => {
    setProfileForm({
      ...profileForm,
      [section]: {
        ...(profileForm[section] as any || {}),
        [field]: value,
      },
    });
  };

  const handleSocialMediaChange = (key: string, value: string) => {
    setProfileForm({
      ...profileForm,
      social_media_links: {
        ...(profileForm?.social_media_links || {}),
        [key]: value,
      },
    });
  };

  const addArrayItem = (arrayName: 'product_shop_options' | 'products') => {
    const array = [...(profileForm[arrayName] || [])];
    array.push('');
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  const removeArrayItem = (arrayName: 'product_shop_options' | 'products', index: number) => {
    const array = [...(profileForm[arrayName] || [])];
    array.splice(index, 1);
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  const handleArrayChange = (arrayName: 'product_shop_options' | 'products', index: number, value: string) => {
    const array = [...(profileForm[arrayName] || [])];
    array[index] = value;
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="text-red-600 text-center text-xl">{error}</div>;
  if (!profile) return <div className="text-center text-xl">Invalid user or profile type</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Company Details - {profile?.company_name || user?.name}</h1>
          <div className="flex flex-wrap space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              onClick={handleToggleSuspension}
              className={`px-4 py-2 ${user?.isSuspended ? 'bg-green-600' : 'bg-yellow-600'} text-white rounded-lg hover:opacity-90 transition`}
            >
              {user?.isSuspended ? 'Activate User' : 'Suspend User'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userForm?.name || ''}
                  onChange={(e) => handleChange(e, 'user')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{user?.name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsapp_number"
                  value={userForm?.whatsapp_number || ''}
                  onChange={(e) => handleChange(e, 'user')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{user?.whatsapp_number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p className={`text-gray-900 ${user?.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                {user?.isSuspended ? 'Suspended' : 'Active'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="company_name"
                  value={profileForm?.company_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.company_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              {isEditing ? (
                <input
                  type="text"
                  name="brand"
                  value={profileForm?.brand || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.brand || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unique Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="unique_name"
                  value={profileForm?.unique_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.unique_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsapp_number"
                  value={profileForm?.whatsapp_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.whatsapp_number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gst_number"
                  value={profileForm?.gst_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.gst_number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="pan_number"
                  value={profileForm?.pan_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.pan_number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
              {isEditing ? (
                <input
                  type="text"
                  name="cin"
                  value={profileForm?.cin || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.cin || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.country || ''}
                  onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.country || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.state || ''}
                  onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.state || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.city || ''}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.city || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.pincode || ''}
                  onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.pincode || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country ISO Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.countryIsoCode || ''}
                  onChange={(e) => handleNestedChange('address', 'countryIsoCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.countryIsoCode || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State ISO Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm?.address?.stateIsoCode || ''}
                  onChange={(e) => handleNestedChange('address', 'stateIsoCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.stateIsoCode || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Social Media Links */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Social Media Links</h2>
          {isEditing ? (
            <div className="space-y-4">
              {Object.keys(profileForm?.social_media_links || {}).map((key, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={key}
                    placeholder="Platform (e.g., Instagram)"
                    onChange={(e) => {
                      const newLinks = { ...profileForm?.social_media_links };
                      const value = newLinks[key];
                      delete newLinks[key];
                      newLinks[e.target.value] = value;
                      setProfileForm({ ...profileForm, social_media_links: newLinks });
                    }}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={profileForm?.social_media_links?.[key] || ''}
                    placeholder="URL"
                    onChange={(e) => handleSocialMediaChange(key, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      const newLinks = { ...profileForm?.social_media_links };
                      delete newLinks[key];
                      setProfileForm({ ...profileForm, social_media_links: newLinks });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleSocialMediaChange(`platform_${Date.now()}`, '')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Social Media Link
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.social_media_links && Object.keys(profile.social_media_links).length > 0 ? (
                Object.entries(profile.social_media_links).map(([platform, url], index) => (
                  <li key={index} className="text-gray-900">
                    {platform}: <a href={url} className="text-blue-600 hover:underline">{url}</a>
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No social media links available</p>
              )}
            </ul>
          )}
        </section>

        {/* Product Shop Options */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Product Shop Options</h2>
          {isEditing ? (
            <div className="space-y-4">
              {(profileForm?.product_shop_options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleArrayChange('product_shop_options', index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeArrayItem('product_shop_options', index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('product_shop_options')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Product Shop Option
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.product_shop_options?.length ? (
                profile.product_shop_options.map((option, index) => (
                  <li key={index} className="text-gray-900">{option}</li>
                ))
              ) : (
                <p className="text-gray-900">No product shop options available</p>
              )}
            </ul>
          )}
        </section>

        {/* Products */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Products</h2>
          {isEditing ? (
            <div className="space-y-4">
              {(profileForm?.products || []).map((product, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => handleArrayChange('products', index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeArrayItem('products', index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('products')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Product
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.products?.length ? (
                profile.products.map((product, index) => (
                  <li key={index} className="text-gray-900">{product}</li>
                ))
              ) : (
                <p className="text-gray-900">No products available</p>
              )}
            </ul>
          )}
        </section>

        {/* Image */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Image</h2>
          {isEditing ? (
            <input
              type="text"
              name="image"
              value={profileForm?.image || ''}
              onChange={(e) => handleChange(e, 'profile')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Image URL or Path"
            />
          ) : profile?.image ? (
            <img src={profile.image} alt="Company Image" className="w-48 h-48 rounded-lg object-cover" />
          ) : (
            <p className="text-gray-900">No image available</p>
          )}
        </section>

        {isEditing && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleUpdate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save All Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;