import React, { useState, useEffect } from 'react';
import { Exam, Question } from '../../types';
import { apiGetExams, apiCreateExam, apiUpdateExam, apiDeleteExam, apiImportQuestions } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import ExamFormModal from './ExamFormModal';
import QuestionManagementModal from './QuestionManagementModal';
import QuestionImportModal from './QuestionImportModal';

const ExamManagement: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const data = await apiGetExams();
            setExams(data);
        } catch (err) {
            setError('Gagal memuat data ujian.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

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
            fetchExams();
            setIsFormModalOpen(false);
        } catch (err: any) {
            alert(`Gagal menyimpan ujian: ${err.message}`);
        }
    };

    const handleDeleteExam = async (examId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus ujian ini? Semua soal di dalamnya juga akan terhapus.')) {
            try {
                await apiDeleteExam(examId);
                fetchExams();
            } catch (err) {
                alert('Gagal menghapus ujian.');
            }
        }
    };

    const handleImportQuestions = async (examId: string, questions: Omit<Question, 'id' | 'examId'>[]) => {
        try {
            await apiImportQuestions(examId, questions);
            alert(`${questions.length} soal berhasil diimpor.`);
            fetchExams(); // To update question count
            setIsImportModalOpen(false);
        } catch (err: any) {
            alert(`Gagal mengimpor soal: ${err.message}`);
        }
    };

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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ujian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Soal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exams.map((exam) => (
                                <tr key={exam.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{exam.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration} menit</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.questionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono bg-gray-100 rounded">{exam.token || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenFormModal(exam)}>Edit</Button>
                                        <Button size="sm" onClick={() => handleOpenQuestionModal(exam)}>Soal</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenImportModal(exam)}>Import</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteExam(exam.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
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
