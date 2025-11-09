import React, { useState, useEffect } from 'react';
import { Exam } from '../../types';
import { apiGetExams, apiCreateExam, apiUpdateExam } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import ExamFormModal from './ExamFormModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { toastSuccess, toastError } from '../../utils/helpers';

const ExamSchedule: React.FC = () => {
    const [scheduledExams, setScheduledExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, exam: null as Exam | null });

    const fetchScheduledExams = async () => {
        setIsLoading(true);
        try {
            const allExams = await apiGetExams();
            const filteredExams = allExams.filter(exam => exam.startTime && exam.endTime);
            setScheduledExams(filteredExams);
        } catch (err) {
            setError('Gagal memuat data jadwal ujian.');
            toastError('Gagal memuat data jadwal ujian.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScheduledExams();
    }, []);

    const handleOpenFormModal = (exam: Exam | null) => {
        setSelectedExam(exam);
        setIsFormModalOpen(true);
    };

    const handleSaveExam = async (examData: Exam | Omit<Exam, 'id' | 'questionCount'>) => {
        try {
            if ('id' in examData) {
                await apiUpdateExam(examData);
                toastSuccess('Jadwal ujian berhasil diperbarui.');
            } else {
                await apiCreateExam(examData);
                toastSuccess('Jadwal ujian baru berhasil dibuat.');
            }
            fetchScheduledExams();
            setIsFormModalOpen(false);
        } catch (err: any) {
            toastError(`Gagal menyimpan jadwal: ${err.message}`);
        }
    };

    const openDeleteConfirmation = (exam: Exam) => {
        setConfirmModalState({ isOpen: true, exam });
    };

    const closeDeleteConfirmation = () => {
        setConfirmModalState({ isOpen: false, exam: null });
    };

    const handleDeleteSchedule = async () => {
        const examToDelete = confirmModalState.exam;
        if (!examToDelete) return;

        try {
            // Create a new object for the exam, removing schedule-related properties
            const updatedExam = { 
                ...examToDelete, 
                startTime: undefined, 
                endTime: undefined,
                token: undefined // Also remove token for consistency
            };

            await apiUpdateExam(updatedExam);
            toastSuccess('Jadwal untuk ujian berhasil dihapus.');
            fetchScheduledExams();
        } catch (err) {
            toastError('Gagal menghapus jadwal.');
        } finally {
            closeDeleteConfirmation();
        }
    };
    
    const formatDateTime = (dateString?: Date | string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (isLoading) return <LoadingSpinner text="Memuat jadwal ujian..." />;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <>
            <Card title="Manajemen Jadwal Ujian">
                <div className="mb-4 flex justify-end">
                    <Button onClick={() => handleOpenFormModal(null)}>
                        + Buat Ujian Terjadwal Baru
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ujian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Mulai</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Selesai</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scheduledExams.length > 0 ? (
                                scheduledExams.map((exam) => (
                                    <tr key={exam.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{exam.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(exam.startTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(exam.endTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration} menit</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono bg-gray-100 rounded">{exam.token || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenFormModal(exam)}>Edit</Button>
                                            <Button size="sm" variant="danger" onClick={() => openDeleteConfirmation(exam)}>Hapus Jadwal</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada ujian yang dijadwalkan saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ExamFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveExam}
                exam={selectedExam}
            />

            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={closeDeleteConfirmation}
                onConfirm={handleDeleteSchedule}
                title="Konfirmasi Hapus Jadwal"
                message={`Apakah Anda yakin ingin menghapus jadwal untuk ujian "${confirmModalState.exam?.name}"? Tindakan ini tidak akan menghapus ujian atau soalnya, hanya menghilangkan waktu pelaksanaannya.`}
                variant="danger"
                confirmText="Ya, Hapus Jadwal"
            />
        </>
    );
};

export default ExamSchedule;