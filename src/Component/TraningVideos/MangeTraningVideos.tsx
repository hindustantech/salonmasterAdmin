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
  const token = localStorage.getItem('token');
  
  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({
    title: '',
    description: '',
    link: '',
    duration: 0,
    categories: ['general'],
    isActive: true,
  });

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
      const response = await api.get(`${BASE_URL}/api/v1/TraningVideos`, {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Training Videos</h1>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="technology">Technology</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
        </select>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add New Video
        </button>
      </div>

      {/* Video List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-md">
          No videos found. Try adjusting your search criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className={`border rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${
                  !video.isActive ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {getYouTubeThumbnail(video.link) && (
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={getYouTubeThumbnail(video.link)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.formattedDuration}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.categories.map((cat) => (
                      <span
                        key={cat}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Created: {formatDate(video.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(video)}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    {video.isActive ? (
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(video._id)}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(video._id)}
                          className="text-sm bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 transition-colors"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-l-md border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-4 py-2 border-t border-b border-gray-300 transition-colors ${
                      page === num
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-r-md border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {modalType === 'create' ? 'Add New Video' : 'Edit Video'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
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
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentVideo.title}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={currentVideo.description}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">YouTube URL *</label>
                  <input
                    type="url"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={currentVideo.link}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, link: e.target.value })
                    }
                    required
                  />
                  {currentVideo.link && getYouTubeThumbnail(currentVideo.link) && (
                    <div className="mt-2">
                      <img
                        src={getYouTubeThumbnail(currentVideo.link)}
                        alt="YouTube thumbnail preview"
                        className="h-24 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Thumbnail preview</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Duration (seconds) *</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentVideo.duration}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, duration: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {['general', 'technology', 'business', 'health'].map((cat) => (
                      <label key={cat} className="inline-flex items-center">
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
                          className="mr-1 rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={currentVideo.isActive || false}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="flex items-center">
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
  );
};

export default ManageTrainingVideos;