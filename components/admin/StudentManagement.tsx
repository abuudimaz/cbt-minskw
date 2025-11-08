import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents, apiCreateStudent, apiUpdateStudent, apiDeleteStudent, apiImportStudents } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import StudentFormModal from './StudentFormModal';
import StudentImportModal from './StudentImportModal';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await apiGetStudents();
            setStudents(data);
        } catch (err) {
            setError('Gagal memuat data siswa.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleOpenFormModal = (student: Student | null) => {
        setSelectedStudent(student);
        setIsFormModalOpen(true);
    };

    const handleSaveStudent = async (studentData: Student) => {
        try {
            // Check if student with same nis already exists in the current state
            const studentExists = students.some(s => s.nis === studentData.nis);
            if (studentExists) {
                await apiUpdateStudent(studentData);
            } else {
                await apiCreateStudent(studentData);
            }
            fetchStudents();
            setIsFormModalOpen(false);
        } catch (err: any) {
            alert(`Gagal menyimpan data siswa: ${err.message}`);
        }
    };

    const handleDeleteStudent = async (nis: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            try {
                await apiDeleteStudent(nis);
                fetchStudents();
            } catch (err) {
                alert('Gagal menghapus siswa.');
            }
        }
    };
    
    const handleImportStudents = async (importedStudents: Student[]) => {
        try {
            const { added, skipped } = await apiImportStudents(importedStudents);
            let alertMessage = '';
            if (added > 0) {
                alertMessage += `${added} data siswa berhasil diimpor.`;
            }
            if (skipped > 0) {
                alertMessage += `\n${skipped} data dilewati karena NIS sudah ada.`;
            }
            if (!alertMessage) {
                alertMessage = 'Tidak ada data siswa baru untuk diimpor.';
            }
            alert(alertMessage.trim());
            fetchStudents();
            setIsImportModalOpen(false);
        } catch (err: any) {
            alert(`Gagal mengimpor data siswa: ${err.message}`);
        }
    };


    if (isLoading) return <LoadingSpinner text="Memuat data siswa..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Card title="Manajemen Data Siswa">
                <div className="mb-4 flex justify-end space-x-2">
                    <Button onClick={() => setIsImportModalOpen(true)} variant="secondary">
                        Import Siswa
                    </Button>
                    <Button onClick={() => handleOpenFormModal(null)}>
                        + Tambah Siswa Baru
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruang</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.nis}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">{student.nis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenFormModal(student)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteStudent(student.nis)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveStudent}
                student={selectedStudent}
            />

            <StudentImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportStudents}
            />
        </>
    );
};

export default StudentManagement;