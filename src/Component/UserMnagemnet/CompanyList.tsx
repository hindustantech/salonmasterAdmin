// src/pages/UserManagement/CompanyList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, toggleUserSuspension } from '../services/userService';
import type { User } from '../../types/userTypes';
import Pagination from '../Common/Pagination';
import SearchFilter from '../Common/SearchFilter';

const CompanyList: React.FC = () => {
    const [companies, setCompanies] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isSuspendedFilter, setIsSuspendedFilter] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers({
                page: currentPage,
                limit: 10,
                search: searchTerm,
                fromDate,
                toDate,
                domainType: 'company',
                isSuspended: isSuspendedFilter !== null ? isSuspendedFilter : undefined
            });
            setCompanies(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [currentPage, searchTerm, fromDate, toDate, isSuspendedFilter]);

    const handleViewDetails = (id: string) => {
        navigate(`/Detail/${id}`);
    };

    const handleStatusChange = async (id: string, isSuspended: boolean) => {
        try {
            // Call API to update status
            await toggleUserSuspension(id, isSuspended);
            fetchCompanies();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div>
            <SearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                isSuspendedFilter={isSuspendedFilter}
                setIsSuspendedFilter={setIsSuspendedFilter}
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">Name</th>
                                    <th className="py-3 px-4 text-left">Email</th>
                                    <th className="py-3 px-4 text-left">Phone</th>
                                    <th className="py-3 px-4 text-left">Created At</th>
                                    <th className="py-3 px-4 text-left">Status</th>
                                    <th className="py-3 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4">{company.name}</td>
                                        <td className="py-3 px-4">{company.email}</td>
                                        <td className="py-3 px-4">{company.whatsapp_number}</td>
                                        <td className="py-3 px-4">{new Date(company.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${company.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {company.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(company._id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(company._id, !company.isSuspended)}
                                                className={`${company.isSuspended ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}
                                            >
                                                {company.isSuspended ? 'Activate' : 'Suspend'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default CompanyList;