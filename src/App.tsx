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

// Layout wrapper for protected routes
const ProtectedLayoutWrapper: React.FC = () => {
  return (
    <SidebarProvider>
      <DashboardLayout>
        <Routes>
          {/* Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* Product Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/Products" element={<Products />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/AddProducts" element={<AddProducts />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/ProductList" element={<ProductList />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/CategoryManagement" element={<CategoryManagement />} />
          </Route>

          {/* Order Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/orders/list" element={<div>Order List Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/orders/analytics" element={<div>Order Analytics Component</div>} />
          </Route>

          {/* Training Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
            <Route path="/training/videos" element={<div>Training Videos Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/ManageTrainingVideos" element={<ManageTrainingVideos />} />
          </Route>

          {/* Company Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/company" element={<Dashboard_Compony />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/company/profile" element={<div>Company Profile Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/company/employees" element={<div>Company Employees Component</div>} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/admin" element={<Dasboard_Super />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/admin/users" element={<div>User Management Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/admin/companies" element={<div>Company Management Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/admin/analytics" element={<div>System Analytics Component</div>} />
          </Route>

          {/* Financial Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/financial/revenue" element={<div>Revenue Component</div>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/financial/loss" element={<div>Profit/Loss Component</div>} />
          </Route>

          {/* Settings Route */}
          <Route element={<ProtectedRoute allowedRoles={['company', 'superadmin']} />}>
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