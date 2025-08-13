// src/pages/UserManagement/UserManagement.tsx
import React, { useState } from 'react';
import CompanyList from './CompanyList';
import SalonList from './SalonList';
import UserList from './UserList';

const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('company');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'company' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('company')}
                >
                    Companies
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'salon' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('salon')}
                >
                    Salons
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'worker' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('worker')}
                >
                    Workers
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'company' && <CompanyList />}
                {activeTab === 'salon' && <SalonList />}
                {activeTab === 'worker' && <UserList />}
            </div>
        </div>
    );
};

export default UserManagement;