import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  FiHome, FiBriefcase, FiSettings, FiUsers
  , FiLogOut, FiUser, FiChevronDown,
  FiChevronRight, FiMenu, FiX, FiShoppingBag,
  FiTruck, FiFilm, FiBell, FiSearch,
  FiGlobe, FiHelpCircle,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

type UserRole = 'company' | 'superadmin';
type SidebarItem = {
  path: string;
  name: string;
  icon: React.ReactNode;
  roles: UserRole[];
  subItems?: SidebarItem[];
  badge?: number;
  isNew?: boolean;
  description?: string;
};

// Sidebar Context
interface SidebarContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Sidebar Provider Component
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768) {
        setMobileOpen(false);
      }
      if (width >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar state to localStorage for persistence
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <SidebarContext.Provider value={{
      isSidebarCollapsed,
      setSidebarCollapsed,
      isMobileOpen,
      setMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Layout Component
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarCollapsed, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-in-out ${isMobileOpen ? 'md:ml-0' :
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
          }`}
      >
        <TopBar />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => useSidebar().setMobileOpen(false)}
        />
      )}
    </div>
  );
};

// Top Bar Component
const TopBar: React.FC = () => {
  const { setMobileOpen, setSidebarCollapsed, isSidebarCollapsed } = useSidebar();
  const { state } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2.5 rounded-xl hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <FiMenu size={20} className="text-slate-600" />
            </button>

            {/* Desktop Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiMenu size={20} className="text-slate-600" />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-slate-100/70 rounded-2xl px-4 py-2.5 w-80 lg:w-96">
              <FiSearch size={16} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm text-slate-700 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <FiX size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2.5 rounded-xl hover:bg-slate-100 relative transition-colors group">
              <FiBell size={18} className="text-slate-600 group-hover:text-slate-900" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium animate-pulse">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">{state?.user?.name}</p>
                <p className="text-xs text-slate-500">{state?.user?.email}</p>
              </div>
              <button className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors">
                <FiUser size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Navigation Item Component
const NavigationItem: React.FC<{
  item: SidebarItem;
  isCollapsed: boolean;
  isActive: boolean;
  hasActiveSubItem: boolean;
  onToggleExpand: () => void;
  onItemClick: () => void;
  isExpanded: boolean;
}> = ({ item, isCollapsed, isActive, hasActiveSubItem, onToggleExpand, onItemClick, isExpanded }) => {
  const location = useLocation();

  const isSubItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <li>
      <div>
        <div className="flex items-center">
          <Link
            to={item.path}
            className={`flex-1 flex items-center px-3 py-3 rounded-2xl transition-all duration-200 group relative ${isActive || hasActiveSubItem
              ? 'bg-slate-900 text-white shadow-lg'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            onClick={onItemClick}
            title={isCollapsed ? item.name : undefined}
          >
            <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'} transition-all duration-200 flex-shrink-0`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">{item.name}</span>
                  {item.description && !isActive && (
                    <span className="text-xs text-slate-400 block truncate mt-0.5">
                      {item.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {item.isNew && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  )}
                  {item.badge && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                      }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              </>
            )}
          </Link>
          {item.subItems && !isCollapsed && (
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors ml-1 flex-shrink-0"
              aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}
            >
              {isExpanded || hasActiveSubItem ? (
                <FiChevronDown size={14} className="text-slate-500" />
              ) : (
                <FiChevronRight size={14} className="text-slate-500" />
              )}
            </button>
          )}
        </div>

        {item.subItems && !isCollapsed && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded || hasActiveSubItem
              ? 'max-h-96 opacity-100 mt-2'
              : 'max-h-0 opacity-0'
              }`}
          >
            <ul className="ml-6 space-y-1">
              {item.subItems.map((subItem) => (
                <li key={subItem.path}>
                  <Link
                    to={subItem.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${isSubItemActive(subItem.path)
                      ? 'text-slate-900 bg-slate-100 font-medium'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    onClick={onItemClick}
                  >
                    <span className="mr-3 flex-shrink-0">{subItem.icon}</span>
                    <span className="flex-1 truncate">{subItem.name}</span>
                    {subItem.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
                        {subItem.badge > 99 ? '99+' : subItem.badge}
                      </span>
                    )}
                    {subItem.isNew && (
                      <span className="ml-2 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
};

// Main Sidebar Component
const Sidebar: React.FC = () => {
  const { state, logout } = useAuth();
  const location = useLocation();
  const { isSidebarCollapsed, isMobileOpen, setMobileOpen } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const userRole = state?.user?.domain_type as UserRole || 'company';

  // Enhanced sidebar configuration with more items for testing scalability
  const sidebarConfig: SidebarItem[] = [
    {
      path: '/',
      name: 'Dashboard',
      icon: <FiHome size={20} />,
      roles: ['company', 'superadmin'],
      description: 'Overview & analytics'
    },

    {
      path: '/Products',
      name: 'Products',
      icon: <FiShoppingBag size={20} />,
      roles: ['company'],
      badge: 5,
      description: 'Manage inventory',
      subItems: [
        {
          path: '/ProductList',
          name: 'Product List',
          icon: <FiShoppingBag size={18} />,
          roles: ['company'],
          badge: 45
        },
        {
          path: '/AddProducts',
          name: 'Add Product',
          icon: <FiShoppingBag size={18} />,
          roles: ['company']
        },
        {
          path: '/CategoryManagement',
          name: 'Categories',
          icon: <FiShoppingBag size={18} />,
          roles: ['company'],
          badge: 12
        },

      ]
    },
    {
      path: '/orders',
      name: 'Orders',
      icon: <FiTruck size={20} />,
      roles: ['company'],
      badge: 156,
      description: 'Track & manage',
      subItems: [
        {
          path: '/orders/list',
          name: 'Order List',
          icon: <FiTruck size={18} />,
          roles: ['company'],
          badge: 23
        },
        {
          path: '/orders/analytics',
          name: 'Order Analytics',
          icon: <FiGlobe size={18} />,
          roles: ['company']
        },

      ]
    },
    {
      path: '/customers',
      name: 'Customers',
      icon: <FiUsers size={20} />,
      roles: ['company'],
      badge: 1234,
      description: 'Customer relations',
      subItems: [
        {
          path: '/customers/list',
          name: 'Customer List',
          icon: <FiUsers size={18} />,
          roles: ['company']
        },
      ]
    },
    {
      path: '/ManageTrainingVideos',
      name: 'Manage Videos',
      icon: <FiFilm size={18} />,
      roles: ['superadmin']

    },
    {
      path: '/UserManagement',
      name: 'User Management',
      icon: <FiUsers size={20} />,
      roles: ['superadmin'],
      description: 'Manage users',
      subItems: [
        {
          path: '/CompanyList',
          name: 'Company List',
          icon: <FiUsers size={18} />,
          roles: ['superadmin']
        },
        {
          path: '/SalonList',
          name: 'Salon List',
          icon: <FiUsers size={18} />,
          roles: ['superadmin']
        },
        {
          path: '/WorkersList',
          name: 'Workers List',
          icon: <FiUsers size={18} />,
          roles: ['superadmin']
        },

      ]
    },
    {
      path: '/company',
      name: ' Company Profile',
      icon: <FiBriefcase size={20} />,
      roles: ['company'],
      description: 'Organization info',

    },


    {
      path: '/settings',
      name: 'Settings',
      icon: <FiSettings size={20} />,
      roles: ['company', 'superadmin'],
      description: 'System preferences'
    },
    {
      path: '/help',
      name: 'Help & Support',
      icon: <FiHelpCircle size={20} />,
      roles: ['company', 'superadmin'],
      description: 'Get assistance'
    }
  ];

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const filteredItems = sidebarConfig.filter(item => item.roles.includes(userRole));

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const hasActiveSubItem = (subItems: SidebarItem[]): boolean =>
    subItems.some(subItem => isActive(subItem.path));


  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-72';

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200/60 z-50 transition-all duration-300 ease-in-out flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarWidth}`}
    >
      {/* Sidebar Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-2xl flex items-center justify-center">
                <FiBriefcase size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Portal</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {userRole === 'superadmin' ? 'Administrator' : 'Company Dashboard'}
                </p>
              </div>
            </div>
          </div>

          {isSidebarCollapsed && (
            <div className="w-8 h-8 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto">
              <FiBriefcase size={16} className="text-white" />
            </div>
          )}

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 md:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <FiX size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <ul className="space-y-2 px-4">
          {filteredItems.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              isCollapsed={isSidebarCollapsed}
              isActive={isActive(item.path)}
              hasActiveSubItem={hasActiveSubItem(item.subItems ?? [])}
              onToggleExpand={() => toggleExpand(item.path)}
              onItemClick={handleItemClick}
              isExpanded={expandedItems[item.path]}
            />
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200/60 bg-white">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <FiUser size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {state?.user?.name || 'User Name'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {state?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <FiUser size={16} className="text-white" />
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};