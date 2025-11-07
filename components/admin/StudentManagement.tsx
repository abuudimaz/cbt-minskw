import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { apiGetStudents, apiDeleteStudent, apiCreateStudent, apiUpdateStudent, apiBulkDeleteStudents } from '../../services/api';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import StudentFormModal from './StudentFormModal';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [selectedNis, setSelectedNis] = useState<string[]>([]);

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

    const handleOpenModal = (student: Student | null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleSaveStudent = async (studentData: Student) => {
        try {
            if (editingStudent) {
                await apiUpdateStudent(studentData);
            } else {
                await apiCreateStudent(studentData);
            }
            fetchStudents();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Gagal menyimpan data siswa: ${err.message}`);
        }
    };

    const handleDelete = async (nis: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            try {
                await apiDeleteStudent(nis);
                setStudents(students.filter(s => s.nis !== nis));
            } catch (err) {
                alert('Gagal menghapus siswa.');
            }
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedNis(students.map(s => s.nis));
        } else {
            setSelectedNis([]);
        }
    };

    const handleSelectOne = (nis: string) => {
        setSelectedNis(prev => 
            prev.includes(nis) 
                ? prev.filter(id => id !== nis) 
                : [...prev, nis]
        );
    };
    
    const handleBulkDelete = async () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedNis.length} siswa terpilih?`)) {
            try {
                await apiBulkDeleteStudents(selectedNis);
                fetchStudents();
                setSelectedNis([]);
            } catch (err) {
                alert('Gagal menghapus siswa yang dipilih.');
            }
        }
    };

    if (isLoading) return <LoadingSpinner text="Memuat data siswa..." />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Card title="Manajemen Data Siswa">
                <div className="mb-4 flex justify-end space-x-2">
                    {selectedNis.length > 0 && (
                        <Button variant="danger" onClick={handleBulkDelete}>
                            Hapus {selectedNis.length} Siswa Terpilih
                        </Button>
                    )}
                    <Button onClick={() => handleOpenModal(null)}>
                        + Tambah Siswa
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    <input 
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={handleSelectAll}
                                        checked={students.length > 0 && selectedNis.length === students.length}
                                        indeterminate={selectedNis.length > 0 && selectedNis.length < students.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruang</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.nis} className={selectedNis.includes(student.nis) ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4">
                                         <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedNis.includes(student.nis)}
                                            onChange={() => handleSelectOne(student.nis)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(student)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(student.nis)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <StudentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStudent}
                student={editingStudent}
            />
        </>
    );
};

export default StudentManagement;