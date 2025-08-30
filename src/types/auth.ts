// types/auth.ts
export type User = {
    _id: string;
    name: string;
    email: string;
    domain_type: 'company' | 'superadmin' | 'admin';
    permissions?: string[]; // Add permissions array
    whatsapp_number?: string;
};

export type AuthState = {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
};

export type RegisterData = {
    name: string;
    email: string;
    password: string;
    domain_type: 'company' | 'superadmin' | 'admin';
    whatsapp_number?: string;
};

export type LoginData = {
    whatsapp_number: string;
    password: string;
    deviceToken?: string;
};

export type AuthContextType = {
    state: AuthState;
    register: (data: RegisterData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => void;
    verifyOtp: (whatsapp_number: string, otp: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    refreshToken: () => Promise<void>;
    resendOtp: () => Promise<void>;
};