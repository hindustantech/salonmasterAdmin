import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications
import { getUserById,updateUser,toggleUserSuspension,deleteUser } from '../../services/userService';
interface UserData {
  _id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  domain_type: string;
  isSuspended: boolean;
  // Add other user fields as needed
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  grade: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: number;
}

interface PortfolioLink {
  platform: string;
  url: string;
}

interface Skill {
  _id: string;
  name: string; // Assuming Skill has name
  // Other skill fields if needed
}

interface CandidateProfile {
  _id: string;
  user_id: string;
  image?: string;
  is_Premium?: boolean;
  uniquename?: string;
  id_no?: string;
  location?: string;
  name?: string;
  date_of_birth?: string; // Use string for date inputs
  gender?: 'male' | 'female' | 'other';
  pan_no?: string;
  contact_no?: string;
  id_type?: 'Aadhaar' | 'Passport' | 'Driving License' | 'Voter ID' | 'PAN' | 'Other';
  id_detail?: {
    number?: string;
    front_image?: string;
    back_image?: string;
  };
  education?: Education[];
  certificates?: Certificate[];
  skills?: Skill[];
  services?: string[];
  available_for_join?: boolean;
  available_for_join_start?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    countryIsoCode?: string;
    stateIsoCode?: string;
  };
  joining_date?: string;
  expected_salary?: {
    min: number;
    max: number;
  };
  portfolio_links?: PortfolioLink[];
  looking_job_location?: 'india' | 'outside_india' | 'both' | '';
  preferred_locations?: string[];
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userForm, setUserForm] = useState<Partial<UserData>>({});
  const [profileForm, setProfileForm] = useState<Partial<CandidateProfile>>({});

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
          setProfileForm({
            ...domainProfile,
            date_of_birth: domainProfile.date_of_birth ? new Date(domainProfile.date_of_birth).toISOString().split('T')[0] : '',
            available_for_join_start: domainProfile.available_for_join_start ? new Date(domainProfile.available_for_join_start).toISOString().split('T')[0] : '',
            joining_date: domainProfile.joining_date ? new Date(domainProfile.joining_date).toISOString().split('T')[0] : '',
          });
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch user details');
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
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to update profile');
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

  const handleNestedChange = (section: keyof CandidateProfile, field: string, value: any) => {
    setProfileForm({
      ...profileForm,
      [section]: {
        ...(profileForm[section] as any || {}),
        [field]: value,
      },
    });
  };

  const handleArrayChange = (arrayName: keyof CandidateProfile, index: number, field: string, value: any) => {
    const array = [...(profileForm[arrayName] as any[] || [])];
    array[index] = { ...array[index], [field]: value };
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  const addArrayItem = (arrayName: keyof CandidateProfile, defaultItem: any) => {
    const array = [...(profileForm[arrayName] as any[] || [])];
    array.push(defaultItem);
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  const removeArrayItem = (arrayName: keyof CandidateProfile, index: number) => {
    const array = [...(profileForm[arrayName] as any[] || [])];
    array.splice(index, 1);
    setProfileForm({ ...profileForm, [arrayName]: array });
  };

  const handleServicesChange = (index: number, value: string) => {
    const services = [...(profileForm.services || [])];
    services[index] = value;
    setProfileForm({ ...profileForm, services });
  };

  const addService = () => {
    const services = [...(profileForm.services || [])];
    services.push('');
    setProfileForm({ ...profileForm, services });
  };

  const removeService = (index: number) => {
    const services = [...(profileForm.services || [])];
    services.splice(index, 1);
    setProfileForm({ ...profileForm, services });
  };

  const handlePreferredLocationsChange = (index: number, value: string) => {
    const locations = [...(profileForm.preferred_locations || [])];
    locations[index] = value;
    setProfileForm({ ...profileForm, preferred_locations: locations });
  };

  const addPreferredLocation = () => {
    const locations = [...(profileForm.preferred_locations || [])];
    locations.push('');
    setProfileForm({ ...profileForm, preferred_locations: locations });
  };

  const removePreferredLocation = (index: number) => {
    const locations = [...(profileForm.preferred_locations || [])];
    locations.splice(index, 1);
    setProfileForm({ ...profileForm, preferred_locations: locations });
  };

  // For skills, assuming we edit IDs or names; for simplicity, edit as strings. Adjust if needed.

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  if (error) return <div className="text-red-600 text-center text-xl">{error}</div>;
  if (!profileForm) return <div className="text-center text-xl">Profile not Fuoun User is Not registered proper</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Profile Details - {user?.name}</h1>
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

        {/* Personal Information */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userForm.name || ''}
                  onChange={(e) => handleChange(e, 'user')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="whatsapp_number"
                  value={userForm.whatsapp_number || ''}
                  onChange={(e) => handleChange(e, 'user')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{user?.whatsapp_number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={profileForm.date_of_birth || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.date_of_birth ? new Date(profile?.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={profileForm.gender || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.gender || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <p className="text-gray-900">
                {profile?.date_of_birth ? Math.floor((Date.now() - new Date(profile?.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unique Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="uniquename"
                  value={profileForm.uniquename || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.uniquename || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Premium</label>
              {isEditing ? (
                <select
                  name="is_Premium"
                  value={profileForm.is_Premium ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, is_Premium: e.target.value === 'true' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.is_Premium ? 'Yes' : 'No'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Contact and Address */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact and Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact_no"
                  value={profileForm.contact_no || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.contact_no || 'N/A'}</p>
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
          </div>
        </section>

        {/* ID Details */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">ID Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
              {isEditing ? (
                <select
                  name="id_type"
                  value={profileForm.id_type || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PAN">PAN</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.id_type || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm.id_detail?.number || ''}
                  onChange={(e) => handleNestedChange('id_detail', 'number', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.id_detail?.number || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="pan_no"
                  value={profileForm.pan_no || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.pan_no || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID No</label>
              {isEditing ? (
                <input
                  type="text"
                  name="id_no"
                  value={profileForm.id_no || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.id_no || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Front Image URL</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm.id_detail?.front_image || ''}
                  onChange={(e) => handleNestedChange('id_detail', 'front_image', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.id_detail?.front_image || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Back Image URL</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm.id_detail?.back_image || ''}
                  onChange={(e) => handleNestedChange('id_detail', 'back_image', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.id_detail?.back_image || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Education</h2>
          {isEditing ? (
            <div>
              {(profileForm.education || []).map((edu, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => handleArrayChange('education', index, 'year', parseInt(e.target.value))}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Grade"
                      value={edu.grade}
                      onChange={(e) => handleArrayChange('education', index, 'grade', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('education', index)}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('education', { degree: '', institution: '', year: 0, grade: '' })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Education
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.education?.length ? (
                profile?.education.map((edu, index) => (
                  <li key={index} className="text-gray-900">
                    {edu.degree} from {edu.institution} ({edu.year}) - Grade: {edu.grade}
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No education details available</p>
              )}
            </ul>
          )}
        </section>

        {/* Certificates */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Certificates</h2>
          {isEditing ? (
            <div>
              {(profileForm.certificates || []).map((cert, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={cert.name}
                      onChange={(e) => handleArrayChange('certificates', index, 'name', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Issuer"
                      value={cert.issuer}
                      onChange={(e) => handleArrayChange('certificates', index, 'issuer', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      value={cert.year}
                      onChange={(e) => handleArrayChange('certificates', index, 'year', parseInt(e.target.value))}
                      className="p-3 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('certificates', index)}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('certificates', { name: '', issuer: '', year: 0 })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Certificate
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.certificates?.length ? (
                profile?.certificates.map((cert, index) => (
                  <li key={index} className="text-gray-900">
                    {cert.name} by {cert.issuer} ({cert.year})
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No certificates available</p>
              )}
            </ul>
          )}
        </section>

        {/* Skills */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Skills</h2>
          {isEditing ? (
            <div>
              {(profileForm.skills || []).map((skill, index) => (
                <div key={index} className="mb-4 flex items-center space-x-4">
                  <input
                    type="text"
                    value={skill.name || skill._id} // Assuming editing name or ID
                    onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)} // Adjust if skills are IDs
                    className="flex-1 p-3 border rounded-lg"
                  />
                  <button
                    onClick={() => removeArrayItem('skills', index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('skills', { _id: '', name: '' })} // Adjust default
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Skill
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.skills?.length ? (
                profile?.skills.map((skill, index) => (
                  <li key={index} className="text-gray-900">
                    {skill.name}
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No skills listed</p>
              )}
            </ul>
          )}
        </section>

        {/* Services */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Services</h2>
          {isEditing ? (
            <div>
              {(profileForm.services || []).map((service, index) => (
                <div key={index} className="mb-4 flex items-center space-x-4">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => handleServicesChange(index, e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                  />
                  <button
                    onClick={() => removeService(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addService}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Service
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.services?.length ? (
                profile?.services.map((service, index) => (
                  <li key={index} className="text-gray-900">
                    {service}
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No services listed</p>
              )}
            </ul>
          )}
        </section>

        {/* Portfolio Links */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Portfolio Links</h2>
          {isEditing ? (
            <div>
              {(profileForm.portfolio_links || []).map((link, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Platform"
                      value={link.platform}
                      onChange={(e) => handleArrayChange('portfolio_links', index, 'platform', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => handleArrayChange('portfolio_links', index, 'url', e.target.value)}
                      className="p-3 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('portfolio_links', index)}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('portfolio_links', { platform: '', url: '' })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Portfolio Link
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.portfolio_links?.length ? (
                profile?.portfolio_links.map((link, index) => (
                  <li key={index} className="text-gray-900">
                    {link.platform}: <a href={link.url} className="text-blue-600 hover:underline">{link.url}</a>
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No portfolio links</p>
              )}
            </ul>
          )}
        </section>

        {/* Job Preferences */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Job Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available for Join</label>
              {isEditing ? (
                <select
                  name="available_for_join"
                  value={profileForm.available_for_join ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, available_for_join: e.target.value === 'true' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.available_for_join ? 'Yes' : 'No'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="available_for_join_start"
                  value={profileForm.available_for_join_start || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.available_for_join_start ? new Date(profile?.available_for_join_start).toLocaleDateString() : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="joining_date"
                  value={profileForm.joining_date || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.joining_date ? new Date(profile?.joining_date).toLocaleDateString() : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary Min</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profileForm.expected_salary?.min || 0}
                  onChange={(e) => handleNestedChange('expected_salary', 'min', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.expected_salary?.min || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary Max</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profileForm.expected_salary?.max || 0}
                  onChange={(e) => handleNestedChange('expected_salary', 'max', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{profile?.expected_salary?.max || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking for Job Location</label>
              {isEditing ? (
                <select
                  name="looking_job_location"
                  value={profileForm.looking_job_location || ''}
                  onChange={(e) => handleChange(e, 'profile')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="india">India</option>
                  <option value="outside_india">Outside India</option>
                  <option value="both">Both</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile?.looking_job_location || 'N/A'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Preferred Locations */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Preferred Locations</h2>
          {isEditing ? (
            <div>
              {(profileForm.preferred_locations || []).map((location, index) => (
                <div key={index} className="mb-4 flex items-center space-x-4">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handlePreferredLocationsChange(index, e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                  />
                  <button
                    onClick={() => removePreferredLocation(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addPreferredLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Location
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {profile?.preferred_locations?.length ? (
                profile?.preferred_locations.map((location, index) => (
                  <li key={index} className="text-gray-900">
                    {location}
                  </li>
                ))
              ) : (
                <p className="text-gray-900">No preferred locations</p>
              )}
            </ul>
          )}
        </section>

        {/* Profile Image */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Profile Image</h2>
          {isEditing ? (
            <input
              type="text"
              name="image"
              value={profileForm.image || ''}
              onChange={(e) => handleChange(e, 'profile')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Image URL"
            />
          ) : profile?.image ? (
            <img src={profile?.image} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          ) : (
            <p className="text-gray-900">No image</p>
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

export default UserDetails;