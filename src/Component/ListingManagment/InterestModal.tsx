import React from 'react';

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

interface InterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    interests: Interest[];
    loading?: boolean;
}

const InterestModal: React.FC<InterestModalProps> = ({ isOpen, onClose, interests, loading = false }) => {
    if (!isOpen) return null;
    console.log(interests);

    return (
        <div className="fixed inset-0  bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-auto">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
                    onClick={onClose}
                >
                    ✖
                </button>
                <h2 className="text-2xl font-semibold mb-4">Listing Interests</h2>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-2">Loading interests...</span>
                    </div>
                ) : interests.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No interests found for this listing.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Ad Title</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Interested User</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Ad Owner</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interests.map((interest) => (
                                    <tr key={interest._id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">
                                            {interest.adId.heading || 'No Title'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {interest.interestedUserId.name}
                                            {interest.interestedUserId.whatsapp_number && ` (${interest.interestedUserId.whatsapp_number})`}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {interest.adUserId.name}
                                            {interest.adUserId.whatsapp_number && ` (${interest.adUserId.whatsapp_number})`}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {new Date(interest.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterestModal;