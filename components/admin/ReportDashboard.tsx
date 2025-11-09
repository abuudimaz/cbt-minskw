import React, { useState, useEffect } from 'react';
import { ExamResult } from '../../types';
import { apiGetExamResults } from '../../services/api';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { downloadCSV, toastError } from '../../utils/helpers';

interface ExamClassSummary {
    examName: string;
    participantCount: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
}

interface ClassReport {
    className: string;
    examSummaries: ExamClassSummary[];
}

const ReportDashboard: React.FC = () => {
    const [reportData, setReportData] = useState<ClassReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const generateReport = async () => {
            setIsLoading(true);
            try {
                const results = await apiGetExamResults();
                if (results.length === 0) {
                    setReportData([]);
                    return;
                }

                // Group results by class
                const resultsByClass = results.reduce((acc, result) => {
                    const className = result.class || 'Tanpa Kelas';
                    if (!acc[className]) {
                        acc[className] = [];
                    }
                    acc[className].push(result);
                    return acc;
                }, {} as Record<string, ExamResult[]>);

                const finalReport: ClassReport[] = Object.entries(resultsByClass).map(([className, classResults]) => {
                    // Group results within a class by examName
                    const resultsByExam = classResults.reduce((acc, result) => {
                        const examName = result.examName || 'Ujian Tidak Dikenal';
                        if (!acc[examName]) {
                            acc[examName] = [];
                        }
                        acc[examName].push(result.score);
                        return acc;
                    }, {} as Record<string, number[]>);

                    const examSummaries: ExamClassSummary[] = Object.entries(resultsByExam).map(([examName, scores]) => {
                        const participantCount = scores.length;
                        const sum = scores.reduce((total, score) => total + score, 0);
                        const averageScore = Math.round(sum / participantCount);
                        const highestScore = Math.max(...scores);
                        const lowestScore = Math.min(...scores);
                        
                        return { examName, participantCount, averageScore, highestScore, lowestScore };
                    });

                    return { className, examSummaries };
                }).sort((a, b) => a.className.localeCompare(b.className)); // Sort classes alphabetically

                setReportData(finalReport);
            } catch (err) {
                setError('Gagal menghasilkan laporan.');
            } finally {
                setIsLoading(false);
            }
        };

        generateReport();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleExportClassReport = (className: string, summaries: ExamClassSummary[]) => {
        if (summaries.length === 0) {
            toastError("Tidak ada data untuk diekspor untuk kelas ini.");
            return;
        }

        const dataToExport = summaries.map(summary => ({
            'Nama Ujian': summary.examName,
            'Jumlah Peserta': summary.participantCount,
            'Nilai Rata-rata': summary.averageScore,
            'Nilai Tertinggi': summary.highestScore,
            'Nilai Terendah': summary.lowestScore,
        }));

        const filename = `laporan_hasil_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(dataToExport, filename);
    };

    if (isLoading) return <LoadingSpinner text="Menghasilkan Laporan..." />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div>
             <Card title="Laporan Hasil Ujian per Kelas">
                <div className="flex justify-end mb-4 no-print">
                    <Button onClick={handlePrint}>Cetak Laporan</Button>
                </div>
                
                <div className="printable-content space-y-8">
                    {reportData.length > 0 ? (
                        reportData.map(({ className, examSummaries }) => (
                            <div key={className}>
                                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 pb-2 border-gray-200">
                                    Kelas: {className}
                                </h2>
                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ujian</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Peserta</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Rata-rata</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Tertinggi</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Terendah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {examSummaries.map(summary => (
                                                <tr key={summary.examName}>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{summary.examName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{summary.participantCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-blue-600">{summary.averageScore}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-green-600">{summary.highestScore}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-red-600">{summary.lowestScore}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 text-right no-print">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleExportClassReport(className, examSummaries)}
                                        disabled={examSummaries.length === 0}
                                    >
                                        Export Laporan Kelas {className}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">
                            Tidak ada data hasil ujian yang dapat ditampilkan untuk membuat laporan.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportDashboard;
