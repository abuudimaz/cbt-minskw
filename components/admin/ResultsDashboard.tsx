
import React, { useState, useEffect } from 'react';
import { ExamResult } from '../../types';
import { apiGetExamResults } from '../../services/api';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { downloadCSV } from '../../utils/helpers';


const ResultsDashboard: React.FC = () => {
    const [results, setResults] = useState<ExamResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            const data = await apiGetExamResults();
            setResults(data);
            setIsLoading(false);
        };
        fetchResults();
    }, []);

    const handleExport = () => {
        const dataToExport = results.map(r => ({
            NIS: r.nis,
            Nama: r.name,
            Kelas: r.class,
            Ujian: r.examName,
            Nilai: r.score,
            Tanggal_Submit: r.submittedAt.toLocaleString('id-ID'),
        }));
        downloadCSV(dataToExport, 'hasil_ujian_anbk.csv');
    };

    return (
        <Card title="Hasil Ujian Siswa">
            <div className="mb-4">
                <Button onClick={handleExport} disabled={results.length === 0}>
                    Export ke CSV
                </Button>
            </div>
             {isLoading ? <LoadingSpinner /> : results.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada hasil ujian yang tersedia.</p>
             ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">NIS</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nama Siswa</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Kelas</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Ujian</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nilai</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Waktu Submit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => (
                                <tr key={`${result.nis}-${result.examId}`} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{result.nis}</td>
                                    <td className="py-3 px-4">{result.name}</td>
                                    <td className="py-3 px-4">{result.class}</td>
                                    <td className="py-3 px-4">{result.examName}</td>
                                    <td className="py-3 px-4 font-bold">{result.score}</td>
                                    <td className="py-3 px-4 text-sm">{result.submittedAt.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default ResultsDashboard;
