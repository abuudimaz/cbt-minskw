import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { KemenagLogo, APP_TITLE } from '../../constants';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <KemenagLogo className="h-10 w-10" />
                        <div className="ml-4">
                            <h1 className="text-xl font-bold text-gray-800">{APP_TITLE}</h1>
                            <p className="text-sm text-gray-500">Sistem Asesmen Online</p>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center">
                            <span className="text-gray-600 mr-4 hidden sm:block">Selamat datang, {user.name}!</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;