import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById,updateUser,toggleUserSuspension,deleteUser } from '../../services/userService';
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

interface UserData {
  _id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  domain_type: string;
  isSuspended: boolean;
  // Add other user fields as needed
}

interface SalonProfile {
  _id: string;
  user_id: string;
  identification_number?: string;
  brand_name?: string;
  unique_name?: string;
  salon_name?: string;
  year_of_start?: number;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    countryIsoCode?: string;
    stateIsoCode?: string;
  };
  contact_number?: string;
  whatsapp_number?: string;
  company_name?: string;
  registered_address?: string;
  gst_number?: string;
  pan_number?: string;
  instagram_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  shop_area?: number;
  female_employees_count?: number;
  male_employees_count?: number;
  managers_count?: number;
  payment_credit?: number;
  image_path?: string;
  location?: string;
  requires_employee_recruitment?: boolean;
  requires_product_training?: boolean;
  requires_product_order?: boolean;
  // Virtual total_employees_count
}

const SalonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<SalonProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userForm, setUserForm] = useState<Partial<UserData>>({});
  const [profileForm, setProfileForm] = useState<Partial<SalonProfile>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getUserById(id);
        if (response.success) {
          const { user: fetchedUser, domainProfile } = response.data;
          setUser(fetchedUser);
          setProfile(domainProfile);
          setUserForm(fetchedUser);
          setProfileForm(domainProfile);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch salon details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !user) return;
    try {
      const data = {
        userData: userForm,
        domainData: profileForm,
      };
      const response = await updateUser(id, data);
      if (response.success) {
        setUser(response.data.user);
        setProfile(response.data.domainProfile);
        setIsEditing(false);
        toast.success('Salon profile updated successfully');
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to update salon profile');
      console.error(err);
    }
  };

  const handleToggleSuspension = async () => {
    if (!id || !user) return;
    const newSuspended = !user.isSuspended;
    try {
      const response = await toggleUserSuspension(id, newSuspended);
      if (response.success) {
        setUser(response.data);
        toast.success(`User ${newSuspended ? 'suspended' : 'activated'} successfully`);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to toggle suspension');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await deleteUser(id);
      if (response.success) {
        toast.success('User deleted successfully');
        navigate('/users');
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: 'user' | 'profile') => {
    const setForm = formType === 'user' ? setUserForm : setProfileForm;
    const form = formType === 'user' ? userForm : profileForm;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (section: keyof SalonProfile, field: string, value: any) => {
    setProfileForm({
      ...profileForm,
      [section]: {
        ...(profileForm[section] as any || {}),
        [field]: value,
      },
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  if (error) return <div className="text-red-600 text-center text-xl">{error}</div>;
//   if (!profileForm) return <div className="text-center text-xl">Profile Not created  </div>;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Salon Details - {profile?.salon_name || user?.name}</h1>
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
              Delete User
            </button>
          </div>
        </div>

        {/* Business Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Business Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="salon_name"
                  value={profileForm.salon_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.salon_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="brand_name"
                  value={profileForm.brand_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.brand_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unique Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="unique_name"
                  value={profileForm.unique_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.unique_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Start</label>
              {isEditing ? (
                <input
                  type="number"
                  name="year_of_start"
                  value={profileForm.year_of_start || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.year_of_start || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="company_name"
                  value={profileForm.company_name || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.company_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identification Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="identification_number"
                  value={profileForm.identification_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.identification_number || 'N/A'}</p>
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
                  value={profileForm.address?.country || ''}
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
                  value={profileForm.address?.state || ''}
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
                  value={profileForm.address?.city || ''}
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
                  value={profileForm.address?.pincode || ''}
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
                  value={profileForm.address?.countryIsoCode || ''}
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
                  value={profileForm.address?.stateIsoCode || ''}
                  onChange={(e) => handleNestedChange('address', 'stateIsoCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.address?.stateIsoCode || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="registered_address"
                  value={profileForm.registered_address || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.registered_address || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profileForm.location || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.location || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact_number"
                  value={profileForm.contact_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.contact_number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsapp_number"
                  value={profileForm.whatsapp_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.whatsapp_number || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Legal Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Legal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gst_number"
                  value={profileForm.gst_number || ''}
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
                  value={profileForm.pan_number || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.pan_number || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link</label>
              {isEditing ? (
                <input
                  type="text"
                  name="instagram_link"
                  value={profileForm.instagram_link || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.instagram_link ? <a href={profile?.instagram_link} className="text-blue-600 hover:underline">{profile.instagram_link}</a> : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
              {isEditing ? (
                <input
                  type="text"
                  name="facebook_link"
                  value={profileForm.facebook_link || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.facebook_link ? <a href={profile?.facebook_link} className="text-blue-600 hover:underline">{profile.facebook_link}</a> : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Link</label>
              {isEditing ? (
                <input
                  type="text"
                  name="youtube_link"
                  value={profileForm.youtube_link || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.youtube_link ? <a href={profile?.youtube_link} className="text-blue-600 hover:underline">{profile.youtube_link}</a> : 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Operations */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Area (sq ft)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="shop_area"
                  value={profileForm.shop_area || 0}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.shop_area || 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Female Employees Count</label>
              {isEditing ? (
                <input
                  type="number"
                  name="female_employees_count"
                  value={profileForm.female_employees_count || 0}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.female_employees_count || 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Male Employees Count</label>
              {isEditing ? (
                <input
                  type="number"
                  name="male_employees_count"
                  value={profileForm.male_employees_count || 0}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.male_employees_count || 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Managers Count</label>
              {isEditing ? (
                <input
                  type="number"
                  name="managers_count"
                  value={profileForm.managers_count || 0}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.managers_count || 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Employees</label>
              <p className="text-gray-900">
                {(profile?.female_employees_count || 0) + (profile?.male_employees_count || 0) + (profile?.managers_count || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Credit</label>
              {isEditing ? (
                <input
                  type="number"
                  name="payment_credit"
                  value={profileForm.payment_credit || 0}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.payment_credit || 0}</p>
              )}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requires Employee Recruitment</label>
              {isEditing ? (
                <select
                  name="requires_employee_recruitment"
                  value={profileForm.requires_employee_recruitment ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, requires_employee_recruitment: e.target.value === 'true' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.requires_employee_recruitment ? 'Yes' : 'No'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requires Product Training</label>
              {isEditing ? (
                <select
                  name="requires_product_training"
                  value={profileForm.requires_product_training ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, requires_product_training: e.target.value === 'true' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.requires_product_training ? 'Yes' : 'No'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requires Product Order</label>
              {isEditing ? (
                <select
                  name="requires_product_order"
                  value={profileForm.requires_product_order ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, requires_product_order: e.target.value === 'true' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.requires_product_order ? 'Yes' : 'No'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Image</h2>
          {isEditing ? (
            <input
              type="text"
              name="image_path"
              value={profileForm.image_path || ''}
              onChange={(e) => handleChange(e, 'profile')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Image URL or Path"
            />
          ) : profile?.image_path ? (
            <img src={profile.image_path} alt="Salon Image" className="w-48 h-48 rounded-lg object-cover" />
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

export default SalonDetails;