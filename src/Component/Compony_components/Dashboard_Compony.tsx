import { useState, useEffect } from 'react';
import { FiShoppingBag, FiFilm } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define interfaces for data structures
interface DashboardStats {
  totalTrendingVideos: number;
  totalProducts: number;
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
  category?: string;
  quantity: number;
  originalPrice: number;
}

interface Video {
  _id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
}

interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

interface ProductsResponse {
  data: Product[];
}

interface VideosResponse {
  videos: Video[];
}

const Dashboard_Company: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTrendingVideos: 0,
    totalProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get<DashboardStatsResponse>(
        `${API_BASE_URL}/api/v1/DashboardApi/getDashboardStats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    }
  };

  // Fetch recent products (latest 5)
  const fetchRecentProducts = async () => {
    try {
      const response = await axios.post<ProductsResponse>(
        `${API_BASE_URL}/api/v1/product/vendor`,
        {
          page: 1,
          limit: 5,
          sortBy: 'createdAt:desc',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data) {
        setRecentProducts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching recent products:', err);
    }
  };

  // Fetch recent videos (latest 3)
  const fetchRecentVideos = async () => {
    try {
      const response = await axios.get<VideosResponse>(
        `${API_BASE_URL}/api/v1/TraningVideos/userby`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 1,
            limit: 3,
            sortBy: 'createdAt:desc',
          },
        }
      );

      if (response.data.videos) {
        setRecentVideos(response.data.videos);
      }
    } catch (err) {
      console.error('Error fetching recent videos:', err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentProducts(),
        fetchRecentVideos(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {/* SOP Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FiShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total SOP
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {dashboardStats.totalTrendingVideos}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FiShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Products
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {dashboardStats.totalProducts}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                <button
                  className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => navigate('/ProductList')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                      <FiShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-blue-600">Add New Product</h3>
                      <p className="mt-1 text-sm text-gray-500">Add a new product to your inventory</p>
                    </div>
                  </div>
                </button>

                <button
                  className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => navigate('/ManageTrainingVideos')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-md">
                      <FiFilm className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-purple-600">Add Training Video</h3>
                      <p className="mt-1 text-sm text-gray-500">Upload product training materials</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Products */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
                <button
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => navigate('/ProductList')}
                >
                  View all
                </button>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-300 rounded-md flex items-center justify-center">
                                  <FiShoppingBag className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`font-medium ${
                              product.quantity < 10
                                ? 'text-red-600'
                                : product.quantity < 20
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {product.quantity} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.originalPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => navigate(`/edit-product/${product._id}`)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Training Videos */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Training Videos</h2>
                <button
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => navigate('/ManageTrainingVideos')}
                >
                  Upload New
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recentVideos.map((video) => (
                  <div key={video._id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="bg-gray-200 h-40 flex items-center justify-center">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <FiFilm className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{video.title}</h3>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{video.duration || 'N/A'}</span>
                        <span>{video.views || 0} views</span>
                      </div>
                      <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Watch Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard_Company;