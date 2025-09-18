import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define TypeScript interfaces (unchanged)




interface TransformedCartItem {
    userName: string;
    userEmail: string;
    productName: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
    addedAt: string;
    status: string;
    vendorId: string;
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

const CartDataViewer: React.FC = () => {
    const [cartData, setCartData] = useState<TransformedCartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [exporting, setExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        from: '',
        to: ''
    });
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token') || '';

    // Theme toggle
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Check authentication
    useEffect(() => {
        if (!token) {
            setError('Authentication required. Please login again.');
            setLoading(false);
        }
    }, []);

    // Fetch cart data
    const fetchCartData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const queryParams = new URLSearchParams({
                page: filters.page.toString(),
                limit: filters.limit.toString(),
                ...(filters.from && { from: filters.from }),
                ...(filters.to && { to: filters.to })
            });

            const response = await fetch(`${BASE_URL}/api/v1/cart/getcartDatatovendore?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Authentication failed. Please login again.');
                if (response.status === 403) throw new Error('You do not have permission to access this data.');
                if (response.status === 404) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Data not found');
                }
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setCartData(data.data);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || 'Failed to fetch cart data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Export to CSV
    const exportToCSV = async () => {
        if (!token) {
            setError('Authentication required. Please login again.');
            return;
        }
        try {
            setExporting(true);
            const queryParams = new URLSearchParams({
                exportCSV: 'true',
                ...(filters.from && { from: filters.from }),
                ...(filters.to && { to: filters.to })
            });

            const response = await fetch(`${BASE_URL}/api/v1/cart/getcartDatatovendore?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) throw new Error('Export endpoint not found.');
                throw new Error(`Failed to export CSV: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cart_data_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('CSV exported successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Apply filters
    const applyFilters = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({ page: 1, limit: 10, from: '', to: '' });
    };

    // Fetch data when filters change
    useEffect(() => {
        if (token) fetchCartData();
    }, [filters, token]);

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Skeleton loader component
    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {Array(7).fill(0).map((_, index) => (
                <td key={index} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
            ))}
        </tr>
    );

    // Pagination buttons
    const renderPaginationButtons = () => {
        if (!pagination) return null;
        const buttons = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        buttons.push(
            <button
                key="prev"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                aria-label="Previous page"
            >
                &laquo; Prev
            </button>
        );

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg ${pagination.currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors`}
                    aria-label={`Page ${i}`}
                >
                    {i}
                </button>
            );
        }

        buttons.push(
            <button
                key="next"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                aria-label="Next page"
            >
                Next &raquo;
            </button>
        );

        return buttons;
    };

    if (!token) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <strong className="font-bold">Authentication Error: </strong>
                    <span>Please login to access this page.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen" data-theme={theme}>
            <ToastContainer position="top-right" autoClose={3000} theme={theme} />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">Cart Data</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={resetFilters}
                        className="bg-gray-500 dark:bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Reset Filters
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={exporting || cartData.length === 0}
                        className="bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-green-600 dark:hover:bg-green-500 transition-colors flex items-center"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Export to CSV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Filters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                        <input
                            type="date"
                            name="from"
                            value={filters.from}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                        <input
                            type="date"
                            name="to"
                            value={filters.to}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items Per Page</label>
                        <select
                            name="limit"
                            value={filters.limit}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={applyFilters}
                            className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Cart Data */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['User', 'Product', 'Qty', 'Price', 'Total', 'Date Added', 'Status'].map(header => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Array(5).fill(0).map((_, index) => <SkeletonRow key={index} />)}
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden space-y-4 p-4">
                        {Array(5).fill(0).map((_, index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                    <button
                        onClick={fetchCartData}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['User', 'Product', 'Qty', 'Price', 'Total', 'Date Added', 'Status'].map(header => (
                                        <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {cartData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="text-lg mb-2">No cart data found</div>
                                            <p>Try adjusting your filters or check back later.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    cartData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.userName}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{item.userEmail}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.productName}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.productPrice)}</td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.totalPrice)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.addedAt)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-4 p-4">
                        {cartData.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <div className="text-lg mb-2">No cart data found</div>
                                <p>Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            cartData.map((item, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">User:</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.userName}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.userEmail}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Product:</span>
                                        <span className="text-gray-900 dark:text-gray-100">{item.productName}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Quantity:</span>
                                        <span className="text-gray-500 dark:text-gray-400">{item.quantity}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Price:</span>
                                        <span className="text-gray-500 dark:text-gray-400">{formatCurrency(item.productPrice)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Total:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Date:</span>
                                        <span className="text-gray-500 dark:text-gray-400">{formatDate(item.addedAt)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Status:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{" "}
                        <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                        </span>{" "}
                        
                        of <span className="font-medium">{pagination.totalItems}</span> results
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {renderPaginationButtons()}
                    </div>
                </div>
            )}  
        </div>
    );
};

export default CartDataViewer;