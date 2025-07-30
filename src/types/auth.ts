// types/auth.ts
export type User = {
    _id: string;
    name: string;
    email: string;
    domain_type: 'company' | 'superadmin';
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
    domain_type: 'company' | 'superadmin';
    whatsapp_number?: string;
};

export type LoginData = {
    email: string;
    password: string;
    deviceToken?: string;
};

export type AuthContextType = {
    state: AuthState;
    register: (data: RegisterData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => void;
    verifyOtp: (otp: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    refreshToken: () => Promise<void>;
    resendOtp: () => Promise<void>;
};