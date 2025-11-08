
import React, { useState } from 'react';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiAdminLogin } from '../../services/api';
import { AppView } from '../../types';
import { toastSuccess, toastError } from '../../utils/helpers';

const AdminLogin: React.FC = () => {
    const { login, setCurrentView } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Username dan Password harus diisi.');
            return;
        }
        setIsLoading(true);
        try {
            const user = await apiAdminLogin(username, password);
            if (user) {
                toastSuccess('Login berhasil!');
                login(user);
            } else {
                setError('Username atau Password salah.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            toastError('Gagal terhubung ke server. Periksa koneksi Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card title="Login Guru / Proktor">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Input
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan Username"
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

export default AdminLogin;