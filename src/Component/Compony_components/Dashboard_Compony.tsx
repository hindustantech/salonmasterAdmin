import { useAuth } from "../../contexts/AuthContext";
import {
  FiDollarSign,
  FiShoppingBag, FiTruck, FiFilm, FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

const Dashboard_Company = () => {
  const { state } = useAuth();

  // Sample data - replace with actual data from your API
  const financialData = {
    revenue: 24500,
    profit: 18500,
    loss: 6000,
    growth: 12.5
  };

  const recentOrders = [
    { id: '#ORD-1001', customer: 'John Doe', amount: 249.99, status: 'Delivered' },
    { id: '#ORD-1002', customer: 'Jane Smith', amount: 149.99, status: 'Shipped' },
    { id: '#ORD-1003', customer: 'Robert Johnson', amount: 99.99, status: 'Processing' },
    { id: '#ORD-1004', customer: 'Emily Davis', amount: 199.99, status: 'Delivered' }
  ];

  const productStats = {
    total: 56,
    lowStock: 12,
    outOfStock: 3
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}


      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {state?.user?.name || 'Company Admin'}
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Revenue Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FiDollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Monthly Revenue
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${financialData.revenue.toLocaleString()}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <FiTrendingUp className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                          <span className="sr-only">Increased by</span>
                          {financialData.growth}%
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <FiTrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Monthly Profit
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${financialData.profit.toLocaleString()}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loss Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <FiTrendingDown className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Monthly Loss
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${financialData.loss.toLocaleString()}
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
                          {productStats.total}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                          <span className="text-xs text-gray-500">
                            ({productStats.lowStock} low stock)
                          </span>
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <button className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors">
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

                <button className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                      <FiTruck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-600">Process Orders</h3>
                      <p className="mt-1 text-sm text-gray-500">View and process pending orders</p>
                    </div>
                  </div>
                </button>

                <button className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors">
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

            {/* Recent Orders */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
                </button>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Inventory */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Product Inventory</h2>
                <div className="flex space-x-4">
                  <button className="text-sm font-medium text-red-600 hover:text-red-500">
                    Low Stock ({productStats.lowStock})
                  </button>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </button>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: 1, name: 'Premium Widget', category: 'Widgets', stock: 42, price: 29.99 },
                      { id: 2, name: 'Deluxe Gadget', category: 'Gadgets', stock: 15, price: 49.99 },
                      { id: 3, name: 'Basic Tool', category: 'Tools', stock: 5, price: 19.99 },
                      { id: 4, name: 'Advanced Device', category: 'Devices', stock: 23, price: 79.99 }
                    ].map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md"></div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-600' :
                              product.stock < 20 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
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
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Upload New
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 1, title: 'Product Setup Guide', duration: '12:34', views: 145 },
                  { id: 2, title: 'Advanced Features', duration: '8:45', views: 89 },
                  { id: 3, title: 'Troubleshooting', duration: '15:20', views: 67 }
                ].map((video) => (
                  <div key={video.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="bg-gray-200 h-40 flex items-center justify-center">
                      <FiFilm className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{video.title}</h3>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{video.duration}</span>
                        <span>{video.views} views</span>
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