// src/components/SearchFilter.tsx
import React from 'react';

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    fromDate: string;
    setFromDate: (date: string) => void;
    toDate: string;
    setToDate: (date: string) => void;
    isSuspendedFilter: boolean | null;
    setIsSuspendedFilter: (value: boolean | null) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchTerm,
    setSearchTerm,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    isSuspendedFilter,
    setIsSuspendedFilter
}) => {
    return (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email or phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={isSuspendedFilter === null ? '' : isSuspendedFilter.toString()}
                        onChange={(e) => setIsSuspendedFilter(e.target.value === '' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All</option>
                        <option value="false">Active</option>
                        <option value="true">Suspended</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchFilter;