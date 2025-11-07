
import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents, apiDeleteStudent } from '../../services/api';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStudents = async () => {
        setIsLoading(true);
        const data = await apiGetStudents();
        setStudents(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (nis: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus siswa dengan NIS ${nis}?`)) {
            await apiDeleteStudent(nis);
            fetchStudents(); // Refresh list
        }
    };

    return (
        <Card title="Manajemen Siswa">
            <div className="mb-4">
                <Button>+ Tambah Siswa Baru</Button>
            </div>
            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">NIS</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nama Siswa</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Kelas</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Ruang</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.nis} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{student.nis}</td>
                                    <td className="py-3 px-4">{student.name}</td>
                                    <td className="py-3 px-4">{student.class}</td>
                                    <td className="py-3 px-4">{student.room}</td>
                                    <td className="py-3 px-4">
                                        <button className="text-blue-500 hover:underline text-sm">Edit</button>
                                        <button onClick={() => handleDelete(student.nis)} className="text-red-500 hover:underline text-sm ml-4">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default StudentManagement;
