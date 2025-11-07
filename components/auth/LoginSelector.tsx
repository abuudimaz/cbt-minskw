import React from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import { AppView } from '../../types';

const LoginSelector: React.FC = () => {
    const { setCurrentView } = useAuth();
    
    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Selamat Datang di Aplikasi CBT MIN Singkawang.
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Silakan pilih peran Anda untuk masuk.
                    </p>
                    <div className="space-y-4">
                        <Button 
                            onClick={() => setCurrentView(AppView.STUDENT_LOGIN)}
                            className="w-full text-lg py-3"
                        >
                            Login sebagai Siswa
                        </Button>
                        <Button 
                            onClick={() => setCurrentView(AppView.ADMIN_LOGIN)}
                            variant="secondary" 
                            className="w-full text-lg py-3"
                        >
                            Login sebagai Guru / Proktor
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginSelector;