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

const generateToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};


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

    const handleGenerateToken = () => {
        const newToken = generateToken();
        setFormData(prev => ({ ...prev, token: newToken }));
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
                
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">Token (opsional)</label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="token"
                            name="token"
                            value={formData.token}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-grow"
                            placeholder="Klik Generate atau isi manual"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleGenerateToken}
                            className="flex-shrink-0"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Generate
                        </Button>
                    </div>
                </div>

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