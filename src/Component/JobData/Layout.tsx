import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-indigo-600 text-white py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-2xl font-bold">Salon Job Portal</h1>
                </div>
            </header>
            <main className="py-8">{children}</main>
        </div>
    );
};

export default Layout;