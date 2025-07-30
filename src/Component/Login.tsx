import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [deviceToken, setDeviceToken] = useState('');
    const { state, login } = useAuth();
    const navigate = useNavigate();

    console.log("state", state);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password, deviceToken });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    // Add useEffect to handle navigation after successful login
    useEffect(() => {
        if (state.isAuthenticated) {
            navigate('/'); // or whatever your dashboard route is
        }
    }, [state.isAuthenticated, navigate]);

    if (state.isLoading) {
        return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Login to Your Account</h2>

                {state.error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                        {state.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Device Token (optional)</label>
                        <input
                            type="text"
                            value={deviceToken}
                            onChange={(e) => setDeviceToken(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={state.isLoading}
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                        {state.isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};