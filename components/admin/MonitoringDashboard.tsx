
import React, { useState, useEffect } from 'react';
import { MonitoredStudent, StudentExamStatus } from '../../types';
import { apiGetMonitoringData } from '../../services/api';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';

const getStatusBadge = (status: StudentExamStatus) => {
    switch (status) {
        case StudentExamStatus.IN_PROGRESS:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
        case StudentExamStatus.FINISHED:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
        case StudentExamStatus.LOGGED_OUT:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
        default:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
};

const MonitoringDashboard: React.FC = () => {
    const [students, setStudents] = useState<MonitoredStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMonitoringData = async () => {
            setIsLoading(true);
            const data = await apiGetMonitoringData();
            setStudents(data);
            setIsLoading(false);
        };
        fetchMonitoringData();
    }, []);

    return (
        <Card title="Monitoring Ujian Real-time">
            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">NIS</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nama Siswa</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Kelas</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.nis} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{student.nis}</td>
                                    <td className="py-3 px-4">{student.name}</td>
                                    <td className="py-3 px-4">{student.class}</td>
                                    <td className="py-3 px-4">{getStatusBadge(student.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default MonitoringDashboard;
