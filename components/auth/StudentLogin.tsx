import React, { useState } from 'react';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiStudentLogin } from '../../services/api';
import { AppView } from '../../types';
import { KemenagLogo, APP_TITLE } from '../../constants';

const StudentLogin: React.FC = () => {
    const { login, setCurrentView } = useAuth();
    const [nis, setNis] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nis || !password) {
            setError('NIS dan Password harus diisi.');
            return;
        }

        // Validate NIS format (numeric, 4-10 digits)
        const nisRegex = /^\d{4,10}$/;
        if (!nisRegex.test(nis)) {
            setError('NIS harus berupa angka dengan panjang 4-10 digit.');
            return;
        }

        setIsLoading(true);
        try {
            const user = await apiStudentLogin(nis, password);
            if (user) {
                login(user);
            } else {
                setError('NIS atau Password salah.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="flex flex-col items-center mb-8 text-center">
                <KemenagLogo className="h-20 w-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{APP_TITLE}</h1>
                <p className="text-gray-500 mt-1">Ujian Berbasis Komputer</p>
            </div>
            
            <Card title="Login Peserta Ujian">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Input
                        id="nis"
                        label="Nomor Induk Siswa (NIS)"
                        type="text"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="Masukkan NIS Anda"
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan Password"
                        required
                    />
                    <div className="flex items-center justify-between">
                         <Button type="button" variant="secondary" onClick={() => setCurrentView(AppView.LOGIN_SELECTOR)}>
                            Kembali
                        </Button>
                        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                            Login
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default StudentLogin;