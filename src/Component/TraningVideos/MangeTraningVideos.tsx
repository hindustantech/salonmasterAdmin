import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Video {
  _id: string;
  title: string;
  description: string;
  link: string;
  duration: number;
  formattedDuration: string;
  categories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ManageTrainingVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const token = localStorage.getItem('token');

  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({
    title: '',
    description: '',
    link: '',
    duration: 0,
    categories: ['general'],
    isActive: true,
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BASE_URL}/api/v1/TraningVideos/userby`, {
        headers: {
          Authorization: `Bearer ${token}` // ✅ proper way
        },
        params: {
          page,
          search: searchTerm,
          category: selectedCategory,
        },
      });

      setVideos(response.data.videos);
      setTotalPages(response.data.totalPages);
      setTotalVideos(response.data.total);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch videos');
        }
      } else {
        setError('Failed to fetch videos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchVideos();
  }, [page, searchTerm, selectedCategory]);

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      if (modalType === 'create') {
        await api.post(`${BASE_URL}/api/v1/TraningVideos`, currentVideo);
        toast.success('Video created successfully');
      } else {
        await api.put(`/api/v1/TraningVideos/${currentVideo._id}`, currentVideo);
        toast.success('Video updated successfully');
      }
      setShowModal(false);
      fetchVideos();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Error saving video');
      } else {
        toast.error('Error saving video');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this video?')) {
      try {
        await api.delete(`${BASE_URL}/api/TraningVideos/${id}`);
        toast.success('Video deactivated');
        fetchVideos();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || 'Error deactivating video');
        } else {
          toast.error('Error deactivating video');
        }
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.put(`${BASE_URL}/api/v1/TraningVideos/${id}/restore`);
      toast.success('Video restored');
      fetchVideos();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Error restoring video');
      } else {
        toast.error('Error restoring video');
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this video?')) {
      try {
        await api.delete(`${BASE_URL}/api/v1/TraningVideos/${id}/permanent`);
        toast.success('Video permanently deleted');
        fetchVideos();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || 'Error deleting video');
        } else {
          toast.error('Error deleting video');
        }
      }
    }
  };

  const openEditModal = (video: Video) => {
    setCurrentVideo(video);
    setModalType('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setCurrentVideo({
      title: '',
      description: '',
      link: '',
      duration: 0,
      categories: ['general'],
      isActive: true,
    });
    setModalType('create');
    setShowModal(true);
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {videos.map((video) => (
        <div
          key={video._id}
          className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${!video.isActive ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
            }`}
        >
          {/* Thumbnail Section */}
          <div className="relative">
            {getYouTubeThumbnail(video.link) ? (
              <div className="relative h-36 sm:h-40 lg:h-44 bg-gray-200 overflow-hidden">
                <img
                  src={getYouTubeThumbnail(video.link) || ''}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-md font-medium">
                  {video.formattedDuration}
                </div>
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${video.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                      }`}
                  >
                    {video.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-36 sm:h-40 lg:h-44 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <p className="text-sm">No thumbnail</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-3 lg:p-4">
            <h3 className="font-semibold text-sm lg:text-base text-gray-900 mb-2 line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <p className="text-gray-600 text-xs lg:text-sm mb-3 line-clamp-2 leading-relaxed">
              {video.description}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 mb-3">
              {video.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium border border-blue-100"
                >
                  {cat}
                </span>
              ))}
              {video.categories.length > 2 && (
                <span className="text-xs text-gray-500 px-1">
                  +{video.categories.length - 2}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 mb-3 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDate(video.createdAt)}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => openEditModal(video)}
                className="flex-1 min-w-0 text-xs bg-amber-500 text-white px-2 py-1.5 rounded-md hover:bg-amber-600 transition-colors font-medium"
              >
                Edit
              </button>
              {video.isActive ? (
                <button
                  onClick={() => handleDelete(video._id)}
                  className="flex-1 min-w-0 text-xs bg-red-500 text-white px-2 py-1.5 rounded-md hover:bg-red-600 transition-colors font-medium"
                >
                  Deactivate
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleRestore(video._id)}
                    className="flex-1 min-w-0 text-xs bg-green-500 text-white px-2 py-1.5 rounded-md hover:bg-green-600 transition-colors font-medium"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(video._id)}
                    className="flex-1 min-w-0 text-xs bg-red-700 text-white px-2 py-1.5 rounded-md hover:bg-red-800 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 lg:px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-3 lg:gap-4 text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
          <div className="col-span-4 lg:col-span-3">Video</div>
          <div className="col-span-3 lg:col-span-2 hidden sm:block">Categories</div>
          <div className="col-span-2 lg:col-span-2 hidden lg:block">Duration</div>
          <div className="col-span-2 lg:col-span-2 hidden md:block">Created</div>
          <div className="col-span-2 lg:col-span-1">Status</div>
          <div className="col-span-4 lg:col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-gray-100">
        {videos.map((video) => (
          <div
            key={video._id}
            className={`px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${!video.isActive ? 'bg-gray-25' : ''
              }`}
          >
            <div className="grid grid-cols-12 gap-3 lg:gap-4 items-center">
              {/* Video Info */}
              <div className="col-span-4 lg:col-span-3 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getYouTubeThumbnail(video.link) ? (
                    <img
                      src={getYouTubeThumbnail(video.link) || ''}
                      alt={video.title}
                      className="w-12 h-8 lg:w-16 lg:h-10 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-8 lg:w-16 lg:h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm lg:text-base font-medium text-gray-900 truncate">
                    {video.title}
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-500 truncate mt-0.5 lg:hidden">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div className="col-span-3 lg:col-span-2 hidden sm:block">
                <div className="flex flex-wrap gap-1">
                  {video.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium border border-blue-100"
                    >
                      {cat}
                    </span>
                  ))}
                  {video.categories.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{video.categories.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="col-span-2 lg:col-span-2 hidden lg:block">
                <span className="text-sm text-gray-600 font-medium">
                  {video.formattedDuration}
                </span>
              </div>

              {/* Created Date */}
              <div className="col-span-2 lg:col-span-2 hidden md:block">
                <span className="text-sm text-gray-600">
                  {formatDate(video.createdAt)}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 lg:col-span-1">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${video.isActive
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${video.isActive ? 'bg-green-400' : 'bg-red-400'
                      }`}
                  ></div>
                  {video.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-4 lg:col-span-2 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(video)}
                  className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-md hover:bg-amber-600 transition-colors font-medium"
                >
                  Edit
                </button>
                {video.isActive ? (
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors font-medium"
                  >
                    Deactivate
                  </button>
                ) : (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleRestore(video._id)}
                      className="text-xs bg-green-500 text-white px-2 py-1.5 rounded-md hover:bg-green-600 transition-colors font-medium"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(video._id)}
                      className="text-xs bg-red-700 text-white px-2 py-1.5 rounded-md hover:bg-red-800 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Training Videos</h1>
              <p className="text-gray-600 mt-1">Manage your training video library</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Total: {totalVideos}</span>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Video
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading videos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Videos</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or add your first video.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add First Video
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? <CardView /> : <ListView />}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex items-center rounded-lg shadow-sm bg-white border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 text-sm font-medium transition-colors border-r border-gray-200 last:border-r-0 ${page === pageNum
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'text-gray-700 bg-white hover:bg-gray-50'
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Video Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {modalType === 'create' ? 'Add New Video' : 'Edit Video'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter video title"
                      value={currentVideo.title}
                      onChange={(e) =>
                        setCurrentVideo({ ...currentVideo, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                      rows={4}
                      placeholder="Enter video description"
                      value={currentVideo.description}
                      onChange={(e) =>
                        setCurrentVideo({ ...currentVideo, description: e.target.value })
                      }
                    />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={currentVideo.link}
                      onChange={(e) =>
                        setCurrentVideo({ ...currentVideo, link: e.target.value })
                      }
                      required
                    />
                    {/* Thumbnail Preview */}
                    {currentVideo.link && getYouTubeThumbnail(currentVideo.link) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img
                          src={getYouTubeThumbnail(currentVideo.link) || ''}
                          alt="YouTube thumbnail preview"
                          className="h-20 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (seconds) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter duration in seconds"
                      value={currentVideo.duration}
                      onChange={(e) =>
                        setCurrentVideo({ ...currentVideo, duration: parseInt(e.target.value) || 0 })
                      }
                      min="0"
                      required
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Categories
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['general', 'technology', 'business', 'health'].map((cat) => (
                        <label key={cat} className="inline-flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentVideo.categories?.includes(cat)}
                            onChange={(e) => {
                              const newCategories = currentVideo.categories
                                ? [...currentVideo.categories]
                                : [];
                              if (e.target.checked) {
                                newCategories.push(cat);
                              } else {
                                const index = newCategories.indexOf(cat);
                                if (index > -1) {
                                  newCategories.splice(index, 1);
                                }
                              }
                              setCurrentVideo({ ...currentVideo, categories: newCategories });
                            }}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 capitalize">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={currentVideo.isActive || false}
                      onChange={(e) =>
                        setCurrentVideo({ ...currentVideo, isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="isActive" className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-700">Active Status</span>
                      <p className="text-xs text-gray-500">
                        When active, this video will be visible to users
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-gray-200 rounded-b-xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {modalType === 'create' ? 'Creating...' : 'Updating...'}
                    </span>
                  ) : (
                    modalType === 'create' ? 'Create Video' : 'Update Video'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTrainingVideos;