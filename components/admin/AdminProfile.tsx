import React, { useState } from 'react';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { apiUpdateAdminProfile, apiResetAdminPassword } from '../../services/api';
import { toastSuccess, toastError } from '../../utils/helpers';

const AdminProfile: React.FC = () => {
    const { user, updateUser } = useAuth();
    
    // Ensure we don't proceed if user is not an admin or is null
    if (!user || user.role !== 'admin') {
        return <p>Akses tidak sah.</p>;
    }

    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password && password !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok.');
            return;
        }

        if (password && password.length < 6) {
            setError('Password baru minimal harus 6 karakter.');
            return;
        }

        setIsLoading(true);
        try {
            const updatedUser = await apiUpdateAdminProfile(
                user.id, 
                name, 
                password || undefined
            );
            updateUser(updatedUser); // Update user in context
            toastSuccess('Profil berhasil diperbarui.');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Gagal memperbarui profil. Silakan coba lagi.');
            toastError('Gagal memperbarui profil. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setIsLoading(true);
        setError('');
        try {
            await apiResetAdminPassword(user.id);
            toastSuccess('Password admin berhasil direset ke default (`admin123`). Anda mungkin perlu login ulang.');
            setIsResetModalOpen(false);
        } catch (err) {
            toastError('Gagal mereset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card title="Profil Admin">
                <div className="max-w-lg mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
                        
                        <Input
                            id="username"
                            label="Username"
                            type="text"
                            value={user.id}
                            disabled
                            className="bg-gray-100"
                        />
                        <Input
                            id="name"
                            label="Nama Lengkap"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div className="border-t pt-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Ubah Password</h3>
                            <p className="text-sm text-gray-500 mb-4">Kosongkan jika Anda tidak ingin mengubah password.</p>
                            <div className="space-y-4">
                                <Input
                                    id="password"
                                    label="Password Baru"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password baru"
                                />
                                <Input
                                    id="confirmPassword"
                                    label="Konfirmasi Password Baru"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ketik ulang password baru"
                                />
                            </div>
                        </div>
                    
                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                    
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-md font-semibold text-gray-700">Reset Password Admin</h3>
                        <p className="text-sm text-gray-500 my-2">
                            Fitur ini akan mengembalikan password admin ke pengaturan awal (`admin123`). Gunakan dengan hati-hati.
                        </p>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => setIsResetModalOpen(true)}
                        >
                            Reset Password ke Default
                        </Button>
                    </div>

                </div>
            </Card>

            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Konfirmasi Reset Password"
            >
                <div>
                    <p className="text-gray-600 mb-6">
                        Apakah Anda yakin ingin mereset password admin ke pengaturan awal? Anda akan perlu login kembali dengan password default.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsResetModalOpen(false)}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleResetPassword}
                            isLoading={isLoading}
                        >
                            Ya, Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AdminProfile;