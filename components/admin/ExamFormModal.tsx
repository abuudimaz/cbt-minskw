import React, { useState, useEffect } from 'react';
import { Exam, AssessmentType } from '../../types';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';

interface ExamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exam: Exam | Omit<Exam, 'id' | 'questionCount'>) => void;
    exam: Exam | null;
}

const ExamFormModal: React.FC<ExamFormModalProps> = ({ isOpen, onClose, onSave, exam }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: AssessmentType.LITERASI,
        duration: 60,
        token: '',
        startTime: '',
        endTime: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (exam) {
            setFormData({
                name: exam.name,
                type: exam.type,
                duration: exam.duration,
                token: exam.token || '',
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                startTime: exam.startTime ? new Date(new Date(exam.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
                endTime: exam.endTime ? new Date(new Date(exam.endTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
            });
        } else {
            setFormData({
                name: '',
                type: AssessmentType.LITERASI,
                duration: 60,
                token: '',
                startTime: '',
                endTime: '',
            });
        }
    }, [exam, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || formData.duration <= 0) {
            setError('Nama ujian dan durasi (harus > 0) wajib diisi.');
            return;
        }

        const examData: Omit<Exam, 'id' | 'questionCount'> = {
            name: formData.name,
            type: formData.type,
            duration: formData.duration,
            token: formData.token || undefined,
            // Convert local datetime string back to Date object
            startTime: formData.startTime ? new Date(formData.startTime) : undefined,
            endTime: formData.endTime ? new Date(formData.endTime) : undefined,
        };
        
        if (exam) {
            onSave({ ...exam, ...examData });
        } else {
            onSave(examData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={exam ? 'Edit Ujian' : 'Tambah Ujian Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Input label="Nama Ujian" name="name" value={formData.name} onChange={handleChange} required />
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Asesmen</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {Object.values(AssessmentType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <Input label="Durasi (menit)" name="duration" type="number" value={formData.duration} onChange={handleChange} required />
                <Input label="Token (opsional)" name="token" value={formData.token} onChange={handleChange} />
                <Input label="Waktu Mulai (opsional)" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} />
                <Input label="Waktu Selesai (opsional)" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExamFormModal;