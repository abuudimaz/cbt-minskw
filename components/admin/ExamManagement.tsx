import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question } from '../../types';
import { apiGetExams, apiCreateExam, apiUpdateExam, apiDeleteExam, apiImportQuestions, apiUpdateExamsOrder } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import ExamFormModal from './ExamFormModal';
import QuestionManagementModal from './QuestionManagementModal';
import QuestionImportModal from './QuestionImportModal';
import { toastSuccess, toastError } from '../../utils/helpers';

interface ExamManagementProps {
    searchQuery?: string;
}

const ExamManagement: React.FC<ExamManagementProps> = ({ searchQuery }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const fetchExams = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiGetExams();
            setExams(data);
        } catch (err) {
            setError('Gagal memuat data ujian.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleOpenFormModal = (exam: Exam | null) => {
        setSelectedExam(exam);
        setIsFormModalOpen(true);
    };

    const handleOpenQuestionModal = (exam: Exam) => {
        setSelectedExam(exam);
        setIsQuestionModalOpen(true);
    };

    const handleOpenImportModal = (exam: Exam) => {
        setSelectedExam(exam);
        setIsImportModalOpen(true);
    };
    
    const handleSaveExam = async (examData: Exam | Omit<Exam, 'id' | 'questionCount'>) => {
        try {
            if ('id' in examData) {
                await apiUpdateExam(examData);
            } else {
                await apiCreateExam(examData);
            }
            toastSuccess('Data ujian berhasil disimpan.');
            fetchExams();
            setIsFormModalOpen(false);
        } catch (err: any) {
            toastError(`Gagal menyimpan ujian: ${err.message}`);
        }
    };

    const handleDeleteExam = async (examId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus ujian ini? Semua soal di dalamnya juga akan terhapus.')) {
            try {
                await apiDeleteExam(examId);
                toastSuccess('Ujian berhasil dihapus.');
                fetchExams();
            } catch (err) {
                toastError('Gagal menghapus ujian.');
            }
        }
    };

    const handleImportQuestions = async (examId: string, questions: Omit<Question, 'id' | 'examId'>[]) => {
        try {
            await apiImportQuestions(examId, questions);
            toastSuccess(`${questions.length} soal berhasil diimpor.`);
            fetchExams(); // To update question count
            setIsImportModalOpen(false);
        } catch (err: any) {
            toastError(`Gagal mengimpor soal: ${err.message}`);
        }
    };

    const handleMoveExam = async (currentIndex: number, direction: 'up' | 'down') => {
        const displayedExams = getDisplayedExams(); // Make sure to reorder the currently visible list
        const originalIndex = exams.findIndex(e => e.id === displayedExams[currentIndex].id);
        
        const newOriginalIndex = direction === 'up' 
            ? exams.findIndex(e => e.id === displayedExams[currentIndex - 1].id)
            : exams.findIndex(e => e.id === displayedExams[currentIndex + 1].id);

        if (originalIndex < 0 || newOriginalIndex < 0) return;

        const reorderedExams = [...exams];
        const [movedExam] = reorderedExams.splice(originalIndex, 1);
        
        // Find the new position in the original array
        const targetIndex = reorderedExams.findIndex(e => e.id === exams[newOriginalIndex].id);
        reorderedExams.splice(targetIndex, 0, movedExam);


        setExams(reorderedExams);

        try {
            const orderedExamIds = reorderedExams.map(exam => exam.id);
            await apiUpdateExamsOrder(orderedExamIds);
        } catch (err) {
            toastError('Gagal menyimpan urutan baru. Mengembalikan ke urutan sebelumnya.');
            fetchExams();
        }
    };
    
    const getDisplayedExams = () => {
        if (!searchQuery) return exams;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return exams.filter(e => e.name.toLowerCase().includes(lowerCaseQuery));
    };

    const displayedExams = getDisplayedExams();

    if (isLoading) return <LoadingSpinner text="Memuat data ujian..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Card title="Manajemen Ujian & Soal">
                <div className="mb-4 flex justify-end">
                    <Button onClick={() => handleOpenFormModal(null)}>
                        + Buat Ujian Baru
                    </Button>
                </div>
                <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ujian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Soal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedExams.length > 0 ? displayedExams.map((exam, index) => (
                                <tr key={exam.id}>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleMoveExam(index, 'up')}
                                                disabled={index === 0 || !!searchQuery}
                                                className="p-1 text-gray-500 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={searchQuery ? "Urutan tidak dapat diubah saat mencari" : "Pindah ke atas"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleMoveExam(index, 'down')}
                                                disabled={index === displayedExams.length - 1 || !!searchQuery}
                                                className="p-1 text-gray-500 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={searchQuery ? "Urutan tidak dapat diubah saat mencari" : "Pindah ke bawah"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{exam.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration} menit</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.questionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono bg-gray-100 rounded">{exam.token || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenFormModal(exam)}>Edit</Button>
                                        <Button size="sm" onClick={() => handleOpenQuestionModal(exam)}>Kelola Soal</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenImportModal(exam)}>Import</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteExam(exam.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            )) : (
                                 <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery ? `Tidak ada ujian yang cocok dengan pencarian "${searchQuery}".` : "Belum ada ujian yang dibuat."}
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
            {selectedExam && (
                <>
                    <QuestionManagementModal
                        isOpen={isQuestionModalOpen}
                        onClose={() => setIsQuestionModalOpen(false)}
                        exam={selectedExam}
                        onQuestionsUpdate={fetchExams}
                    />
                    <QuestionImportModal
                        isOpen={isImportModalOpen}
                        onClose={() => setIsImportModalOpen(false)}
                        exam={selectedExam}
                        onImport={handleImportQuestions}
                    />
                </>
            )}
        </>
    );
};

export default ExamManagement;