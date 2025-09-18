// src/services/userService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
    domainType?: string | string[];
    isSuspended?: boolean;
}

export const getAllUsers = async (params: GetAllUsersParams) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/userManagement/getAllUsers`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/userManagement/getAllUsersbyId/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (id: string, data: any) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/userManagement/getAllUsersbyId/${id}`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const toggleUserSuspension = async (id: string, isSuspended: boolean) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/v1/userManagement/${id}/suspend`, { isSuspended }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/userManagement/getAllUsersbyId/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
            
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};