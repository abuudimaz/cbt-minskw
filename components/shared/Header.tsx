import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KemenagLogo, APP_TITLE } from '../../constants';
import Button from './Button';
import { Role } from '../../types';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (user?.role === Role.STUDENT) {
            if (window.confirm('Apakah Anda yakin ingin logout? Progres ujian yang belum disimpan mungkin akan hilang.')) {
                logout();
            }
        } else {
            logout();
        }
    };

    return (
        <header className="bg-white shadow-md no-print sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3">
                    <KemenagLogo className="h-10 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{APP_TITLE}</h1>
                        <p className="text-sm text-gray-500">Ujian Berbasis Komputer</p>
                    </div>
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        Tentang
                    </Link>
                    {user && (
                        <>
                           <span className="hidden sm:block text-gray-700">
                               Selamat datang, <span className="font-semibold">{user.name}</span>
                           </span>
                            <Button onClick={handleLogout} variant="secondary" size="sm">
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;