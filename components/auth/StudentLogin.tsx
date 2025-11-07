
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiStudentLogin } from '../../services/api';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { AppView } from '../../types';

const StudentLogin: React.FC = () => {
    const [nis, setNis] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, setCurrentView } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await apiStudentLogin(nis, password);
            if (user) {
                login(user);
            } else {
                setError('NIS atau Password salah. Silakan coba lagi.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mencoba masuk.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card title="Login Siswa">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
                    <Input
                        id="nis"
                        label="Nomor Induk Siswa (NIS)"
                        type="text"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        required
                        placeholder="Masukkan NIS Anda"
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Masukkan password"
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

export default StudentLogin;
