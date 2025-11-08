import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (student: Student) => void;
    student: Student | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, student }) => {
    const [formData, setFormData] = useState({
        nis: '',
        name: '',
        class: '',
        room: '',
        password: '',
    });
    const [error, setError] = useState('');

    const isEditing = !!student;

    useEffect(() => {
        if (student) {
            setFormData({
                nis: student.nis,
                name: student.name,
                class: student.class,
                room: student.room,
                password: '', // Password is not sent from API, clear for editing
            });
        } else {
            setFormData({
                nis: '',
                name: '',
                class: '',
                room: '',
                password: '',
            });
        }
    }, [student, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.nis || !formData.name || !formData.class || !formData.room) {
            setError('Semua field wajib diisi, kecuali password saat mengedit.');
            return;
        }
        if (!isEditing && !formData.password) {
            setError('Password wajib diisi saat membuat siswa baru.');
            return;
        }

        const studentData: Student = {
            nis: formData.nis,
            name: formData.name,
            class: formData.class,
            room: formData.room,
            password: formData.password,
        };

        onSave(studentData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Siswa' : 'Tambah Siswa Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Input label="NIS" name="nis" value={formData.nis} onChange={handleChange} required disabled={isEditing} />
                <Input label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Kelas" name="class" value={formData.class} onChange={handleChange} required />
                <Input label="Ruang" name="room" value={formData.room} onChange={handleChange} required />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Kosongkan jika tidak diubah" : ""} required={!isEditing} />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                </div>
            </form>
        </Modal>
    );
};

export default StudentFormModal;