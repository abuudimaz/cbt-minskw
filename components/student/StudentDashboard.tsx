import React, { useState, useEffect } from 'react';
import { Exam, ExamResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { apiGetExamsForStudent, apiGetResultsForStudent } from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { toastError, downloadCSV } from '../../utils/helpers';

const StudentDashboard: React.FC = () => {
    const { user, selectExam } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [examsData, resultsData] = await Promise.all([
                    // FIX: apiGetExamsForStudent expects 0 arguments.
                    apiGetExamsForStudent(),
                    apiGetResultsForStudent(user.id)
                ]);
                setExams(examsData);
                setResults(resultsData);
            } catch (err) {
                setError('Gagal memuat daftar ujian.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    const handleStartExam = (exam: Exam) => {
        const token = exam.token;
        if (token) {
            const enteredToken = prompt(`Masukkan token untuk memulai ujian "${exam.name}":`);
            if (enteredToken === token) {
                selectExam(exam);
            } else if (enteredToken !== null) {
                toastError('Token yang Anda masukkan salah.');
            }
        } else {
             if (window.confirm(`Anda akan memulai ujian "${exam.name}". Apakah Anda siap?`)) {
                selectExam(exam);
             }
        }
    };

    const handleExportResults = () => {
        if (!user) return;
        
        const dataToExport = results.map(r => ({
            nama_ujian: r.examName,
            nilai: r.score,
            tanggal_submit: new Date(r.submittedAt).toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
        }));

        downloadCSV(dataToExport, `hasil_ujian_${user.name.replace(/\s+/g, '_')}.csv`);
    };

    if (isLoading) return <LoadingSpinner text="Memuat daftar ujian..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Asesmen</h1>
                <Button onClick={handleExportResults} disabled={results.length === 0} variant="secondary">
                    Export Hasil
                </Button>
            </div>
            {exams.length > 0 ? (
                <div className="space-y-4">
                    {exams.map(exam => {
                        const result = results.find(r => r.examId === exam.id);
                        const isCompleted = !!result;
                        const status = isCompleted 
                            ? { text: 'Selesai Dikerjakan', color: 'bg-green-100 text-green-800' }
                            : { text: 'Belum Dikerjakan', color: 'bg-gray-100 text-gray-800' };

                        return (
                            <Card key={exam.id} className="transition hover:shadow-xl">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="mb-4 sm:mb-0">
                                        <h2 className="text-lg font-semibold text-gray-900">{exam.name}</h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                                            <span>{exam.type}</span>
                                            <span>&bull;</span>
                                            <span>{exam.questionCount} Soal</span>
                                            <span>&bull;</span>
                                            <span>{exam.duration} Menit</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.text}
                                            </span>
                                            {isCompleted && result && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span className="font-semibold text-gray-800">
                                                        Nilai: <span className="text-blue-600 font-bold text-base">{result.score}</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Button onClick={() => handleStartExam(exam)} disabled={isCompleted}>
                                        {isCompleted ? 'Telah Dikerjakan' : 'Mulai Kerjakan'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <p>Tidak ada ujian yang tersedia saat ini.</p>
            )}
        </div>
    );
};

export default StudentDashboard;