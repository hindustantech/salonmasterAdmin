import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InterestModal from './InterestModal';

interface Listing {
    _id: string;
    userId: string;
    fullName: string;
    idDetails: string;
    phoneNumber: string;
    email: string;
    shopName: string;
    status: 'active' | 'inactive';
    heading: string;
    description: string;
    short_description: string;
    address: string;
    advertisementDetails: string;
    advertisementImages: string[];
    termsAccepted: boolean;
    createdAt: string;
    updatedAt: string;
    expiredAt: string;
}

export interface UserInfo {
    _id: string;
    id: string;
    name: string;
    whatsapp_number?: string;
}

export interface AdDetails {
    _id: string;
    userId: string;
    fullName: string;
    idDetails: string;
    phoneNumber: string;
    email: string;
    shopName: string;
    status: 'active' | 'inactive';
    heading: string;
    description: string;
    shortDescription: string;
    address: string;
    advertisementDetails: string;
    advertisementImages: string[];
    termsAccepted: boolean;
    createdAt: string;
    updatedAt: string;
    expiredAt: string;
}

export interface Interest {
    _id: string;
    adId: AdDetails;
    adUserId: UserInfo;
    interestedUserId: UserInfo;
    category: 'FranchiseList' | 'TraningList' | 'SellerListing';
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

interface FormData extends Omit<Listing, 'advertisementImages' | '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'expiredAt'> {
    imagesToRemove: string[];
    newImages: File[];
}

