
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiAdminLogin } from '../../services/api';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { AppView } from '../../types';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, setCurrentView } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await apiAdminLogin(username, password);
            if (user) {
                login(user);
            } else {
                setError('Username atau Password salah.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mencoba masuk.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card title="Login Guru / Proktor">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
                    <Input
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="admin"
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="admin123"
                    />
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setCurrentView(AppView.LOGIN_SELECTOR)} className="text-sm text-brand-blue hover:underline">
                            &larr; Kembali
                        </button>
                        <Button type="submit" isLoading={isLoading}>
                            Masuk
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
