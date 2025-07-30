import axios, { AxiosError } from 'axios';
import type {
    Category,
    PaginatedResponse,
    ApiResponse,
    CategoryFormValues
} from '../types/category';

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/v1/category`;

const handleApiError = (error: unknown): ApiResponse<never> => {
    const axiosError = error as AxiosError;
    return {
        success: false,
        message: axiosError.response?.data?.message || 'An error occurred',
        errors: axiosError.response?.data?.errors,
        status: axiosError.response?.status,
    };
};

export const getCategories = async (
    params: Record<string, unknown> = {}
): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    try {
        const response = await axios.get<PaginatedResponse<Category>>(API_URL, { params });
        return { success: true, data: response.data };
    } catch (error) {
        return handleApiError(error);
    }
};

export const getCategory = async (id: string): Promise<ApiResponse<Category>> => {
    try {
        const response = await axios.get<Category>(`${API_URL}/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        return handleApiError(error);
    }
};

export const createCategory = async (
    categoryData: CategoryFormValues,
    token: string
): Promise<ApiResponse<Category>> => {
    try {
        const response = await axios.post<Category>(API_URL, categoryData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateCategory = async (
    id: string,
    categoryData: Partial<CategoryFormValues>,
    token: string
): Promise<ApiResponse<Category>> => {
    try {
        const response = await axios.put<Category>(`${API_URL}/${id}`, categoryData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return handleApiError(error);
    }
};

export const deleteCategory = async (
    id: string,
    token: string
): Promise<ApiResponse<void>> => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true };
    } catch (error) {
        return handleApiError(error);
    }
};

export const toggleCategoryStatus = async (
    id: string,
    token: string
): Promise<ApiResponse<Category>> => {
    try {
        const response = await axios.patch<Category>(
            `${API_URL}/${id}/status`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: response.data };
    } catch (error) {
        return handleApiError(error);
    }
};