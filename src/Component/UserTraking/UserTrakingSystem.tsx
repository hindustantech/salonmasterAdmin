import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Phone, Building, Eye, ChevronLeft, ChevronRight, ArrowLeft, MapPin, IdCard, Image } from 'lucide-react';

// Type definitions
interface User {
  _id: string;
  name: string;
  whatsapp_number: string;
  domain_type: 'worker' | 'company' | 'salon';
  createdAt: string;
}

interface Profile {
  _id: string;
  user_id: string;
  [key: string]: any;
}

interface UsersResponse {
  success: boolean;
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  data: User[];
}

interface ProfileResponse {
  success: boolean;
  user: User;
  profile: Profile | null;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const UserTracking: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/trakingroute/getAllUsers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data: UsersResponse = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/trakingroute/${userId}/profile`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data: ProfileResponse = await response.json();
      if (data.success) {
        setSelectedUser(data.user);
        setProfile(data.profile);
      } else {
        setError('Failed to fetch user profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get domain type styling
  const getDomainTypeStyle = (domainType: string) => {
    switch (domainType) {
      case 'worker':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'company':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'salon':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get domain type icon
  const getDomainTypeIcon = (domainType: string) => {
    switch (domainType) {
      case 'worker':
        return <User className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      case 'salon':
        return <Building className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Format address display
  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'No address available';
    
    const { country, state, city, pincode } = address;
    const parts = [];
    
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);
    if (pincode) parts.push(pincode);
    
    return parts.length > 0 ? parts.join(', ') : 'No address available';
  };

  // Render ID details with images
  const renderIdDetails = (idDetails: any) => {
    if (!idDetails || typeof idDetails !== 'object') {
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No ID details available</p>
        </div>
      );
    }
    
    const { number, front_image, back_image } = idDetails;
    
    return (
      <div className="space-y-4">
        {number && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">ID Number</p>
            <p className="font-medium text-gray-900">{number}</p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Front Image */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Front Side</p>
            {front_image ? (
              <div className="relative">
                <img
                  src={front_image}
                  alt="ID Front Side"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Image not available</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">No front image</span>
              </div>
            )}
          </div>
          
          {/* Back Image */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Back Side</p>
            {back_image ? (
              <div className="relative">
                <img
                  src={back_image}
                  alt="ID Back Side"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Image not available</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">No back image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Format salary
  const formatSalary = (salary: any) => {
    if (!salary || typeof salary !== 'object') return 'Salary not specified';
    
    const { min, max } = salary;
    if (min > 0 && max > 0) {
      return `${min} - ${max}`;
    } else if (min > 0) {
      return `Min: ${min}`;
    } else if (max > 0) {
      return `Max: ${max}`;
    }
    return 'Salary not specified';
  };

  // // Format skills
  // const formatSkills = (skills: any[]) => {
  //   if (!skills || !Array.isArray(skills)) return 'No skills listed';
    
  //   return skills.map((skill: any) => skill.skill_name).join(', ');
  // };
  

  // // Format boolean fields
  // const formatBoolean = (value: any, fieldName: string) => {
  //   if (typeof value === 'boolean') {
  //     return value ? `${fieldName}: Yes` : `${fieldName}: No`;
  //   }
  //   return `${fieldName}: ${String(value)}`;
  // };

  // Render profile details
  const renderProfileDetails = () => {
    if (!selectedUser) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {getDomainTypeIcon(selectedUser.domain_type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  {getDomainTypeIcon(selectedUser.domain_type)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDomainTypeStyle(selectedUser.domain_type)}`}>
                    {selectedUser.domain_type.charAt(0).toUpperCase() + selectedUser.domain_type.slice(1)}
                  </span>
                </div>
                <p className="text-blue-100 mt-1">User Profile Details</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              aria-label="Back to user list"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium text-gray-900">{selectedUser.whatsapp_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Domain Type</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainTypeStyle(selectedUser.domain_type)}`}>
                        {selectedUser.domain_type.charAt(0).toUpperCase() + selectedUser.domain_type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              {profile ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Key Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <IdCard className="w-5 h-5" />
                      <span>Identification</span>
                    </h3>
                    
                    {/* ID Details */}
                    {profile['id detail'] && (
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 md:col-span-2">
                        <p className="text-sm text-gray-500 mb-3">ID Details</p>
                        {renderIdDetails(profile['id detail'])}
                      </div>
                    )}

                    {/* Contact Number (if different from WhatsApp) */}
                    {profile['contact no'] && profile['contact no'] !== selectedUser.whatsapp_number && (
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Additional Contact</p>
                        <p className="font-medium text-gray-900">{profile['contact no']}</p>
                      </div>
                    )}

                    {/* Premium Status */}
                    {profile['is Preuime'] !== undefined && (
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Premium Status</p>
                        <p className={`font-medium ${profile['is Preuime'] ? 'text-green-600' : 'text-gray-600'}`}>
                          {profile['is Preuime'] ? 'Premium Member' : 'Standard Member'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Address & Salary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location & Compensation</span>
                    </h3>
                    
                    {/* Address */}
                    {profile.address && (
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Address</p>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{formatAddress(profile.address)}</p>
                          {profile.address.countryIsoCode && (
                            <p className="text-xs text-gray-500">ISO: {profile.address.countryIsoCode}</p>
                          )}
                          {profile.address.stateIsoCode && (
                            <p className="text-xs text-gray-500">State ISO: {profile.address.stateIsoCode}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expected Salary */}
                    {profile['expected salary'] && (
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Expected Salary</p>
                        <p className="font-medium text-gray-900">{formatSalary(profile['expected salary'])}</p>
                      </div>
                    )}
                  </div>

                  {/* Skills Section - Full Width */}
                  {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            {profile.skills.length}
                          </span>
                          <span>Skills</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: any, index: number) => (
                            <span
                              key={skill._id || index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {skill.skill_name}
                            </span>
                          ))}
                        </div>
                        {profile.skills.length > 3 && (
                          <p className="text-xs text-gray-500 mt-2">
                            and {profile.skills.length - 3} more skills
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Profile Fields */}
                  {Object.entries(profile).map(([key, value]) => {
                    // Skip already handled fields
                    const handledFields = ['_id', 'user_id', 'id detail', 'address', 'expected salary', 'skills', 'is Preuime', 'contact no'];
                    if (handledFields.includes(key)) return null;

                    // Skip non-object and empty values
                    if (typeof value !== 'object' || value === null || (Array.isArray(value) && value.length === 0)) {
                      return (
                        <div key={key} className="md:col-span-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-500 capitalize mb-1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="font-medium text-gray-900">{String(value)}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No profile details available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Tracking System</h1>
          <p className="text-gray-600">Manage and track user profiles across different domains</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or WhatsApp number"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Search users"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Content */}
        {selectedUser ? (
          renderProfileDetails()
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                <span className="text-sm text-gray-500">
                  {totalUsers} total users
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                          WhatsApp
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                          Domain
                        </th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getDomainTypeStyle(user.domain_type)}`}>
                                {getDomainTypeIcon(user.domain_type)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">ID: {user._id.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{user.whatsapp_number}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getDomainTypeIcon(user.domain_type)}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDomainTypeStyle(user.domain_type)}`}>
                                {user.domain_type.charAt(0).toUpperCase() + user.domain_type.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => fetchUserProfile(user._id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              aria-label={`View profile for ${user.name}`}
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Profile</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="inline-flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                pageNum === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="inline-flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};