const ManageListings: React.FC = () => {
    const [listingType, setListingType] = useState<'franchise' | 'training' | 'seller'>('franchise');
    const [listings, setListings] = useState<Listing[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editListing, setEditListing] = useState<Listing | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        idDetails: '',
        phoneNumber: '',
        email: '',
        shopName: '',
        status: 'active',
        heading: '',
        description: '',
        short_description: '',
        address: '',
        advertisementDetails: '',
        termsAccepted: false,
        imagesToRemove: [],
        newImages: [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const token = localStorage.getItem('token');
    const baseurl = import.meta.env.VITE_BASE_URL;

    const fetchListings = async () => {
        setLoading(true);
        try {
            const endpoint =
                listingType === 'franchise'
                    ? `${baseurl}/api/v1/listing_managment/franchise-lists`
                    : listingType === 'training'
                        ? `${baseurl}/api/v1/listing_managment/training-lists`
                        : `${baseurl}/api/v1/listing_managment/seller-listings`;
            const response = await axios.get(endpoint, {
                params: { page, limit, search, fromDate, toDate },
                headers: { Authorization: `Bearer ${token}` },
            });
            setListings(response.data.data);
            setTotal(response.data.total);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const fetchListingsInterested = async (adId: string) => {
        setModalLoading(true);
        try {
            const endpoint = `${baseurl}/api/v1/interested/all-interests`;

            const response = await axios.post(
                endpoint,
                { adId },
                {
                    params: { page, limit },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setInterests(response.data.interests || response.data.data || []);
            setIsModalOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch interests');
        } finally {
            setModalLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const endpoint =
                listingType === 'franchise'
                    ? `${baseurl}/api/v1/listing_managment/franchise-lists?export=true`
                    : listingType === 'training'
                        ? `${baseurl}/api/v1/listing_managment/training-lists?export=true`
                        : `${baseurl}/api/v1/listing_managment/seller-listings?export=true`;
            const response = await axios.get(endpoint, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` },
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${listingType}_listings.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            setError('Failed to export listings');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editListing) return;
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'newImages') {
                    value.forEach((file: File) => formDataToSend.append('advertisementImages', file));
                } else if (key === 'imagesToRemove') {
                    formDataToSend.append('imagesToRemove', JSON.stringify(value));
                } else {
                    formDataToSend.append(key, value as string);
                }
            });

            const endpoint =
                listingType === 'franchise'
                    ? `${baseurl}/api/v1/listing_managment/franchise-list/${editListing._id}`
                    : listingType === 'training'
                        ? `${baseurl}/api/v1/listing_managment/training-list/${editListing._id}`
                        : `${baseurl}/api/v1/listing_managment/seller-listing/${editListing._id}`;

            const response = await axios.patch(endpoint, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(response.data.message);
            setEditListing(null);
            setFormData({
                fullName: '',
                idDetails: '',
                phoneNumber: '',
                email: '',
                shopName: '',
                status: 'active',
                heading: '',
                description: '',
                short_description: '',
                address: '',
                advertisementDetails: '',
                termsAccepted: false,
                imagesToRemove: [],
                newImages: [],
            });
            fetchListings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        setLoading(true);
        try {
            const endpoint =
                listingType === 'franchise'
                    ? `${baseurl}/api/v1/listing_managment/franchise-list/${id}`
                    : listingType === 'training'
                        ? `${baseurl}/api/v1/listing_managment/training-list/${id}`
                        : `${baseurl}/api/v1/listing_managment/seller-listing/${id}`;
            const response = await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(response.data.message);
            fetchListings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete listing');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        setLoading(true);
        try {
            const endpoint =
                listingType === 'franchise'
                    ? `${baseurl}/api/v1/listing_managment/franchise-list/${id}/toggle`
                    : listingType === 'training'
                        ? `${baseurl}/api/v1/listing_managment/training-list/${id}/toggle`
                        : `${baseurl}/api/v1/listing_managment/seller-listing/${id}/toggle`;
            const response = await axios.patch(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(response.data.message);
            fetchListings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to toggle status');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (listing: Listing) => {
        setEditListing(listing);
        setFormData({
            fullName: listing.fullName,
            idDetails: listing.idDetails,
            phoneNumber: listing.phoneNumber,
            email: listing.email,
            shopName: listing.shopName,
            status: listing.status,
            heading: listing.heading,
            description: listing.description,
            short_description: listing.short_description,
            address: listing.address,
            advertisementDetails: listing.advertisementDetails,
            termsAccepted: listing.termsAccepted,
            imagesToRemove: [],
            newImages: [],
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setInterests([]);
    };

    useEffect(() => {
        fetchListings();
    }, [listingType, page, search, fromDate, toDate]);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Manage Listings</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button 
                            className="float-right font-bold" 
                            onClick={() => setError(null)}
                        >
                            ×
                        </button>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                        <button 
                            className="float-right font-bold" 
                            onClick={() => setSuccess(null)}
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <select
                        value={listingType}
                        onChange={(e) => setListingType(e.target.value as any)}
                        className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="franchise">Franchise</option>
                        <option value="training">Training</option>
                        <option value="seller">Seller</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by name, shop, email, or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={handleExport}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Export CSV
                    </button>
                </div>
                {editListing && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h3 className="text-xl font-bold mb-4">Edit Listing</h3>
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID Details</label>
                                <input
                                    type="text"
                                    value={formData.idDetails}
                                    onChange={(e) => setFormData({ ...formData, idDetails: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                                <input
                                    type="text"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Heading</label>
                                <input
                                    type='text'
                                    value={formData.heading}
                                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                    rows={4}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                                <textarea
                                    value={formData.short_description}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                    rows={2}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Advertisement Details</label>
                                <textarea
                                    value={formData.advertisementDetails}
                                    onChange={(e) => setFormData({ ...formData, advertisementDetails: e.target.value })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                    rows={4}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Existing Images</label>
                                <div className="flex flex-wrap gap-2">
                                    {editListing?.advertisementImages?.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img src={img} alt="listing" className="h-20 w-20 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imagesToRemove: [...formData.imagesToRemove, img] })}
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Upload New Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, newImages: Array.from(e.target.files || []) })}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Terms Accepted</span>
                                </label>
                            </div>
                            <div className="sm:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Updating...' : 'Update Listing'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditListing(null)}
                                    className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {listings?.map((listing) => (
                                <tr key={listing._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{listing.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{listing.shopName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(listing)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => fetchListingsInterested(listing._id)}
                                            disabled={modalLoading}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            {modalLoading ? 'Loading...' : 'View Interests'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(listing._id)}
                                            className="text-red-600 hover:text-red-900 mr-4"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(listing._id)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Toggle Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">Page {page} of {Math.ceil(total / limit)}</span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * limit >= total || loading}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <InterestModal
                isOpen={isModalOpen}
                onClose={closeModal}
                interests={interests}
                loading={modalLoading}
            />
        </div>
    );
};

export default ManageListings;