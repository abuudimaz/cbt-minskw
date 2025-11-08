
import React, { useState, useEffect } from 'react';
import { ExamResult } from '../../types';
import { apiGetExamResults } from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { downloadCSV } from '../../utils/helpers';
import ResultDetailModal from './ResultDetailModal';

const ResultsDashboard: React.FC = () => {
    const [results, setResults] = useState<ExamResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await apiGetExamResults();
            setResults(data);
        } catch (err) {
            setError('Gagal memuat data hasil ujian.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = () => {
        const dataToExport = results.map(r => ({
            nis: r.nis,
            nama_siswa: r.name,
            kelas: r.class,
            nama_ujian: r.examName,
            nilai: r.score,
            waktu_submit: new Date(r.submittedAt).toLocaleString('id-ID'),
        }));
        downloadCSV(dataToExport, `hasil_ujian_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleOpenDetailModal = (result: ExamResult) => {
        setSelectedResult(result);
        setIsDetailModalOpen(true);
    };
    
    const handleScoreUpdate = () => {
        fetchData(); // Refresh the data after a score has been updated
        setIsDetailModalOpen(false);
    }

    if (isLoading) return <LoadingSpinner text="Memuat hasil ujian..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Card title="Rekapitulasi Hasil Ujian">
                <div className="mb-4 text-right">
                    <Button onClick={handleExport} disabled={results.length === 0}>
                        Export ke CSV
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ujian</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Submit</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {results.map((result, index) => (
                                <tr key={result.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.examName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{result.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.submittedAt).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenDetailModal(result)}>
                                            Detail
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {results.length === 0 && (
                        <p className="text-center py-4 text-gray-500">Belum ada hasil ujian yang tersedia.</p>
                    )}
                </div>
            </Card>
            
            {selectedResult && (
                <ResultDetailModal 
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    result={selectedResult}
                    onScoreUpdate={handleScoreUpdate}
                />
            )}
        </>
    );
};

export default ResultsDashboard;