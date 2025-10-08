// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './Component/ProtectedRoute';
import { Login } from './Component/Login';
import { Register } from './Component/Register';
import { Dashboard } from './Component/Dashboard';
import Unauthorized from './Component/unauthorized';
import Dasboard_Super from './Component/SuperAdmin/Dasboard_Super';
import Dashboard_Compony from './Component/Compony_components/Dashboard_Compony';
import AddProducts from './Component/Productmangement/AddProducts';
import ProductList from './Component/Productmangement/ProductList';
import Products from './Component/Productmangement/Products';
import CategoryManagement from './Component/Categorymanagement/Categorymangement';
import ManageTrainingVideos from './Component/TraningVideos/MangeTraningVideos';
import { SidebarProvider, DashboardLayout } from './SideBar/Sidebar';
import CompanyList from './Component/UserMnagemnet/CompanyList';
import UserList from './Component/UserMnagemnet/UserList';
import SalonList from './Component/UserMnagemnet/SalonList';
import UserManagement from './Component/UserMnagemnet/UserManagement';
import CompanyDetail from './Component/UserMnagemnet/UserDeatils/ComapnyDeatils';
// import ImportUser from  './Component/ImportUsers/ImportUsers.TSX';
import CompanyProfilePage from './Component/CompanyProfile/ComapnyProfile';
import CartDataViewer from './Component/Order/Order';
import AddUser from './Component/Adduser/Add_user';
import UploadPage from './Component/dummaydata/UploadPage';
import { UserTracking } from './Component/UserTraking/UserTrakingSystem';
import SalonDetails from './Component/UserMnagemnet/UserDeatils/SalonDetils';
import UserDetails from './Component/UserMnagemnet/UserDeatils/UserDetils';
import ManageListings from './Component/ListingManagment/ManageListings';
import CreateListingPage from './Component/ListingManagment/creatingList';
// Layout wrapper for protected routes
const ProtectedLayoutWrapper: React.FC = () => {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <Routes>
          {/* Dashboard Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin', 'admin']}
            requiredPermissions={['view_dashboard']}
          />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* Product Management Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['company','superadmin', 'admin']}
            requiredPermissions={['view_products']}
          />}>
            <Route path="/Products" element={<Products />} />
          </Route>
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin', 'admin']}
            requiredPermissions={['UserTracking']}
          />}>
            <Route path="/UserTracking" element={<UserTracking />} />
          </Route>
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin', 'admin']}
            requiredPermissions={['UserTracking']}
          />}>
            <Route path="/ManageListings" element={<ManageListings />} />
          </Route>
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin', 'admin']}
            requiredPermissions={['UserTracking']}
          />}>
            <Route path="/CreateListingPage" element={<CreateListingPage />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['company','superadmin', 'admin']}
            requiredPermissions={['add_products']}
          />}>
            <Route path="/AddProducts" element={<AddProducts />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin','admin']}
            requiredPermissions={['view_products']}
          />}>
            <Route path="/ProductList" element={<ProductList />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin','admin']}
            requiredPermissions={['manage_categories']}
          />}>
            <Route path="/CategoryManagement" element={<CategoryManagement />} />
          </Route>

          {/* Order Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin','admin']}
            requiredPermissions={['view_orders']}
          />}>
            <Route path="/orders" element={<CartDataViewer/>} />
          </Route>

         

          {/* Training Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin', 'admin']}
            requiredPermissions={['view_training']}
          />}>
            <Route path="/training/videos" element={<div>Training Videos Component</div>} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin','company']}
            requiredPermissions={['manage_training']}
          />}>
            <Route path="/ManageTrainingVideos" element={<ManageTrainingVideos />} />
          </Route>

          {/* Superadmin User Management */}
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_companies']}
          />}>
            <Route path="/CompanyList" element={<CompanyList />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['AddUser']}
          />}>
            <Route path="/AddUser" element={<AddUser />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_companies']}
          />}>
            <Route path="/CompanyList" element={<CompanyList />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_workers']}
          />}>
            <Route path="/WorkersList" element={<UserList />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_salons']}
          />}>
            <Route path="/SalonList" element={<SalonList />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
          />}>
            <Route path="/UserManagement" element={<UserManagement />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['view_user_details']}
          />}>
            <Route path="/Detail/:id" element={<CompanyDetail />} />
          </Route>
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['view_user_details']}
          />}>
            <Route path="/Detail/salon/:id" element={<SalonDetails />} />
          </Route>
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['view_user_details']}
          />}>
            <Route path="/Detail/emp/:id" element={<UserDetails />} />
          </Route>

          {/* Company Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['company']}
          />}>
            <Route path="/company" element={<Dashboard_Compony />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['company']}
            requiredPermissions={['manage_profile']}
          />}>
            <Route path="/company/profile" element={<CompanyProfilePage/>} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['company']}
            requiredPermissions={['manage_employees']}
          />}>
            <Route path="/company/employees" element={<div>Company Employees Component</div>} />
          </Route>

          {/* Superadmin Routes */}
          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
          />}>
            <Route path="/admin" element={<Dasboard_Super />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_users']}
          />}>
            <Route path="/admin/users" element={<div>User Management Component</div>} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['manage_companies']}
          />}>
            <Route path="/admin/companies" element={<div>Company Management Component</div>} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['view_reports']}
          />}>
            <Route path="/admin/analytics" element={<div>System Analytics Component</div>} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['superadmin']}
            requiredPermissions={['UploadPage']}
          />}>
            <Route path="/UploadPage" element={<UploadPage/>} />
          </Route>

          {/* Admin Routes */}
          {/* <Route element={<ProtectedRoute
            allowedRoles={['admin']}
            requiredPermissions={['view_dashboard']}
          />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute
            allowedRoles={['admin']}
            requiredPermissions={['manage_users']}
          />}>
            <Route path="/admin/users" element={<AdminUserManagement />} />
          </Route> */}

          {/* Financial Routes */}
          
          {/* Settings Route */}
          <Route element={<ProtectedRoute
            allowedRoles={['company', 'superadmin', 'admin']}
            requiredPermissions={['manage_settings']}
          />}>
            <Route path="/settings" element={<div>Settings Component</div>} />
          </Route>

          {/* Catch all route for 404 */}
          <Route path="*" element={<div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          </div>} />
        </Routes>
      </DashboardLayout>
    </SidebarProvider>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - No sidebar layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* All protected routes with sidebar layout */}
          <Route path="/*" element={<ProtectedLayoutWrapper />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};