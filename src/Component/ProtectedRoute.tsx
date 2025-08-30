// // components/ProtectedRoute.tsx
// import React, { useEffect, useState } from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';

// interface ProtectedRouteProps {
//   allowedRoles?: ('company' | 'superadmin' | 'admin')[];
//   requiredPermissions?: string[];
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   allowedRoles,
//   requiredPermissions
// }) => {
//   const { state } = useAuth();
//   const [permissions, setPermissions] = useState<string[]>([]);
//   const [loadingPerms, setLoadingPerms] = useState(true);
//   const BASE_URL = import.meta.env.VITE_BASE_URL;

//   // 1️⃣ If auth state is loading → show loader
//   if (state.isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // 2️⃣ If not authenticated → redirect immediately
//   if (!state.isAuthenticated || !localStorage.getItem('token')) {
//     return <Navigate to="/login" replace />;
//   }

//   // 3️⃣ Fetch permissions only if admin
//   useEffect(() => {
//     if (state.user?.domain_type === 'admin') {
//       axios
//         .get(`${BASE_URL}/api/v1/permission/my`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         })
//         .then((res) => {
//           setPermissions(res.data.permissions.map((p: any) => p.name || p));
//         })
//         .finally(() => setLoadingPerms(false));
//     } else {
//       setLoadingPerms(false); // Non-admin → no permissions needed
//     }
//   }, [state.user?.domain_type, BASE_URL]);

//   // 4️⃣ Show loader while permissions are loading (for admin only)
//   if (loadingPerms) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // 5️⃣ Role check
//   if (allowedRoles && !allowedRoles.includes(state.user?.domain_type ?? 'admin')) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   // 6️⃣ Permission check for admins
//   if (state.user?.domain_type === 'admin' && requiredPermissions) {
//     const hasAllPermissions = requiredPermissions.every((p) => permissions.includes(p));
//     if (!hasAllPermissions) {
//       return <Navigate to="/unauthorized" replace />;
//     }
//   }

//   // ✅ Everything passed → allow route
//   return <Outlet />;
// };



// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ProtectedRouteProps {
  allowedRoles?: ('company' | 'superadmin' | 'admin')[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermissions
}) => {
  const { state } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Always declare hooks first
  useEffect(() => {
    if (state.user?.domain_type === 'admin') {
      axios
        .get(`${BASE_URL}/api/v1/permission/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then((res) => {
          setPermissions(res.data.permissions.map((p: any) => p.name || p));
        })
        .finally(() => setLoadingPerms(false));
    } else {
      setLoadingPerms(false);
    }
  }, [state.user?.domain_type, BASE_URL]);

  // ✅ Then handle conditional rendering
  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!state.isAuthenticated || !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (loadingPerms) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(state.user?.domain_type ?? 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (state.user?.domain_type === 'admin' && requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every((p) =>
      permissions.includes(p)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

