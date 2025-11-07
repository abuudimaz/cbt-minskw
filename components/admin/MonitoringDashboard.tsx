
import React, { useState, useEffect } from 'react';
import { MonitoredStudent, StudentExamStatus } from '../../types';
import { apiGetMonitoringData } from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';

const statusColorMap: { [key in StudentExamStatus]: string } = {
    [StudentExamStatus.NOT_STARTED]: 'bg-gray-200 text-gray-800',
    [StudentExamStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-800 animate-pulse',
    [StudentExamStatus.FINISHED]: 'bg-green-200 text-green-800',
    [StudentExamStatus.LOGGED_OUT]: 'bg-red-200 text-red-800',
};

const MonitoringDashboard: React.FC = () => {
    const [students, setStudents] = useState<MonitoredStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        // Don't show loading spinner on refresh
        // setIsLoading(true);
        try {
            const data = await apiGetMonitoringData();
            setStudents(data);
        } catch (err) {
            setError('Gagal memuat data monitoring.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <LoadingSpinner text="Memuat data status ujian..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <Card title="Status Ujian Peserta (Live)">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.nis}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nis}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[student.status]}`}>
                                        {student.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default MonitoringDashboard;
