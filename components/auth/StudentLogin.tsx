import React, { useState } from 'react';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiStudentLogin, apiGetStudents } from '../../services/api';
import { AppView } from '../../types';
import { toastSuccess, toastError } from '../../utils/helpers';
import Modal from '../shared/Modal';

const ForgotPasswordModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (nis: string) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [nis, setNis] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(nis);
        setIsSubmitting(false);
        setNis('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lupa Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">Masukkan NIS Anda untuk menerima instruksi reset password (simulasi).</p>
                <Input
                    id="forgot-nis"
                    label="NIS (Nomor Induk Siswa)"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    required
                    placeholder="Masukkan NIS Anda"
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit" isLoading={isSubmitting}>Kirim Instruksi</Button>
                </div>
            </form>
        </Modal>
    );
};

const StudentLogin: React.FC = () => {
    const { login, setCurrentView } = useAuth();
    const [nis, setNis] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!nis || !password) {
            setError('NIS dan Password harus diisi.');
            return;
        }
        setIsLoading(true);
        try {
            const user = await apiStudentLogin(nis, password);
            if (user) {
                toastSuccess('Login berhasil!');
                login(user);
            } else {
                setError('NIS atau Password salah.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            toastError('Gagal terhubung ke server. Periksa koneksi Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (forgotNis: string) => {
        if (!forgotNis) {
            toastError("NIS harus diisi.");
            return;
        }
        // Simulate checking if NIS exists
        const students = await apiGetStudents();
        const studentExists = students.some(s => s.nis === forgotNis);

        if (studentExists) {
            toastSuccess(`Instruksi reset password telah dikirim ke data yang terhubung dengan NIS ${forgotNis} (simulasi).`);
        } else {
            toastError(`NIS ${forgotNis} tidak ditemukan.`);
        }
        setIsForgotModalOpen(false);
    };

    return (
        <>
            <div className="max-w-md mx-auto mt-10">
                <Card title="Login Siswa">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Input
                            id="nis"
                            label="NIS (Nomor Induk Siswa)"
                            type="text"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            placeholder="Masukkan NIS Anda"
                            required
                        />
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Lupa Password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan Password"
                                required
                                className="mt-1"
                            />
                        </div>
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
            <ForgotPasswordModal 
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
                onSubmit={handleForgotPassword}
            />
        </>
    );
};

export default StudentLogin;