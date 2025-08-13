import { useAuth } from "../../contexts/AuthContext";
import {
  FiBriefcase,
  FiUsers,
  FiFilm,
  FiTrendingUp,
  FiActivity,
  FiPlus,
  FiEdit2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Type definitions
type SystemStats = {
  totalUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  trainingVideos: number;
};

type RecentActivity = {
  id: number;
  action: string;
  company: string;
  time: string;
};

type Company = {
  id: number;
  name: string;
  users: number;
  status: 'Active' | 'Suspended' | 'Pending';
  lastActive: string;
  logo?: string;
};

type TrainingVideo = {
  id: number;
  title: string;
  company: string;
  views: number;
  duration: string;
  thumbnail?: string;
};

const Dashboard_Super = () => {
  const { state } = useAuth();
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    trainingVideos: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch counts data
      const countsRes = await axios.get(`${baseurl}/api/v1/DashboardApi/counts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Counts Response:", countsRes.data);

      if (countsRes.data?.success) {
        const data = countsRes.data.data;
        setSystemStats({
          totalUsers: data.totalUsers || 0,
          totalCompanies: data.userCountsByDomain?.company || 0,
          activeCompanies: data.userCountsByDomain?.company || 0,
          trainingVideos: data.trendingVideoCount || 0,
        });
      }

      // Fetch recent activities (mock data - replace with actual API call)
      const mockActivities: RecentActivity[] = [
        { id: 1, action: 'New company registered', company: 'Acme Corp', time: '2 hours ago' },
        { id: 2, action: 'User account created', company: 'Tech Solutions', time: '5 hours ago' },
        { id: 3, action: 'Training video uploaded', company: 'Global Inc', time: '1 day ago' },
        { id: 4, action: 'System maintenance', company: 'System', time: '2 days ago' }
      ];
      setRecentActivities(mockActivities);

      // Fetch companies (mock data - replace with actual API call)
      const mockCompanies: Company[] = [
        { id: 1, name: 'Acme Corp', users: 15, status: 'Active', lastActive: '2 hours ago' },
        { id: 2, name: 'Tech Solutions', users: 8, status: 'Active', lastActive: '5 hours ago' },
        { id: 3, name: 'Global Inc', users: 23, status: 'Suspended', lastActive: '3 days ago' },
        { id: 4, name: 'Innovate Co', users: 5, status: 'Active', lastActive: '1 day ago' }
      ];
      setCompanies(mockCompanies);

      // Fetch training videos (mock data - replace with actual API call)
      const mockVideos: TrainingVideo[] = [
        { id: 1, title: 'Product Introduction', company: 'Acme Corp', views: 245, duration: '8:45' },
        { id: 2, title: 'Advanced Features', company: 'Tech Solutions', views: 189, duration: '12:30' },
        { id: 3, title: 'Troubleshooting Guide', company: 'Global Inc', views: 156, duration: '15:20' }
      ];
      setTrainingVideos(mockVideos);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleSuspendCompany = (companyId: number) => {
    // TODO: Implement company suspension logic
    console.log(`Suspending company with ID: ${companyId}`);
    // Update UI optimistically
    setCompanies(companies.map(company =>
      company.id === companyId ? { ...company, status: 'Suspended' } : company
    ));
  };

  const handleActivateCompany = (companyId: number) => {
    // TODO: Implement company activation logic
    console.log(`Activating company with ID: ${companyId}`);
    // Update UI optimistically
    setCompanies(companies.map(company =>
      company.id === companyId ? { ...company, status: 'Active' } : company
    ));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading....
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow">
          <FiXCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {state?.user?.name || 'Admin'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Data
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Users Card */}
            <StatCard
              icon={<FiUsers className="h-6 w-6 text-white" />}
              iconBg="bg-blue-500"
              title="Total Users"
              value={systemStats.totalUsers.toLocaleString()}
              trend="up"
              trendValue="12%"
            />

            {/* Companies Card */}
            <StatCard
              icon={<FiBriefcase className="h-6 w-6 text-white" />}
              iconBg="bg-green-500"
              title="Total Companies"
              value={systemStats.totalCompanies}
              trend="up"
              trendValue="8%"
            />

            {/* Active Companies Card */}
            <StatCard
              icon={<FiBriefcase className="h-6 w-6 text-white" />}
              iconBg="bg-purple-500"
              title="Active Companies"
              value={systemStats.activeCompanies}
              additionalText={`(${Math.round((systemStats.activeCompanies / systemStats.totalCompanies) * 100)}%)`}
            />

            {/* Training Videos Card */}
            <StatCard
              icon={<FiFilm className="h-6 w-6 text-white" />}
              iconBg="bg-yellow-500"
              title="Training Videos"
              value={systemStats.trainingVideos}
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              <QuickActionCard
                icon={<FiUsers className="h-6 w-6 text-blue-600" />}
                iconBg="bg-blue-100"
                title="Manage Users"
                description="View and manage all system users"
                link="/UserManagement"
              />
              <QuickActionCard
                icon={<FiFilm className="h-6 w-6 text-purple-600" />}
                iconBg="bg-purple-100"
                title="Manage Training"
                description="Manage training materials and videos"
                link="/ManageTrainingVideos"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivitySection activities={recentActivities} />

          {/* Company Management */}
          <CompanyManagementSection
            companies={companies}
            onSuspend={handleSuspendCompany}
            onActivate={handleActivateCompany}
          />

          {/* Training Management */}
          <TrainingManagementSection videos={trainingVideos} />
        </div>
      </main>
    </div>
  );
};

// Sub-components for better organization

type StatCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  additionalText?: string;
};

const StatCard = ({ icon, iconBg, title, value, trend, trendValue, additionalText }: StatCardProps) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? <FiTrendingUp className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
    : <FiTrendingUp className="self-center flex-shrink-0 h-5 w-5 text-red-500 transform rotate-180" />;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBg} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendColor}`}>
                  {trendIcon}
                  <span className="sr-only">{trend === 'up' ? 'Increased by' : 'Decreased by'}</span>
                  {trendValue}
                </div>
              )}
              {additionalText && (
                <div className="ml-2 text-xs text-gray-500">
                  {additionalText}
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

type QuickActionCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  link: string;
};

const QuickActionCard = ({ icon, iconBg, title, description, link }: QuickActionCardProps) => {
  return (
    <Link to={link} className="bg-white overflow-hidden shadow rounded-lg p-6 text-left hover:bg-gray-50 transition-colors block">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${iconBg} p-3 rounded-md`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

type RecentActivitySectionProps = {
  activities: RecentActivity[];
};

const RecentActivitySection = ({ activities }: RecentActivitySectionProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent System Activity</h2>
        <Link to="/admin/activity" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <FiActivity className="flex-shrink-0 mr-2 text-gray-400" />
                    {activity.action}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiClock className="flex-shrink-0 mr-1 text-gray-400" />
                    {activity.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/activity/${activity.id}`} className="text-blue-600 hover:text-blue-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type CompanyManagementSectionProps = {
  companies: Company[];
  onSuspend: (id: number) => void;
  onActivate: (id: number) => void;
};

const CompanyManagementSection = ({ companies, onSuspend, onActivate }: CompanyManagementSectionProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Company Management</h2>
        <Link to="/admin/companies" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all companies
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                      {company.logo ? (
                        <img className="h-10 w-10 rounded-md" src={company.logo} alt={company.name} />
                      ) : (
                        <FiBriefcase className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.users} users
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'Active' ? 'bg-green-100 text-green-800' : company.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiClock className="flex-shrink-0 mr-1 text-gray-400" />
                    {company.lastActive}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link to={`/admin/companies/edit/${company.id}`} className="text-blue-600 hover:text-blue-900">
                    <FiEdit2 className="inline mr-1" /> Edit
                  </Link>
                  {company.status === 'Active' ? (
                    <button
                      onClick={() => onSuspend(company.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiXCircle className="inline mr-1" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(company.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <FiCheckCircle className="inline mr-1" /> Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type TrainingManagementSectionProps = {
  videos: TrainingVideo[];
};

const TrainingManagementSection = ({ videos }: TrainingManagementSectionProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Training Management</h2>
        <Link to="/admin/training/new" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
          Add New Video
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
            <div className="bg-gray-200 h-40 flex items-center justify-center">
              {video.thumbnail ? (
                <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
              ) : (
                <FiFilm className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="px-4 py-5 sm:p-6 flex-grow">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{video.title}</h3>
              <p className="text-sm text-gray-500 mb-2">By {video.company}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{video.duration}</span>
                <span>{video.views} views</span>
              </div>
            </div>
            <div className="px-4 pb-4 sm:px-6">
              <div className="flex space-x-2">
                <Link
                  to={`/admin/training/edit/${video.id}`}
                  className="flex-1 inline-flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiEdit2 className="mr-2" /> Edit
                </Link>
                <Link
                  to={`/admin/training/${video.id}`}
                  className="flex-1 inline-flex justify-center items-center bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FiEye className="mr-2" /> View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard_Super;