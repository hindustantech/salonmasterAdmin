// src/pages/UserManagement/CompanyDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, toggleUserSuspension, deleteUser } from '../../services/userService';
const CompanyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                const response = await getUserById(id!);
                setCompany(response.data);
                setFormData({
                    userData: {
                        name: response.data.name,
                        email: response.data.email,
                        whatsapp_number: response.data.whatsapp_number,
                        isSuspended: response.data.isSuspended
                    },
                    domainData: response.data.domainProfile
                });
            } catch (error) {
                console.error('Error fetching company:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const [parent, child] = name.includes('.') ? name.split('.') : [name, ''];

        setFormData((prev: any) => {
            if (child) {
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: type === 'checkbox' ? checked : value
                    }
                };
            } else {
                return {
                    ...prev,
                    userData: {
                        ...prev.userData,
                        [name]: type === 'checkbox' ? checked : value
                    }
                };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUser(id!, formData);
            setEditing(false);
            // Refresh data
            const response = await getUserById(id!);
            setCompany(response.data);
        } catch (error) {
            console.error('Error updating company:', error);
        }
    };

    const handleStatusChange = async () => {
        try {
            await toggleUserSuspension(id!, !company.isSuspended);
            // Refresh data
            const response = await getUserById(id!);
            setCompany(response.data);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            try {
                await deleteUser(id!);
                navigate('/user-management');
            } catch (error) {
                console.error('Error deleting company:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!company) {
        return <div className="text-center py-10">Company not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Company Details</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {editing ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                        onClick={handleStatusChange}
                        className={`px-4 py-2 rounded-md ${company.isSuspended ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                    >
                        {company.isSuspended ? 'Activate Account' : 'Suspend Account'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {editing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.userData.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.userData.email}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            name="whatsapp_number"
                                            value={formData.userData.whatsapp_number}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input
                                            type="text"
                                            name="domainData.company_name"
                                            value={formData.domainData?.company_name || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                                        <input
                                            type="text"
                                            name="domainData.brand"
                                            value={formData.domainData?.brand || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">GST Number</label>
                                        <input
                                            type="text"
                                            name="domainData.gst_number"
                                            value={formData.domainData?.gst_number || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {company.name}</p>
                                <p><span className="font-medium">Email:</span> {company.email}</p>
                                <p><span className="font-medium">Phone:</span> {company.whatsapp_number}</p>
                                <p>
                                    <span className="font-medium">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${company.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {company.isSuspended ? 'Suspended' : 'Active'}
                                    </span>
                                </p>
                                <p><span className="font-medium">Created At:</span> {new Date(company.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                            {company.domainProfile ? (
                                <div className="space-y-2">
                                    <p><span className="font-medium">Company Name:</span> {company.domainProfile.company_name}</p>
                                    <p><span className="font-medium">Brand:</span> {company.domainProfile.brand}</p>
                                    <p><span className="font-medium">GST Number:</span> {company.domainProfile.gst_number}</p>
                                    <p><span className="font-medium">PAN Number:</span> {company.domainProfile.pan_number}</p>
                                    <p><span className="font-medium">CIN:</span> {company.domainProfile.cin}</p>
                                </div>
                            ) : (
                                <p>No company profile found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDetail;